import { Bot, Loader2 } from 'lucide-react';

export default function AIMaintenanceAssistant({ selectedTurbineId, recommendation, loading, onRequestRecommendation }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Bot size={15} className="text-blue-500" /> Smart Maintenance Recommendation
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">Actionable AI guidance based on turbine condition and risk profile</p>
      </div>

      <div className="p-4 space-y-3 flex-1 overflow-y-auto">
        <button
          onClick={onRequestRecommendation}
          disabled={loading || !selectedTurbineId}
          className="w-full py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-300"
        >
          {loading ? 'Generating AI recommendation...' : `Generate for ${selectedTurbineId ?? 'selected turbine'}`}
        </button>

        {!recommendation ? (
          <div className="text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg p-4">
            Run predictive analysis first, then request AI recommendation.
          </div>
        ) : (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-2">
            <p className="text-xs font-semibold text-blue-700">{recommendation.title}</p>
            <p className="text-xs text-slate-700"><span className="font-semibold">Recommended Action:</span> {recommendation.recommendation}</p>
            <p className="text-xs text-slate-700"><span className="font-semibold">Suggested Window:</span> {recommendation.suggestedWindow}</p>
            <p className="text-xs text-slate-700"><span className="font-semibold">Confidence:</span> {recommendation.confidence}%</p>
            <p className="text-[11px] text-slate-500">{recommendation.notes}</p>
          </div>
        )}

        {loading && (
          <div className="text-xs text-blue-600 flex items-center gap-2">
            <Loader2 size={13} className="animate-spin" /> AI assistant is evaluating maintenance actions...
          </div>
        )}
      </div>
    </div>
  );
}
