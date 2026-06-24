import { useState } from 'react';

function ReorderBadge({ part }) {
  const isLow = part.stockLevel <= part.reorderPoint;
  return (
    <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full border ${isLow ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
      {isLow ? 'Low Stock' : 'Healthy'}
    </span>
  );
}

export default function SparePartsInventory({ inventory, onRunForecast }) {
  const [forecast, setForecast] = useState(null);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <h3 className="text-sm font-bold text-slate-800">Spare Parts Inventory</h3>
        <p className="text-xs text-slate-400 mt-0.5">Stock visibility with depletion forecasting for critical spare parts</p>
      </div>

      <div className="p-4 space-y-2 overflow-y-auto flex-1">
        {inventory.map((part) => (
          <div key={part.partName} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-700">{part.partName}</p>
              <ReorderBadge part={part} />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 text-[11px] text-slate-500">
              <div>Stock: <span className="font-bold text-slate-700">{part.stockLevel}</span></div>
              <div>Usage/Wk: <span className="font-bold text-slate-700">{part.usageRatePerWeek}</span></div>
              <div>Reorder@ <span className="font-bold text-slate-700">{part.reorderPoint}</span></div>
            </div>
            {part.stockLevel <= part.reorderPoint && (
              <button
                onClick={async () => setForecast(await onRunForecast(part))}
                className="mt-2 text-[11px] font-semibold px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
              >
                Forecast Depletion
              </button>
            )}
          </div>
        ))}

        {forecast && (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-xs text-orange-800">
            {forecast.message}
          </div>
        )}
      </div>
    </div>
  );
}
