function severityStyle(severity) {
  if (severity === 'critical') return 'bg-red-50 border-red-200 text-red-800';
  if (severity === 'high') return 'bg-orange-50 border-orange-200 text-orange-800';
  if (severity === 'medium') return 'bg-amber-50 border-amber-200 text-amber-800';
  return 'bg-sky-50 border-sky-200 text-sky-800';
}

export default function AIInsightMessage({ insight }) {
  if (!insight) return null;

  return (
    <div className={`rounded-lg border p-3 ${severityStyle(insight.severity ?? 'medium')}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold tracking-wide uppercase flex items-center gap-3">
          <img src="/Anemo.png" alt="Anemo" className="w-14 h-14 object-contain" />
          <span>Anemo AI Insight</span>
        </p>
        <span className="text-[11px] font-semibold">Confidence: {insight.confidence}%</span>
      </div>
      <p className="text-sm font-semibold mt-2">{insight.summary ?? insight.title}</p>
      {insight.recommendation && <p className="text-xs mt-1">{insight.recommendation}</p>}
      {Array.isArray(insight.actionItems) && insight.actionItems.length > 0 && (
        <ul className="mt-2 text-xs space-y-1">
          {insight.actionItems.map((item, idx) => (
            <li key={`${item}-${idx}`} className="leading-relaxed">• {item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
