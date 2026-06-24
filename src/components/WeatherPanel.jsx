import { Thermometer, Droplets, Gauge, Eye, Wind } from 'lucide-react';

// SVG compass — needle points FROM the direction the wind is coming from.
// degrees = 0 → N, 90 → E, 180 → S, 270 → W (meteorological convention)
function WindCompass({ degrees, label }) {
  const cx = 52;
  const cy = 52;
  const r  = 44;

  // 8 tick marks (every 45°)
  const ticks = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45 * Math.PI) / 180;
    const inner = i % 2 === 0 ? r - 9 : r - 6;
    return {
      x1: cx + inner * Math.sin(a),
      y1: cy - inner * Math.cos(a),
      x2: cx + r * Math.sin(a),
      y2: cy - r * Math.cos(a),
      major: i % 2 === 0,
    };
  });

  // Cardinal label positions (inset from tick)
  const cardinals = [
    { label: 'N', angle: 0   },
    { label: 'E', angle: 90  },
    { label: 'S', angle: 180 },
    { label: 'W', angle: 270 },
  ].map(({ label, angle }) => {
    const a = (angle * Math.PI) / 180;
    const d = r - 18;
    return { label, x: cx + d * Math.sin(a), y: cy - d * Math.cos(a) };
  });

  // Needle — arrow points in the wind-coming-from direction
  const needleRad = (degrees * Math.PI) / 180;
  const tipLen  = r - 12;
  const tailLen = r - 22;
  const tipX  = cx + tipLen  * Math.sin(needleRad);
  const tipY  = cy - tipLen  * Math.cos(needleRad);
  const tailX = cx - tailLen * Math.sin(needleRad);
  const tailY = cy + tailLen * Math.cos(needleRad);

  // Arrowhead points perpendicular to needle at tip
  const perpX = Math.cos(needleRad);
  const perpY = Math.sin(needleRad);
  const aw = 5;
  const al = 10;
  const midX = cx + (tipLen - al) * Math.sin(needleRad);
  const midY = cy - (tipLen - al) * Math.cos(needleRad);

  return (
    <svg width="104" height="104" viewBox="0 0 104 104" className="shrink-0">
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={r} fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />

      {/* Tick marks */}
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke={t.major ? '#94a3b8' : '#cbd5e1'}
          strokeWidth={t.major ? 1.5 : 1}
        />
      ))}

      {/* Cardinal labels */}
      {cardinals.map(({ label: lbl, x, y }) => (
        <text
          key={lbl}
          x={x} y={y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="8"
          fontWeight="700"
          fill={lbl === 'N' ? '#3b82f6' : '#94a3b8'}
        >
          {lbl}
        </text>
      ))}

      <g
        className="wind-needle-wobble"
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      >
        {/* Needle tail (south / grey) */}
        <line
          x1={cx} y1={cy} x2={tailX} y2={tailY}
          stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"
        />

        {/* Needle shaft (north / blue) */}
        <line
          x1={cx} y1={cy} x2={tipX} y2={tipY}
          stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"
        />

        {/* Arrowhead */}
        <polygon
          points={`
            ${tipX},${tipY}
            ${midX + perpX * aw},${midY + perpY * aw}
            ${midX - perpX * aw},${midY - perpY * aw}
          `}
          fill="#3b82f6"
        />
      </g>

      {/* Centre hub */}
      <circle cx={cx} cy={cy} r="4" fill="#1e40af" />
      <circle cx={cx} cy={cy} r="2" fill="white" />
    </svg>
  );
}

const metrics = (w) => [
  { label: 'Temperature', value: `${w.temperature} °C`,   icon: Thermometer, color: 'text-orange-500' },
  { label: 'Humidity',    value: `${w.humidity}%`,         icon: Droplets,    color: 'text-blue-500'   },
  { label: 'Pressure',    value: `${w.pressure} hPa`,      icon: Gauge,       color: 'text-violet-500' },
  { label: 'Visibility',  value: `${w.visibility} km`,     icon: Eye,         color: 'text-slate-400'  },
  { label: 'Gusts',       value: `${w.gusts} m/s`,         icon: Wind,        color: 'text-teal-500'   },
];

export default function WeatherPanel({ weather }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800">Weather Conditions</h3>
        <p className="text-xs text-slate-400 mt-0.5">Live environmental data</p>
      </div>

      <div className="p-5 flex-1">
        {/* Wind speed + compass */}
        <div className="flex items-center justify-between mb-5 pb-5 border-b border-slate-100">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Wind Speed</p>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-bold text-slate-800">{weather.windSpeed}</span>
              <span className="text-sm font-medium text-slate-500">m/s</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Direction: <span className="font-semibold text-slate-700">{weather.windDirectionLabel}</span>
            </p>
          </div>
          <WindCompass degrees={weather.windDirectionDeg} label={weather.windDirectionLabel} />
        </div>

        {/* Other metrics */}
        <div className="space-y-2.5">
          {metrics(weather).map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon size={13} className={m.color} />
                  <span className="text-xs text-slate-600">{m.label}</span>
                </div>
                <span className="text-xs font-semibold text-slate-800">{m.value}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
