import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ReportGeneratorPanel from '../components/reports/ReportGeneratorPanel';
import ReportPreviewViewer from '../components/reports/ReportPreviewViewer';
import AIExecutiveSummary from '../components/reports/AIExecutiveSummary';
import ScheduledReportsPanel from '../components/reports/ScheduledReportsPanel';
import ReportArchiveTable from '../components/reports/ReportArchiveTable';
import {
  getReportArchive,
  getReportGeneratorOptions,
  getScheduledReports,
  postAIReportSummary,
  postGenerateReport,
  postScheduleReport,
} from '../services/reportsApi';

function toDateInput(date) {
  return new Date(date).toISOString().slice(0, 10);
}

export default function ReportsPage({ activePage, onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [config, setConfig] = useState({
    reportTypes: [],
    outputFormats: [],
    templates: [],
    turbines: [],
  });

  const [formValues, setFormValues] = useState({
    reportType: 'Daily Operations Report',
    template: 'Management Report',
    timeRange: {
      start: toDateInput(Date.now() - 6 * 24 * 60 * 60 * 1000),
      end: toDateInput(Date.now()),
    },
    format: 'PDF',
    turbines: [],
  });

  const [generatedReport, setGeneratedReport] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [archive, setArchive] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const [options, archived, scheduled] = await Promise.all([
        getReportGeneratorOptions(),
        getReportArchive(),
        getScheduledReports(),
      ]);

      setConfig(options);
      setArchive(archived);
      setSchedules(scheduled);
      setFormValues((prev) => ({
        ...prev,
        reportType: options.reportTypes[0] ?? prev.reportType,
        template: options.templates[0] ?? prev.template,
        format: options.outputFormats[0] ?? prev.format,
      }));
    };

    init();
  }, []);

  const handleFormChange = (patch) => {
    setFormValues((prev) => ({ ...prev, ...patch }));
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    setSummaryLoading(true);
    try {
      const generated = await postGenerateReport({
        reportType: formValues.reportType,
        turbines: formValues.turbines,
        timeRange: formValues.timeRange,
        format: formValues.format,
        template: formValues.template,
      });
      setGeneratedReport(generated);

      const ai = await postAIReportSummary({
        reportType: formValues.reportType,
        preview: generated.preview,
      });
      setAiSummary(ai);

      const latestArchive = await getReportArchive();
      setArchive(latestArchive);
    } finally {
      setGenerating(false);
      setSummaryLoading(false);
    }
  };

  const handleCreateSchedule = async (payload) => {
    await postScheduleReport(payload);
    const updated = await getScheduledReports();
    setSchedules(updated);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        activePage={activePage}
        onNavigate={onNavigate}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar sidebarOpen={sidebarOpen} onOpenAlarms={() => onNavigate('alarms')} />

        <main className="app-scroll flex-1 overflow-y-auto">
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-base font-bold text-slate-800">Reports and Compliance Center</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Structured documentation, regulatory compliance reporting, and exportable operational summaries
                </p>
              </div>
              <span className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Documentation Workflow Active
              </span>
            </div>

            <ReportGeneratorPanel
              config={config}
              values={formValues}
              onChange={handleFormChange}
              onGenerate={handleGenerateReport}
              generating={generating}
            />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 xl:min-h-[500px]">
              <div className="xl:col-span-8 min-h-[360px] xl:min-h-0">
                <ReportPreviewViewer generatedReport={generatedReport} />
              </div>
              <div className="xl:col-span-4 min-h-[360px] xl:min-h-0">
                <AIExecutiveSummary summary={aiSummary} loading={summaryLoading} />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 xl:min-h-[390px]">
              <div className="xl:col-span-7 min-h-[290px] xl:min-h-0">
                <ReportArchiveTable archive={archive} />
              </div>
              <div className="xl:col-span-5 min-h-[290px] xl:min-h-0">
                <ScheduledReportsPanel
                  schedules={schedules}
                  reportTypes={config.reportTypes}
                  onCreate={handleCreateSchedule}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
