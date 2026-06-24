import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_BADGE = {
  normal:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning:  'bg-amber-50 text-amber-700 border-amber-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
};
const STATUS_LABEL = { normal: 'Operational', warning: 'Warning', critical: 'Fault' };

const PAGE_SIZE = 5;

function SortIcon({ col, sortKey, sortDir }) {
  if (sortKey !== col) return <span className="ml-1 text-slate-300 text-[10px]">↕</span>;
  return sortDir === 'asc'
    ? <ChevronUp size={11} className="inline ml-1 text-blue-500" />
    : <ChevronDown size={11} className="inline ml-1 text-blue-500" />;
}

export default function TurbineFleetTable({ turbines, selectedId, onSelect }) {
  const [search, setSearch]         = useState('');
  const [filterStatus, setStatus]   = useState('All');
  const [sortKey, setSortKey]       = useState('id');
  const [sortDir, setSortDir]       = useState('asc');
  const [page, setPage]             = useState(1);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return turbines
      .filter(t =>
        (filterStatus === 'All' || t.health === filterStatus.toLowerCase()) &&
        (!q || t.id.toLowerCase().includes(q) || t.model.toLowerCase().includes(q) ||
          t.manufacturer.toLowerCase().includes(q) || t.zone.toLowerCase().includes(q))
      )
      .sort((a, b) => {
        const av = a[sortKey] ?? '', bv = b[sortKey] ?? '';
        const res = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
        return sortDir === 'asc' ? res : -res;
      });
  }, [turbines, search, filterStatus, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const rows       = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const selectCls = 'text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300';
  const th = (key, label) => (
    <th
      key={key}
      onClick={() => handleSort(key)}
      className={`text-left text-xs font-semibold px-4 py-3 cursor-pointer select-none whitespace-nowrap hover:text-slate-700 ${sortKey === key ? 'text-blue-600' : 'text-slate-500'}`}
    >
      {label}<SortIcon col={key} sortKey={sortKey} sortDir={sortDir} />
    </th>
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Turbine Fleet</h3>
          <p className="text-xs text-slate-400 mt-0.5">{filtered.length} turbines · click row to inspect</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID, model, zone…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-300 w-48"
            />
          </div>
          <select value={filterStatus} onChange={e => { setStatus(e.target.value); setPage(1); }} className={selectCls}>
            {['All', 'Normal', 'Warning', 'Critical'].map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {th('id',              'Turbine ID')}
              {th('model',          'Model / Manufacturer')}
              {th('zone',           'Zone')}
              {th('ratedCapacity',  'Rated (MW)')}
              {th('power',          'Output (kW)')}
              {th('windSpeed',      'Wind (m/s)')}
              {th('health',         'Status')}
              {th('availability',   'Availability')}
              {th('commissionDate', 'Commissioned')}
            </tr>
          </thead>
          <tbody>
            {rows.map(t => (
              <tr
                key={t.id}
                onClick={() => onSelect(t.id)}
                className={`border-b border-slate-50 cursor-pointer transition-colors ${selectedId === t.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
              >
                <td className="px-4 py-3 font-semibold text-slate-800">{t.id}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-700">{t.model}</div>
                  <div className="text-slate-400">{t.manufacturer}</div>
                </td>
                <td className="px-4 py-3 text-slate-600">{t.zone}</td>
                <td className="px-4 py-3 font-medium text-slate-700">{t.ratedCapacity}</td>
                <td className="px-4 py-3 font-semibold text-slate-800">{t.power.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-700">{t.windSpeed}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${STATUS_BADGE[t.health] ?? STATUS_BADGE.normal}`}>
                    {STATUS_LABEL[t.health] ?? t.health}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${t.availability >= 90 ? 'bg-emerald-500' : t.availability >= 80 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${t.availability}%` }}
                      />
                    </div>
                    <span className="font-medium text-slate-700">{t.availability}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{t.commissionDate}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-400">No turbines match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
        <span className="text-xs text-slate-400">
          Showing {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`w-7 h-7 rounded-lg text-xs font-medium ${safePage === i + 1 ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
