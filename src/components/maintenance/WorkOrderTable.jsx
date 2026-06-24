import { useMemo, useState } from 'react';

const STATUS_STYLE = {
  Scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
  'Waiting for Parts': 'bg-orange-50 text-orange-700 border-orange-200',
  Completed: 'bg-green-50 text-green-700 border-green-200',
};

const PRIORITY_STYLE = {
  Critical: 'text-red-700',
  High: 'text-orange-700',
  Medium: 'text-amber-700',
  Low: 'text-green-700',
};

export default function WorkOrderTable({ workOrders, onCreateWorkOrder }) {
  const [form, setForm] = useState({
    turbineId: 'WT-003',
    component: 'Gearbox',
    maintenanceType: 'Predictive Inspection',
    assignedEngineer: 'Arun Patel',
    priority: 'High',
    startDate: '2026-03-18',
    status: 'Scheduled',
  });

  const sorted = useMemo(() => [...workOrders].sort((a, b) => b.startDate.localeCompare(a.startDate)), [workOrders]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <h3 className="text-sm font-bold text-slate-800">Maintenance Work Orders</h3>
        <p className="text-xs text-slate-400 mt-0.5">Plan, assign, and track work orders from scheduling to completion</p>
      </div>

      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 grid grid-cols-1 md:grid-cols-7 gap-2">
        <input className="text-xs border border-slate-200 rounded px-2 py-1.5" value={form.turbineId} onChange={(e) => setForm((p) => ({ ...p, turbineId: e.target.value }))} placeholder="Turbine ID" />
        <input className="text-xs border border-slate-200 rounded px-2 py-1.5" value={form.component} onChange={(e) => setForm((p) => ({ ...p, component: e.target.value }))} placeholder="Component" />
        <input className="text-xs border border-slate-200 rounded px-2 py-1.5" value={form.maintenanceType} onChange={(e) => setForm((p) => ({ ...p, maintenanceType: e.target.value }))} placeholder="Maintenance Type" />
        <input className="text-xs border border-slate-200 rounded px-2 py-1.5" value={form.assignedEngineer} onChange={(e) => setForm((p) => ({ ...p, assignedEngineer: e.target.value }))} placeholder="Engineer" />
        <select className="text-xs border border-slate-200 rounded px-2 py-1.5" value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
          <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
        </select>
        <input type="date" className="text-xs border border-slate-200 rounded px-2 py-1.5" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} />
        <button
          onClick={() => onCreateWorkOrder(form)}
          className="text-xs font-semibold rounded px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Create WO
        </button>
      </div>

      <div className="overflow-auto flex-1">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-slate-50 z-10">
            <tr className="border-b border-slate-100 text-slate-500 uppercase tracking-wider">
              <th className="px-3 py-2 text-left">Work Order ID</th>
              <th className="px-3 py-2 text-left">Turbine ID</th>
              <th className="px-3 py-2 text-left">Component</th>
              <th className="px-3 py-2 text-left">Maintenance Type</th>
              <th className="px-3 py-2 text-left">Assigned Engineer</th>
              <th className="px-3 py-2 text-left">Priority</th>
              <th className="px-3 py-2 text-left">Start Date</th>
              <th className="px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((wo) => (
              <tr key={wo.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-3 py-2 font-mono font-semibold text-slate-700">{wo.id}</td>
                <td className="px-3 py-2 text-blue-600 font-semibold">{wo.turbineId}</td>
                <td className="px-3 py-2">{wo.component}</td>
                <td className="px-3 py-2">{wo.maintenanceType}</td>
                <td className="px-3 py-2">{wo.assignedEngineer}</td>
                <td className={`px-3 py-2 font-semibold ${PRIORITY_STYLE[wo.priority] ?? 'text-slate-700'}`}>{wo.priority}</td>
                <td className="px-3 py-2 font-mono">{wo.startDate}</td>
                <td className="px-3 py-2">
                  <span className={`inline-block px-2 py-0.5 rounded-full border ${STATUS_STYLE[wo.status] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                    {wo.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
