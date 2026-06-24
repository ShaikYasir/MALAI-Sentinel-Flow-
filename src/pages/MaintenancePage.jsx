import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import MaintenanceSummaryCards from '../components/maintenance/MaintenanceSummaryCards';
import PredictiveMaintenancePanel from '../components/maintenance/PredictiveMaintenancePanel';
import WorkOrderTable from '../components/maintenance/WorkOrderTable';
import AIMaintenanceAssistant from '../components/maintenance/AIMaintenanceAssistant';
import SparePartsInventory from '../components/maintenance/SparePartsInventory';
import MaintenanceCalendar from '../components/maintenance/MaintenanceCalendar';
import TechnicianAssignmentPanel from '../components/maintenance/TechnicianAssignmentPanel';
import { turbineFleetData } from '../data/mockData';
import {
  createMaintenanceWorkOrder,
  getMaintenanceSchedule,
  getMaintenanceSummary,
  getMaintenanceWorkOrders,
  getSparePartsInventory,
  getTechnicianWorkload,
  postMaintenanceRecommendation,
  postPredictiveMaintenance,
  postSparePartForecast,
} from '../services/maintenanceApi';

export default function MaintenancePage({ activePage, onNavigate, onNavigateTurbine }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [summary, setSummary] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  const [selectedTurbineId, setSelectedTurbineId] = useState('WT-003');
  const [predictiveResult, setPredictiveResult] = useState(null);
  const [recommendation, setRecommendation] = useState(null);

  const [predictLoading, setPredictLoading] = useState(false);
  const [recommendLoading, setRecommendLoading] = useState(false);

  const turbineOptions = useMemo(
    () => turbineFleetData.map((t) => ({ id: t.id, zone: t.zone, health: t.health })),
    []
  );

  const refreshSummary = async () => {
    const res = await getMaintenanceSummary();
    setSummary(res);
  };

  useEffect(() => {
    const init = async () => {
      const [sum, wo, inv, sch, tech] = await Promise.all([
        getMaintenanceSummary(),
        getMaintenanceWorkOrders(),
        getSparePartsInventory(),
        getMaintenanceSchedule(),
        getTechnicianWorkload(),
      ]);
      setSummary(sum);
      setWorkOrders(wo);
      setInventory(inv);
      setSchedule(sch);
      setTechnicians(tech);
    };
    init();
  }, []);

  const handlePredict = async () => {
    setPredictLoading(true);
    setRecommendation(null);
    try {
      const result = await postPredictiveMaintenance({ turbineId: selectedTurbineId });
      setPredictiveResult(result);
    } finally {
      setPredictLoading(false);
    }
  };

  const handleRecommend = async () => {
    if (!predictiveResult) return;
    setRecommendLoading(true);
    try {
      const result = await postMaintenanceRecommendation({
        turbineId: selectedTurbineId,
        predictiveResult,
      });
      setRecommendation(result);
    } finally {
      setRecommendLoading(false);
    }
  };

  const handleCreateWorkOrder = async (payload) => {
    await createMaintenanceWorkOrder(payload);
    const [wo, tech] = await Promise.all([getMaintenanceWorkOrders(), getTechnicianWorkload()]);
    setWorkOrders(wo);
    setTechnicians(tech);
    await refreshSummary();
  };

  const handleForecastPart = async (part) => {
    return postSparePartForecast(part);
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

        <main className="maintenance-scroll flex-1 overflow-y-auto">
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-base font-bold text-slate-800">Maintenance Management</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Industrial predictive maintenance planning, work order control, spare part forecasting, and technician load balancing
                </p>
              </div>
              <button
                onClick={() => onNavigateTurbine?.(selectedTurbineId)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
              >
                Open {selectedTurbineId} in Turbines →
              </button>
            </div>

            <MaintenanceSummaryCards summary={summary} />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 xl:h-[430px]">
              <div className="xl:col-span-7 min-h-[340px] xl:min-h-0">
                <PredictiveMaintenancePanel
                  turbines={turbineOptions}
                  selectedTurbineId={selectedTurbineId}
                  onSelectTurbine={(id) => {
                    setSelectedTurbineId(id);
                    setPredictiveResult(null);
                    setRecommendation(null);
                  }}
                  onPredict={handlePredict}
                  predictiveResult={predictiveResult}
                  loading={predictLoading}
                />
              </div>
              <div className="xl:col-span-5 min-h-[340px] xl:min-h-0">
                <AIMaintenanceAssistant
                  selectedTurbineId={selectedTurbineId}
                  recommendation={recommendation}
                  loading={recommendLoading}
                  onRequestRecommendation={handleRecommend}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 xl:h-[470px]">
              <div className="xl:col-span-8 min-h-[360px] xl:min-h-0">
                <WorkOrderTable workOrders={workOrders} onCreateWorkOrder={handleCreateWorkOrder} />
              </div>
              <div className="xl:col-span-4 min-h-[360px] xl:min-h-0">
                <SparePartsInventory inventory={inventory} onRunForecast={handleForecastPart} />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 xl:h-[420px]">
              <div className="xl:col-span-7 min-h-[320px] xl:min-h-0">
                <MaintenanceCalendar schedule={schedule} />
              </div>
              <div className="xl:col-span-5 min-h-[320px] xl:min-h-0">
                <TechnicianAssignmentPanel technicians={technicians} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
