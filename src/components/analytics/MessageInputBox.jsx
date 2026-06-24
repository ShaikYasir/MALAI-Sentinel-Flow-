import { useState } from 'react';

export default function MessageInputBox({ onSend, sending, turbineId }) {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend({ text: trimmed, attachment: attachment || null });
    setText('');
    setAttachment('');
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <div className="rounded-lg border border-slate-200 bg-white px-2 py-2 flex items-center gap-2 min-w-0">
        <select
          value={attachment}
          onChange={(e) => setAttachment(e.target.value)}
          className="text-xs rounded border border-slate-200 px-1.5 py-1 bg-slate-50 text-slate-600 shrink-0 max-w-[108px]"
          title="Attach sensor snapshot or alarm log"
        >
          <option value="">Attach</option>
          <option value="sensor-snapshot.png">Sensor Snapshot</option>
          <option value="alarm-log.csv">Alarm Log</option>
          <option value="vibration-spectrum.png">Vibration Spectrum</option>
        </select>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Message technicians or use @Anemo analyze turbine ${turbineId}`}
          className="w-full min-w-0 text-sm bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={sending}
          className="text-xs font-semibold px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 shrink-0"
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </form>
  );
}
