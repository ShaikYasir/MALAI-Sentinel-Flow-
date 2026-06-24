function row(label, value) {
  return (
    <div className="flex items-center justify-between text-xs border-b border-slate-100 py-1">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-700">{value}</span>
    </div>
  );
}

export default function MaintenanceCostReport({ metrics }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-full">
      <h2 className="text-sm font-bold text-slate-800">Maintenance Cost Analysis</h2>
      <p className="text-xs text-slate-400 mb-2">Labor, spare parts, workload, and downtime cost trend</p>

      <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
        {row('Maintenance Hours', metrics?.maintenanceHours ?? 0)}
        {row('Technician Workload', metrics?.technicianWorkload ?? 'N/A')}
        {row('Spare Parts Usage', metrics?.sparePartsUsage ?? 'N/A')}
        {row('Downtime Cost', `$${(metrics?.downtimeCost ?? 0).toLocaleString()}`)}
        {row('Maintenance Cost (Month)', `$${(metrics?.monthlyCost ?? 0).toLocaleString()}`)}
        {row('Most Frequent Component Serviced', metrics?.topComponent ?? 'N/A')}
        {row('Average Repair Time', `${metrics?.averageRepairHours ?? 0} hours`)}
      </div>
    </section>
  );
}
