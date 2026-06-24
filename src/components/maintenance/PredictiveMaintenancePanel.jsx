import { AlertTriangle, Bot, Check, ChevronDown, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const RISK_STYLE = {
  Low: 'text-green-700 bg-green-50 border-green-200',
  Medium: 'text-amber-700 bg-amber-50 border-amber-200',
  High: 'text-red-700 bg-red-50 border-red-200',
};

export default function PredictiveMaintenancePanel({
  turbines,
  selectedTurbineId,
  onSelectTurbine,
  onPredict,
  predictiveResult,
  loading,
}) {
  const [turbineMenuOpen, setTurbineMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedTurbineLabel = useMemo(() => {
    const selected = turbines.find((t) => t.id === selectedTurbineId);
    return selected
      ? `${selected.id} · ${selected.zone} · ${selected.health}`
      : 'Select turbine';
  }, [turbines, selectedTurbineId]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setTurbineMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setTurbineMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Bot size={15} className="text-blue-500" /> Predictive Maintenance
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">AI-driven failure risk forecast and maintenance window planning</p>
        </div>
      </div>

      <div className="p-4 space-y-3 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <div ref={dropdownRef} className="relative mt-1">
              <button
                type="button"
                onClick={() => setTurbineMenuOpen((open) => !open)}
                className="w-full text-left text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 flex items-center justify-between hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                aria-haspopup="listbox"
                aria-expanded={turbineMenuOpen}
              >
                <span className="truncate">{selectedTurbineLabel}</span>
                <ChevronDown size={14} className={`text-slate-500 shrink-0 transition-transform ${turbineMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {turbineMenuOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 z-40 bg-white border border-slate-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                  <ul role="listbox" className="py-1">
                    {turbines.map((t) => {
                      const isSelected = t.id === selectedTurbineId;
                      return (
                        <li key={t.id}>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectTurbine(t.id);
                              setTurbineMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                          >
                            <span>{t.id} · {t.zone} · {t.health}</span>
                            {isSelected && <Check size={13} className="shrink-0" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-1 flex items-end">
            <button
              onClick={onPredict}
              disabled={loading}
              className="w-full py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-300"
            >
              {loading ? 'Running...' : 'Run Prediction'}
            </button>
          </div>
        </div>

        {!predictiveResult ? (
          <div className="border border-dashed border-slate-200 rounded-lg p-6 text-center text-xs text-slate-400">
            Select turbine and run predictive analysis.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Overall Health</p>
                <p className="text-xl font-bold text-slate-800">{predictiveResult.overallHealth}%</p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-[10px] text-red-600 uppercase font-semibold">Highest Risk Component</p>
                <p className="text-sm font-bold text-red-700">{predictiveResult.highestRiskComponent}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Maintenance Window</p>
                <p className="text-sm font-bold text-slate-700">{predictiveResult.recommendedMaintenanceWindow}</p>
              </div>
            </div>

            <div className="space-y-2">
              {predictiveResult.componentPredictions.map((p) => (
                <div key={p.component} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-slate-700">{p.component}</p>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${RISK_STYLE[p.risk]}`}>
                      {p.risk} Risk
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-500">
                    <div>Health: <span className="font-bold text-slate-700">{p.healthScore}%</span></div>
                    <div>Failure: <span className="font-bold text-slate-700">{p.failureProbability}%</span></div>
                    <div>Inspect: <span className="font-bold text-slate-700">{p.maintenanceWindow}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {loading && (
          <div className="flex items-center justify-center text-xs text-blue-600 gap-2">
            <Loader2 size={14} className="animate-spin" /> AI model analyzing sensor trends...
          </div>
        )}

        {predictiveResult?.predictedFailureProbability >= 70 && (
          <div className="flex items-start gap-2 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            Immediate inspection advised to avoid unplanned downtime.
          </div>
        )}
      </div>
    </div>
  );
}
