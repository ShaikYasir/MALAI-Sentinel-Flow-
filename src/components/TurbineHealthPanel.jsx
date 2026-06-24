const BAR_COLOR   = { normal: 'bg-green-500', warning: 'bg-amber-500', critical: 'bg-red-500' };
const VALUE_COLOR = { normal: 'text-slate-800', warning: 'text-amber-600', critical: 'text-red-600' };
const STATUS_DOT  = { normal: 'bg-green-500', warning: 'bg-amber-500', critical: 'bg-red-500 animate-pulse' };

export default function TurbineHealthPanel({ turbineId, metrics }) {
  const criticalCount = metrics.filter((m) => m.status === 'critical').length;
  const warningCount  = metrics.filter((m) => m.status === 'warning').length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Turbine Health Metrics</h3>
            <p className="text-xs text-slate-400 mt-0.5">Selected: <span className="font-semibold text-blue-600">{turbineId}</span></p>
          </div>
          <div className="flex space-x-1.5">
            {criticalCount > 0 && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                {criticalCount} Critical
              </span>
            )}
            {warningCount > 0 && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {warningCount} Warning
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="p-5 flex-1 space-y-4 overflow-y-auto">
        {metrics.map((m) => (
          <div key={m.label}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-1.5">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[m.status]}`} />
                <span className="text-xs font-medium text-slate-600">{m.label}</span>
              </div>
              <span className={`text-xs font-bold ${VALUE_COLOR[m.status]}`}>
                {m.value}
                <span className="text-slate-400 font-normal ml-0.5">{m.unit}</span>
              </span>
            </div>

            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${BAR_COLOR[m.status]}`}
                style={{ width: `${m.pct}%` }}
              />
            </div>

            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-slate-300">{m.min} {m.unit}</span>
              <span className="text-[10px] text-slate-400">{m.pct}%</span>
              <span className="text-[10px] text-slate-300">{m.max} {m.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
