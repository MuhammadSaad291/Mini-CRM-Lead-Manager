const cardMeta = [
  { key: "total", label: "Total Leads", accent: "text-slate-900", ring: "ring-slate-200" },
  { key: "new", label: "New", accent: "text-blue-600", ring: "ring-blue-100" },
  { key: "contacted", label: "Contacted", accent: "text-amber-600", ring: "ring-amber-100" },
  { key: "converted", label: "Converted", accent: "text-green-600", ring: "ring-green-100" },
];

export default function AnalyticsCards({ analytics }) {
  if (!analytics) return null;

  const values = {
    total: analytics.total,
    new: analytics.byStatus.new,
    contacted: analytics.byStatus.contacted,
    converted: analytics.byStatus.converted,
  };

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
      {cardMeta.map((c) => (
        <div
          key={c.key}
          className={`rounded-xl bg-white p-4 shadow-sm ring-1 ${c.ring}`}
        >
          <p className="text-sm text-slate-500">{c.label}</p>
          <p className={`mt-1 text-2xl font-bold ${c.accent}`}>{values[c.key]}</p>
        </div>
      ))}

      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-indigo-100">
        <p className="text-sm text-slate-500">Conversion Rate</p>
        <p className="mt-1 text-2xl font-bold text-indigo-600">
          {analytics.conversionRate}%
        </p>
      </div>
    </div>
  );
}
