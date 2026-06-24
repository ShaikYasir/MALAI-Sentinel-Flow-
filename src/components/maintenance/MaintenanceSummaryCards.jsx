const CARD_CONFIG = [
  { key: 'scheduledTasks', label: 'Scheduled Tasks', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  { key: 'pendingMaintenance', label: 'Pending Maintenance', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  { key: 'completedMaintenance', label: 'Completed Maintenance', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  { key: 'highRiskTurbines', label: 'High Risk Turbines', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  { key: 'avgDowntimeHours', label: 'Average Downtime', suffix: 'h', color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200' },
  { key: 'maintenanceEfficiency', label: 'Maintenance Efficiency', suffix: '%', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
];

export default function MaintenanceSummaryCards({ summary }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {CARD_CONFIG.map((card) => (
        <div key={card.key} className={`rounded-xl border p-4 ${card.bg}`}>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{card.label}</p>
          <p className={`mt-1.5 text-2xl font-bold ${card.color}`}>
            {summary?.[card.key] ?? '-'}
            {card.suffix ? <span className="text-sm ml-1">{card.suffix}</span> : null}
          </p>
        </div>
      ))}
    </div>
  );
}
