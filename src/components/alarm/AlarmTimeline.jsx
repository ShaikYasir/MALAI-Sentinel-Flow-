import { Activity } from 'lucide-react';

const ESCALATION_STYLE = {
  monitoring: { dot: 'bg-blue-400',  line: 'bg-blue-100', text: 'text-blue-600',  badge: 'bg-blue-50  text-blue-700  border-blue-200'  },
  warning:    { dot: 'bg-amber-400', line: 'bg-amber-100',text: 'text-amber-600', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed:  { dot: 'bg-red-500',   line: 'bg-red-100',  text: 'text-red-600',   badge: 'bg-red-50   text-red-700   border-red-200'   },
  info:       { dot: 'bg-slate-300', line: 'bg-slate-50', text: 'text-slate-400', badge: 'bg-slate-50 text-slate-500 border-slate-200' },
};

const SEV_DOT = {
  Critical: 'bg-red-500 animate-pulse',
  Warning:  'bg-amber-400',
  Info:     'bg-slate-300',
};

export default function AlarmTimeline({ events }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-full">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Activity size={14} className="text-blue-500" /> Alarm Timeline
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Chronological event history</p>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="relative">
          {/* Continuous vertical line */}
          <div className="absolute left-[9px] top-2 bottom-0 w-px bg-slate-100" />

          <ul className="space-y-0">
            {events.map((ev, idx) => {
              const escCfg = ESCALATION_STYLE[ev.escalation] ?? ESCALATION_STYLE.info;
              const isFirst = idx === 0;
              return (
                <li key={ev.id} className="relative flex gap-3 pb-3">
                  {/* Timeline dot */}
                  <div className="relative z-10 mt-1 shrink-0">
                    <span className={`block w-[18px] h-[18px] rounded-full border-2 border-white shadow-sm ${escCfg.dot}`} />
                  </div>

                  {/* Event card */}
                  <div className={`flex-1 min-w-0 rounded-lg border px-3 py-2.5 ${isFirst ? 'ring-1 ring-blue-200 border-blue-200 bg-blue-50/50' : 'border-slate-100 bg-slate-50/50'}`}>
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <span className="font-bold text-[11px] text-slate-700 truncate">{ev.turbineId}</span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">{ev.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-snug">{ev.event}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${escCfg.badge}`}>
                        {ev.escalation}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <span className={`w-1.5 h-1.5 rounded-full ${SEV_DOT[ev.severity] ?? ''}`} />
                        {ev.severity}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
