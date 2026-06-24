import { alarmCenterAlarms } from "../data/alarmCenterData";
import {
  maintenanceWorkOrdersSeed,
  sparePartsInventorySeed,
  technicianSeed,
} from "../data/maintenanceData";
import { powerChartData7d, turbineFleetData } from "../data/mockData";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const REPORT_TYPES = [
  "Daily Operations Report",
  "Alarm Summary Report",
  "Maintenance Activity Report",
  "Turbine Performance Report",
  "Energy Production Report",
  "False Alarm Analysis Report",
  "Turbine Availability Report",
  "Downtime Analysis Report",
  "Environmental Impact Summary",
  "Energy Generation Compliance Report",
];

const OUTPUT_FORMATS = ["PDF", "CSV", "Excel"];
const TEMPLATES = [
  "Management Report",
  "Engineering Analysis Report",
  "Maintenance Log Report",
];

let archiveStore = [
  {
    id: "RPT-00128",
    name: "Weekly Ops Report",
    type: "Turbine Performance Report",
    template: "Management Report",
    generatedAt: "2026-03-10 18:02",
    format: "PDF",
    version: "v1.2",
    turbines: ["WT-001", "WT-003", "WT-004", "WT-007"],
  },
  {
    id: "RPT-00127",
    name: "Alarm Reliability Report",
    type: "False Alarm Analysis Report",
    template: "Engineering Analysis Report",
    generatedAt: "2026-03-09 09:10",
    format: "Excel",
    version: "v2.0",
    turbines: ["WT-003", "WT-011", "WT-012"],
  },
];

let scheduledReports = [
  {
    id: "SCH-RPT-301",
    name: "Daily Operations Auto Run",
    reportType: "Daily Operations Report",
    scheduleLabel: "Daily - 06:00 PM",
    recipients: ["system dashboard", "management portal"],
    format: "PDF",
    active: true,
  },
  {
    id: "SCH-RPT-302",
    name: "Weekly Management Summary",
    reportType: "Turbine Performance Report",
    scheduleLabel: "Weekly - Monday 09:00 AM",
    recipients: ["email", "management portal"],
    format: "Excel",
    active: true,
  },
];

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function toYmd(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function parseJsonContent(content) {
  try {
    return JSON.parse(content);
  } catch {
    const match = content?.match?.(/\{[\s\S]*\}/);
    if (!match) throw new Error("Invalid JSON response");
    return JSON.parse(match[0]);
  }
}

function getSelectedTurbines(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return turbineFleetData;
  return turbineFleetData.filter((turbine) => ids.includes(turbine.id));
}

function getEnergyMWhForTurbines(turbines) {
  const totalPowerMw = turbines.reduce(
    (sum, turbine) => sum + turbine.power / 1000,
    0,
  );
  return Number((totalPowerMw * 24 * 0.63).toFixed(1));
}

function createComplianceMetrics(turbines) {
  const availability = Number(
    average(turbines.map((t) => t.availability)).toFixed(1),
  );
  const totalDowntime = Math.round(
    turbines.reduce((sum, t) => sum + (t.downtime ?? 0), 0) / 60,
  );
  const energyGWh = Number(
    (getEnergyMWhForTurbines(turbines) / 1000).toFixed(2),
  );
  const curtailmentHours = Math.round(
    turbines.filter((t) => t.quickStatus === "Curtailment").length * 3.2,
  );
  const gridCompliance = Number(
    Math.max(92, Math.min(99.7, availability + 1.7)).toFixed(1),
  );

  return {
    availability,
    totalDowntime,
    energyGWh,
    curtailmentHours,
    gridCompliance,
  };
}

function createFalseAlarmMetrics(turbines) {
  const selectedIds = new Set(turbines.map((t) => t.id));
  const alarms = alarmCenterAlarms.filter((alarm) =>
    selectedIds.has(alarm.turbineId),
  );
  const occurrenceTrackedAlarms = alarms.filter(
    (alarm) => alarm.countInOccurrenceMetrics !== false,
  );
  const triggered = occurrenceTrackedAlarms.reduce(
    (sum, alarm) => sum + (alarm.occurrenceCount ?? 1),
    0,
  );
  const confirmed = occurrenceTrackedAlarms.filter(
    (alarm) => alarm.escalationLevel === "confirmed",
  ).length;
  const falseAlarms = Math.max(0, triggered - confirmed);
  const falseAlarmRate =
    triggered === 0 ? 0 : Number(((falseAlarms / triggered) * 100).toFixed(1));

  return {
    triggered,
    confirmed,
    falseAlarms,
    falseAlarmRate,
  };
}

function createMaintenanceOpsMetrics(turbines) {
  const selectedIds = new Set(turbines.map((t) => t.id));
  const workOrders = maintenanceWorkOrdersSeed.filter((wo) =>
    selectedIds.has(wo.turbineId),
  );

  const hoursByType = {
    "Predictive Inspection": 5.5,
    "Corrective Maintenance": 8.2,
    "Parts Replacement": 10.4,
    "Condition Monitoring": 4.2,
    "Firmware + Diagnostics": 6.3,
    "Vibration Inspection": 4.7,
    "Actuator Calibration": 3.9,
    "Alignment Service": 3.5,
  };

  const maintenanceHours = Number(
    workOrders
      .reduce((sum, wo) => sum + (hoursByType[wo.maintenanceType] ?? 5.1), 0)
      .toFixed(1),
  );

  const techLoad = technicianSeed.map((tech) => {
    const assigned = workOrders.filter(
      (wo) => wo.assignedEngineer === tech.name,
    ).length;
    return { name: tech.name, assigned };
  });

  const mostLoaded = techLoad.sort((a, b) => b.assigned - a.assigned)[0] ?? {
    name: "N/A",
    assigned: 0,
  };
  const topComponent =
    Object.entries(
      workOrders.reduce((map, wo) => {
        map[wo.component] = (map[wo.component] ?? 0) + 1;
        return map;
      }, {}),
    ).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Gearbox";

  const downtimeHours = Number(
    (maintenanceHours * 0.78 + turbines.length * 1.4).toFixed(1),
  );

  return {
    maintenanceHours,
    technicianWorkload: `${mostLoaded.name} (${mostLoaded.assigned} jobs)`,
    sparePartsUsage: `${sparePartsInventorySeed.length} part families tracked`,
    downtimeHours,
    topComponent,
    averageRepairHours: Number(
      (maintenanceHours / Math.max(workOrders.length, 1)).toFixed(1),
    ),
  };
}

function createOperationalKpis(turbines) {
  const activeCount = turbines.filter(
    (t) => t.quickStatus === "Running",
  ).length;
  const availability = Number(
    average(turbines.map((t) => t.availability)).toFixed(1),
  );
  const reliability = Number(
    (
      100 -
      average(
        turbines.map((t) =>
          t.health === "critical" ? 32 : t.health === "warning" ? 15 : 5,
        ),
      )
    ).toFixed(1),
  );
  const energyMWh = getEnergyMWhForTurbines(turbines);
  const totalPowerMw = Number(
    turbines.reduce((sum, t) => sum + t.power / 1000, 0).toFixed(1),
  );

  return {
    turbinesIncluded: turbines.length,
    activeCount,
    availability,
    reliability,
    totalPowerMw,
    energyMWh,
  };
}

function createPreviewSections({
  reportType,
  turbines,
  timeRange,
  template,
  format,
}) {
  const kpis = createOperationalKpis(turbines);
  const falseAlarms = createFalseAlarmMetrics(turbines);
  const maintenanceOps = createMaintenanceOpsMetrics(turbines);
  const compliance = createComplianceMetrics(turbines);

  return {
    reportMeta: {
      reportType,
      template,
      format,
      generatedAt: new Date().toLocaleString(),
      period: `${toYmd(timeRange.start)} to ${toYmd(timeRange.end)}`,
      turbines: turbines.map((t) => t.id),
    },
    kpis,
    falseAlarms,
    maintenanceOps,
    compliance,
    turbineSummaries: turbines.map((t) => ({
      id: t.id,
      health: t.health,
      availability: t.availability,
      powerMw: Number((t.power / 1000).toFixed(2)),
      efficiency: t.efficiency,
    })),
    chartSeries: {
      energy: powerChartData7d.map((point, index) => ({
        label: point.time,
        energyMWh: Number((point.power * 1.45 + index * 0.4).toFixed(1)),
      })),
      reliability: turbines.map((t) => ({
        turbineId: t.id,
        reliability:
          t.health === "critical" ? 63 : t.health === "warning" ? 81 : 95,
      })),
    },
  };
}

async function groqExecutiveSummary(payload) {
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
      max_tokens: 520,
      messages: [
        {
          role: "system",
          content:
            "You generate detailed wind farm executive summaries. The insight must match the selected report type focus. Do not mention money, costs, currency, or budgets. Return VALID JSON only with keys: summary, keyPoints. Summary should be 2-4 sentences and keyPoints should be 4 concise bullets.",
        },
        {
          role: "user",
          content: JSON.stringify(payload),
        },
      ],
    }),
  });

  if (!response.ok) return null;
  const json = await response.json();
  const content = json?.choices?.[0]?.message?.content ?? "{}";
  const parsed = parseJsonContent(content);
  if (!parsed?.summary) return null;

  return {
    summary: String(parsed.summary),
    keyPoints: Array.isArray(parsed.keyPoints)
      ? parsed.keyPoints.map(String)
      : [],
  };
}

function buildTypeFocusedInsight(reportType, preview) {
  const k = preview?.kpis ?? {};
  const f = preview?.falseAlarms ?? {};
  const m = preview?.maintenanceOps ?? {};
  const c = preview?.compliance ?? {};

  const map = {
    "Daily Operations Report": {
      summary:
        `Daily operations remained stable with ${k.activeCount ?? 0} active turbines out of ${k.turbinesIncluded ?? 0}, ` +
        `overall availability at ${k.availability ?? 0}% and reliability at ${k.reliability ?? 0}%. ` +
        `Energy production reached ${k.energyMWh ?? 0} MWh, while alarm validation maintained a ${f.falseAlarmRate ?? 0}% false alarm rate.`,
      keyPoints: [
        `Operational readiness: ${k.activeCount ?? 0}/${k.turbinesIncluded ?? 0} turbines online.`,
        `Availability held at ${k.availability ?? 0}% for the selected period.`,
        `Energy production totaled ${k.energyMWh ?? 0} MWh.`,
        `False alarm filtering effectiveness remained at ${f.falseAlarmRate ?? 0}%.`,
      ],
    },
    "Alarm Summary Report": {
      summary:
        `Alarm-focused analysis shows ${f.triggered ?? 0} triggered events with ${f.confirmed ?? 0} confirmed faults, ` +
        `resulting in ${f.falseAlarms ?? 0} false alarms. ` +
        `The validation workflow continues to reduce unnecessary interventions by separating genuine fault chains from noisy alarm behavior.`,
      keyPoints: [
        `Triggered alarms reviewed: ${f.triggered ?? 0}.`,
        `Confirmed fault cases: ${f.confirmed ?? 0}.`,
        `False alarms isolated: ${f.falseAlarms ?? 0}.`,
        `Current false alarm rate: ${f.falseAlarmRate ?? 0}%.`,
      ],
    },
    "Maintenance Activity Report": {
      summary:
        `Maintenance operations were centered on ${m.topComponent ?? "key drivetrain"} systems, with ${m.maintenanceHours ?? 0} total maintenance hours executed. ` +
        `Average repair duration remained at ${m.averageRepairHours ?? 0} hours, and technician distribution indicates ${m.technicianWorkload ?? "balanced assignments"}. ` +
        `Downtime-linked service impact was tracked at ${m.downtimeHours ?? 0} hours.`,
      keyPoints: [
        `Total maintenance execution: ${m.maintenanceHours ?? 0} hours.`,
        `Average repair duration: ${m.averageRepairHours ?? 0} hours.`,
        `Most serviced component: ${m.topComponent ?? "N/A"}.`,
        `Recorded maintenance-related downtime: ${m.downtimeHours ?? 0} hours.`,
      ],
    },
    "Turbine Performance Report": {
      summary:
        `Performance analysis indicates ${k.reliability ?? 0}% system reliability with fleet availability at ${k.availability ?? 0}%. ` +
        `The turbine set produced ${k.energyMWh ?? 0} MWh during the selected window, with ${k.activeCount ?? 0} turbines maintaining active output. ` +
        `Operational behavior is consistent with expected fleet performance patterns.`,
      keyPoints: [
        `System reliability index: ${k.reliability ?? 0}%.`,
        `Fleet availability: ${k.availability ?? 0}%.`,
        `Energy produced: ${k.energyMWh ?? 0} MWh.`,
        `Active generation units: ${k.activeCount ?? 0}.`,
      ],
    },
    "Energy Production Report": {
      summary:
        `Energy production review reports ${k.energyMWh ?? 0} MWh generated across the selected turbines, supported by ${k.activeCount ?? 0} active units. ` +
        `Availability at ${k.availability ?? 0}% and reliability at ${k.reliability ?? 0}% indicate stable operational contribution to output targets. ` +
        `Generation continuity remained within expected farm operating thresholds.`,
      keyPoints: [
        `Total energy generated: ${k.energyMWh ?? 0} MWh.`,
        `Active turbines contributing: ${k.activeCount ?? 0}.`,
        `Availability during period: ${k.availability ?? 0}%.`,
        `Reliability baseline: ${k.reliability ?? 0}%.`,
      ],
    },
    "False Alarm Analysis Report": {
      summary:
        `False alarm analysis identified ${f.falseAlarms ?? 0} false positives from ${f.triggered ?? 0} triggered alarms, with ${f.confirmed ?? 0} events validated as true faults. ` +
        `This detection profile supports cleaner incident triage and better prioritization of engineering attention. ` +
        `Overall alarm quality remains trackable through the current false alarm rate of ${f.falseAlarmRate ?? 0}%.`,
      keyPoints: [
        `Triggered alarm instances: ${f.triggered ?? 0}.`,
        `Validated faults: ${f.confirmed ?? 0}.`,
        `False positives filtered: ${f.falseAlarms ?? 0}.`,
        `False alarm rate: ${f.falseAlarmRate ?? 0}%.`,
      ],
    },
    "Turbine Availability Report": {
      summary:
        `Availability reporting shows fleet uptime at ${c.availability ?? 0}% with ${k.activeCount ?? 0} turbines currently active. ` +
        `Total downtime across selected assets is ${c.totalDowntime ?? 0} hours, while reliability remains at ${k.reliability ?? 0}%. ` +
        `The operating profile indicates resilient asset availability in the selected reporting interval.`,
      keyPoints: [
        `Fleet availability: ${c.availability ?? 0}%.`,
        `Total downtime: ${c.totalDowntime ?? 0} hours.`,
        `Active turbines: ${k.activeCount ?? 0}/${k.turbinesIncluded ?? 0}.`,
        `Reliability indicator: ${k.reliability ?? 0}%.`,
      ],
    },
    "Downtime Analysis Report": {
      summary:
        `Downtime analysis records ${c.totalDowntime ?? 0} hours of total downtime, including ${m.downtimeHours ?? 0} hours associated with maintenance execution and ${c.curtailmentHours ?? 0} hours of curtailment. ` +
        `Availability remains at ${c.availability ?? 0}%, highlighting targeted opportunities for uptime recovery through focused maintenance scheduling.`,
      keyPoints: [
        `Total downtime footprint: ${c.totalDowntime ?? 0} hours.`,
        `Maintenance-linked downtime: ${m.downtimeHours ?? 0} hours.`,
        `Curtailment impact: ${c.curtailmentHours ?? 0} hours.`,
        `Current availability level: ${c.availability ?? 0}%.`,
      ],
    },
    "Environmental Impact Summary": {
      summary:
        `Environmental impact metrics indicate ${c.energyGWh ?? 0} GWh generated with grid compliance at ${c.gridCompliance ?? 0}%. ` +
        `Fleet availability of ${c.availability ?? 0}% and controlled curtailment at ${c.curtailmentHours ?? 0} hours support stable, regulation-aligned clean energy delivery. ` +
        `Operational performance remains favorable for sustainability reporting.`,
      keyPoints: [
        `Energy generated: ${c.energyGWh ?? 0} GWh.`,
        `Grid compliance score: ${c.gridCompliance ?? 0}%.`,
        `Fleet availability: ${c.availability ?? 0}%.`,
        `Curtailment duration: ${c.curtailmentHours ?? 0} hours.`,
      ],
    },
    "Energy Generation Compliance Report": {
      summary:
        `Compliance reporting confirms ${c.energyGWh ?? 0} GWh energy generation with a grid compliance index of ${c.gridCompliance ?? 0}%. ` +
        `Availability at ${c.availability ?? 0}% and total downtime of ${c.totalDowntime ?? 0} hours provide the key operational context for regulatory submission. ` +
        `The selected fleet remains within expected compliance-oriented operating bounds.`,
      keyPoints: [
        `Regulatory energy generation: ${c.energyGWh ?? 0} GWh.`,
        `Grid compliance index: ${c.gridCompliance ?? 0}%.`,
        `Fleet availability metric: ${c.availability ?? 0}%.`,
        `Total downtime context: ${c.totalDowntime ?? 0} hours.`,
      ],
    },
  };

  return map[reportType] ?? map["Daily Operations Report"];
}

export async function getReportGeneratorOptions() {
  await sleep(140);
  return {
    reportTypes: REPORT_TYPES,
    outputFormats: OUTPUT_FORMATS,
    templates: TEMPLATES,
    turbines: turbineFleetData.map((t) => ({
      id: t.id,
      zone: t.zone,
      health: t.health,
    })),
  };
}

// POST /api/reports/generate
export async function postGenerateReport({
  reportType,
  turbines,
  timeRange,
  format,
  template,
}) {
  await sleep(320);

  const selectedTurbines = getSelectedTurbines(turbines);
  const preview = createPreviewSections({
    reportType,
    turbines: selectedTurbines,
    timeRange,
    template,
    format,
  });

  const reportId = `RPT-${String(130 + archiveStore.length).padStart(5, "0")}`;
  const version = `v${Math.max(1, Math.round(archiveStore.length / 5))}.${(archiveStore.length % 5) + 1}`;

  const archiveRecord = {
    id: reportId,
    name: `${reportType.replace("Report", "").trim()} ${toYmd(timeRange.end)}`,
    type: reportType,
    template,
    generatedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    format,
    version,
    turbines: selectedTurbines.map((t) => t.id),
  };

  archiveStore = [archiveRecord, ...archiveStore];

  return {
    reportId,
    outputFormat: format,
    downloadName: `${reportId}-${reportType.replace(/\s+/g, "-")}.${format.toLowerCase()}`,
    preview,
    archiveRecord,
  };
}

// POST /api/ai/report-summary
export async function postAIReportSummary({ reportType, preview }) {
  await sleep(280);
  const focused = buildTypeFocusedInsight(reportType, preview);

  try {
    const groq = await groqExecutiveSummary({ reportType, preview });
    if (groq) {
      const mergedKeyPoints = [
        ...(groq.keyPoints ?? []),
        ...(focused.keyPoints ?? []),
      ]
        .filter(Boolean)
        .slice(0, 6);

      return {
        source: "groq",
        summary: groq.summary?.length > 140 ? groq.summary : focused.summary,
        keyPoints: mergedKeyPoints,
      };
    }
  } catch {
    // deterministic fallback below
  }

  return {
    source: "local-model",
    summary: focused.summary,
    keyPoints: focused.keyPoints,
  };
}

// POST /api/reports/schedule
export async function postScheduleReport(payload) {
  await sleep(200);

  const record = {
    id: `SCH-RPT-${310 + scheduledReports.length}`,
    name: payload.name,
    reportType: payload.reportType,
    scheduleLabel: payload.scheduleLabel,
    recipients: payload.recipients,
    format: payload.format,
    active: true,
  };

  scheduledReports = [record, ...scheduledReports];
  return record;
}

export async function getScheduledReports() {
  await sleep(120);
  return [...scheduledReports];
}

// GET /api/reports/archive
export async function getReportArchive() {
  await sleep(130);
  return [...archiveStore];
}
