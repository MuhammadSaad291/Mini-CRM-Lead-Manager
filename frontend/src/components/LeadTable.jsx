import StatusBadge from "./StatusBadge.jsx";

const STATUSES = ["new", "contacted", "converted"];

export default function LeadTable({ leads, loading, onStatusChange, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="p-10 text-center text-slate-500">Loading leads…</div>
    );
  }

  if (!leads.length) {
    return (
      <div className="p-10 text-center text-slate-500">
        No leads found. Try adding one or changing your filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Assigned To</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Update Status</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {leads.map((lead) => (
            <tr key={lead._id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-900">
                {lead.name}
              </td>
              <td className="px-4 py-3 text-slate-600">{lead.email}</td>
              <td className="px-4 py-3 text-slate-600">{lead.phone || "—"}</td>
              <td className="px-4 py-3 text-slate-600">
                {lead.assignedTo || "—"}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={lead.status} />
              </td>
              <td className="px-4 py-3">
                <select
                  value={lead.status}
                  onChange={(e) => onStatusChange(lead._id, e.target.value)}
                  className="cursor-pointer rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3 text-slate-500">
                {new Date(lead.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onEdit(lead)}
                  className="cursor-pointer rounded-lg px-3 py-1 text-sm font-medium text-green-600 hover:bg-green-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(lead._id)}
                  className="cursor-pointer rounded-lg px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
