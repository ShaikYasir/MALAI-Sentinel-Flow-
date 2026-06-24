function metricRow(label, value) {
  return (
    <div className="flex items-center justify-between text-xs border-b border-slate-100 py-1">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-700">{value}</span>
    </div>
  );
}

export default function FalseAlarmAnalysisReport({ metrics }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-full">
      <h2 className="text-sm font-bold text-slate-800">False Alarm Impact Report</h2>
      <p className="text-xs text-slate-400 mb-2">Oil leakage and sensor alarm reliability analysis</p>

      <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
        {metricRow('Oil Leakage Alarms Triggered', metrics?.triggered ?? 0)}
        {metricRow('Confirmed Faults', metrics?.confirmed ?? 0)}
        {metricRow('False Alarms', metrics?.falseAlarms ?? 0)}
        {metricRow('False Alarm Rate', `${metrics?.falseAlarmRate ?? 0}%`)}
      </div>
    </section>
  );
}
