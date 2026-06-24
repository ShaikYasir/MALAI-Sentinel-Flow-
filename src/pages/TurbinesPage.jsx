import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import TurbineFleetTable from '../components/TurbineFleetTable';
import WindFarmMap from '../components/WindFarmMap';
import TurbineDetailPanel from '../components/TurbineDetailPanel';
import { turbineFleetData, weatherData } from '../data/mockData';

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

export default function TurbinesPage({ activePage, onNavigate, initialTurbineId }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedId, setSelectedId]   = useState(initialTurbineId ?? null);

  const selectedTurbine = turbineFleetData.find(t => t.id === selectedId) ?? null;

  const handleSelect = (id) => {
    setSelectedId(prev => (prev === id ? null : id));
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
          <div className="p-5 space-y-5">

            {/* ── Top: Fleet Management Table ────────────────────── */}
            <section>
              <SectionHeader
                title="Turbine Fleet Management"
                subtitle="Asset registry — search, filter and sort all turbines"
                badge={`${turbineFleetData.length} units`}
              />
              <TurbineFleetTable
                turbines={turbineFleetData}
                selectedId={selectedId}
                onSelect={handleSelect}
              />
            </section>

            {/* ── Optimized Ops Grid: Map + Detail ───────────────── */}
            <section>
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
                <div className="xl:col-span-4">
                  <SectionHeader
                    title="Wind Farm Layout"
                    subtitle="All 24 turbines with live status"
                  />
                  <WindFarmMap
                    turbines={turbineFleetData}
                    selectedId={selectedId}
                    onSelect={handleSelect}
                    windDeg={weatherData.windDirectionDeg}
                  />
                </div>

                <div className="xl:col-span-8">
                  <SectionHeader
                    title={selectedTurbine ? `${selectedTurbine.id} — Detailed Inspection` : 'Detailed Inspection'}
                    subtitle={
                      selectedTurbine
                        ? `${selectedTurbine.model} · ${selectedTurbine.manufacturer} · ${selectedTurbine.zone}`
                        : 'Select a turbine from the table or map above'
                    }
                  />
                  <TurbineDetailPanel turbine={selectedTurbine} />
                </div>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}
