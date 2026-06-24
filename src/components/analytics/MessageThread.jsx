import AIInsightMessage from './AIInsightMessage';

function bubbleStyle(role) {
  if (role === 'ai') return 'bg-blue-50 border-blue-200';
  if (role === 'technician') return 'bg-white border-slate-200';
  return 'bg-slate-100 border-slate-200';
}

export default function MessageThread({ messages }) {
  return (
    <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-w-0">
      {messages.map((msg) => (
        <div key={msg.id} className={`rounded-lg border p-3 ${bubbleStyle(msg.role)}`}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 min-w-0">
              {msg.role === 'ai' && (
                <img src="/Anemo.png" alt="Anemo" className="w-4 h-4 rounded-sm object-contain shrink-0" />
              )}
              <span className="truncate">{msg.author}</span>
            </p>
            <p className="text-[11px] text-slate-400">{msg.time}</p>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{msg.text}</p>

          {Array.isArray(msg.tags) && msg.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {msg.tags.map((tag) => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {msg.attachment && (
            <div className="mt-2 rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-600">
              Attachment: {msg.attachment}
            </div>
          )}

          {msg.insight && <div className="mt-2"><AIInsightMessage insight={msg.insight} /></div>}
        </div>
      ))}
    </div>
  );
}
