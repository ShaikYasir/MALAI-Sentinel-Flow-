import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Filter, Search, Bot, CheckCheck, Droplets } from 'lucide-react';

const SEV_BADGE = {
  Critical: 'bg-red-50 text-red-700 border border-red-200',
  Warning:  'bg-amber-50 text-amber-700 border border-amber-200',
  Info:     'bg-blue-50 text-blue-700 border border-blue-200',
};

const STATUS_BADGE = {
  Active:       'bg-red-50  text-red-600  border border-red-200',
  Acknowledged: 'bg-amber-50 text-amber-700 border border-amber-200',
  Resolved:     'bg-green-50 text-green-700 border border-green-200',
};

const ESCALATION = {
  monitoring: { label: '1 / 3', bar: 'w-1/3',  color: 'bg-blue-400',  text: 'text-blue-600',  ring: 'bg-blue-400'  },
  warning:    { label: '2 / 3', bar: 'w-2/3',  color: 'bg-amber-400', text: 'text-amber-600', ring: 'bg-amber-400' },
  confirmed:  { label: '3 / 3', bar: 'w-full', color: 'bg-red-500',   text: 'text-red-600',   ring: 'bg-red-500'   },
};

const COLUMNS = [
  { key: 'id',              label: 'Alarm ID',   sortable: true  },
  { key: 'turbineId',       label: 'Turbine',    sortable: true  },
  { key: 'zone',            label: 'Zone',       sortable: true  },
  { key: 'component',       label: 'Component',  sortable: true  },
  { key: 'type',            label: 'Alarm Type', sortable: false },
  { key: 'severity',        label: 'Severity',   sortable: true  },
  { key: 'occurrenceCount', label: 'Threshold',  sortable: true  },
  { key: 'triggeredAt',     label: 'Triggered',  sortable: false },
  { key: 'status',          label: 'Status',     sortable: true  },
];

function SortIcon({ active, dir }) {
  if (!active) return <ChevronsUpDown size={10} className="text-slate-300 ml-1 shrink-0" />;
  return dir === 'asc'
    ? <ChevronUp   size={10} className="text-blue-500 ml-1 shrink-0" />
    : <ChevronDown size={10} className="text-blue-500 ml-1 shrink-0" />;
}

function ThresholdBar({ level, count }) {
  const cfg = ESCALATION[level] ?? ESCALATION.monitoring;
  return (
    <div className="flex flex-col items-start gap-1 min-w-[80px]">
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${cfg.bar} ${cfg.color} transition-all`} />
      </div>
      <span className={`text-[10px] font-bold ${cfg.text}`}>
        {count} / 3 {level === 'confirmed' ? '— Confirmed' : ''}
      </span>
    </div>
  );
}

function getOilLeakageBadge(alarm) {
  const type = String(alarm?.type).toLowerCase();
  const category = String(alarm?.faultCategory).toLowerCase();
  const escalation = String(alarm?.escalationLevel).toLowerCase();
  const isOilLeakageCase = (
    type === 'oil leakage' ||
    type === 'oil leakage dedicated fault' ||
    category === 'oil-leakage-detection' ||
    category === 'oil-leakage-confirmed'
  );

  if (!isOilLeakageCase) return null;
  if (escalation !== 'confirmed' && alarm.instanceKind !== 'fault' && category !== 'oil-leakage-confirmed') {
    return null;
  }

  return {
    label: 'Oil Leak Confirmed',
    className: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700',
    iconClassName: 'text-fuchsia-600',
  };
}

export default function AlarmCenterTable({ alarms, selectedId, onSelect, onAcknowledge, onAnalyze, onGoToTurbine }) {
  const [sortKey, setSortKey]     = useState('id');
  const [sortDir, setSortDir]     = useState('desc');
  const [filterSev, setFilterSev] = useState('All');
  const [filterStat, setFilterStat] = useState('All');
  const [filterEsc, setFilterEsc] = useState('All');
  const [search, setSearch]       = useState('');

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return alarms
      .filter((a) => filterSev  === 'All' || a.severity        === filterSev)
      .filter((a) => filterStat === 'All' || a.status          === filterStat)
      .filter((a) => filterEsc  === 'All' || a.escalationLevel === filterEsc)
      .filter((a) => !q || a.id.toLowerCase().includes(q) || a.turbineId.toLowerCase().includes(q) || a.component.toLowerCase().includes(q))
      .sort((a, b) => {
        const av = String(a[sortKey] ?? '');
        const bv = String(b[sortKey] ?? '');
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
  }, [alarms, sortKey, sortDir, filterSev, filterStat, filterEsc, search]);

  const selectCls = 'text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Panel header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Real-Time Alarm Feed</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {rows.length} alarm{rows.length !== 1 ? 's' : ''} shown •{' '}
            <span className="text-red-500 font-medium">
              {alarms.filter((a) => a.status === 'Active').length} active
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID / turbine…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 w-40"
            />
          </div>
          <Filter size={12} className="text-slate-400" />
          <select value={filterSev}  onChange={(e) => setFilterSev(e.target.value)}  className={selectCls}>
            {['All', 'Critical', 'Warning', 'Info'].map((v) => <option key={v}>{v}</option>)}
          </select>
          <select value={filterStat} onChange={(e) => setFilterStat(e.target.value)} className={selectCls}>
            {['All', 'Active', 'Acknowledged', 'Resolved'].map((v) => <option key={v}>{v}</option>)}
          </select>
          <select value={filterEsc}  onChange={(e) => setFilterEsc(e.target.value)}  className={selectCls}>
            {['All', 'monitoring', 'warning', 'confirmed'].map((v) => (
              <option key={v} value={v}>{v === 'All' ? 'All Levels' : v.charAt(0).toUpperCase() + v.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-slate-100 bg-slate-50">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${col.sortable ? 'cursor-pointer hover:text-slate-700 select-none' : ''}`}
                >
                  <span className="flex items-center">
                    {col.label}
                    {col.sortable && <SortIcon active={sortKey === col.key} dir={sortDir} />}
                  </span>
                </th>
              ))}
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((alarm) => {
              const isSelected = alarm.id === selectedId;
              const oilLeakageBadge = getOilLeakageBadge(alarm);
              return (
                <tr
                  key={alarm.id}
                  onClick={() => onSelect(alarm.id)}
                  className={`border-b border-slate-50 cursor-pointer transition-colors
                    ${isSelected
                      ? 'bg-blue-50 hover:bg-blue-50'
                      : alarm.status === 'Resolved'
                        ? 'text-slate-400 hover:bg-slate-50/80'
                        : 'hover:bg-slate-50'
                    }`}
                >
                  <td className="px-4 py-3 font-mono font-semibold text-slate-700 whitespace-nowrap">{alarm.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {onGoToTurbine ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); onGoToTurbine(alarm.turbineId); }}
                        className="font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors text-xs"
                        title="View turbine detail"
                      >
                        {alarm.turbineId}
                      </button>
                    ) : (
                      <span className="font-bold text-slate-800">{alarm.turbineId}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{alarm.zone}</td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{alarm.component}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <div className="flex items-center gap-2">
                      <span>{alarm.type}</span>
                      {oilLeakageBadge && (
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${oilLeakageBadge.className}`}>
                          <Droplets size={10} className={oilLeakageBadge.iconClassName} />
                          {oilLeakageBadge.label}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${SEV_BADGE[alarm.severity] ?? ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${alarm.severity === 'Critical' ? 'bg-red-500 animate-pulse' : alarm.severity === 'Warning' ? 'bg-amber-500' : 'bg-blue-400'}`} />
                      {alarm.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ThresholdBar level={alarm.escalationLevel} count={alarm.occurrenceCount} />
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap font-mono">{alarm.triggeredAt}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[alarm.status] ?? ''}`}>
                      {alarm.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => { onSelect(alarm.id); onAnalyze(alarm); }}
                        className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors"
                      >
                        <Bot size={11} /> Analyze
                      </button>
                      {alarm.status === 'Active' && (
                        <button
                          onClick={() => onAcknowledge(alarm.id)}
                          className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                        >
                          <CheckCheck size={11} /> Ack
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="px-6 py-10 text-center text-slate-400 text-xs">
                  No alarms match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
