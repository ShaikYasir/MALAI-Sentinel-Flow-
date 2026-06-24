import { useState } from 'react';
import { Bell, BellRing, CheckCircle2, Send } from 'lucide-react';

export default function OperatorNotificationPanel({ alarms, sentNotifications, onSendNotification }) {
  const [expanded, setExpanded] = useState(null);

  const confirmedActive = alarms.filter(
    (a) => a.escalationLevel === 'confirmed' && a.status === 'Active'
  );
  const alreadySentIds = new Set(sentNotifications.map((n) => n.alarmId));

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-full">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <BellRing size={14} className="text-red-500" /> Operator Notifications
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Confirmed faults requiring action</p>
        </div>
        {confirmedActive.length > 0 && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
            {confirmedActive.length} pending
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Pending notifications */}
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Pending Dispatch
          </p>
          {confirmedActive.length === 0 && (
            <div className="py-6 text-center">
              <CheckCircle2 size={24} className="text-green-400 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No pending operator notifications.</p>
            </div>
          )}
          <ul className="space-y-2">
            {confirmedActive.map((alarm) => {
              const sent    = alreadySentIds.has(alarm.id);
              const isOpen  = expanded === alarm.id;
              return (
                <li key={alarm.id} className={`rounded-lg border overflow-hidden ${sent ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50/60'}`}>
                  <div
                    className="flex items-center justify-between px-3 py-2.5 cursor-pointer"
                    onClick={() => setExpanded(isOpen ? null : alarm.id)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${sent ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                      <span className="text-xs font-bold text-slate-800 shrink-0">{alarm.turbineId}</span>
                      <span className="text-xs text-slate-500 truncate">— {alarm.type}</span>
                    </div>
                    {sent
                      ? <span className="text-[10px] text-green-600 font-bold shrink-0">Notified ✓</span>
                      : <span className="text-[10px] text-red-600 font-bold shrink-0">Action Req.</span>
                    }
                  </div>

                  {isOpen && (
                    <div className="px-3 pb-3 border-t border-red-100 pt-2.5 space-y-2">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                        {[
                          ['Turbine',   alarm.turbineId],
                          ['Zone',      alarm.zone],
                          ['Component', alarm.component],
                          ['Alarm',     alarm.type],
                          ['Severity',  alarm.severity],
                          ['Occurred',  `${alarm.occurrenceCount}× since ${alarm.triggeredAt}`],
                        ].map(([k, v]) => (
                          <div key={k}>
                            <span className="text-slate-400">{k}: </span>
                            <span className="text-slate-700 font-semibold">{v}</span>
                          </div>
                        ))}
                      </div>
                      <div className="bg-white/80 rounded-md p-2 border border-red-100">
                        <p className="text-[10px] font-semibold text-red-700 uppercase tracking-wider mb-0.5">Required Action</p>
                        <p className="text-[11px] text-slate-600">Operator physical inspection required at {alarm.turbineId} ({alarm.component}).</p>
                      </div>
                      {!sent && (
                        <button
                          onClick={() => onSendNotification(alarm)}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
                        >
                          <Send size={12} /> Notify Operator
                        </button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Sent log */}
        {sentNotifications.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Dispatch Log
            </p>
            <ul className="space-y-1.5">
              {sentNotifications.map((n, i) => (
                <li key={i} className="flex items-start gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                  <CheckCircle2 size={13} className="text-green-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-green-800">{n.turbineId} — {n.type}</p>
                    <p className="text-[10px] text-slate-400 font-mono">Notified at {n.notifiedAt}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
