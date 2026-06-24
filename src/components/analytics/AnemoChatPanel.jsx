import MessageThread from './MessageThread';
import MessageInputBox from './MessageInputBox';

export default function AnemoChatPanel({
  turbineId,
  messages,
  onSendMessage,
  onSwitchTurbine,
  turbineOptions,
  sending,
}) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm h-full min-h-[380px] flex flex-col p-4 min-w-0 overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-3">
            <img src="/Anemo.png" alt="Anemo" className="w-20 h-20 object-contain" />
            <span>Anemo Collaboration</span>
          </h2>
          <p className="text-xs text-slate-400">Real-time troubleshooting channel with AI-assisted thread analysis</p>
        </div>
        <select
          value={turbineId}
          onChange={(e) => onSwitchTurbine(e.target.value)}
          className="text-xs rounded-md border border-slate-200 px-2 py-1.5 bg-slate-50 text-slate-700 shrink-0"
        >
          {turbineOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <MessageThread messages={messages} />

      <MessageInputBox onSend={onSendMessage} sending={sending} turbineId={turbineId} />
    </section>
  );
}
