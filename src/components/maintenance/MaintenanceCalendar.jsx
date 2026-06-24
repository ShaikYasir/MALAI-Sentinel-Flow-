function dateCellLabel(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
}

export default function MaintenanceCalendar({ schedule }) {
  const grouped = schedule.reduce((acc, s) => {
    acc[s.date] = acc[s.date] ?? [];
    acc[s.date].push(s);
    return acc;
  }, {});
  const dates = Object.keys(grouped).sort();

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <h3 className="text-sm font-bold text-slate-800">Maintenance Calendar</h3>
        <p className="text-xs text-slate-400 mt-0.5">Time-based maintenance schedule across turbines and teams</p>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-3">
        {dates.map((date) => (
          <div key={date} className="rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-700">
              {dateCellLabel(date)}
            </div>
            <div className="p-2 space-y-2">
              {grouped[date].map((task) => (
                <div key={task.id} className="rounded border border-slate-200 p-2 text-xs">
                  <p className="font-semibold text-slate-700">{task.turbineId} · {task.activity}</p>
                  <p className="text-slate-500 mt-0.5">Technician: {task.technician}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
