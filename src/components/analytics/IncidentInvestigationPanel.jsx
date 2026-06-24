export default function IncidentInvestigationPanel({ incident, turbineId }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-full min-h-[360px]">
      <div className="mb-3">
        <h2 className="text-sm font-bold text-slate-800">Incident Investigation Workspace</h2>
        <p className="text-xs text-slate-400">Alarm history, sensor snapshots, maintenance records, and RCA focus for {turbineId}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-[280px]">
        <div className="rounded-lg border border-slate-100 p-2 overflow-y-auto">
          <p className="text-[11px] font-semibold text-slate-500 mb-1">Alarm History</p>
          {(incident?.alarms ?? []).map((alarm) => (
            <div key={alarm.id} className="border border-slate-200 rounded-md p-2 mb-1.5">
              <p className="text-xs font-semibold text-slate-700">{alarm.type}</p>
              <p className="text-[11px] text-slate-500">{alarm.component} · {alarm.severity}</p>
              <p className="text-[11px] text-slate-400">Last: {alarm.lastOccurrence}</p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-slate-100 p-2 overflow-y-auto">
          <p className="text-[11px] font-semibold text-slate-500 mb-1">Sensor Trend Snapshot</p>
          {(incident?.sensors ?? []).map((sensor) => (
            <div key={sensor.sensor} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-b-0">
              <span className="text-slate-600">{sensor.sensor}</span>
              <span className="font-semibold text-slate-700">{sensor.value} {sensor.unit}</span>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-slate-100 p-2 overflow-y-auto">
          <p className="text-[11px] font-semibold text-slate-500 mb-1">Related Maintenance Records</p>
          {(incident?.relatedMaintenance ?? []).length === 0 && (
            <p className="text-xs text-slate-400">No maintenance records linked to this turbine yet.</p>
          )}
          {(incident?.relatedMaintenance ?? []).map((record) => (
            <div key={record.id} className="border border-slate-200 rounded-md p-2 mb-1.5">
              <p className="text-xs font-semibold text-slate-700">{record.id} · {record.component}</p>
              <p className="text-[11px] text-slate-500">{record.maintenanceType}</p>
              <p className="text-[11px] text-slate-400">{record.assignedEngineer} · {record.status}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
