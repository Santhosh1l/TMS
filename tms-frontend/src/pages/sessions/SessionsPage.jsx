import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { sessionService, courseService, toArray } from "../../services/api";
import {
  PageHeader,
  Table,
  Modal,
  ConfirmDialog,
  Alert,
  EmptyState,
  Spinner,
  InputField,
  SelectField,
  TimePickerField,
} from "../../components/common";
import { SESSION_TYPES } from "../../utils/enums";

// ─── Session Form Modal ─────────────────────────────────────────
function SessionModal({ session, open, onClose, onSaved }) {
  const isEdit = !!session;

  const blank = {
    courseId: null,
    title: "",
    sessionDate: "",
    startTime: "",
    endTime: "",
    sessionType: SESSION_TYPES?.[0] || "",
    deliveryLink: "",
    recordingLink: "",
    room: "",
  };

  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [coursePreview, setCoursePreview] = useState(null); // { title, type, mode } | { notFound: true }
  const [previewLoading, setPreviewLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    setError("");
    setCoursePreview(null);
    if (session) {
      setForm({ ...session, courseId: session.courseId ?? null });
      // Pre-fill preview when editing an existing session
      if (session.courseId) {
        courseService.getById(session.courseId)
          .then(res => { if (res.data?.title) setCoursePreview({ title: res.data.title, type: res.data.type, mode: res.data.mode }); })
          .catch(() => {});
      }
    } else {
      setForm(blank);
    }
  }, [session, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === "courseId" ? (value ? Number(value) : null) : value,
    }));

    if (name === "courseId") {
      setCoursePreview(null);
      clearTimeout(debounceRef.current);
      if (value && Number(value) > 0) {
        setPreviewLoading(true);
        debounceRef.current = setTimeout(async () => {
          try {
            const res = await courseService.getById(Number(value));
            const c = res.data;
            if (c?.title) {
              setCoursePreview({ title: c.title, type: c.type, mode: c.mode });
            } else {
              setCoursePreview({ notFound: true });
            }
          } catch {
            setCoursePreview({ notFound: true });
          } finally {
            setPreviewLoading(false);
          }
        }, 400);
      } else {
        setPreviewLoading(false);
      }
    }
  };

  const validate = () => {
    if (!form.title || !form.courseId) return "Title and Course ID are required.";
    if (form.startTime && form.endTime && form.startTime >= form.endTime) return "End time must be after start time.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setSaving(true);
    setError("");
    try {
      if (isEdit) await sessionService.update({ ...form });
      else await sessionService.create({ ...form });
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

        <div className="grid grid-cols-2 gap-4 relative">
          {/* Course ID + live preview */}
          <div className="col-span-1">
            <InputField
              label="Course ID"
              name="courseId"
              type="number"
              value={form.courseId ?? ""}
              onChange={handleChange}
              required
              min={1}
            />
            {form.courseId && (
              <div className="mt-2 px-3 py-2 rounded-lg bg-ink-900 border border-ink-600 flex items-center gap-2 min-h-[36px]">
                {previewLoading ? (
                  <Spinner size="sm" />
                ) : coursePreview?.notFound ? (
                  <span className="text-accent-rose text-xs font-mono">No course found with this ID</span>
                ) : coursePreview ? (
                  <>
                    <span className="text-accent-teal text-base">◎</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{coursePreview.title}</p>
                    </div>
                    {coursePreview.type && (
                      <span className="text-xs font-mono text-accent-amber bg-accent-amber/10 px-1.5 py-0.5 rounded border border-accent-amber/20 whitespace-nowrap">{coursePreview.type}</span>
                    )}
                    {coursePreview.mode && (
                      <span className="text-xs font-mono text-slate-400">{coursePreview.mode}</span>
                    )}
                  </>
                ) : null}
              </div>
            )}
          </div>

          <SelectField
            label="Session Type"
            name="sessionType"
            value={form.sessionType}
            onChange={handleChange}
            options={SESSION_TYPES}
          />

          <div className="col-span-2">
            <InputField label="Title" name="title" value={form.title} onChange={handleChange} required maxLength={140} />
          </div>

          <InputField label="Date" name="sessionDate" type="date" value={form.sessionDate} onChange={handleChange} />
          <InputField label="Room" name="room" value={form.room} onChange={handleChange} maxLength={60} />
          <TimePickerField label="Start Time" name="startTime" value={form.startTime} onChange={handleChange} />
          <TimePickerField label="End Time"   name="endTime"   value={form.endTime}   onChange={handleChange} />

          <div className="col-span-2">
            <InputField label="Delivery Link" name="deliveryLink" type="url" value={form.deliveryLink} onChange={handleChange} maxLength={200} />
          </div>
          <div className="col-span-2">
            <InputField label="Recording Link" name="recordingLink" type="url" value={form.recordingLink} onChange={handleChange} maxLength={200} />
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
            disabled={saving || !form.title || !form.courseId || coursePreview?.notFound}
          >
            {saving && <Spinner size="sm" />}
            {isEdit ? "Save Changes" : "Create Session"}
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
    } catch (err) {
      setAlert({ type: "error", message: err.response?.data?.message || "Failed to load sessions." });
    } finally {
      setLoading(false);
    }
  }, [filters.courseId, filters.recurring, filters.active]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await sessionService.delete(deleteSession.sessionId);
      setAlert({ type: "success", message: "Session deleted successfully." });
      setDeleteSession(null);
      fetchSessions();
    } catch (err) {
      setAlert({ type: "error", message: err.response?.data?.message || "Delete failed." });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleRecurring = async (s) => {
    setSessions((prev) =>
      prev.map((item) => item.sessionId === s.sessionId ? { ...item, recurring: !item.recurring } : item)
    );
    try {
      await sessionService.toggleRecurring(s.sessionId);
    } catch (err) {
      setAlert({ type: "error", message: err.response?.data?.message || "Update failed." });
      fetchSessions();
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
        {[{ key: "recurring", label: "Recurring" }, { key: "active", label: "Active" }].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={filters[key]}
              onChange={(e) => setFilters((f) => ({ ...f, [key]: e.target.checked }))}
              className="accent-brand"
            />
            {label}
          </label>
        ))}
      </div>

      {alert.message && <div className="mb-4"><Alert type={alert.type} message={alert.message} /></div>}

      <Table
        headers={["ID", "Title", "Course", "Type", "Date", "Time", "Actions"]}
        loading={loading}
        empty={
          !loading && sessions.length === 0 ? (
            <tr>
              <td colSpan={7}>
                <EmptyState
                  icon="◷"
                  title="No sessions found"
                  description={
                    filters.active || filters.recurring
                      ? "Try adjusting filters to see more sessions."
                      : "Create your first session to get started."
                  }
                  action={<button className="btn-primary" onClick={() => setModalOpen(true)}>+ New Session</button>}
                />
              </td>
            </tr>
          ) : null
        }
      >
        {sessions.map((s) => (
          <tr key={s.sessionId} className="border-b table-row-hover">
            <td className="px-4 py-3 text-xs font-mono">#{s.sessionId}</td>
            <td className="px-4 py-3 text-white font-medium">{s.title}</td>
            <td className="px-4 py-3 text-xs font-mono">#{s.courseId}</td>
            <td className="px-4 py-3 text-xs">{s.sessionType}</td>
            <td className="px-4 py-3 text-xs">{s.sessionDate || "—"}</td>
            <td className="px-4 py-3 text-xs">
              {s.startTime && s.endTime ? `${s.startTime} – ${s.endTime}` : "—"}
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => navigate(`/sessions/${s.sessionId}/attendance`)} className="text-xs text-slate-400 hover:text-accent-amber px-2 py-1 rounded hover:bg-accent-amber/10 transition-colors">Attendance</button>
                <button onClick={() => handleToggleRecurring(s)} className="text-xs text-slate-400 hover:text-brand px-2 py-1 rounded hover:bg-brand/10 transition-colors">Recurring</button>
                <button onClick={() => { setEditSession(s); setModalOpen(true); }} className="text-xs text-slate-400 hover:text-accent-teal px-2 py-1 rounded hover:bg-accent-teal/10 transition-colors">Edit</button>
                <button onClick={() => setDeleteSession(s)} className="text-xs text-slate-400 hover:text-accent-rose px-2 py-1 rounded hover:bg-accent-rose/10 transition-colors">Delete</button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <SessionModal
        session={editSession}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditSession(null); }}
        onSaved={fetchSessions}
      />

      <ConfirmDialog
        open={!!deleteSession}
        onClose={() => setDeleteSession(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Session"
        message={`Are you sure you want to delete "${deleteSession?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
