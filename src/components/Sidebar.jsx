import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Wind, AlertTriangle, Wrench,
  BarChart3, FileBarChart, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { getMaintenanceSummary } from '../services/maintenanceApi';

const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'turbines',    label: 'Turbines',     icon: Wind            },
  { id: 'alarms',      label: 'Alarm Center', icon: AlertTriangle   },
  { id: 'maintenance', label: 'Maintenance',  icon: Wrench          },
  { id: 'analytics',   label: 'Analytics',    icon: BarChart3       },
  { id: 'reports',     label: 'Reports',      icon: FileBarChart    },
];

export default function Sidebar({ isOpen, setIsOpen, activePage, onNavigate }) {
  const [localActive, setLocalActive] = useState('dashboard');
  const [maintenancePending, setMaintenancePending] = useState(null);
  const currentActive = activePage ?? localActive;

  useEffect(() => {
    let mounted = true;
    const loadMaintenanceBadge = async () => {
      try {
        const summary = await getMaintenanceSummary();
        if (mounted) setMaintenancePending(summary.pendingMaintenance);
      } catch {
        if (mounted) setMaintenancePending(null);
      }
    };
    loadMaintenanceBadge();
    const timer = setInterval(loadMaintenanceBadge, 30000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <aside
      style={{ width: isOpen ? 256 : 64, transition: 'width 0.25s' }}
      className="h-screen shrink-0 overflow-y-auto bg-slate-900 text-white flex flex-col shadow-xl select-none"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700/60 shrink-0">
        {isOpen ? (
          <div className="flex items-center">
            <div className="relative rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-[0_8px_22px_rgba(15,23,42,0.16)] transition-all duration-300 hover:shadow-[0_10px_30px_rgba(30,64,175,0.18)]">
              <img
                src="/logo.svg"
                alt="MALAI"
                className="h-10 w-auto shrink-0"
              />
            </div>
          </div>
        ) : (
          <div className="mx-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_8px_18px_rgba(15,23,42,0.16)]">
            <img
              src="/vite.svg"
              alt="MALAI Compact"
              className="h-8 w-8 object-contain"
            />
          </div>
        )}
        {isOpen && (
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
          >
            <ChevronLeft size={15} />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="mx-auto mt-3 p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronRight size={15} />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {isOpen && (
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest px-3 mb-2">
            Navigation
          </p>
        )}
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => { setLocalActive(item.id); onNavigate?.(item.id); }}
                  title={!isOpen ? item.label : undefined}
                  className={`w-full flex items-center ${
                    isOpen ? 'space-x-3 px-3' : 'justify-center'
                  } py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    currentActive === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={17} className="shrink-0" />
                  {isOpen && (
                    <>
                      <span>{item.label}</span>
                      {item.id === 'maintenance' && typeof maintenancePending === 'number' && maintenancePending > 0 && (
                        <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white min-w-5 text-center">
                          {maintenancePending}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User footer */}
      {isOpen && (
        <div className="px-4 py-4 border-t border-slate-700/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-blue-400">SY</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">Shaik Yasir</p>
              <p className="text-[10px] text-slate-400">Operator</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
