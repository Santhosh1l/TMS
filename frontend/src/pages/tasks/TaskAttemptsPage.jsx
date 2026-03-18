import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { taskAttemptService, toArray } from "../../services/api";
import {
  PageHeader, Table, StatusBadge, Modal, ConfirmDialog,
  Alert, EmptyState, Spinner, InputField, SelectField,
} from "../../components/common";
import { TASK_TYPES, TASK_ATTEMPT_STATUSES } from "../../utils/enums";


// ─── Create Attempt Modal ────────────────────────────────────────
function CreateAttemptModal({ taskId, open, onClose, onSaved }) {
  const [form, setForm] = useState({
    userId: "", status: "PENDING", type: TASK_TYPES[0], total: "",
    attachmentLink: "", attemptedAt: "", feedback: "", score: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({ userId: "", status: "PENDING", type: TASK_TYPES[0], total: "", attachmentLink: "", attemptedAt: "", feedback: "", score: "" });
    setError("");
  }, [open]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await taskAttemptService.create({
        ...form,
        taskId: Number(taskId),
        userId: Number(form.userId),
        total: form.total ? Number(form.total) : undefined,
        score: form.score ? Number(form.score) : undefined,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create attempt.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Record Attempt" size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Alert message={error} />
        <div className="grid grid-cols-2 gap-4">
          <InputField label="User ID" name="userId" type="number" value={form.userId} onChange={handleChange} required min={1} />
          <SelectField label="Task Type" name="type" value={form.type} onChange={handleChange} options={TASK_TYPES} />
          <SelectField label="Status" name="status" value={form.status} onChange={handleChange} options={TASK_ATTEMPT_STATUSES} />
          <InputField label="Attempted At" name="attemptedAt" type="date" value={form.attemptedAt} onChange={handleChange} />
          <InputField label="Score" name="score" type="number" value={form.score} onChange={handleChange} min={0} placeholder="0" />
          <InputField label="Total" name="total" type="number" value={form.total} onChange={handleChange} min={1} placeholder="100" />
          <div className="col-span-2">
            <InputField label="Attachment Link" name="attachmentLink" value={form.attachmentLink} onChange={handleChange} placeholder="https://..." />
          </div>
          <div className="col-span-2">
            <label className="label">Feedback</label>
            <textarea name="feedback" value={form.feedback} onChange={handleChange} placeholder="Optional feedback..." rows={3} className="input-field resize-none" />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
            {saving && <Spinner size="sm" />} Record Attempt
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Grade Modal ─────────────────────────────────────────────────
function GradeModal({ attempt, open, onClose, onSaved }) {
  const [form, setForm] = useState({ score: "", status: "GRADED", feedback: "", attemptedAt: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (attempt) {
      setForm({
        attemptId: attempt.taskAttemptId,
        score: attempt.score ?? "",
        status: attempt.status || "GRADED",
        feedback: attempt.feedback || "",
        attemptedAt: attempt.attemptedAt || "",
        attachmentLink: attempt.attachmentLink || "",
        total: attempt.total ?? "",
        isDelete: false,
      });
    }
    setError("");
  }, [attempt]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await taskAttemptService.update({
        ...form,
        score: form.score !== "" ? Number(form.score) : undefined,
        total: form.total !== "" ? Number(form.total) : undefined,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Grade update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Grade Attempt #${attempt?.taskAttemptId}`} size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Alert message={error} />
        <SelectField label="Status" name="status" value={form.status} onChange={handleChange} options={TASK_ATTEMPT_STATUSES} />
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Score" name="score" type="number" value={form.score} onChange={handleChange} min={0} />
          <InputField label="Total" name="total" type="number" value={form.total} onChange={handleChange} min={1} />
        </div>
        <div>
          <label className="label">Feedback</label>
          <textarea name="feedback" value={form.feedback} onChange={handleChange} placeholder="Feedback for the attempt..." rows={3} maxLength={10000} className="input-field resize-none" />
        </div>
        <div className="flex gap-3 justify-end mt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
            {saving && <Spinner size="sm" />} Save Grade
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function TaskAttemptsPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ userId: "" });
  const [createOpen, setCreateOpen] = useState(false);
  const [gradeAttempt, setGradeAttempt] = useState(null);
  const [deleteAttempt, setDeleteAttempt] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const fetchAttempts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { taskId };
      if (filters.userId) params.userId = filters.userId;
      const res = await taskAttemptService.getAll(params);
      setAttempts(toArray(res.data));
    } catch {
      setAlert({ type: "error", message: "Failed to load attempts." });
    } finally {
      setLoading(false);
    }
  }, [taskId, filters]);

  useEffect(() => { fetchAttempts(); }, [fetchAttempts]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await taskAttemptService.delete(deleteAttempt.taskAttemptId);
      setAlert({ type: "success", message: "Attempt deleted." });
      setDeleteAttempt(null);
      fetchAttempts();
    } catch {
      setAlert({ type: "error", message: "Delete failed." });
    } finally {
      setDeleting(false);
    }
  };

  // Quick summary
  const passed = attempts.filter((a) => a.status === "PASSED" || a.status === "GRADED").length;
  const pending = attempts.filter((a) => a.status === "PENDING" || a.status === "SUBMITTED").length;

  return (
    <div className="animate-fade-in">
      <div className="mb-2">
        <button onClick={() => navigate("/tasks")} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">← Back to Tasks</button>
      </div>
      <PageHeader
        title={`Task #${taskId} Attempts`}
        subtitle="Review and grade task submissions"
        action={<button className="btn-primary" onClick={() => setCreateOpen(true)}>+ Record Attempt</button>}
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total", value: attempts.length, color: "text-white" },
          { label: "Graded / Passed", value: passed, color: "text-accent-teal" },
          { label: "Pending", value: pending, color: "text-accent-amber" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card p-4">
            <p className="text-xs font-display font-semibold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <p className={`font-display font-bold text-2xl ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-6">
        <input
          type="number" placeholder="Filter by User ID" value={filters.userId}
          onChange={(e) => setFilters({ userId: e.target.value })}
          className="input-field w-48" min={1}
        />
      </div>

      {alert.message && <div className="mb-4"><Alert type={alert.type} message={alert.message} /></div>}

      <Table
        headers={["ID", "User ID", "Type", "Status", "Score", "Attempted At", "Attachment", "Actions"]}
        loading={loading}
        empty={
          <tr><td colSpan={8}>
            <EmptyState icon="◫" title="No attempts found" description="No submissions for this task yet." action={<button className="btn-primary" onClick={() => setCreateOpen(true)}>+ Record Attempt</button>} />
          </td></tr>
        }
      >
        {attempts.map((a) => (
          <tr key={a.taskAttemptId} className="border-b border-ink-700/50 last:border-0 table-row-hover">
            <td className="px-4 py-3 text-slate-500 font-mono text-xs">#{a.taskAttemptId}</td>
            <td className="px-4 py-3 font-mono text-xs text-white">{a.userId}</td>
            <td className="px-4 py-3 font-mono text-xs text-accent-amber">{a.type}</td>
            <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
            <td className="px-4 py-3 font-mono text-xs text-slate-300">
              {a.score != null ? `${a.score}${a.total ? ` / ${a.total}` : ""}` : "—"}
            </td>
            <td className="px-4 py-3 font-mono text-xs text-slate-400">{a.attemptedAt || "—"}</td>
            <td className="px-4 py-3">
              {a.attachmentLink ? (
                <a href={a.attachmentLink} target="_blank" rel="noreferrer" className="text-brand text-xs hover:underline font-mono">View →</a>
              ) : <span className="text-slate-500 text-xs">—</span>}
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-2">
                <button onClick={() => setGradeAttempt(a)} className="text-xs text-slate-400 hover:text-accent-teal px-2 py-1 rounded hover:bg-accent-teal/10 transition-colors">Grade</button>
                <button onClick={() => setDeleteAttempt(a)} className="text-xs text-slate-400 hover:text-accent-rose px-2 py-1 rounded hover:bg-accent-rose/10 transition-colors">Delete</button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <CreateAttemptModal taskId={taskId} open={createOpen} onClose={() => setCreateOpen(false)} onSaved={fetchAttempts} />
      <GradeModal attempt={gradeAttempt} open={!!gradeAttempt} onClose={() => setGradeAttempt(null)} onSaved={fetchAttempts} />
      <ConfirmDialog open={!!deleteAttempt} onClose={() => setDeleteAttempt(null)} onConfirm={handleDelete} loading={deleting} title="Delete Attempt" message={`Delete attempt #${deleteAttempt?.taskAttemptId}? This cannot be undone.`} />
    </div>
  );
}
