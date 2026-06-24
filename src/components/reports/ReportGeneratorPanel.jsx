import { useMemo } from 'react';
import ReportTypeSelector from './ReportTypeSelector';

const TEMPLATE_STYLE = {
  'Management Report': {
    title: 'Management',
    subtitle: 'KPI-first business summary for leaders and investors',
    activeClass: 'bg-blue-50 border-blue-300 text-blue-800',
    dotClass: 'bg-blue-500',
  },
  'Engineering Analysis Report': {
    title: 'Engineering',
    subtitle: 'Technical diagnostics with alarms, sensors, and reliability details',
    activeClass: 'bg-emerald-50 border-emerald-300 text-emerald-800',
    dotClass: 'bg-emerald-500',
  },
  'Maintenance Log Report': {
    title: 'Maintenance',
    subtitle: 'Work orders, parts usage, and service performance records',
    activeClass: 'bg-amber-50 border-amber-300 text-amber-800',
    dotClass: 'bg-amber-500',
  },
};

export default function ReportGeneratorPanel({
  config,
  values,
  onChange,
  onGenerate,
  generating,
}) {
  const turbineLabel = useMemo(() => {
    if (!values.turbines.length) return 'All turbines selected';
    if (values.turbines.length <= 3) return values.turbines.join(', ');
    return `${values.turbines.slice(0, 3).join(', ')} +${values.turbines.length - 3} more`;
  }, [values.turbines]);

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="mb-3">
        <h2 className="text-sm font-bold text-slate-800">Automated Report Generator</h2>
        <p className="text-xs text-slate-400">Select report type, turbines, date range, and export format</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 items-end">
        <ReportTypeSelector
          value={values.reportType}
          options={config.reportTypes}
          onChange={(reportType) => onChange({ reportType })}
        />

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Time Range Start</label>
          <input
            type="date"
            value={values.timeRange.start}
            onChange={(event) => onChange({ timeRange: { ...values.timeRange, start: event.target.value } })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Time Range End</label>
          <input
            type="date"
            value={values.timeRange.end}
            onChange={(event) => onChange({ timeRange: { ...values.timeRange, end: event.target.value } })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Output Format</label>
          <select
            value={values.format}
            onChange={(event) => onChange({ format: event.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            {config.outputFormats.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3">
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Template Style</label>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          {config.templates.map((item) => {
            const style = TEMPLATE_STYLE[item] ?? {
              title: item,
              subtitle: 'Structured operational documentation template',
              activeClass: 'bg-slate-50 border-slate-300 text-slate-700',
              dotClass: 'bg-slate-500',
            };
            const active = values.template === item;

            return (
              <button
                key={item}
                onClick={() => onChange({ template: item })}
                className={`text-left rounded-lg border px-3 py-2 transition-colors ${
                  active
                    ? style.activeClass
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${style.dotClass}`} />
                  <p className="text-xs font-semibold">{style.title}</p>
                </div>
                <p className="text-[11px] mt-1 opacity-80">{style.subtitle}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3 items-end">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Turbines</label>
          <div className="flex flex-wrap gap-2 rounded-lg border border-slate-300 p-2 bg-slate-50 min-h-10">
            {config.turbines.map((item) => {
              const checked = values.turbines.includes(item.id);
              return (
                <label
                  key={item.id}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium cursor-pointer ${
                    checked ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      if (checked) {
                        onChange({ turbines: values.turbines.filter((id) => id !== item.id) });
                      } else {
                        onChange({ turbines: [...values.turbines, item.id] });
                      }
                    }}
                  />
                  {item.id}
                </label>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Selected: {turbineLabel}</p>
        </div>

        <button
          onClick={onGenerate}
          disabled={generating}
          className="h-10 px-4 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-700 disabled:opacity-50"
        >
          {generating ? 'Generating...' : 'Generate Report'}
        </button>
      </div>
    </section>
  );
}
