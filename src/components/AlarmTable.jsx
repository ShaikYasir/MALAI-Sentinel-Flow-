import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Filter } from 'lucide-react';

const SEV_BADGE = {
  Critical: 'bg-red-50 text-red-700 border border-red-200',
  Warning:  'bg-amber-50 text-amber-700 border border-amber-200',
  Info:     'bg-blue-50 text-blue-700 border border-blue-200',
};

const STATUS_BADGE = {
  Active:       'bg-red-50 text-red-600',
  Acknowledged: 'bg-amber-50 text-amber-700',
  Resolved:     'bg-green-50 text-green-700',
};

const COLUMNS = [
  { key: 'id',          label: 'Alarm ID',   sortable: true  },
  { key: 'turbineId',   label: 'Turbine',    sortable: true  },
  { key: 'zone',        label: 'Zone',       sortable: true  },
  { key: 'component',   label: 'Component',  sortable: true  },
  { key: 'type',        label: 'Alarm Type', sortable: false },
  { key: 'severity',    label: 'Severity',   sortable: true  },
  { key: 'triggeredAt', label: 'Time',       sortable: false },
  { key: 'status',      label: 'Status',     sortable: true  },
];

function SortIcon({ active, dir }) {
  if (!active) return <ChevronsUpDown size={11} className="text-slate-300 ml-1 shrink-0" />;
  return dir === 'asc'
    ? <ChevronUp   size={11} className="text-blue-500 ml-1 shrink-0" />
    : <ChevronDown size={11} className="text-blue-500 ml-1 shrink-0" />;
}

export default function AlarmTable({ alarms, onNavigateTurbine, onViewAlarms }) {
  const [sortKey, setSortKey]     = useState('id');
  const [sortDir, setSortDir]     = useState('desc');
  const [filterSev, setFilterSev] = useState('All');
  const [filterStat, setFilterStat] = useState('All');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const rows = useMemo(() => {
    return alarms
      .filter((a) => filterSev  === 'All' || a.severity === filterSev)
      .filter((a) => filterStat === 'All' || a.status   === filterStat)
      .sort((a, b) => {
        const av = String(a[sortKey] ?? '');
        const bv = String(b[sortKey] ?? '');
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
  }, [alarms, sortKey, sortDir, filterSev, filterStat]);

  const selectCls = 'text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Alarm Summary</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-slate-400">{rows.length} alarm{rows.length !== 1 ? 's' : ''} shown</p>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
              {alarms.filter((a) => a.status === 'Active').length} active
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Filter size={13} className="text-slate-400 shrink-0" />
          <select value={filterSev}  onChange={(e) => setFilterSev(e.target.value)}  className={selectCls}>
            {['All', 'Critical', 'Warning', 'Info'].map((v) => <option key={v}>{v}</option>)}
          </select>
          <select value={filterStat} onChange={(e) => setFilterStat(e.target.value)} className={selectCls}>
            {['All', 'Active', 'Acknowledged', 'Resolved'].map((v) => <option key={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${
                    col.sortable ? 'cursor-pointer hover:text-slate-700 select-none' : ''
                  }`}
                >
                  <span className="inline-flex items-center">
                    {col.label}
                    {col.sortable && <SortIcon active={sortKey === col.key} dir={sortDir} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((alarm, i) => (
              <tr
                key={alarm.id}
                onClick={() => onViewAlarms && onViewAlarms()}
                className={`border-b border-slate-50 transition-colors ${onViewAlarms ? 'cursor-pointer hover:bg-blue-50/60' : 'hover:bg-slate-50'} ${
                  i % 2 !== 0 ? 'bg-slate-50/40' : ''
                }`}
              >
                <td className="px-5 py-3 font-mono text-xs font-medium text-slate-600">{alarm.id}</td>
                <td className="px-5 py-3">
                  {onNavigateTurbine ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); onNavigateTurbine(alarm.turbineId); }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                      title="View turbine detail"
                    >
                      {alarm.turbineId}
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-blue-600">{alarm.turbineId}</span>
                  )}
                </td>
                <td className="px-5 py-3 text-xs text-slate-500">{alarm.zone}</td>
                <td className="px-5 py-3 text-xs text-slate-600">{alarm.component}</td>
                <td className="px-5 py-3 text-xs text-slate-600">{alarm.type}</td>
                <td className="px-5 py-3">
                  <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${SEV_BADGE[alarm.severity] ?? ''}`}>
                    {alarm.severity}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs font-mono text-slate-500">{alarm.triggeredAt ?? alarm.time}</td>
                <td className="px-5 py-3">
                  <span className={`inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-md ${STATUS_BADGE[alarm.status] ?? ''}`}>
                    {alarm.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm">
            No alarms match the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}
