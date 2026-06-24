import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from 'recharts';

export default function PerformanceAnalyticsCharts({ performance }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-full min-h-[360px]">
      <div className="mb-2">
        <h2 className="text-sm font-bold text-slate-800">Turbine Performance Analytics</h2>
        <p className="text-xs text-slate-400">
          {performance?.turbineLabel
            ? `${performance.turbineLabel} · power curve, efficiency trends, and production history`
            : 'Power vs wind speed, efficiency trends, and production history'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-[280px]">
        <div className="rounded-lg border border-slate-100 p-2">
          <p className="text-[11px] font-semibold text-slate-500 mb-1">Power vs Wind Speed</p>
          <ResponsiveContainer width="100%" height="88%">
            <ScatterChart>
              <CartesianGrid stroke="#e2e8f0" />
              <XAxis type="number" dataKey="windSpeed" name="Wind" unit="m/s" tick={{ fontSize: 10 }} />
              <YAxis type="number" dataKey="powerMW" name="Power" unit="MW" tick={{ fontSize: 10 }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={performance?.scatter ?? []} fill="#0f766e" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-slate-100 p-2">
          <p className="text-[11px] font-semibold text-slate-500 mb-1">Efficiency Trend</p>
          <ResponsiveContainer width="100%" height="88%">
            <LineChart data={performance?.trend ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="efficiency" stroke="#2563eb" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="windSpeed" stroke="#f59e0b" dot={false} strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-slate-100 p-2">
          <p className="text-[11px] font-semibold text-slate-500 mb-1">Energy Production History</p>
          <ResponsiveContainer width="100%" height="88%">
            <AreaChart data={performance?.productionHistory ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey="energyMWh" stroke="#0f766e" fill="#99f6e4" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
