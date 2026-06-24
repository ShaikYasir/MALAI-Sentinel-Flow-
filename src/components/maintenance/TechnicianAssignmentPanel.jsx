const AVAIL_STYLE = {
  Available: 'bg-green-50 text-green-700 border-green-200',
  'Partially Available': 'bg-amber-50 text-amber-700 border-amber-200',
  Busy: 'bg-red-50 text-red-700 border-red-200',
};

export default function TechnicianAssignmentPanel({ technicians }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <h3 className="text-sm font-bold text-slate-800">Technician Assignment</h3>
        <p className="text-xs text-slate-400 mt-0.5">Workload and availability view for balanced field execution</p>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-2">
        {technicians.map((tech) => (
          <div key={tech.technicianName} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-700">{tech.technicianName}</p>
              <span className={`text-[11px] px-2 py-0.5 rounded-full border ${AVAIL_STYLE[tech.availability] ?? 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                {tech.availability}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] text-slate-500">
              <div>Assigned Tasks: <span className="font-bold text-slate-700">{tech.assignedTasks}</span></div>
              <div>Completion Rate: <span className="font-bold text-slate-700">{tech.completionRate}%</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
