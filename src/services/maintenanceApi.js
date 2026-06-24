import { alarmCenterAlarms } from "../data/alarmCenterData";
import {
  maintenanceWorkOrdersSeed,
  sparePartsInventorySeed,
  maintenanceScheduleSeed,
  technicianSeed,
  getTurbineBaseContext,
} from "../data/maintenanceData";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

let workOrders = [...maintenanceWorkOrdersSeed];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const STATUS_WEIGHT = {
  Scheduled: 0.75,
  "In Progress": 0.6,
  "Waiting for Parts": 0.45,
  Completed: 1.0,
};

function getActiveAlarmCountsByTurbine() {
  const map = {};
  alarmCenterAlarms
    .filter((a) => a.status === "Active")
    .forEach((a) => {
      map[a.turbineId] = (map[a.turbineId] ?? 0) + 1;
    });
  return map;
}

function buildPredictivePayload(turbineId) {
  const turbine = getTurbineBaseContext().find((t) => t.id === turbineId);
  const alarmCount = getActiveAlarmCountsByTurbine()[turbineId] ?? 0;
  if (!turbine) return null;

  const activeAlarms = alarmCenterAlarms.filter(
    (a) => a.status === "Active" && a.turbineId === turbineId,
  );
  const componentAlarmBoost = {
    Gearbox: activeAlarms.filter((a) => /gearbox/i.test(a.component)).length,
    Generator: activeAlarms.filter((a) =>
      /generator|control system/i.test(a.component),
    ).length,
    Bearings: activeAlarms.filter((a) => /bearing/i.test(a.component)).length,
    "Rotor Blades": activeAlarms.filter((a) => /rotor|blade/i.test(a.component))
      .length,
    "Pitch System": activeAlarms.filter((a) => /pitch/i.test(a.component))
      .length,
  };

  return {
    turbineId,
    health: turbine.health,
    vibration: turbine.vibration,
    temperatureTrend: {
      gearbox: turbine.gearboxTemp,
      generator: turbine.generatorTemp,
    },
    operatingHours: turbine.operatingHours,
    alarmHistory: alarmCount,
    componentAlarmBoost,
  };
}

function componentRiskScore(component, payload) {
  const tempAvg =
    (payload.temperatureTrend.gearbox + payload.temperatureTrend.generator) / 2;
  const vib = payload.vibration;
  const hrs = payload.operatingHours;
  const alarms = payload.alarmHistory;
  const alarmBoost = (payload.componentAlarmBoost?.[component] ?? 0) * 16;
  const healthPenalty =
    payload.health === "critical" ? 16 : payload.health === "warning" ? 8 : 0;

  const baseByComponent = {
    Gearbox:
      vib * 10.5 +
      payload.temperatureTrend.gearbox * 0.72 +
      hrs / 210 +
      alarms * 10,
    Generator:
      vib * 8.8 +
      payload.temperatureTrend.generator * 0.75 +
      hrs / 240 +
      alarms * 8,
    Bearings: vib * 11.2 + tempAvg * 0.62 + hrs / 195 + alarms * 9,
    "Rotor Blades": vib * 7.2 + tempAvg * 0.33 + hrs / 300 + alarms * 6,
    "Pitch System": vib * 8.1 + tempAvg * 0.44 + hrs / 280 + alarms * 7,
  };

  const base =
    (baseByComponent[component] ??
      vib * 8 + tempAvg * 0.5 + hrs / 260 + alarms * 7) +
    alarmBoost +
    healthPenalty;
  const probability = Math.max(6, Math.min(95, Math.round(base / 2.4)));
  const healthScore = Math.max(
    5,
    Math.min(98, 100 - probability + (payload.alarmHistory === 0 ? 4 : 0)),
  );

  let risk = "Low";
  if (probability >= 70) risk = "High";
  else if (probability >= 45) risk = "Medium";

  const maintenanceWindow =
    risk === "High"
      ? "Within 3 days"
      : risk === "Medium"
        ? "Within 7 days"
        : "Within 21 days";

  return {
    component,
    healthScore,
    failureProbability: probability,
    risk,
    maintenanceWindow,
  };
}

function parseJsonContent(content) {
  try {
    return JSON.parse(content);
  } catch {
    const match = content?.match?.(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Non-JSON response from Groq");
  }
}

function validatePredictiveResult(raw, payload) {
  if (
    !raw ||
    !Array.isArray(raw.componentPredictions) ||
    raw.componentPredictions.length === 0
  ) {
    return null;
  }

  const cleaned = raw.componentPredictions
    .map((c) => ({
      component: String(c.component ?? "").trim(),
      healthScore: Math.max(1, Math.min(99, Number(c.healthScore ?? 50))),
      failureProbability: Math.max(
        1,
        Math.min(99, Number(c.failureProbability ?? 50)),
      ),
      risk: ["Low", "Medium", "High"].includes(c.risk)
        ? c.risk
        : Number(c.failureProbability) >= 70
          ? "High"
          : Number(c.failureProbability) >= 45
            ? "Medium"
            : "Low",
      maintenanceWindow: String(c.maintenanceWindow ?? "Within 7 days"),
    }))
    .filter((c) => c.component.length > 0)
    .sort((a, b) => b.failureProbability - a.failureProbability);

  if (cleaned.length === 0) return null;

  const top = cleaned[0];
  return {
    turbineId: payload.turbineId,
    inputUsed: payload,
    componentPredictions: cleaned,
    overallHealth: Math.round(
      cleaned.reduce((s, c) => s + c.healthScore, 0) / cleaned.length,
    ),
    highestRiskComponent: top.component,
    predictedFailureProbability: top.failureProbability,
    recommendedMaintenanceWindow: top.maintenanceWindow,
  };
}

async function groqPredictive(payload) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) return null;

  const prompt = {
    task: "Predict wind turbine component failure risk",
    turbineId: payload.turbineId,
    health: payload.health,
    vibration: payload.vibration,
    temperatureTrend: payload.temperatureTrend,
    operatingHours: payload.operatingHours,
    alarmHistory: payload.alarmHistory,
    componentAlarmBoost: payload.componentAlarmBoost,
    expectedComponents: [
      "Gearbox",
      "Generator",
      "Bearings",
      "Rotor Blades",
      "Pitch System",
    ],
    outputSchema: {
      componentPredictions: [
        {
          component: "string",
          healthScore: "number 1..99",
          failureProbability: "number 1..99",
          risk: "Low|Medium|High",
          maintenanceWindow: "string",
        },
      ],
    },
  };

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 700,
      messages: [
        {
          role: "system",
          content:
            "You are a wind turbine predictive maintenance model. Return VALID JSON ONLY. No markdown. Prioritize component-specific alarm evidence so highest-risk component can vary by turbine.",
        },
        {
          role: "user",
          content: JSON.stringify(prompt),
        },
      ],
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content ?? "{}";
  const parsed = parseJsonContent(content);
  return validatePredictiveResult(parsed, payload);
}

async function groqRecommendation({ turbineId, predictiveResult }) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.25,
      max_tokens: 350,
      messages: [
        {
          role: "system",
          content:
            "You are an O&M maintenance copilot. Return VALID JSON ONLY with keys: title, confidence, recommendation, suggestedWindow, notes. Make action specific to the highest risk component.",
        },
        {
          role: "user",
          content: JSON.stringify({ turbineId, predictiveResult }),
        },
      ],
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content ?? "{}";
  const parsed = parseJsonContent(content);
  if (!parsed?.title || !parsed?.recommendation) return null;
  return {
    turbineId,
    title: String(parsed.title),
    confidence: Math.max(1, Math.min(99, Number(parsed.confidence ?? 70))),
    recommendation: String(parsed.recommendation),
    suggestedWindow: String(
      parsed.suggestedWindow ??
        predictiveResult?.recommendedMaintenanceWindow ??
        "Within 7 days",
    ),
    notes: String(
      parsed.notes ?? "Recommendation generated from turbine risk profile.",
    ),
  };
}

// GET /api/maintenance/summary
export async function getMaintenanceSummary() {
  await sleep(240);
  const pending = workOrders.filter((w) => w.status !== "Completed").length;
  const completed = workOrders.filter((w) => w.status === "Completed").length;
  const scheduled = workOrders.filter((w) => w.status === "Scheduled").length;

  const riskyTurbines = new Set(
    alarmCenterAlarms
      .filter(
        (a) =>
          a.status === "Active" &&
          (a.severity === "Critical" || a.escalationLevel === "confirmed"),
      )
      .map((a) => a.turbineId),
  );

  const avgDowntimeHours = Number(
    (pending * 1.6 + riskyTurbines.size * 2.1).toFixed(1),
  );

  const weightedEfficiency =
    workOrders.reduce((acc, wo) => acc + (STATUS_WEIGHT[wo.status] ?? 0.5), 0) /
    workOrders.length;
  const maintenanceEfficiency = Number((weightedEfficiency * 100).toFixed(1));

  return {
    scheduledTasks: scheduled,
    pendingMaintenance: pending,
    completedMaintenance: completed,
    highRiskTurbines: riskyTurbines.size,
    avgDowntimeHours,
    maintenanceEfficiency,
  };
}

// POST /api/ai/predictive-maintenance
export async function postPredictiveMaintenance(input) {
  await sleep(380);
  const payload = input?.turbineId
    ? buildPredictivePayload(input.turbineId)
    : input;
  if (!payload || !payload.turbineId) {
    throw new Error("Missing turbine payload for predictive maintenance");
  }

  try {
    const groqResult = await groqPredictive(payload);
    if (groqResult) return groqResult;
  } catch {
    // fall through to deterministic local model
  }

  const components = [
    "Gearbox",
    "Generator",
    "Bearings",
    "Rotor Blades",
    "Pitch System",
  ];
  const componentPredictions = components
    .map((c) => componentRiskScore(c, payload))
    .sort((a, b) => b.failureProbability - a.failureProbability);

  const highest = componentPredictions[0];

  return {
    turbineId: payload.turbineId,
    inputUsed: payload,
    componentPredictions,
    overallHealth: Math.round(
      componentPredictions.reduce((s, c) => s + c.healthScore, 0) /
        componentPredictions.length,
    ),
    highestRiskComponent: highest.component,
    predictedFailureProbability: highest.failureProbability,
    recommendedMaintenanceWindow: highest.maintenanceWindow,
  };
}

// GET /api/maintenance/workorders
export async function getMaintenanceWorkOrders() {
  await sleep(200);
  return [...workOrders];
}

// POST /api/maintenance/create-workorder
export async function createMaintenanceWorkOrder(data) {
  await sleep(220);
  const nextId = `WO-${24031 + workOrders.length}`;
  const order = {
    id: nextId,
    turbineId: data.turbineId,
    component: data.component,
    maintenanceType: data.maintenanceType,
    assignedEngineer: data.assignedEngineer,
    priority: data.priority,
    startDate: data.startDate,
    status: data.status ?? "Scheduled",
  };
  workOrders = [order, ...workOrders];
  return order;
}

// POST /api/ai/maintenance-recommendation
export async function postMaintenanceRecommendation({
  turbineId,
  predictiveResult,
}) {
  await sleep(330);
  const top = predictiveResult?.componentPredictions?.[0];
  if (!top) throw new Error("Predictive result required for recommendation");

  try {
    const groqResult = await groqRecommendation({
      turbineId,
      predictiveResult,
    });
    if (groqResult) return groqResult;
  } catch {
    // fall through to deterministic local recommendation
  }

  const actionMap = {
    Gearbox:
      "Lubrication quality test, oil debris analysis, and endoscope inspection",
    Generator: "Thermal imaging and winding resistance validation",
    Bearings: "Vibration spectrum analysis and bearing preload inspection",
    "Rotor Blades": "Blade surface inspection and balance check",
    "Pitch System": "Hydraulic pressure test and actuator calibration",
  };

  return {
    turbineId,
    title: `Possible ${top.component} wear detected`,
    confidence: Math.min(98, top.failureProbability + 4),
    recommendation:
      actionMap[top.component] ?? "Run detailed inspection workflow",
    suggestedWindow: top.maintenanceWindow,
    notes: `Risk level ${top.risk}. Triggered by vibration, temperature trend, operating hours, and alarm history.`,
  };
}

// GET /api/spareparts/inventory
export async function getSparePartsInventory() {
  await sleep(180);
  return [...sparePartsInventorySeed];
}

// POST /api/ai/sparepart-forecast
export async function postSparePartForecast(part) {
  await sleep(260);
  const dailyUse = part.usageRatePerWeek / 7;
  const daysToRunOut = Math.floor(part.stockLevel / Math.max(dailyUse, 0.01));
  const reorderStatus =
    daysToRunOut <= 14
      ? "Urgent Reorder"
      : daysToRunOut <= 30
        ? "Reorder Soon"
        : "Healthy";
  return {
    partName: part.partName,
    daysToRunOut,
    reorderStatus,
    message: `${part.partName} stock will run out in approximately ${daysToRunOut} days based on current maintenance trend.`,
  };
}

// GET /api/maintenance/schedule
export async function getMaintenanceSchedule() {
  await sleep(160);
  return [...maintenanceScheduleSeed];
}

// GET /api/technicians/workload
export async function getTechnicianWorkload() {
  await sleep(180);
  return technicianSeed.map((tech) => {
    const assigned = workOrders.filter(
      (w) => w.assignedEngineer === tech.name && w.status !== "Completed",
    );
    const completed = workOrders.filter(
      (w) => w.assignedEngineer === tech.name && w.status === "Completed",
    );
    const total = assigned.length + completed.length;
    const completionRate =
      total === 0 ? 100 : Math.round((completed.length / total) * 100);
    return {
      technicianName: tech.name,
      assignedTasks: assigned.length,
      completionRate,
      availability: tech.availability,
    };
  });
}
