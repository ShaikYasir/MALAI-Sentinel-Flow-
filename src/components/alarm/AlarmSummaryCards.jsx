import { AlertTriangle, CheckCircle, Clock, Eye, Zap } from 'lucide-react';

const CARDS = [
  {
    key: 'totalActive',
    label: 'Total Active',
    icon: Zap,
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    valueColor: 'text-red-700',
  },
  {
    key: 'critical',
    label: 'Critical',
    icon: AlertTriangle,
    bg: 'bg-red-50',
    border: 'border-red-300',
    iconBg: 'bg-red-600',
    iconColor: 'text-white',
    valueColor: 'text-red-800',
    pulse: true,
  },
  {
    key: 'warning',
    label: 'Warning',
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    valueColor: 'text-amber-700',
  },
  {
    key: 'underVerification',
    label: 'Under Verification',
    icon: Eye,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    valueColor: 'text-blue-700',
  },
  {
    key: 'confirmed',
    label: 'Confirmed Faults',
    icon: CheckCircle,
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    valueColor: 'text-slate-700',
  },
];

export default function AlarmSummaryCards({ alarms }) {
  // Count by unique turbines so numbers match Dashboard KPIs
  const active = alarms.filter((a) => a.status === 'Active');
  const criticalTurbines = new Set(active.filter(a => a.severity === 'Critical').map(a => a.turbineId));
  const warningTurbines  = new Set(active.filter(a => a.severity === 'Warning' && !criticalTurbines.has(a.turbineId)).map(a => a.turbineId));
  const confirmedTurbines = new Set(active.filter(a => a.escalationLevel === 'confirmed').map(a => a.turbineId));
  const totalActiveTurbines = new Set(active.map(a => a.turbineId));
  const stats = {
    totalActive:       totalActiveTurbines.size,
    critical:          criticalTurbines.size,
    warning:           warningTurbines.size,
    underVerification: totalActiveTurbines.size - confirmedTurbines.size,
    confirmed:         confirmedTurbines.size,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {CARDS.map(({ key, label, icon: Icon, bg, border, iconBg, iconColor, valueColor, pulse }) => (
        <div key={key} className={`${bg} border ${border} rounded-xl p-4 flex items-center gap-4`}>
          <div className={`${iconBg} rounded-lg p-2.5 shrink-0`}>
            <Icon size={18} className={`${iconColor} ${pulse && stats[key] > 0 ? 'animate-pulse' : ''}`} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 font-medium truncate">{label}</p>
            <p className={`text-2xl font-bold leading-tight ${valueColor}`}>{stats[key]}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
