import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import KPIWidget from '../components/KPIWidget';
import TurbineStatusCard from '../components/TurbineStatusCard';
import PowerChart from '../components/PowerChart';
import AlarmTable from '../components/AlarmTable';
import WeatherPanel from '../components/WeatherPanel';
import { turbineFleetData, weatherData } from '../data/mockData';
import { alarmCenterAlarms } from '../data/alarmCenterData';

// ── Derive alarm turbine sets from single source of truth ──────────────────
function getAlarmStats(alarms) {
  const active = alarms.filter(a => a.status === 'Active');
  const criticalTurbines = new Set(active.filter(a => a.severity === 'Critical').map(a => a.turbineId));
  const warningTurbines  = new Set(
    active.filter(a => a.severity === 'Warning' && !criticalTurbines.has(a.turbineId)).map(a => a.turbineId)
  );
  return { critical: criticalTurbines.size, warning: warningTurbines.size };
}

function SectionHeader({ title, subtitle, badge }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-sm font-bold text-slate-800">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {badge && (
        <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg border border-slate-200">
          {badge}
        </span>
      )}
    </div>
  );
}

// ── Compute KPIs live from fleet data ──────────────────────────────────────
function computeKPIs(fleet) {
  const total      = fleet.length;
  const active     = fleet.filter(t => t.quickStatus === 'Running').length;
  const offline    = fleet.filter(t => t.quickStatus === 'Fault').length;
  const { critical, warning } = getAlarmStats(alarmCenterAlarms);
  const totalPower = +(fleet.reduce((s, t) => s + t.power, 0) / 1000).toFixed(1);
  const avgEff     = +(fleet.reduce((s, t) => s + t.efficiency, 0) / fleet.length).toFixed(1);
  const maintenance = fleet.filter(t => t.availability < 85).length;

  return [
    {
      id: 1, title: 'Total Turbines', value: total, unit: '',
      subtitle: 'Installed capacity', trend: null, trendDir: null,
      color: 'blue', iconType: 'turbine',
    },
    {
      id: 2, title: 'Active Turbines', value: active, unit: '',
      subtitle: `${offline} offline`, trend: null, trendDir: null,
      color: 'green', iconType: 'check',
    },
    {
      id: 3, title: 'Turbines in Alarm', value: critical + warning, unit: '',
      subtitle: `${critical} critical, ${warning} warning`,
      trend: critical > 0 ? `+${critical}` : null,
      trendDir: critical > 0 ? 'up' : null,
      color: 'red', iconType: 'alert',
    },
    {
      id: 4, title: 'Power Output', value: totalPower, unit: 'MW',
      subtitle: '↑ 12% vs last hr', trend: '+12%', trendDir: 'up',
      color: 'amber', iconType: 'bolt',
    },
    {
      id: 5, title: 'Farm Efficiency', value: avgEff, unit: '%',
      subtitle: 'Target: 90%',
      trend: avgEff >= 90 ? '+0.5%' : '-0.8%',
      trendDir: avgEff >= 90 ? 'up' : 'dn',
      color: 'purple', iconType: 'chart',
    },
    {
      id: 6, title: 'Maintenance Due', value: maintenance, unit: '',
      subtitle: `${Math.min(maintenance, 2)} overdue`, trend: null, trendDir: null,
      color: 'orange', iconType: 'wrench',
    },
  ];
}

function getTopAlarmTurbines(fleet, alarms, limit = 6) {
  const activeAlarms = alarms.filter((a) => a.status === 'Active');
  const scoreByTurbine = new Map();

  activeAlarms.forEach((alarm) => {
    const severityWeight = alarm.severity === 'Critical' ? 4 : alarm.severity === 'Warning' ? 2 : 1;
    const escalationWeight = alarm.escalationLevel === 'confirmed' ? 3 : alarm.escalationLevel === 'warning' ? 2 : 1;
    const occurrenceWeight = Math.max(1, Number(alarm.occurrenceCount ?? 1));
    const score = (severityWeight * 6) + (escalationWeight * 4) + occurrenceWeight;

    scoreByTurbine.set(alarm.turbineId, (scoreByTurbine.get(alarm.turbineId) ?? 0) + score);
  });

  const scored = fleet
    .map((turbine) => ({
      ...turbine,
      alarmScore: scoreByTurbine.get(turbine.id) ?? 0,
    }))
    .sort((a, b) => {
      if (b.alarmScore !== a.alarmScore) return b.alarmScore - a.alarmScore;
      return a.id.localeCompare(b.id);
    });

  return scored.slice(0, limit);
}

export default function Dashboard({ activePage, onNavigate, onNavigateTurbine }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const kpiData = computeKPIs(turbineFleetData);
  const topAlarmTurbines = getTopAlarmTurbines(turbineFleetData, alarmCenterAlarms, 6);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage={activePage} onNavigate={onNavigate} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar sidebarOpen={sidebarOpen} onOpenAlarms={() => onNavigate('alarms')} />

        <main className="app-scroll flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">

            {/* ── Row 1 : KPI Cards ─────────────────────────────────── */}
            <section>
              <SectionHeader
                title="Farm Overview"subtitle="Key performance indicators — real-time"
                badge="● Live"
              />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {kpiData.map((kpi) => <KPIWidget key={kpi.id} {...kpi} />)}
              </div>
            </section>

            {/* ── Row 2 : Turbine Status (full width) ─────────────── */}
            <section>
              <SectionHeader
                title="Turbine Status"
                subtitle="Top 6 turbines by active alarms"
                badge={`${turbineFleetData.length} total units`}
              />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {topAlarmTurbines.map((t) => (
                  <TurbineStatusCard
                    key={t.id}
                    turbine={{ ...t, power: +(t.power / 1000).toFixed(2) }}
                    onSelect={() => onNavigateTurbine && onNavigateTurbine(t.id)}
                  />
                ))}
              </div>
            </section>

            {/* ── Row 3 : Power Chart (left 3/4) + Weather (right 1/4) ── */}
            <section>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">

                <div className="lg:col-span-3">
                  <SectionHeader
                    title="Power Generation"
                    subtitle="Wind speed · output · efficiency"
                  />
                  <PowerChart />
                </div>

                <div className="lg:col-span-1">
                  <SectionHeader
                    title="Weather"
                    subtitle="Live environmental data"
                  />
                  <WeatherPanel weather={weatherData} />
                </div>

              </div>
            </section>

            {/* ── Row 4 : Alarm Table ───────────────────────────────── */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Alarm Center</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Recent alarms — sortable and filterable</p>
                </div>
                <button
                  onClick={() => onNavigate('alarms')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                >
                  View Alarm Center →
                </button>
              </div>
              <AlarmTable alarms={alarmCenterAlarms} onNavigateTurbine={onNavigateTurbine} onViewAlarms={() => onNavigate('alarms')} />
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}
