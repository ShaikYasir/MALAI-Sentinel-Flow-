export default function AIExecutiveSummary({ summary, loading }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-full">
      <div className="mb-2">
        <h2 className="text-sm font-bold text-slate-800">AI Executive Summary</h2>
        <p className="text-xs text-slate-400">Readable insight generated from operational report data</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 min-h-[280px]">
        {loading ? (
          <p className="text-xs text-slate-500">Generating executive summary...</p>
        ) : !summary ? (
          <p className="text-xs text-slate-500">Generate a report to receive AI narrative insights.</p>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-cyan-700 font-semibold">Anemo Insight</p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{summary.summary}</p>
            <ul className="space-y-1">
              {(summary.keyPoints ?? []).map((point, index) => (
                <li key={`${point}-${index}`} className="text-xs text-slate-600">
                  - {point}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
