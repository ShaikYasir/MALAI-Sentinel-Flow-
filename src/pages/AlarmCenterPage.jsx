import { useState } from 'react';
import Sidebar   from '../components/Sidebar';
import Navbar    from '../components/Navbar';
import AlarmSummaryCards        from '../components/alarm/AlarmSummaryCards';
import AlarmCenterTable         from '../components/alarm/AlarmCenterTable';
import FalseAlarmDetectionPanel from '../components/alarm/FalseAlarmDetectionPanel';
import SensorCorrelationView    from '../components/alarm/SensorCorrelationView';
import AlarmTimeline            from '../components/alarm/AlarmTimeline';
import OperatorNotificationPanel from '../components/alarm/OperatorNotificationPanel';
import { alarmCenterAlarms, alarmTimelineEvents } from '../data/alarmCenterData';

export default function AlarmCenterPage({ activePage, onNavigate, onNavigateTurbine }) {
  const [sidebarOpen,       setSidebarOpen]       = useState(true);
  const [alarms,            setAlarms]            = useState(alarmCenterAlarms);
  const [selectedAlarmId,   setSelectedAlarmId]   = useState(alarmCenterAlarms[0]?.id ?? null);
  const [sentNotifications, setSentNotifications] = useState([]);

  const selectedAlarm = alarms.find((a) => a.id === selectedAlarmId) ?? null;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleAcknowledge = (alarmId) => {
    setAlarms((prev) =>
      prev.map((a) => a.id === alarmId ? { ...a, status: 'Acknowledged' } : a)
    );
  };

  // Clicking "Analyze" from the table selects the alarm and scrolls focus to the panel
  const handleAnalyzeFromTable = (alarm) => {
    setSelectedAlarmId(alarm.id);
  };

  const handleNotify = (alarm) => {
    const already = sentNotifications.find((n) => n.alarmId === alarm.id);
    if (already) return;
    setSentNotifications((prev) => [
      ...prev,
      {
        alarmId:    alarm.id,
        turbineId:  alarm.turbineId,
        type:       alarm.type,
        component:  alarm.component,
        notifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage={activePage} onNavigate={onNavigate} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar sidebarOpen={sidebarOpen} onOpenAlarms={() => onNavigate('alarms')} />

        <main className="app-scroll flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">

            {/* ── Page title ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-base font-bold text-slate-800">Alarm Center</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time SCADA alarm monitoring · AI-powered false alarm detection · Operator escalation
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live Feed
              </span>
            </div>

            {/* ── Row 1 : Summary cards ─────────────────────────────── */}
            <AlarmSummaryCards alarms={alarms} />

            {/* ── Row 2 : Table (8) + Timeline (4) ─────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 xl:h-[460px]">
              <div className="xl:col-span-8 min-h-[300px] xl:min-h-0">
                <AlarmCenterTable
                  alarms={alarms}
                  selectedId={selectedAlarmId}
                  onSelect={setSelectedAlarmId}
                  onAcknowledge={handleAcknowledge}
                  onAnalyze={handleAnalyzeFromTable}
                  onGoToTurbine={onNavigateTurbine}
                />
              </div>
              <div className="xl:col-span-4 min-h-[300px] xl:min-h-0">
                <AlarmTimeline events={alarmTimelineEvents} />
              </div>
            </div>

            {/* ── Row 3 : AI Panel (5) + Correlation (4) + Notify (3) ── */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 xl:h-[540px]">
              <div className="xl:col-span-5 min-h-[400px] xl:min-h-0">
                <FalseAlarmDetectionPanel
                  alarms={alarms}
                  selectedAlarm={selectedAlarm}
                  onSelectAlarm={setSelectedAlarmId}
                />
              </div>
              <div className="xl:col-span-4 min-h-[400px] xl:min-h-0">
                <SensorCorrelationView selectedAlarm={selectedAlarm} />
              </div>
              <div className="xl:col-span-3 min-h-[400px] xl:min-h-0">
                <OperatorNotificationPanel
                  alarms={alarms}
                  sentNotifications={sentNotifications}
                  onSendNotification={handleNotify}
                />
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
