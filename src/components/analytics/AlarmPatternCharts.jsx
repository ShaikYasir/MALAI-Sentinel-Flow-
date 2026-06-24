import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const COLORS = ['#0f766e', '#0369a1', '#b45309', '#be123c', '#4338ca', '#475569'];

function levelColor(count) {
  if (count >= 3) return 'bg-red-500';
  if (count >= 2) return 'bg-amber-500';
  return 'bg-emerald-500';
}

export default function AlarmPatternCharts({ patterns }) {
  const typeLabel = (value) => (String(value).length > 14 ? `${String(value).slice(0, 14)}...` : value);

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-full min-h-[460px] min-w-0 flex flex-col">
      <div className="mb-2">
        <h2 className="text-sm font-bold text-slate-800">Alarm Pattern Analytics</h2>
        <p className="text-xs text-slate-400">Frequency per turbine, common types, and heat intensity matrix</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-[170px] min-h-0 min-w-0">
        <div className="h-full min-w-0 rounded-lg border border-slate-100 p-2 overflow-hidden">
          <p className="text-[11px] font-semibold text-slate-500 mb-1">Alarm Frequency per Turbine</p>
          <ResponsiveContainer width="100%" height="86%">
            <BarChart data={patterns?.byTurbine ?? []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="turbineId" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {(patterns?.byTurbine ?? []).map((entry, idx) => (
                  <Cell key={`${entry.turbineId}-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="h-full min-w-0 rounded-lg border border-slate-100 p-2 overflow-hidden">
          <p className="text-[11px] font-semibold text-slate-500 mb-1">Most Common Alarm Types</p>
          <ResponsiveContainer width="100%" height="86%">
            <BarChart data={patterns?.commonTypes ?? []} layout="vertical" margin={{ left: 6, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="type" tick={{ fontSize: 10 }} width={74} tickFormatter={typeLabel} />
              <Tooltip />
              <Bar dataKey="count" fill="#334155" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-slate-100 p-2 min-h-0 flex-1 overflow-hidden">
        <p className="text-[11px] font-semibold text-slate-500 mb-2">Occurrence Heatmap</p>
        <div className="show-scrollbar grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 h-[280px] overflow-y-auto pr-1 pb-1">
          {(patterns?.heatMap ?? []).map((item, idx) => (
            <div key={`${item.turbineId}-${item.alarmType}-${idx}`} className="rounded-md border border-slate-200 p-2">
              <p className="text-[10px] text-slate-500">{item.turbineId}</p>
              <p className="text-xs font-semibold text-slate-700 truncate">{item.alarmType}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${levelColor(item.count)}`} />
                <span className="text-[10px] text-slate-600">x{item.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
