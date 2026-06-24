import { turbineSensorReadings } from '../../data/alarmCenterData';

const STATUS_STYLE = {
  normal:       { bg: 'bg-green-50',   border: 'border-green-200',  dot: 'bg-green-500',  text: 'text-green-700',  label: 'OK'         },
  'low-alert':  { bg: 'bg-amber-50',   border: 'border-amber-200',  dot: 'bg-amber-400',  text: 'text-amber-700',  label: 'Low Alert'  },
  'high-alert': { bg: 'bg-orange-50',  border: 'border-orange-200', dot: 'bg-orange-400', text: 'text-orange-700', label: 'High Alert' },
  critical:     { bg: 'bg-red-50',     border: 'border-red-200',    dot: 'bg-red-500',    text: 'text-red-700',    label: 'Critical'   },
  offline:      { bg: 'bg-slate-100',  border: 'border-slate-200',  dot: 'bg-slate-400',  text: 'text-slate-400',  label: 'Offline'    },
};

function getCorrelation(sensors) {
  if (!sensors || sensors.length === 0) return null;
  const deviating = sensors.filter((s) => s.status !== 'normal' && s.status !== 'offline');
  const total     = sensors.filter((s) => s.status !== 'offline').length;
  const ratio     = deviating.length / Math.max(total, 1);

  if (deviating.length === 0) return { label: 'All Nominal',         level: 'normal',   confidence: 'Very Low',  pct: 10  };
  if (deviating.length === 1) return { label: 'Single Sensor Fault', level: 'low',      confidence: 'Low',       pct: 28  };
  if (ratio < 0.5)            return { label: 'Partial Correlation',  level: 'medium',   confidence: 'Medium',    pct: 55  };
  if (ratio < 0.75)           return { label: 'Multi-Sensor Alert',   level: 'high',     confidence: 'High',      pct: 78  };
  return                             { label: 'Full Sensor Fault',    level: 'critical', confidence: 'Very High', pct: 96  };
}

const CORR_COLOR = {
  normal:   { bar: 'bg-green-400', text: 'text-green-700',  badge: 'bg-green-50  border-green-300  text-green-700'  },
  low:      { bar: 'bg-blue-400',  text: 'text-blue-700',   badge: 'bg-blue-50   border-blue-300   text-blue-700'   },
  medium:   { bar: 'bg-amber-400', text: 'text-amber-700',  badge: 'bg-amber-50  border-amber-300  text-amber-700'  },
  high:     { bar: 'bg-orange-500',text: 'text-orange-700', badge: 'bg-orange-50 border-orange-300 text-orange-700' },
  critical: { bar: 'bg-red-500',   text: 'text-red-700',    badge: 'bg-red-50    border-red-300    text-red-700'    },
};

export default function SensorCorrelationView({ selectedAlarm }) {
  const sensors    = selectedAlarm ? (turbineSensorReadings[selectedAlarm.turbineId] ?? []) : [];
  const correlation = getCorrelation(sensors);
  const deviating  = sensors.filter((s) => s.status !== 'normal' && s.status !== 'offline');
  const faultConclusion = deviating.length <= 1
    ? 'Only one sensor deviates — likely a false alarm or transient sensor fluctuation.'
    : `${deviating.length} sensors confirm the fault pattern — escalate for inspection.`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-full">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <h3 className="text-sm font-bold text-slate-800">Sensor Correlation</h3>
        <p className="text-xs text-slate-400 mt-0.5">Multi-sensor fault validation matrix</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!selectedAlarm && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-xs text-slate-400">Select an alarm to view<br />sensor correlation analysis.</p>
          </div>
        )}

        {selectedAlarm && sensors.length === 0 && (
          <div className="py-6 text-center">
            <p className="text-xs text-slate-400">No sensor readings available for {selectedAlarm.turbineId}.</p>
          </div>
        )}

        {selectedAlarm && sensors.length > 0 && correlation && (
          <>
            {/* Correlation score */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600">Correlation Level</span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${CORR_COLOR[correlation.level]?.badge}`}>
                  {correlation.label}
                </span>
              </div>
              <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${CORR_COLOR[correlation.level]?.bar}`}
                  style={{ width: `${correlation.pct}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-slate-400">
                <span>Low Confidence</span>
                <span className={`font-bold ${CORR_COLOR[correlation.level]?.text}`}>
                  {correlation.confidence} ({correlation.pct}%)
                </span>
                <span>Confirmed Fault</span>
              </div>
            </div>

            {/* Sensor status matrix */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {selectedAlarm.turbineId} — {sensors.length} sensors monitored
              </p>
              <div className="space-y-1.5">
                {sensors.map((s) => {
                  const cfg = STATUS_STYLE[s.status] ?? STATUS_STYLE.normal;
                  const isDeviating = s.status !== 'normal' && s.status !== 'offline';
                  return (
                    <div
                      key={s.sensor}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border ${cfg.border} ${cfg.bg} ${isDeviating ? 'ring-1 ring-offset-0' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                        <span className="text-xs text-slate-700 font-medium">{s.sensor}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono font-bold text-slate-600">
                          {s.status === 'offline' ? '—' : `${s.value} ${s.unit}`}
                        </span>
                        <span className={`text-[10px] font-bold ${cfg.text}`}>{cfg.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div className={`p-3.5 rounded-lg border ${deviating.length <= 1 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1 text-slate-500">Correlation Verdict</p>
              <p className={`text-xs font-semibold ${deviating.length <= 1 ? 'text-green-700' : 'text-red-700'}`}>
                {faultConclusion}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                {deviating.length} of {sensors.filter(s => s.status !== 'offline').length} sensors deviating
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
