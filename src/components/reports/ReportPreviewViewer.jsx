import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function kpiCard(label, value, unit) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
      <p className="text-[10px] text-slate-500">{label}</p>
      <p className="text-sm font-bold text-slate-700">
        {value}
        {unit ? <span className="text-xs ml-1">{unit}</span> : null}
      </p>
    </div>
  );
}

export default function ReportPreviewViewer({ generatedReport }) {
  const preview = generatedReport?.preview;
  const template = preview?.reportMeta?.template ?? 'Management Report';
  const reportType = preview?.reportMeta?.reportType ?? 'Daily Operations Report';

  const themeByTemplate = {
    'Management Report': {
      chipClass: 'bg-blue-50 text-blue-700 border-blue-200',
      chartColor: '#2563eb',
      accentTitle: 'Executive KPI Snapshot',
    },
    'Engineering Analysis Report': {
      chipClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      chartColor: '#0f766e',
      accentTitle: 'Technical Diagnostics Snapshot',
    },
    'Maintenance Log Report': {
      chipClass: 'bg-amber-50 text-amber-700 border-amber-200',
      chartColor: '#b45309',
      accentTitle: 'Service Operations Snapshot',
    },
  };

  const theme = themeByTemplate[template] ?? themeByTemplate['Management Report'];

  function buildReportTypeCards() {
    if (!preview) return [];

    if (reportType === 'Alarm Summary Report' || reportType === 'False Alarm Analysis Report') {
      return [
        ['Triggered Alarms', preview.falseAlarms.triggered, ''],
        ['Confirmed Faults', preview.falseAlarms.confirmed, ''],
        ['False Alarms', preview.falseAlarms.falseAlarms, ''],
        ['False Alarm Rate', preview.falseAlarms.falseAlarmRate, '%'],
      ];
    }

    if (reportType === 'Maintenance Activity Report') {
      return [
        ['Maintenance Hours', preview.maintenanceOps.maintenanceHours, 'h'],
        ['Avg Repair Time', preview.maintenanceOps.averageRepairHours, 'h'],
        ['Downtime Hours', preview.maintenanceOps.downtimeHours, 'h'],
        ['Top Serviced Component', preview.maintenanceOps.topComponent, ''],
      ];
    }

    if (reportType === 'Turbine Availability Report') {
      return [
        ['Fleet Availability', preview.compliance.availability, '%'],
        ['Active Turbines', preview.kpis.activeCount, ''],
        ['Total Turbines', preview.kpis.turbinesIncluded, ''],
        ['System Reliability', preview.kpis.reliability, '%'],
      ];
    }

    if (reportType === 'Downtime Analysis Report') {
      return [
        ['Total Downtime', preview.compliance.totalDowntime, 'h'],
        ['Maintenance Downtime', preview.maintenanceOps.downtimeHours, 'h'],
        ['Curtailment Hours', preview.compliance.curtailmentHours, 'h'],
        ['Availability', preview.compliance.availability, '%'],
      ];
    }

    if (reportType === 'Environmental Impact Summary') {
      return [
        ['Energy Generated', preview.compliance.energyGWh, 'GWh'],
        ['Energy Produced', preview.kpis.energyMWh, 'MWh'],
        ['Grid Compliance', preview.compliance.gridCompliance, '%'],
        ['Curtailment Hours', preview.compliance.curtailmentHours, 'h'],
      ];
    }

    if (reportType === 'Energy Generation Compliance Report') {
      return [
        ['Grid Compliance', preview.compliance.gridCompliance, '%'],
        ['Energy Generated', preview.compliance.energyGWh, 'GWh'],
        ['Fleet Availability', preview.compliance.availability, '%'],
        ['Total Downtime', preview.compliance.totalDowntime, 'h'],
      ];
    }

    if (reportType === 'Turbine Performance Report') {
      return [
        ['System Reliability', preview.kpis.reliability, '%'],
        ['Energy Produced', preview.kpis.energyMWh, 'MWh'],
        ['Fleet Availability', preview.kpis.availability, '%'],
        ['Active Turbines', preview.kpis.activeCount, ''],
      ];
    }

    return [
      ['Fleet Availability', preview.kpis.availability, '%'],
      ['Energy Produced', preview.kpis.energyMWh, 'MWh'],
      ['System Reliability', preview.kpis.reliability, '%'],
      ['False Alarm Rate', preview.falseAlarms.falseAlarmRate, '%'],
    ];
  }

  function buildReportTypeChart() {
    if (!preview) return { title: '', data: [], dataKey: 'value' };

    if (reportType === 'Alarm Summary Report' || reportType === 'False Alarm Analysis Report') {
      return {
        title: 'Alarm Validation Distribution',
        data: [
          { label: 'Triggered', value: preview.falseAlarms.triggered },
          { label: 'Confirmed', value: preview.falseAlarms.confirmed },
          { label: 'False', value: preview.falseAlarms.falseAlarms },
        ],
        dataKey: 'value',
      };
    }

    if (reportType === 'Maintenance Activity Report') {
      return {
        title: 'Maintenance Operations Throughput',
        data: [
          { label: 'Maintenance', value: preview.maintenanceOps.maintenanceHours },
          { label: 'Repair Avg', value: preview.maintenanceOps.averageRepairHours },
          { label: 'Downtime', value: preview.maintenanceOps.downtimeHours },
        ],
        dataKey: 'value',
      };
    }

    if (reportType === 'Turbine Availability Report' || reportType === 'Downtime Analysis Report') {
      return {
        title: 'Availability and Reliability by Turbine',
        data: preview.chartSeries.reliability.map((item) => ({
          label: item.turbineId,
          value: item.reliability,
        })),
        dataKey: 'value',
      };
    }

    return {
      title: 'Operational Energy Trend',
      data: preview.chartSeries.energy.map((item) => ({ label: item.label, value: item.energyMWh })),
      dataKey: 'value',
    };
  }

  const typeCards = buildReportTypeCards();
  const typeChart = buildReportTypeChart();

  const renderManagementPreview = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {kpiCard('Availability', preview.kpis.availability, '%')}
        {kpiCard('Energy Produced', preview.kpis.energyMWh, 'MWh')}
        {kpiCard('Reliability', preview.kpis.reliability, '%')}
        {kpiCard('False Alarm Rate', preview.falseAlarms.falseAlarmRate, '%')}
        {kpiCard('Maintenance Hours', preview.maintenanceOps.maintenanceHours, 'h')}
        {kpiCard('Compliance Grid Score', preview.compliance.gridCompliance, '%')}
      </div>

      <div className="rounded-lg border border-slate-200 p-2 h-[180px]">
        <p className="text-[11px] font-semibold text-slate-500 mb-1">Energy Production Trend</p>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={preview.chartSeries.energy}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="energyMWh" fill={theme.chartColor} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderEngineeringPreview = () => (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-200 p-2 h-[190px]">
        <p className="text-[11px] font-semibold text-slate-500 mb-1">Turbine Reliability Distribution</p>
        <ResponsiveContainer width="100%" height="86%">
          <BarChart data={preview.chartSeries.reliability}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="turbineId" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} domain={[50, 100]} />
            <Tooltip />
            <Bar dataKey="reliability" fill={theme.chartColor} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-slate-200 p-2">
        <p className="text-[11px] font-semibold text-slate-500 mb-1">Turbine Technical Summary</p>
        <div className="max-h-[120px] overflow-y-auto pr-1">
          <table className="w-full text-[11px]">
            <thead className="text-slate-500">
              <tr>
                <th className="text-left pb-1">ID</th>
                <th className="text-left pb-1">Health</th>
                <th className="text-left pb-1">Power (MW)</th>
                <th className="text-left pb-1">Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {preview.turbineSummaries.map((item) => (
                <tr key={item.id} className="border-t border-slate-100 text-slate-700">
                  <td className="py-1">{item.id}</td>
                  <td className="py-1 capitalize">{item.health}</td>
                  <td className="py-1">{item.powerMw}</td>
                  <td className="py-1">{item.efficiency}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {kpiCard('Availability', preview.compliance.availability, '%')}
        {kpiCard('Total Downtime', preview.compliance.totalDowntime, 'h')}
      </div>
    </div>
  );

  const renderMaintenancePreview = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {kpiCard('Maintenance Hours', preview.maintenanceOps.maintenanceHours, 'h')}
        {kpiCard('Downtime Hours', preview.maintenanceOps.downtimeHours, 'h')}
        {kpiCard('Avg Repair Time', preview.maintenanceOps.averageRepairHours, 'h')}
        {kpiCard('False Alarm Rate', preview.falseAlarms.falseAlarmRate, '%')}
      </div>

      <div className="rounded-lg border border-slate-200 p-2 h-[180px]">
        <p className="text-[11px] font-semibold text-slate-500 mb-1">Service Throughput Trend</p>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={preview.chartSeries.energy}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line type="monotone" dataKey="energyMWh" stroke={theme.chartColor} strokeWidth={2.2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-slate-200 p-2 text-xs text-slate-600 space-y-1">
        <p><span className="font-semibold text-slate-700">Most Frequent Component Serviced:</span> {preview.maintenanceOps.topComponent}</p>
        <p><span className="font-semibold text-slate-700">Technician Workload:</span> {preview.maintenanceOps.technicianWorkload}</p>
        <p><span className="font-semibold text-slate-700">Spare Parts Usage:</span> {preview.maintenanceOps.sparePartsUsage}</p>
      </div>
    </div>
  );

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-full min-h-[360px]">
      <div className="mb-2">
        <h2 className="text-sm font-bold text-slate-800">Visual Report Preview</h2>
        <p className="text-xs text-slate-400">Preview KPI blocks, charts, and turbine summary before export</p>
      </div>

      {!preview ? (
        <div className="rounded-lg border border-slate-200 p-4 bg-slate-50 text-xs text-slate-500 min-h-[300px]">
          Generate a report to preview structured operational documentation.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-700">{preview.reportMeta.reportType}</p>
              <span className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold ${theme.chipClass}`}>
                {template}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {preview.reportMeta.period} | Template: {preview.reportMeta.template} | Format: {preview.reportMeta.format}
            </p>
            <p className="text-[11px] text-slate-400">Turbines: {preview.reportMeta.turbines.join(', ')}</p>
          </div>

          <div className="rounded-lg border border-slate-200 p-3 bg-white">
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-xs font-semibold text-slate-700">Report Type Focus View</p>
              <span className="text-[11px] px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600">
                {reportType}
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
              {typeCards.map(([label, value, unit]) => (
                <div key={label}>{kpiCard(label, value, unit)}</div>
              ))}
            </div>

            <div className="rounded-lg border border-slate-200 p-2 h-[170px]">
              <p className="text-[11px] font-semibold text-slate-500 mb-1">{typeChart.title}</p>
              <ResponsiveContainer width="100%" height="84%">
                <BarChart data={typeChart.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey={typeChart.dataKey} fill={theme.chartColor} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-slate-500 mb-2">{theme.accentTitle}</p>
            {template === 'Engineering Analysis Report' && renderEngineeringPreview()}
            {template === 'Maintenance Log Report' && renderMaintenancePreview()}
            {template !== 'Engineering Analysis Report' && template !== 'Maintenance Log Report' && renderManagementPreview()}
          </div>
        </div>
      )}
    </section>
  );
}
