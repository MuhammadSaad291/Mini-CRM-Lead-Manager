import { useState, useEffect } from "react";
import api from "../api/client.js";

const empty = {
  name: "",
  email: "",
  phone: "",
  status: "new",
  assignedTo: "",
};

// Modal dialog with the "Add Lead" form.
export default function AddLeadModal({ open, onClose, onCreated, lead }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    if (lead) {
      setForm({
        name: lead.name,
        email: lead.email,
        phone: lead.phone || "",
        status: lead.status,
        assignedTo: lead.assignedTo || "",
      });
    } else {
      setForm(empty);
    }
  }, [lead]);

  if (!open) return null;

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });


  const submit = async (e) => {
    e.preventDefault();

    setError("");
    setSaving(true);

    try {

      if (lead) {
        await api.put(`/leads/${lead._id}`, form);
      } else {
        await api.post("/leads", form);
      }

      setForm(empty);

      onCreated();

      onClose();

    } catch (err) {

      setError(err.response?.data?.message || "Something went wrong");

    } finally {
      setSaving(false);
    }
  };




  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{lead ? "Edit Lead" : "Add New Lead"}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {error && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Name *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={change}
              required
              className={inputClass}
              placeholder="e.g. Ali Raza"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={change}
              required
              className={inputClass}
              placeholder="ali@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Phone
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={change}
              className={inputClass}
              placeholder="0300-1234567"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={change}
                className={inputClass}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="converted">Converted</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Assigned To
              </label>
              <input
                name="assignedTo"
                value={form.assignedTo}
                onChange={change}
                className={inputClass}
                placeholder="e.g. Saad"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : lead
                  ? "Update Lead"
                  : "Add Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
