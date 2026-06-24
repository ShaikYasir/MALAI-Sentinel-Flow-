import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { powerChartData, powerChartData7d, powerChartData30d } from '../data/mockData';

const RANGES = ['24h', '7d', '30d'];

const CHART_DATA = {
  '24h': powerChartData,
  '7d':  powerChartData7d,
  '30d': powerChartData30d,
};

const SUBTITLES = {
  '24h': 'Wind speed · Power output · Efficiency — last 24 hours',
  '7d':  'Wind speed · Power output · Efficiency — last 7 days',
  '30d': 'Wind speed · Power output · Efficiency — last 30 days',
};

const X_INTERVALS = { '24h': 3, '7d': 0, '30d': 4 };

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 shadow-lg rounded-lg p-3 min-w-[140px]">
      <p className="text-xs font-semibold text-slate-700 mb-2 border-b border-slate-100 pb-1">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between space-x-4 mb-1 last:mb-0">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-slate-500">{entry.name}</span>
          </div>
          <span className="text-xs font-bold text-slate-800">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function PowerChart() {
  const [activeRange, setActiveRange] = useState('24h');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Real-Time Power Generation</h3>
          <p className="text-xs text-slate-400 mt-0.5">{SUBTITLES[activeRange]}</p>
        </div>
        <div className="flex space-x-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setActiveRange(r)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeRange === r
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'text-slate-500 hover:bg-slate-50 border border-transparent'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="p-5">
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={CHART_DATA[activeRange]} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="gPow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gWind" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gEff" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              interval={X_INTERVALS[activeRange]}
            />
            <YAxis
              yAxisId="mw"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              width={42}
              tickFormatter={(v) => `${v}MW`}
            />
            <YAxis
              yAxisId="ms"
              orientation="right"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              width={42}
              tickFormatter={(v) => `${v}m/s`}
            />

            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={7}
              formatter={(v) => <span className="text-xs text-slate-500">{v}</span>}
            />

            <Area yAxisId="mw" type="monotone" dataKey="power"      name="Power (MW)"   stroke="#2563eb" fill="url(#gPow)"  strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
            <Area yAxisId="ms" type="monotone" dataKey="windSpeed"  name="Wind (m/s)"   stroke="#10b981" fill="url(#gWind)" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
            <Area yAxisId="mw" type="monotone" dataKey="efficiency" name="Efficiency %" stroke="#f59e0b" fill="url(#gEff)"  strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
