import { useCallback, useEffect, useState } from "react";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import AnalyticsCards from "../components/AnalyticsCards.jsx";
import LeadTable from "../components/LeadTable.jsx";
import AddLeadModal from "../components/AddLeadModal.jsx";

const LIMIT = 8;

export default function Dashboard() {
  const { user, logout } = useAuth();

  const [leads, setLeads] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedLead, setSelectedLead] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Debounce the search box so we don't hit the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const loadAnalytics = useCallback(async () => {
    const { data } = await api.get("/leads/analytics");
    setAnalytics(data);
  }, []);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/leads", {
        params: {
          page,
          limit: LIMIT,
          search: debouncedSearch || undefined,
          status: status || undefined,
        },
      });
      setLeads(data.leads);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const refresh = () => {
    loadLeads();
    loadAnalytics();
  };

  const handleStatusChange = async (id, newStatus) => {
    await api.patch(`/leads/${id}/status`, { status: newStatus });
    refresh();
  };

  const handleEdit = (lead) => {
    setSelectedLead(lead);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    await api.delete(`/leads/${id}`);
    refresh();
  };

  const handleFilter = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
              CRM
            </div>
            <div>
              <h1 className="font-semibold text-slate-900">Lead Manager</h1>
              <p className="text-xs text-slate-500">Mini CRM · Naxape</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-600 sm:inline">
              Hi, <b>{user?.name}</b>
            </span>
            <button
              onClick={logout}
              className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <AnalyticsCards analytics={analytics} />

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone…"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:max-w-xs"
            />
            <select
              value={status}
              onChange={handleFilter}
              className="cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="converted">Converted</option>
            </select>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            + Add Lead
          </button>
        </div>

        {/* Table */}
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <LeadTable
            leads={leads}
            loading={loading}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
            <span>
              {total} lead{total === 1 ? "" : "s"} · Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>

      <AddLeadModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedLead(null);
        }}
        onCreated={refresh}
        lead={selectedLead}
      />
    </div>
  );
}
