import { useState } from 'react';
import { Bot, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { analyzeAlarm } from '../../services/groqService';
import { turbineSensorReadings } from '../../data/alarmCenterData';

const SENSOR_STATUS_STYLE = {
  normal:     { bg: 'bg-green-50',  border: 'border-green-200',  value: 'text-green-700',  label: 'Normal',     dot: 'bg-green-500'  },
  'low-alert':  { bg: 'bg-amber-50', border: 'border-amber-200',  value: 'text-amber-700',  label: 'Low Alert',  dot: 'bg-amber-400'  },
  'high-alert': { bg: 'bg-orange-50',border: 'border-orange-200', value: 'text-orange-700', label: 'High Alert', dot: 'bg-orange-400' },
  critical:   { bg: 'bg-red-50',    border: 'border-red-200',    value: 'text-red-700',    label: 'Critical',   dot: 'bg-red-500 animate-pulse' },
  offline:    { bg: 'bg-slate-100', border: 'border-slate-200',  value: 'text-slate-400',  label: 'Offline',    dot: 'bg-slate-400'  },
};

const VERDICT_STYLE = {
  'False Alarm':        { bg: 'bg-green-50',  border: 'border-green-300',  title: 'text-green-800',  badge: 'bg-green-100 text-green-700 border-green-300' },
  'Confirmed Fault':    { bg: 'bg-red-50',    border: 'border-red-300',    title: 'text-red-800',    badge: 'bg-red-100 text-red-700 border-red-300'       },
  'Under Investigation':{ bg: 'bg-amber-50',  border: 'border-amber-300',  title: 'text-amber-800',  badge: 'bg-amber-100 text-amber-700 border-amber-300' },
};

const URGENCY_COLOR = { low: 'text-green-600', medium: 'text-amber-600', high: 'text-orange-600', critical: 'text-red-600' };

function SensorTile({ sensor }) {
  const cfg  = SENSOR_STATUS_STYLE[sensor.status] ?? SENSOR_STATUS_STYLE.normal;
  const pct  = sensor.status === 'offline' ? 0
    : Math.min(100, Math.max(0, ((sensor.value - sensor.min) / (sensor.max - sensor.min)) * 100));
  const barColor = sensor.status === 'normal' ? 'bg-green-400'
    : sensor.status === 'critical' ? 'bg-red-500'
    : sensor.status === 'offline' ? 'bg-slate-300' : 'bg-amber-400';

  return (
    <div className={`${cfg.bg} border ${cfg.border} rounded-lg p-3`}>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] text-slate-500 font-medium truncate pr-1">{sensor.sensor}</p>
        <span className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${cfg.badge ?? `border-transparent`}`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>
      <p className={`text-sm font-bold leading-none ${cfg.value}`}>
        {sensor.status === 'offline' ? '—' : sensor.value}
        <span className="text-xs font-normal text-slate-400 ml-1">{sensor.unit}</span>
      </p>
      <div className="mt-2 h-1 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[9px] text-slate-400 mt-0.5">Range: {sensor.min} – {sensor.max} {sensor.unit}</p>
    </div>
  );
}

export default function FalseAlarmDetectionPanel({ alarms, selectedAlarm, onSelectAlarm }) {
  const [result,    setResult]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [lastAlarmId, setLastAlarmId] = useState(null);

  const sensors = selectedAlarm ? (turbineSensorReadings[selectedAlarm.turbineId] ?? []) : [];

  const handleAnalyze = async () => {
    if (!selectedAlarm) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setLastAlarmId(selectedAlarm.id);
    try {
      const res = await analyzeAlarm({
        turbineId:       selectedAlarm.turbineId,
        component:       selectedAlarm.component,
        alarmType:       selectedAlarm.type,
        occurrenceCount: selectedAlarm.occurrenceCount,
        sensors,
      });
      setResult(res);
    } catch (err) {
      setError(err.message ?? 'AI analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const verdictCfg = result ? (VERDICT_STYLE[result.verdict] ?? VERDICT_STYLE['Under Investigation']) : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-full">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Bot size={15} className="text-blue-500" /> False Alarm Detection
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">AI-powered multi-sensor analysis via Groq</p>
        </div>
        {selectedAlarm && (
          <span className="text-[11px] font-semibold px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg border border-blue-200">
            {selectedAlarm.turbineId} · {selectedAlarm.component}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Alarm selector */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
            Select Alarm to Analyse
          </label>
          <div className="relative">
            <select
              value={selectedAlarm?.id ?? ''}
              onChange={(e) => {
                const a = alarms.find((x) => x.id === e.target.value);
                if (a) { onSelectAlarm(a.id); setResult(null); setError(null); }
              }}
              className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 pr-8 text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 appearance-none"
            >
              <option value="">— choose an alarm —</option>
              {alarms
                .filter((a) => a.status !== 'Resolved')
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id} · {a.turbineId} · {a.type} ({a.severity})
                  </option>
                ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Sensor grid */}
        {sensors.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Live Sensor Readings — {selectedAlarm?.turbineId}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {sensors.map((s) => <SensorTile key={s.sensor} sensor={s} />)}
            </div>
          </div>
        )}

        {!selectedAlarm && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Bot size={32} className="text-slate-300 mb-3" />
            <p className="text-xs text-slate-400">Select an alarm above to load sensor data<br />and run AI analysis.</p>
          </div>
        )}

        {/* Analyse button */}
        {selectedAlarm && sensors.length > 0 && (
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold transition-colors"
          >
            {loading
              ? (<><Loader2 size={14} className="animate-spin" /> Analysing with Groq AI…</>)
              : (<><Bot size={14} /> Run AI Analysis</>)
            }
          </button>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {/* AI Result */}
        {result && verdictCfg && (
          <div className={`${verdictCfg.bg} border ${verdictCfg.border} rounded-xl p-4 space-y-3`}>
            {/* Verdict + confidence */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${verdictCfg.badge}`}>
                {result.verdict}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      result.verdict === 'False Alarm' ? 'bg-green-500'
                      : result.verdict === 'Confirmed Fault' ? 'bg-red-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
                <span className={`text-xs font-bold ${verdictCfg.title}`}>{result.confidence}%</span>
              </div>
            </div>

            {/* Cause */}
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Root Cause</p>
              <p className={`text-xs font-semibold ${verdictCfg.title}`}>{result.cause}</p>
            </div>

            {/* Reasoning */}
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Analysis</p>
              <p className="text-xs text-slate-600 leading-relaxed">{result.reasoning}</p>
            </div>

            {/* Recommendation */}
            <div className="bg-white/70 rounded-lg p-3 border border-white">
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Recommendation</p>
              <p className="text-xs text-slate-700 leading-relaxed">{result.recommendation}</p>
            </div>

            {/* Meta */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/50">
              <span>Model: llama-3.3-70b-versatile</span>
              <span className={`font-semibold uppercase ${URGENCY_COLOR[result.urgency] ?? ''}`}>
                Urgency: {result.urgency}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
