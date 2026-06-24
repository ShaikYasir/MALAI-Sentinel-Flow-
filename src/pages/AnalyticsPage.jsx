import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import AnemoChatPanel from '../components/analytics/AnemoChatPanel';
import RootCauseDAGGraph from '../components/analytics/RootCauseDAGGraph';
import AlarmPatternCharts from '../components/analytics/AlarmPatternCharts';
import PerformanceAnalyticsCharts from '../components/analytics/PerformanceAnalyticsCharts';
import SensorAnomalyPanel from '../components/analytics/SensorAnomalyPanel';
import IncidentInvestigationPanel from '../components/analytics/IncidentInvestigationPanel';
import {
  getAlarmPatterns,
  getIncidentByTurbine,
  getPerformanceAnalytics,
  getRootCauseGraph,
  postAnemoQuery,
  postAnomalyDetection,
} from '../services/analyticsApi';
import { turbineFleetData } from '../data/mockData';

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const INITIAL_THREAD = [
  {
    id: 'm-1',
    role: 'technician',
    author: 'Technician Rahul',
    text: 'Oil leakage alarms on Turbine WT-003 triggered three times within 10 minutes.',
    tags: ['#WT-003', '#OilLeakage', '#Gearbox'],
    attachment: 'alarm-log-WT-003.csv',
    time: '10:14',
  },
  {
    id: 'm-2',
    role: 'technician',
    author: 'Technician Priya',
    text: 'Checking gearbox temperature trend and vibration spectrum now.',
    tags: ['#temperature', '#vibration'],
    time: '10:16',
  },
];

export default function AnalyticsPage({ activePage, onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTurbineId, setSelectedTurbineId] = useState('WT-003');

  const [messagesByTurbine, setMessagesByTurbine] = useState({ 'WT-003': INITIAL_THREAD });
  const [sending, setSending] = useState(false);

  const [alarmPatterns, setAlarmPatterns] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [dagGraph, setDagGraph] = useState(null);
  const [incident, setIncident] = useState(null);
  const [anomaly, setAnomaly] = useState(null);
  const [anomalyLoading, setAnomalyLoading] = useState(false);

  const turbineOptions = useMemo(() => turbineFleetData.map((t) => t.id), []);
  const currentMessages = messagesByTurbine[selectedTurbineId] ?? [];

  useEffect(() => {
    const init = async () => {
      const [patterns, perf] = await Promise.all([getAlarmPatterns(), getPerformanceAnalytics(selectedTurbineId)]);
      setAlarmPatterns(patterns);
      setPerformance(perf);
    };
    init();
  }, [selectedTurbineId]);

  useEffect(() => {
    const loadIncidentContext = async () => {
      const [graph, workspace] = await Promise.all([
        getRootCauseGraph(selectedTurbineId),
        getIncidentByTurbine(selectedTurbineId),
      ]);
      setDagGraph(graph);
      setIncident(workspace);
    };

    loadIncidentContext();
  }, [selectedTurbineId]);

  const appendMessage = (turbineId, message) => {
    setMessagesByTurbine((prev) => ({
      ...prev,
      [turbineId]: [...(prev[turbineId] ?? []), message],
    }));
  };

  const handleSendMessage = async ({ text, attachment }) => {
    const technicianMsg = {
      id: `m-${Date.now()}`,
      role: 'technician',
      author: 'You',
      text,
      tags: text.match(/#\w+/g) ?? [],
      attachment,
      time: nowTime(),
    };

    appendMessage(selectedTurbineId, technicianMsg);

    if (!text.toLowerCase().includes('@anemo')) return;

    setSending(true);
    try {
      const ai = await postAnemoQuery({
        command: text,
        turbineId: selectedTurbineId,
        threadContext: currentMessages,
      });

      appendMessage(selectedTurbineId, {
        id: `m-ai-${Date.now()}`,
        role: 'ai',
        author: 'Anemo AI',
        text: ai.summary,
        tags: ai.suggestedTags,
        time: nowTime(),
        insight: {
          summary: ai.summary,
          recommendation: ai.recommendation,
          confidence: ai.confidence,
          actionItems: ai.actionItems,
        },
      });
    } finally {
      setSending(false);
    }
  };

  const handleAnomalyDetection = async () => {
    setAnomalyLoading(true);
    try {
      const result = await postAnomalyDetection({ turbineId: selectedTurbineId });
      setAnomaly(result);
    } finally {
      setAnomalyLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage={activePage} onNavigate={onNavigate} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar sidebarOpen={sidebarOpen} onOpenAlarms={() => onNavigate('alarms')} />

        <main className="analytics-scroll flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-5 space-y-4 max-w-full">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-base font-bold text-slate-800">Analytics and Investigation Center</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Advanced alarm intelligence, DAG-based RCA, and collaborative troubleshooting through Anemo
                </p>
              </div>
              <span className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                Investigation Session: {selectedTurbineId}
              </span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 xl:h-[500px] min-w-0">
              <div className="xl:col-span-5 min-h-[360px] xl:min-h-0 min-w-0">
                <AnemoChatPanel
                  turbineId={selectedTurbineId}
                  messages={currentMessages}
                  onSendMessage={handleSendMessage}
                  onSwitchTurbine={setSelectedTurbineId}
                  turbineOptions={turbineOptions}
                  sending={sending}
                />
              </div>
              <div className="xl:col-span-7 min-h-[360px] xl:min-h-0 min-w-0">
                <RootCauseDAGGraph graph={dagGraph} />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 xl:min-h-[560px] min-w-0">
              <div className="xl:col-span-6 min-h-[320px] xl:min-h-0 min-w-0">
                <AlarmPatternCharts patterns={alarmPatterns} />
              </div>
              <div className="xl:col-span-6 min-h-[320px] xl:min-h-0 min-w-0">
                <SensorAnomalyPanel
                  anomaly={anomaly}
                  loading={anomalyLoading}
                  onDetect={handleAnomalyDetection}
                  turbineId={selectedTurbineId}
                />
              </div>
            </div>

            <PerformanceAnalyticsCharts performance={performance} />

            <IncidentInvestigationPanel incident={incident} turbineId={selectedTurbineId} />
          </div>
        </main>
      </div>
    </div>
  );
}
