import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const STATUS_CLR = {
  normal:   { text: 'text-emerald-700', bar: 'bg-emerald-500', chip: 'bg-emerald-50 border-emerald-200 text-emerald-700', ring: '#10b981' },
  warning:  { text: 'text-amber-700',   bar: 'bg-amber-500',   chip: 'bg-amber-50 border-amber-200 text-amber-700',   ring: '#f59e0b' },
  critical: { text: 'text-red-700',     bar: 'bg-red-500',     chip: 'bg-red-50 border-red-200 text-red-700',         ring: '#ef4444' },
};

const QUICK_CLR = {
  Running:           'bg-emerald-50 text-emerald-700 border-emerald-200',
  Standby:           'bg-blue-50 text-blue-700 border-blue-200',
  Curtailment:       'bg-amber-50 text-amber-700 border-amber-200',
  'Grid limitation': 'bg-purple-50 text-purple-700 border-purple-200',
  'Weather shutdown':'bg-slate-100 text-slate-600 border-slate-200',
  Fault:             'bg-red-50 text-red-700 border-red-200',
};

function StatTile({ label, value, unit, tone = 'text-slate-800' }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
      <p className="text-[11px] text-slate-500 mb-1">{label}</p>
      <p className={`text-sm font-semibold ${tone}`}>
        {value}
        <span className="text-xs font-normal text-slate-400 ml-1">{unit}</span>
      </p>
    </div>
  );
}

function CurveTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-2.5 min-w-[130px]">
      <p className="text-xs font-semibold text-slate-700 mb-1.5 border-b border-slate-100 pb-1">{label} m/s</p>
      {payload.map((e) => (
        <div key={e.dataKey} className="flex items-center justify-between gap-3 mb-0.5 last:mb-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
            <span className="text-xs text-slate-500">{e.name}</span>
          </div>
          <span className="text-xs font-semibold text-slate-800">{e.value} kW</span>
        </div>
      ))}
    </div>
  );
}

export default function TurbineDetailPanel({ turbine }) {
  if (!turbine) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center">
        <p className="text-sm text-slate-400">Select a turbine from fleet table or map to inspect details.</p>
      </div>
    );
  }

  const sc = STATUS_CLR[turbine.health] ?? STATUS_CLR.normal;
  const circumference = 2 * Math.PI * 16;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800">{turbine.id}</h3>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${QUICK_CLR[turbine.quickStatus] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                {turbine.quickStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{turbine.model} · {turbine.manufacturer} · {turbine.zone}</p>
          </div>

          <div className="text-right">
            <p className="text-xl font-bold text-slate-800">
              {(turbine.power / 1000).toFixed(2)}
              <span className="text-sm font-normal text-slate-400 ml-1">MW</span>
            </p>
            <p className="text-[11px] text-slate-400">Rated {turbine.ratedCapacity} MW</p>
          </div>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 2xl:grid-cols-12 gap-5">

        <section className="2xl:col-span-5 space-y-4">
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Operational Metrics</h4>
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-2.5">
            <StatTile label="Power Output" value={(turbine.power / 1000).toFixed(2)} unit="MW" />
            <StatTile label="Wind Speed" value={turbine.windSpeed} unit="m/s" />
            <StatTile label="Rotor Speed" value={turbine.rpm} unit="RPM" tone={turbine.rpm === 0 ? 'text-red-700' : 'text-slate-800'} />
            <StatTile label="Blade Pitch" value={turbine.bladePitch} unit="deg" tone={turbine.bladePitch > 20 ? 'text-amber-700' : 'text-slate-800'} />
            <StatTile label="Yaw Angle" value={turbine.yawAngle} unit="deg" />
            <StatTile label="Efficiency" value={turbine.efficiency} unit="%" tone={turbine.efficiency < 40 ? 'text-red-700' : turbine.efficiency < 70 ? 'text-amber-700' : 'text-emerald-700'} />
          </div>

          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pt-2">Thermal & Mechanical</h4>
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-2.5">
            <StatTile label="Gearbox Temp" value={turbine.gearboxTemp} unit="degC" tone={turbine.gearboxTemp > 90 ? 'text-red-700' : turbine.gearboxTemp > 80 ? 'text-amber-700' : 'text-slate-800'} />
            <StatTile label="Generator Temp" value={turbine.generatorTemp} unit="degC" tone={turbine.generatorTemp > 85 ? 'text-red-700' : turbine.generatorTemp > 75 ? 'text-amber-700' : 'text-slate-800'} />
            <StatTile label="Bearing Temp" value={turbine.bearingTemp} unit="degC" tone={turbine.bearingTemp > 100 ? 'text-red-700' : turbine.bearingTemp > 80 ? 'text-amber-700' : 'text-slate-800'} />
            <StatTile label="Vibration" value={turbine.vibration} unit="mm/s" tone={turbine.vibration > 6 ? 'text-red-700' : turbine.vibration > 3.5 ? 'text-amber-700' : 'text-slate-800'} />
            <StatTile label="Shaft Torque" value={turbine.shaftTorque.toLocaleString()} unit="kNm" />
          </div>
        </section>

        <section className="2xl:col-span-3 space-y-4">
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Component Health</h4>
          <div className="space-y-2.5">
            {turbine.components.map((c) => {
              const cs = STATUS_CLR[c.status] ?? STATUS_CLR.normal;
              return (
                <div key={c.name} className="grid grid-cols-[70px_1fr_38px] items-center gap-2">
                  <span className="text-xs text-slate-600">{c.name}</span>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${cs.bar}`} style={{ width: `${c.health}%` }} />
                  </div>
                  <span className={`text-[11px] font-semibold text-right ${cs.text}`}>{c.health}%</span>
                </div>
              );
            })}
          </div>

          <div className="rounded-lg border border-slate-200 p-3.5 bg-slate-50">
            <p className="text-[11px] text-slate-500 mb-2">Availability</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold text-slate-800">{turbine.availability}%</p>
                <p className="text-[11px] text-slate-400">Operating health score</p>
              </div>
              <svg viewBox="0 0 40 40" className="w-14 h-14 -rotate-90">
                <circle cx="20" cy="20" r="16" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke={sc.ring}
                  strokeWidth="3.5"
                  strokeDasharray={`${(turbine.availability / 100) * circumference} ${circumference}`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-200">
              <div>
                <p className="text-[11px] text-slate-500">Operating Hrs</p>
                <p className="text-xs font-semibold text-slate-700">{turbine.operatingHours.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Downtime Hrs</p>
                <p className="text-xs font-semibold text-slate-700">{turbine.downtime.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-3.5">
            <p className="text-[11px] text-slate-500 mb-2">Technical Information</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between"><span className="text-slate-500">Manufacturer</span><span className="font-semibold text-slate-700">{turbine.manufacturer}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-500">Model</span><span className="font-semibold text-slate-700">{turbine.model}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-500">Rotor Diameter</span><span className="font-semibold text-slate-700">{turbine.rotorDiameter} m</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-500">Hub Height</span><span className="font-semibold text-slate-700">{turbine.hubHeight} m</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-500">Install Year</span><span className="font-semibold text-slate-700">{turbine.installYear}</span></div>
            </div>
          </div>
        </section>

        <section className="2xl:col-span-4">
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Power Curve</h4>
          <div className="rounded-lg border border-slate-200 p-3.5">
            <ResponsiveContainer width="100%" height={270}>
              <LineChart data={turbine.powerCurve} margin={{ top: 4, right: 8, bottom: 12, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="wind" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={44} tickFormatter={(v) => `${v}kW`} />
                <Tooltip content={<CurveTooltip />} />
                <Legend iconType="circle" iconSize={7} formatter={(v) => <span className="text-xs text-slate-500">{v}</span>} />
                <Line type="monotone" dataKey="expected" name="Expected" stroke="#94a3b8" strokeWidth={2} strokeDasharray="6 3" dot={false} />
                <Line type="monotone" dataKey="actual" name="Actual" stroke="#2563eb" strokeWidth={2} dot={{ r: 2.5, fill: '#2563eb' }} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
            <p className={`mt-2 text-[11px] ${sc.text}`}>
              Performance delta highlights aerodynamic or control inefficiencies under varying wind speed.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
