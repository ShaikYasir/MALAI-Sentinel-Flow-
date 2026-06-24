import {
  alarmCenterAlarms,
  turbineSensorReadings,
} from "../data/alarmCenterData";
import {
  powerChartData,
  powerChartData7d,
  turbineFleetData,
} from "../data/mockData";
import { maintenanceWorkOrdersSeed } from "../data/maintenanceData";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function safeJsonParse(content) {
  try {
    return JSON.parse(content);
  } catch {
    const match = content?.match?.(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Non-JSON response");
  }
}

function getTurbine(turbineId) {
  return turbineFleetData.find((t) => t.id === turbineId);
}

export async function getAlarmPatterns() {
  await sleep(220);

  const active = alarmCenterAlarms.filter((a) => a.status === "Active");
  const byTurbineMap = {};
  const byTypeMap = {};
  const heatMap = [];

  active.forEach((alarm) => {
    byTurbineMap[alarm.turbineId] = (byTurbineMap[alarm.turbineId] ?? 0) + 1;
    byTypeMap[alarm.type] = (byTypeMap[alarm.type] ?? 0) + 1;

    const turbine = getTurbine(alarm.turbineId);
    heatMap.push({
      turbineId: alarm.turbineId,
      zone: alarm.zone,
      alarmType: alarm.type,
      severity: alarm.severity,
      vibration: turbine?.vibration ?? 0,
      gearboxTemp: turbine?.gearboxTemp ?? 0,
      count: alarm.occurrenceCount,
    });
  });

  const byTurbine = Object.entries(byTurbineMap)
    .map(([turbineId, count]) => ({ turbineId, count }))
    .sort((a, b) => b.count - a.count);

  const commonTypes = Object.entries(byTypeMap)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  return { byTurbine, commonTypes, heatMap };
}

export async function getPerformanceAnalytics(turbineId) {
  await sleep(260);

  const selectedTurbine =
    getTurbine(turbineId ?? "WT-003") ?? turbineFleetData[0];
  const powerScale =
    selectedTurbine.ratedCapacity > 0
      ? selectedTurbine.power /
        1000 /
        Math.max(selectedTurbine.ratedCapacity, 0.1)
      : 0;
  const efficiencyBias = (selectedTurbine.efficiency - 82) * 0.22;
  const windBias = (selectedTurbine.windSpeed - 10.5) * 0.18;

  const scatter = selectedTurbine.powerCurve.map((point) => ({
    windSpeed: point.wind,
    powerMW: Number((point.actual / 1000).toFixed(2)),
    expectedMW: Number((point.expected / 1000).toFixed(2)),
  }));

  const trend = powerChartData.map((p, index) => ({
    time: p.time,
    power: Number(
      Math.max(
        0,
        (selectedTurbine.power / 1000) *
          (0.78 + (index % 6) * 0.035 + powerScale * 0.08),
      ).toFixed(2),
    ),
    windSpeed: Number((p.windSpeed + windBias).toFixed(1)),
    efficiency: Math.max(
      0,
      Math.min(100, Math.round(p.efficiency + efficiencyBias)),
    ),
  }));

  const productionHistory = powerChartData7d.map((d, index) => ({
    day: d.time,
    energyMWh: Number(
      (
        Math.max(0, selectedTurbine.power / 1000) *
        (16.5 + index * 0.85) *
        0.42
      ).toFixed(1),
    ),
    efficiency: Math.max(
      0,
      Math.min(100, Math.round(d.efficiency + efficiencyBias * 0.9)),
    ),
  }));

  return {
    turbineId: selectedTurbine.id,
    turbineLabel: `${selectedTurbine.id} · ${selectedTurbine.model}`,
    scatter,
    trend,
    productionHistory,
  };
}

export async function getRootCauseGraph(turbineId) {
  await sleep(200);

  const targetId = turbineId ?? "WT-003";
  const turbine = getTurbine(targetId);
  const turbineAlarms = alarmCenterAlarms.filter(
    (a) => a.turbineId === targetId && a.status === "Active",
  );
  const alarm = turbineAlarms[0] ?? null;
  const sensors = turbineSensorReadings[targetId] ?? [];

  const wind = turbine?.windSpeed ?? 9.5;
  const vib = turbine?.vibration ?? 2.8;
  const temp = turbine?.gearboxTemp ?? 68;
  const alarmWeight = Math.min(22, turbineAlarms.length * 6);
  const healthPenalty =
    turbine?.health === "critical"
      ? 20
      : turbine?.health === "warning"
        ? 10
        : 0;
  const riskBase = Math.max(
    8,
    Math.min(
      92,
      Math.round(vib * 6.5 + temp * 0.34 + alarmWeight + healthPenalty - 14),
    ),
  );
  const healthyMode =
    turbine?.health === "normal" && turbineAlarms.length === 0;
  const faultVariants = ["branch-top", "branch-center", "branch-wide"];
  const healthyVariants = ["healthy-wave", "healthy-stagger"];
  const faultSeed = Math.abs(
    (targetId ?? "").split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0) +
      turbineAlarms.length +
      Math.round(vib * 10) +
      Math.round(temp),
  );
  const healthySeed = Math.abs(
    (targetId ?? "").split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0) +
      Math.round(wind * 10),
  );
  const layoutVariant = healthyMode
    ? healthyVariants[healthySeed % healthyVariants.length]
    : faultVariants[faultSeed % faultVariants.length];

  let nodes;
  let edges;

  if (healthyMode) {
    nodes = [
      {
        id: "env-ok",
        label: `Stable Wind Profile (${wind.toFixed(1)} m/s)`,
        type: "environment",
        score: Math.max(90, 98 - Math.round(Math.abs(wind - 11.5) * 3)),
      },
      {
        id: "sensor-ok",
        label: `Rotor and Vibration Within Band (${vib.toFixed(1)} mm/s)`,
        type: "sensor",
        score: Math.max(88, 97 - Math.round(vib * 3)),
      },
      {
        id: "component-ok",
        label: `Drive Train Healthy (${temp.toFixed(0)} °C gearbox)`,
        type: "component",
        score: Math.max(86, 98 - Math.round((temp - 58) * 0.8)),
      },
      {
        id: "alarm-ok",
        label: "Everything is fine - No active alarm chain",
        type: "alarm",
        score: 96,
      },
    ];

    edges = [
      { from: "env-ok", to: "sensor-ok", confidence: 0.93 },
      { from: "sensor-ok", to: "component-ok", confidence: 0.95 },
      { from: "component-ok", to: "alarm-ok", confidence: 0.97 },
    ];
  } else {
    const alarmLabel = alarm
      ? `${alarm.type} Alarm (${targetId})`
      : `Alarm Correlation Risk (${targetId})`;
    nodes = [
      {
        id: "env-1",
        label: `High Wind Loading (${Math.max(9.0, wind + 0.6).toFixed(1)} m/s)`,
        type: "environment",
        score: Math.min(98, Math.max(28, Math.round(riskBase - 16))),
      },
      {
        id: "sensor-1",
        label: `Rotor Speed and Torque Shift`,
        type: "sensor",
        score: Math.min(98, Math.max(34, Math.round(riskBase - 8))),
      },
      {
        id: "component-1",
        label: `Gearbox Stress Build-up`,
        type: "component",
        score: Math.min(99, Math.max(40, riskBase)),
      },
      {
        id: "sensor-2",
        label: `Vibration Increase (${vib.toFixed(1)} mm/s)`,
        type: "sensor",
        score: Math.min(99, Math.max(38, Math.round(riskBase + 4))),
      },
      {
        id: "sensor-3",
        label: `Thermal Rise (${temp.toFixed(0)} °C)`,
        type: "sensor",
        score: Math.min(99, Math.max(36, Math.round(riskBase + 1))),
      },
      {
        id: "alarm-1",
        label: alarmLabel,
        type: "alarm",
        score: Math.min(99, Math.max(44, Math.round(riskBase + 8))),
      },
    ];

    edges = [
      {
        from: "env-1",
        to: "sensor-1",
        confidence: Math.min(0.97, Math.max(0.62, (riskBase - 8) / 100)),
      },
      {
        from: "sensor-1",
        to: "component-1",
        confidence: Math.min(0.98, Math.max(0.65, riskBase / 100)),
      },
      {
        from: "component-1",
        to: "sensor-2",
        confidence: Math.min(0.99, Math.max(0.66, (riskBase + 6) / 100)),
      },
      {
        from: "component-1",
        to: "sensor-3",
        confidence: Math.min(0.97, Math.max(0.61, (riskBase + 2) / 100)),
      },
      {
        from: "sensor-2",
        to: "alarm-1",
        confidence: Math.min(0.99, Math.max(0.68, (riskBase + 7) / 100)),
      },
      {
        from: "sensor-3",
        to: "alarm-1",
        confidence: Math.min(0.98, Math.max(0.63, (riskBase + 5) / 100)),
      },
    ];
  }

  return {
    turbineId: targetId,
    incident: alarm ?? { id: `RCA-${targetId}`, type: "Healthy Status" },
    sensorSnapshot: sensors,
    healthyMode,
    layoutVariant,
    nodes,
    edges,
  };
}

export async function getIncidentByTurbine(turbineId) {
  await sleep(220);

  const turbine = getTurbine(turbineId);
  const alarms = alarmCenterAlarms.filter((a) => a.turbineId === turbineId);
  const sensors = turbineSensorReadings[turbineId] ?? [];
  const relatedMaintenance = maintenanceWorkOrdersSeed.filter(
    (w) => w.turbineId === turbineId,
  );
  const dag = await getRootCauseGraph(turbineId);

  return {
    turbine,
    alarms,
    sensors,
    relatedMaintenance,
    dag,
  };
}

async function groqAnemoQuery({ command, incidentContext }) {
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
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content:
            "You are Anemo, an AI troubleshooting copilot for wind farms. Return JSON only with keys: summary, recommendation, confidence, suggestedTags, actionItems.",
        },
        {
          role: "user",
          content: JSON.stringify({ command, incidentContext }),
        },
      ],
    }),
  });

  if (!response.ok) return null;
  const json = await response.json();
  const content = json?.choices?.[0]?.message?.content ?? "{}";
  const parsed = safeJsonParse(content);

  if (!parsed?.summary) return null;
  return {
    summary: String(parsed.summary),
    recommendation: String(
      parsed.recommendation ?? "Run full inspection workflow.",
    ),
    confidence: Math.max(1, Math.min(99, Number(parsed.confidence ?? 72))),
    suggestedTags: Array.isArray(parsed.suggestedTags)
      ? parsed.suggestedTags.map(String)
      : [],
    actionItems: Array.isArray(parsed.actionItems)
      ? parsed.actionItems.map(String)
      : [],
  };
}

export async function postAnemoQuery({ command, turbineId, threadContext }) {
  await sleep(340);

  const incidentContext = await getIncidentByTurbine(turbineId);

  try {
    const groqResult = await groqAnemoQuery({ command, incidentContext });
    if (groqResult) return groqResult;
  } catch {
    // fallback below
  }

  const alarmCount = incidentContext.alarms.length;
  const criticalCount = incidentContext.alarms.filter(
    (a) => a.severity === "Critical",
  ).length;
  const avgVibration = average(
    incidentContext.sensors
      .filter((s) => /vibration/i.test(s.sensor))
      .map((s) => Number(s.value))
      .filter((n) => Number.isFinite(n)),
  );

  return {
    summary: `For ${turbineId}, ${alarmCount} alarms are linked in this session (${criticalCount} critical). Sensor correlation suggests a component-driven fault sequence with notable vibration evidence (${avgVibration.toFixed(1)} mm/s avg where available).`,
    recommendation:
      "Prioritize gearbox and bearing inspection, then verify lubrication and rotor loading profile within 48 hours.",
    confidence: 74,
    suggestedTags: [`#${turbineId}`, "#gearbox", "#vibration"],
    actionItems: [
      "Capture fresh vibration spectrum and compare to baseline",
      "Run oil debris check and seal integrity inspection",
      "Attach technician findings back to this incident thread",
    ],
  };
}

async function groqAnomalyQuery(payload) {
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
      temperature: 0.2,
      max_tokens: 420,
      messages: [
        {
          role: "system",
          content:
            "You detect turbine sensor anomalies. Return JSON only with keys: title, anomaly, severity, probableCause, recommendation, confidence.",
        },
        { role: "user", content: JSON.stringify(payload) },
      ],
    }),
  });

  if (!response.ok) return null;
  const json = await response.json();
  const content = json?.choices?.[0]?.message?.content ?? "{}";
  const parsed = safeJsonParse(content);
  if (!parsed?.title || !parsed?.anomaly) return null;

  return {
    title: String(parsed.title),
    anomaly: String(parsed.anomaly),
    severity: ["low", "medium", "high", "critical"].includes(
      String(parsed.severity).toLowerCase(),
    )
      ? String(parsed.severity).toLowerCase()
      : "medium",
    probableCause: String(
      parsed.probableCause ?? "Component wear trend under review.",
    ),
    recommendation: String(
      parsed.recommendation ?? "Schedule targeted inspection.",
    ),
    confidence: Math.max(1, Math.min(99, Number(parsed.confidence ?? 71))),
  };
}

export async function postAnomalyDetection({ turbineId }) {
  await sleep(320);

  const incident = await getIncidentByTurbine(turbineId);
  const payload = {
    turbineId,
    health: incident.turbine?.health,
    alarms: incident.alarms,
    sensors: incident.sensors,
  };

  try {
    const groqResult = await groqAnomalyQuery(payload);
    if (groqResult) return groqResult;
  } catch {
    // fallback below
  }

  const topVibration = incident.sensors
    .filter((s) => /vibration/i.test(s.sensor))
    .sort((a, b) => Number(b.value) - Number(a.value))[0];

  const severity = incident.alarms.some((a) => a.severity === "Critical")
    ? "high"
    : "medium";

  return {
    title: `Anomalous sensor behavior detected in ${turbineId}`,
    anomaly: topVibration
      ? `${topVibration.sensor} is elevated at ${topVibration.value} ${topVibration.unit}.`
      : "Correlated temperature and pressure drift exceeds expected baseline.",
    severity,
    probableCause:
      "Possible early-stage bearing or gearbox degradation under variable rotor loading.",
    recommendation:
      "Create a high-priority condition-monitoring work order and validate with on-site inspection within 24-48 hours.",
    confidence: 78,
  };
}
