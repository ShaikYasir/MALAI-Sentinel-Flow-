const STATUS = {
  normal:   { label: 'Normal',   dot: 'bg-green-500',              badge: 'bg-green-50 text-green-700 border-green-200',  top: 'border-t-green-400' },
  warning:  { label: 'Warning',  dot: 'bg-amber-500',              badge: 'bg-amber-50 text-amber-700 border-amber-200',  top: 'border-t-amber-400' },
  critical: { label: 'Critical', dot: 'bg-red-500 animate-pulse',  badge: 'bg-red-50 text-red-700 border-red-200',        top: 'border-t-red-500'   },
};

export default function TurbineStatusCard({ turbine, isSelected, onSelect }) {
  const { id, power, windSpeed, health, rpm, efficiency } = turbine;
  const cfg = STATUS[health] ?? STATUS.normal;

  const effColor =
    efficiency === 0 ? 'text-red-600' :
    efficiency < 60  ? 'text-red-500' :
    efficiency < 80  ? 'text-amber-600' : 'text-green-600';

  const barColor =
    efficiency === 0 ? 'bg-red-500' :
    efficiency < 60  ? 'bg-red-400' :
    efficiency < 80  ? 'bg-amber-500' : 'bg-green-500';

  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-xl border shadow-sm p-4 border-t-4 cursor-pointer transition-all duration-150 ${
        isSelected
          ? `border-blue-400 ring-2 ring-blue-300 ring-offset-1 ${cfg.top}`
          : `border-slate-200 hover:border-slate-300 hover:shadow-md ${cfg.top}`
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-slate-800 text-sm">{id}</span>
        <span className={`flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-y-2 gap-x-3">
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Power</p>
          <p className={`text-base font-bold leading-none ${health === 'critical' ? 'text-red-600' : 'text-slate-800'}`}>
            {power.toFixed(1)}<span className="text-xs font-normal text-slate-400 ml-0.5">MW</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Wind</p>
          <p className="text-base font-bold text-slate-800 leading-none">
            {windSpeed}<span className="text-xs font-normal text-slate-400 ml-0.5">m/s</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">RPM</p>
          <p className="text-sm font-semibold text-slate-700">{rpm}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Eff.</p>
          <p className={`text-sm font-semibold ${effColor}`}>{efficiency}%</p>
        </div>
      </div>

      {/* Efficiency bar */}
      <div className="mt-3 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${efficiency}%` }}
        />
      </div>
    </div>
  );
}
