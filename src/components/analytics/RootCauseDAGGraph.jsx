const NODE_COLORS = {
  environment: 'bg-cyan-50 border-cyan-200 text-cyan-800',
  sensor: 'bg-amber-50 border-amber-200 text-amber-800',
  component: 'bg-indigo-50 border-indigo-200 text-indigo-800',
  alarm: 'bg-rose-50 border-rose-200 text-rose-800',
};

function getLayout(graph) {
  const healthy = Boolean(graph?.healthyMode);
  const variant = graph?.layoutVariant;

  if (healthy) {
    if (variant === 'healthy-stagger') {
      return {
        canvas: { width: 1280, height: 340 },
        nodes: {
          'env-ok': { x: 30, y: 120, w: 190, h: 74 },
          'sensor-ok': { x: 320, y: 84, w: 190, h: 74 },
          'component-ok': { x: 610, y: 154, w: 190, h: 74 },
          'alarm-ok': { x: 930, y: 118, w: 220, h: 74 },
        },
      };
    }

    return {
      canvas: { width: 1280, height: 340 },
      nodes: {
        'env-ok': { x: 30, y: 112, w: 190, h: 74 },
        'sensor-ok': { x: 335, y: 72, w: 190, h: 74 },
        'component-ok': { x: 640, y: 112, w: 190, h: 74 },
        'alarm-ok': { x: 945, y: 152, w: 220, h: 74 },
      },
    };
  }

  if (variant === 'branch-center') {
    return {
      canvas: { width: 1280, height: 340 },
      nodes: {
        'env-1': { x: 20, y: 132, w: 185, h: 74 },
        'sensor-1': { x: 260, y: 92, w: 185, h: 74 },
        'component-1': { x: 505, y: 132, w: 185, h: 74 },
        'sensor-2': { x: 790, y: 54, w: 185, h: 74 },
        'sensor-3': { x: 790, y: 210, w: 185, h: 74 },
        'alarm-1': { x: 1060, y: 132, w: 190, h: 74 },
      },
    };
  }

  if (variant === 'branch-wide') {
    return {
      canvas: { width: 1280, height: 340 },
      nodes: {
        'env-1': { x: 20, y: 56, w: 185, h: 74 },
        'sensor-1': { x: 280, y: 136, w: 185, h: 74 },
        'component-1': { x: 545, y: 56, w: 185, h: 74 },
        'sensor-2': { x: 810, y: 32, w: 185, h: 74 },
        'sensor-3': { x: 810, y: 230, w: 185, h: 74 },
        'alarm-1': { x: 1060, y: 132, w: 190, h: 74 },
      },
    };
  }

  return {
    canvas: { width: 1280, height: 340 },
    nodes: {
      'env-1': { x: 20, y: 48, w: 185, h: 74 },
      'sensor-1': { x: 270, y: 92, w: 185, h: 74 },
      'component-1': { x: 520, y: 48, w: 185, h: 74 },
      'sensor-2': { x: 810, y: 28, w: 185, h: 74 },
      'sensor-3': { x: 810, y: 222, w: 185, h: 74 },
      'alarm-1': { x: 1060, y: 126, w: 190, h: 74 },
    },
  };
}

function anchor(node, side) {
  const y = node.y + node.h / 2;
  if (side === 'right') return { x: node.x + node.w, y };
  return { x: node.x, y };
}

function Edge({ fromNode, toNode, confidence }) {
  const start = anchor(fromNode, 'right');
  const end = anchor(toNode, 'left');

  const dx = Math.max(56, (end.x - start.x) * 0.42);
  const c1 = { x: start.x + dx, y: start.y };
  const c2 = { x: end.x - dx, y: end.y };
  const path = `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`;

  const t = 0.5;
  const mt = 1 - t;
  const lx = (mt ** 3 * start.x) + (3 * mt * mt * t * c1.x) + (3 * mt * t * t * c2.x) + (t ** 3 * end.x);
  const lyCurve = (mt ** 3 * start.y) + (3 * mt * mt * t * c1.y) + (3 * mt * t * t * c2.y) + (t ** 3 * end.y);
  const ly = lyCurve - 10;

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke="#ffffff"
        strokeWidth="4.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={path}
        fill="none"
        stroke="#1e3a8a"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        markerEnd="url(#dag-arrow)"
      />
      <rect x={lx - 20} y={ly - 10} width="40" height="18" rx="9" fill="#ffffff" stroke="#cbd5e1" />
      <text x={lx} y={ly + 3} textAnchor="middle" fontSize="11" fill="#334155" fontWeight="700">
        {(confidence * 100).toFixed(0)}%
      </text>
    </g>
  );
}

export default function RootCauseDAGGraph({ graph }) {
  const layout = getLayout(graph);
  const nodes = graph?.nodes ?? [];
  const nodeMap = Object.fromEntries(
    nodes.map((node) => [
      node.id,
      {
        ...node,
        ...(layout.nodes[node.id] ?? { x: 25, y: 25, w: 220, h: 88 }),
      },
    ])
  );

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-full min-h-[320px] min-w-0 overflow-hidden flex flex-col">
      <div className="mb-3">
        <h2 className="text-sm font-bold text-slate-800">Root Cause DAG</h2>
        <p className="text-xs text-slate-400">Professional left-to-right causal view for incident {graph?.incident?.id}</p>
      </div>

      <div className="relative flex-1 min-h-[255px] rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${layout.canvas.width} ${layout.canvas.height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <marker
              id="dag-arrow"
              markerUnits="userSpaceOnUse"
              markerWidth="12"
              markerHeight="12"
              refX="10"
              refY="5"
              orient="auto"
            >
              <path d="M0,0 L0,10 L10,5 z" fill="#1e3a8a" />
            </marker>
          </defs>

          {(graph?.edges ?? []).map((edge, idx) => {
            const fromNode = nodeMap[edge.from];
            const toNode = nodeMap[edge.to];
            if (!fromNode || !toNode) return null;
            return <Edge key={`${edge.from}-${edge.to}-${idx}`} fromNode={fromNode} toNode={toNode} confidence={edge.confidence} />;
          })}
        </svg>

        {nodes.map((node) => {
          const pos = nodeMap[node.id];
          return (
            <div
              key={node.id}
              className={`absolute rounded-lg border px-2.5 py-2 shadow-sm ${NODE_COLORS[node.type] ?? 'bg-slate-50 border-slate-200 text-slate-700'}`}
              style={{
                left: `${(pos.x / layout.canvas.width) * 100}%`,
                top: `${(pos.y / layout.canvas.height) * 100}%`,
                width: `${(pos.w / layout.canvas.width) * 100}%`,
                height: `${(pos.h / layout.canvas.height) * 100}%`,
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="uppercase tracking-wide font-semibold text-[10px] leading-none">{node.type}</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white border border-slate-300 text-slate-700 font-bold">
                  {Math.round(Number(node.score ?? 0))}%
                </span>
              </div>
              <p className="text-[12px] font-semibold leading-4 break-words">{node.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
