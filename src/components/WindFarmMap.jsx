const STATUS_FILL = {
  normal:   '#10b981',
  warning:  '#f59e0b',
  critical: '#ef4444',
};
const STATUS_RING = {
  normal:   '#6ee7b7',
  warning:  '#fcd34d',
  critical: '#fca5a5',
};

const LEGEND = [
  { color: '#10b981', label: 'Operational' },
  { color: '#f59e0b', label: 'Warning'     },
  { color: '#ef4444', label: 'Fault'       },
];

export default function WindFarmMap({ turbines, selectedId, onSelect, windDeg }) {
  // Wind arrow: tip points in the "from" direction (meteorological)
  const cx = 658, cy = 18, r = 15;
  const rad = (windDeg * Math.PI) / 180;
  const tipX = cx + r * Math.sin(rad);
  const tipY = cy - r * Math.cos(rad);
  const backX = cx - (r - 6) * Math.sin(rad);
  const backY = cy + (r - 6) * Math.cos(rad);
  const perpX = Math.cos(rad), perpY = Math.sin(rad);
  const p1 = `${tipX},${tipY}`;
  const p2 = `${backX + perpX * 4},${backY + perpY * 4}`;
  const p3 = `${backX - perpX * 4},${backY - perpY * 4}`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Wind Farm Layout</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {turbines.length} turbines · click to select · wind from {windDeg}°
          </p>
        </div>
        <div className="flex items-center gap-4">
          {LEGEND.map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-xs text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Map */}
      <div className="p-4">
        <svg
          viewBox="0 0 700 420"
          className="w-full"
          style={{ maxHeight: 360, userSelect: 'none', WebkitUserSelect: 'none', cursor: 'default' }}
        >
          {/* Canvas bg */}
          <rect x="0" y="0" width="700" height="420" rx="8" fill="#f8fafc" />

          {/* Zone A — x=14..202  (WT-001..004, WT-009..012) */}
          <rect x="14" y="38" width="202" height="358" rx="6" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1" strokeDasharray="5 3" />
          <text x="115" y="30" textAnchor="middle" fontSize="12" fill="#93c5fd" fontWeight="700" letterSpacing="2">ZONE A</text>

          {/* Zone B — x=226..452  (WT-005..008, WT-013..016) */}
          <rect x="226" y="38" width="218" height="358" rx="6" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1" strokeDasharray="5 3" />
          <text x="335" y="30" textAnchor="middle" fontSize="12" fill="#86efac" fontWeight="700" letterSpacing="2">ZONE B</text>

          {/* Zone C — x=466..660  (WT-017..024) */}
          <rect x="466" y="38" width="218" height="358" rx="6" fill="#fff7ed" stroke="#fed7aa" strokeWidth="1" strokeDasharray="5 3" />
          <text x="575" y="30" textAnchor="middle" fontSize="12" fill="#fdba74" fontWeight="700" letterSpacing="2">ZONE C</text>

          {/* Wind compass */}
          <circle cx={cx} cy={cy} r="18" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
          <text x={cx}      y={cy - 21} textAnchor="middle" fontSize="9" fill="#94a3b8" style={{pointerEvents:'none'}}>N</text>
          <text x={cx + 21} y={cy + 3}  textAnchor="middle" fontSize="9" fill="#94a3b8" style={{pointerEvents:'none'}}>E</text>
          <text x={cx}      y={cy + 24} textAnchor="middle" fontSize="9" fill="#94a3b8" style={{pointerEvents:'none'}}>S</text>
          <text x={cx - 21} y={cy + 3}  textAnchor="middle" fontSize="9" fill="#94a3b8" style={{pointerEvents:'none'}}>W</text>
          <line x1={cx} y1={cy} x2={tipX} y2={tipY} stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
          <polygon points={`${p1} ${p2} ${p3}`} fill="#3b82f6" />
          <circle cx={cx} cy={cy} r="2.5" fill="#64748b" />

          {/* Turbines */}
          {turbines.map(t => {
            const isSel  = selectedId === t.id;
            const fill   = STATUS_FILL[t.health] ?? '#94a3b8';
            const ring   = STATUS_RING[t.health] ?? '#cbd5e1';
            return (
              <g key={t.id} onClick={() => onSelect(t.id)} style={{ cursor: 'pointer' }}>
                {/* Glow for critical */}
                {t.health === 'critical' && (
                  <circle cx={t.mapX} cy={t.mapY} r="20" fill={ring} opacity="0.28" />
                )}
                {/* Selection ring */}
                {isSel && (
                  <circle cx={t.mapX} cy={t.mapY} r="19" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4 2" />
                )}
                {/* Turbine body */}
                <circle cx={t.mapX} cy={t.mapY} r="13" fill={fill} fillOpacity="0.12" stroke={fill} strokeWidth="2" />
                {/* Blade lines */}
                <line x1={t.mapX}      y1={t.mapY - 13} x2={t.mapX}      y2={t.mapY - 5}  stroke={fill} strokeWidth="2" opacity="0.75" strokeLinecap="round" />
                <line x1={t.mapX + 11} y1={t.mapY + 6}  x2={t.mapX + 5}  y2={t.mapY + 2}  stroke={fill} strokeWidth="2" opacity="0.75" strokeLinecap="round" />
                <line x1={t.mapX - 11} y1={t.mapY + 6}  x2={t.mapX - 5}  y2={t.mapY + 2}  stroke={fill} strokeWidth="2" opacity="0.75" strokeLinecap="round" />
                {/* Hub dot */}
                <circle cx={t.mapX} cy={t.mapY} r="4" fill={fill} />
                {/* ID label — above marker */}
                <text x={t.mapX} y={t.mapY - 19} textAnchor="middle" fontSize="10" fill="#334155"
                  fontWeight={isSel ? '700' : '500'} letterSpacing="0.3" style={{ pointerEvents: 'none' }}>
                  {t.id}
                </text>
                {/* MW output — shown only when selected, above id label */}
                {isSel && (
                  <text x={t.mapX} y={t.mapY - 31} textAnchor="middle" fontSize="9.5" fill="#2563eb"
                    fontWeight="700" style={{ pointerEvents: 'none' }}>
                    {t.power > 0 ? `${(t.power / 1000).toFixed(1)} MW` : 'Offline'}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
