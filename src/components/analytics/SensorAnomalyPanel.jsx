function severityClass(severity) {
  if (severity === 'critical') return 'bg-red-50 text-red-700 border-red-200';
  if (severity === 'high') return 'bg-orange-50 text-orange-700 border-orange-200';
  if (severity === 'medium') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-sky-50 text-sky-700 border-sky-200';
}

export default function SensorAnomalyPanel({ anomaly, loading, onDetect, turbineId }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-full min-h-[290px]">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Sensor Anomaly Detection</h2>
          <p className="text-xs text-slate-400">AI checks vibration, temperature, oil pressure, and rotor speed anomalies</p>
        </div>
        <button
          onClick={onDetect}
          disabled={loading}
          className="text-xs font-semibold px-3 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {loading ? 'Detecting...' : 'Run Detection'}
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 p-3 bg-slate-50 h-[200px] overflow-y-auto">
        {!anomaly ? (
          <p className="text-xs text-slate-500">No anomaly run yet for {turbineId}. Trigger detection to generate AI findings.</p>
        ) : (
          <div className="space-y-2">
            <div className={`inline-flex text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border ${severityClass(anomaly.severity)}`}>
              {anomaly.severity}
            </div>
            <p className="text-sm font-semibold text-slate-800">{anomaly.title}</p>
            <p className="text-xs text-slate-700">{anomaly.anomaly}</p>
            <p className="text-xs text-slate-600">Cause: {anomaly.probableCause}</p>
            <p className="text-xs text-slate-700">Recommendation: {anomaly.recommendation}</p>
            <p className="text-[11px] text-slate-400">Confidence: {anomaly.confidence}%</p>
          </div>
        )}
      </div>
    </section>
  );
}
