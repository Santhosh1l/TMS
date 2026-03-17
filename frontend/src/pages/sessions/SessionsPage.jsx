import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { sessionService } from "../../services/api";
import {
  PageHeader, Table, StatusBadge, Modal, ConfirmDialog,
  Alert, EmptyState, Spinner, InputField, SelectField,
} from "../../components/common";
import { SESSION_TYPES } from "../../utils/enums";

const toArray = (d) => Array.isArray(d) ? d : Array.isArray(d?.content) ? d.content : Array.isArray(d?.data) ? d.data : [];


// ─── Session Form Modal ─────────────────────────────────────────
function SessionModal({ session, open, onClose, onSaved }) {
  const isEdit = !!session;
  const blank = { courseId: "", title: "", sessionDate: "", startTime: "", endTime: "", sessionType: SESSION_TYPES[0], deliveryLink: "", recordingLink: "", room: "" };
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    if (session) setForm({ ...session, courseId: session.courseId || "" });
    else setForm(blank);
  }, [session, open]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, courseId: Number(form.courseId) };
      if (isEdit) await sessionService.update(payload);
      else await sessionService.create(payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Session" : "Create Session"} size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Alert message={error} />
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Course ID" name="courseId" type="number" value={form.courseId} onChange={handleChange} required min={1} />
          <SelectField label="Session Type" name="sessionType" value={form.sessionType} onChange={handleChange} options={SESSION_TYPES} />
          <div className="col-span-2">
            <InputField label="Title" name="title" value={form.title} onChange={handleChange} placeholder="Session title" required maxLength={140} />
          </div>
          <InputField label="Date" name="sessionDate" type="date" value={form.sessionDate} onChange={handleChange} />
          <InputField label="Room" name="room" value={form.room} onChange={handleChange} placeholder="e.g. Lab A" maxLength={60} />
          <InputField label="Start Time" name="startTime" type="time" value={form.startTime} onChange={handleChange} />
          <InputField label="End Time" name="endTime" type="time" value={form.endTime} onChange={handleChange} />
          <div className="col-span-2">
            <InputField label="Delivery Link" name="deliveryLink" type="url" value={form.deliveryLink} onChange={handleChange} placeholder="https://..." maxLength={200} />
          </div>
          <div className="col-span-2">
            <InputField label="Recording Link" name="recordingLink" type="url" value={form.recordingLink} onChange={handleChange} placeholder="https://..." maxLength={200} />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
            {saving && <Spinner size="sm" />} {isEdit ? "Save Changes" : "Create Session"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Main Page ──────────────────────────────────────────────────
export default function SessionsPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ courseId: "", recurring: false, active: false });
  const [modalOpen, setModalOpen] = useState(false);
  const [editSession, setEditSession] = useState(null);
  const [deleteSession, setDeleteSession] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { recurring: filters.recurring, active: filters.active };
      if (filters.courseId) params.courseId = filters.courseId;
      const res = await sessionService.getAll(params);
      setSessions(toArray(res.data));
    } catch {
      setAlert({ type: "error", message: "Failed to load sessions." });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await sessionService.delete(deleteSession.sessionId);
      setAlert({ type: "success", message: "Session deleted." });
      setDeleteSession(null);
      fetchSessions();
    } catch {
      setAlert({ type: "error", message: "Delete failed." });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleRecurring = async (s) => {
    try {
      await sessionService.toggleRecurring(s.sessionId);
      fetchSessions();
    } catch {
      setAlert({ type: "error", message: "Update failed." });
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Sessions"
        subtitle="Schedule and manage training sessions"
        action={
          <button className="btn-primary" onClick={() => { setEditSession(null); setModalOpen(true); }}>
            + New Session
          </button>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <input
          type="number"
          placeholder="Filter by Course ID"
          value={filters.courseId}
          onChange={(e) => setFilters((f) => ({ ...f, courseId: e.target.value }))}
          className="input-field w-48"
          min={1}
        />
        {[
          { key: "recurring", label: "Recurring" },
          { key: "active", label: "Active" },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer select-none">
            <input type="checkbox" checked={filters[key]} onChange={(e) => setFilters((f) => ({ ...f, [key]: e.target.checked }))} className="accent-brand" />
            {label}
          </label>
        ))}
      </div>

      {alert.message && <div className="mb-4"><Alert type={alert.type} message={alert.message} /></div>}

      <Table
        headers={["ID", "Title", "Course", "Type", "Date", "Time", "Actions"]}
        loading={loading}
        empty={
          <tr><td colSpan={7}>
            <EmptyState icon="◷" title="No sessions found" description="Create a session to get started." action={<button className="btn-primary" onClick={() => setModalOpen(true)}>+ New Session</button>} />
          </td></tr>
        }
      >
        {sessions.map((s) => (
          <tr key={s.sessionId} className="border-b border-ink-700/50 last:border-0 table-row-hover">
            <td className="px-4 py-3 text-slate-500 font-mono text-xs">#{s.sessionId}</td>
            <td className="px-4 py-3 font-body font-medium text-white">{s.title}</td>
            <td className="px-4 py-3 font-mono text-xs text-brand">#{s.courseId}</td>
            <td className="px-4 py-3 font-mono text-xs text-slate-400">{s.sessionType}</td>
            <td className="px-4 py-3 font-mono text-xs text-slate-400">{s.sessionDate || "—"}</td>
            <td className="px-4 py-3 font-mono text-xs text-slate-400">
              {s.startTime && s.endTime ? `${s.startTime} – ${s.endTime}` : "—"}
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => navigate(`/sessions/${s.sessionId}/attendance`)} className="text-xs text-slate-400 hover:text-accent-amber px-2 py-1 rounded hover:bg-accent-amber/10 transition-colors">Attendance</button>
                <button onClick={() => handleToggleRecurring(s)} className="text-xs text-slate-400 hover:text-brand px-2 py-1 rounded hover:bg-brand/10 transition-colors">Recurring</button>
                <button onClick={() => { setEditSession(s); setModalOpen(true); }} className="text-xs text-slate-400 hover:text-brand px-2 py-1 rounded hover:bg-brand/10 transition-colors">Edit</button>
                <button onClick={() => setDeleteSession(s)} className="text-xs text-slate-400 hover:text-accent-rose px-2 py-1 rounded hover:bg-accent-rose/10 transition-colors">Delete</button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <SessionModal session={editSession} open={modalOpen} onClose={() => { setModalOpen(false); setEditSession(null); }} onSaved={fetchSessions} />
      <ConfirmDialog open={!!deleteSession} onClose={() => setDeleteSession(null)} onConfirm={handleDelete} loading={deleting} title="Delete Session" message={`Delete "${deleteSession?.title}"?`} />
    </div>
  );
}
