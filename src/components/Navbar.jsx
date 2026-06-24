import { useEffect, useState } from 'react';
import { BellRing } from 'lucide-react';

export default function Navbar({ sidebarOpen, onOpenAlarms }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fmtDate = (d) =>
    d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  const fmtTime = (d) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <header className="h-16 shrink-0 bg-white border-b border-slate-200 flex items-center px-6 shadow-sm">
      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-bold text-slate-800 truncate">Machine-Assisted Learning for Alarm Intelligence</h1>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-1 shrink-0">
        {/* Date / time */}
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 mr-2">
          <span className="text-[11px] text-slate-500">{fmtDate(time)}</span>
          <span className="text-slate-300">|</span>
          <span className="text-xs font-mono font-semibold text-blue-600">{fmtTime(time)}</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => onOpenAlarms?.()}
            title="Open Alarm Center"
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <BellRing size={17} />
          </button>
          <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-slate-200 mx-2" />

        {/* User */}
        <div className="flex items-center space-x-2 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            SY
          </div>
          <div className="hidden lg:block">
            <p className="text-xs font-semibold text-slate-700 leading-none">Shaik Yasir</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Operator</p>
          </div>
        </div>
      </div>
    </header>
  );
}
