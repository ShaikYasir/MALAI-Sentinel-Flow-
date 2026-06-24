const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are an expert wind turbine SCADA engineer specialising in alarm management, false alarm mitigation, and predictive maintenance for offshore and onshore wind farms.

When asked to analyse a turbine alarm, respond with VALID JSON ONLY — no markdown, no preamble. Use exactly this schema:
{
  "verdict":        "False Alarm" | "Confirmed Fault" | "Under Investigation",
  "confidence":     <integer 0-100>,
  "cause":          "<concise technical cause — max 12 words>",
  "reasoning":      "<2-3 technical sentences explaining the multi-sensor evidence used>",
  "recommendation": "<specific, actionable next step for the O&M team>",
  "urgency":        "low" | "medium" | "high" | "critical"
}

Key diagnostic rule: if ONLY ONE sensor deviates while all others are within bounds → lean toward False Alarm. If TWO or MORE corroborating sensors confirm the fault pattern → lean toward Confirmed Fault.`;

/**
 * Analyse a turbine alarm using the Groq LLM API.
 * @param {{ turbineId: string, component: string, alarmType: string, occurrenceCount: number, sensors: Array<{sensor:string,value:number,unit:string,status:string}> }} payload
 * @returns {Promise<{verdict:string,confidence:number,cause:string,reasoning:string,recommendation:string,urgency:string}>}
 */
export async function analyzeAlarm({
  turbineId,
  component,
  alarmType,
  occurrenceCount,
  sensors,
}) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) throw new Error("VITE_GROQ_API_KEY is not set in .env");

  const sensorBlock = sensors
    .map((s) => `  ${s.sensor}: ${s.value} ${s.unit}  [status: ${s.status}]`)
    .join("\n");

  const userPrompt =
    `Analyse the following wind turbine alarm and determine if it is a false alarm or a confirmed fault.\n\n` +
    `Turbine    : ${turbineId}\n` +
    `Component  : ${component}\n` +
    `Alarm Type : ${alarmType}\n` +
    `Occurrences: ${occurrenceCount} / 3\n\n` +
    `Live Sensor Readings:\n${sensorBlock}\n\n` +
    `Apply multi-sensor correlation analysis. Focus on oil-leakage false alarm patterns where a single sensor fluctuation can trigger a misleading alert.`;

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 450,
      temperature: 0.15,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "{}";

  try {
    return JSON.parse(content);
  } catch {
    // strip possible markdown code fences
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("AI returned non-JSON response");
  }
}
