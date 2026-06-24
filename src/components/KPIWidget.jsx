import { Wind, CheckCircle2, AlertTriangle, Zap, TrendingUp, Wrench } from 'lucide-react';

const ICONS = {
  turbine: Wind,
  check:   CheckCircle2,
  alert:   AlertTriangle,
  bolt:    Zap,
  chart:   TrendingUp,
  wrench:  Wrench,
};

const COLORS = {
  blue:   { icon: 'bg-blue-50 text-blue-600',    border: 'border-l-blue-500'   },
  green:  { icon: 'bg-green-50 text-green-600',  border: 'border-l-green-500'  },
  red:    { icon: 'bg-red-50 text-red-600',      border: 'border-l-red-500'    },
  amber:  { icon: 'bg-amber-50 text-amber-600',  border: 'border-l-amber-500'  },
  purple: { icon: 'bg-violet-50 text-violet-600',border: 'border-l-violet-500' },
  orange: { icon: 'bg-orange-50 text-orange-600',border: 'border-l-orange-500' },
};

export default function KPIWidget({ title, value, unit, subtitle, trend, trendDir, color, iconType }) {
  const Icon = ICONS[iconType] ?? Zap;
  const c = COLORS[color] ?? COLORS.blue;

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-4 border-l-4 ${c.border}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.icon}`}>
          <Icon size={18} />
        </div>
        {trend && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            trendDir === 'dn' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
          }`}>
            {trend}
          </span>
        )}
      </div>
      <div className="flex items-baseline space-x-1 mb-0.5">
        <span className="text-2xl font-bold text-slate-800">{value}</span>
        {unit && <span className="text-sm font-medium text-slate-500">{unit}</span>}
      </div>
      <p className="text-xs font-semibold text-slate-700">{title}</p>
      <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
    </div>
  );
}
