import { useMemo, useState } from 'react';

export default function ReportArchiveTable({ archive }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return archive;
    return archive.filter((item) =>
      [item.name, item.type, item.format, item.generatedAt, ...(item.turbines ?? [])]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [archive, query]);

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-full">
      <div className="flex items-center justify-between mb-2 gap-2">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Report Archive</h2>
          <p className="text-xs text-slate-400">Searchable report history with download and version tracking</p>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search reports"
          className="w-40 rounded-md border border-slate-300 px-2 py-1 text-xs"
        />
      </div>

      <div className="overflow-auto max-h-[255px] border border-slate-200 rounded-lg">
        <table className="w-full text-xs">
          <thead className="bg-slate-100 text-slate-600 sticky top-0">
            <tr>
              <th className="text-left p-2">Report</th>
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Date</th>
              <th className="text-left p-2">Version</th>
              <th className="text-left p-2">Download</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="p-2 text-slate-700 font-medium">{item.name}</td>
                <td className="p-2 text-slate-600">{item.type}</td>
                <td className="p-2 text-slate-500">{item.generatedAt}</td>
                <td className="p-2 text-slate-500">{item.version}</td>
                <td className="p-2">
                  <button className="text-[11px] font-semibold px-2 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700">
                    {item.format}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-slate-400">
                  No matching archived reports
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
