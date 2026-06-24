import { useState } from 'react';

const DEFAULT_RECIPIENTS = ['email', 'system dashboard', 'management portal'];

export default function ScheduledReportsPanel({ schedules, reportTypes, onCreate }) {
  const [form, setForm] = useState({
    name: 'Monthly Compliance Pack',
    reportType: reportTypes[0] ?? 'Daily Operations Report',
    scheduleLabel: 'Monthly - Day 1 08:00 AM',
    recipients: ['email', 'management portal'],
    format: 'PDF',
  });

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-full">
      <div className="mb-2">
        <h2 className="text-sm font-bold text-slate-800">Scheduled Report Automation</h2>
        <p className="text-xs text-slate-400">Automate daily, weekly, and monthly report delivery</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        <input
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-xs"
          placeholder="Schedule name"
        />
        <select
          value={form.reportType}
          onChange={(event) => setForm((prev) => ({ ...prev, reportType: event.target.value }))}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-xs"
        >
          {reportTypes.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <input
          value={form.scheduleLabel}
          onChange={(event) => setForm((prev) => ({ ...prev, scheduleLabel: event.target.value }))}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-xs"
          placeholder="Daily - 06:00 PM"
        />
        <select
          value={form.format}
          onChange={(event) => setForm((prev) => ({ ...prev, format: event.target.value }))}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-xs"
        >
          {['PDF', 'CSV', 'Excel'].map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {DEFAULT_RECIPIENTS.map((item) => {
          const active = form.recipients.includes(item);
          return (
            <button
              key={item}
              onClick={() => {
                if (active) {
                  setForm((prev) => ({ ...prev, recipients: prev.recipients.filter((r) => r !== item) }));
                } else {
                  setForm((prev) => ({ ...prev, recipients: [...prev.recipients, item] }));
                }
              }}
              className={`text-[11px] px-2 py-1 rounded-md border ${
                active ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onCreate(form)}
        className="mb-3 text-xs font-semibold px-3 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-700"
      >
        Add Schedule
      </button>

      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="rounded-md border border-slate-200 p-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-700">{schedule.name}</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                {schedule.active ? 'Active' : 'Paused'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{schedule.reportType}</p>
            <p className="text-[11px] text-slate-500">{schedule.scheduleLabel} | {schedule.format}</p>
            <p className="text-[11px] text-slate-400">Recipients: {schedule.recipients.join(', ')}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
