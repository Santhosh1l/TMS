import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { attendanceService, toArray } from "../../services/api";
import {
  PageHeader, Table, StatusBadge, Modal, ConfirmDialog,
  Alert, EmptyState, Spinner, InputField, SelectField,
} from "../../components/common";
import { ATTENDANCE_STATUSES } from "../../utils/enums";


// ─── Create Attendance Modal ──────────────────────────────────────
function AttendanceModal({ sessionId, open, onClose, onSaved }) {
  const [form, setForm] = useState({ userId: "", status: "PRESENT", checkInTime: "", checkOutTime: "", remarks: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({ userId: "", status: "PRESENT", checkInTime: "", checkOutTime: "", remarks: "" });
    setError("");
  }, [open]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await attendanceService.create(sessionId, { ...form, userId: Number(form.userId), sessionId: Number(sessionId) });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record attendance.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Record Attendance" size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Alert message={error} />
        <InputField label="User ID" name="userId" type="number" value={form.userId} onChange={handleChange} required min={1} />
        <SelectField label="Status" name="status" value={form.status} onChange={handleChange} options={ATTENDANCE_STATUSES} />
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Check-In Date" name="checkInTime" type="date" value={form.checkInTime} onChange={handleChange} />
          <InputField label="Check-Out Date" name="checkOutTime" type="date" value={form.checkOutTime} onChange={handleChange} />
        </div>
        <div>
          <label className="label">Remarks</label>
          <textarea name="remarks" value={form.remarks} onChange={handleChange} placeholder="Optional notes..." rows={2} maxLength={200} className="input-field resize-none" />
        </div>
        <div className="flex gap-3 justify-end mt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
            {saving && <Spinner size="sm" />} Record
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Update Status Modal ─────────────────────────────────────────
function UpdateStatusModal({ sessionId, attendance, open, onClose, onSaved }) {
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (attendance) setStatus(attendance.status);
    setError("");
  }, [attendance]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await attendanceService.updateStatus(sessionId, attendance.attentanceId, status);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Update Attendance Status" size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Alert message={error} />
        <SelectField label="Status" value={status} onChange={(e) => setStatus(e.target.value)} options={ATTENDANCE_STATUSES} />
        <div className="flex gap-3 justify-end">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
            {saving && <Spinner size="sm" />} Update
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function AttendancePage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [statusRecord, setStatusRecord] = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await attendanceService.getAll(sessionId);
      setRecords(toArray(res.data));
    } catch {
      setAlert({ type: "error", message: "Failed to load attendance." });
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await attendanceService.delete(sessionId, deleteRecord.attentanceId);
      setAlert({ type: "success", message: "Record deleted." });
      setDeleteRecord(null);
      fetchAttendance();
    } catch {
      setAlert({ type: "error", message: "Delete failed." });
    } finally {
      setDeleting(false);
    }
  };

  // Summary counts
  const summary = ATTENDANCE_STATUSES.reduce((acc, s) => {
    acc[s] = records.filter((r) => r.status === s).length;
    return acc;
  }, {});

  return (
    <div className="animate-fade-in">
      <div className="mb-2">
        <button onClick={() => navigate("/sessions")} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">← Back to Sessions</button>
      </div>
      <PageHeader
        title={`Session #${sessionId} Attendance`}
        subtitle="Track attendance records for this session"
        action={<button className="btn-primary" onClick={() => setCreateOpen(true)}>+ Record Attendance</button>}
      />

      {/* Summary pills */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {ATTENDANCE_STATUSES.map((s) => (
          <div key={s} className="glass-card px-4 py-2 flex items-center gap-2">
            <StatusBadge status={s} />
            <span className="font-mono text-sm text-white">{summary[s] || 0}</span>
          </div>
        ))}
      </div>

      {alert.message && <div className="mb-4"><Alert type={alert.type} message={alert.message} /></div>}

      <Table
        headers={["ID", "User ID", "Status", "Check-In", "Check-Out", "Remarks", "Actions"]}
        loading={loading}
        empty={
          <tr><td colSpan={7}>
            <EmptyState icon="◷" title="No attendance records" description="Record attendance for this session." action={<button className="btn-primary" onClick={() => setCreateOpen(true)}>+ Record Attendance</button>} />
          </td></tr>
        }
      >
        {records.map((r) => (
          <tr key={r.attentanceId} className="border-b border-ink-700/50 last:border-0 table-row-hover">
            <td className="px-4 py-3 text-slate-500 font-mono text-xs">#{r.attentanceId}</td>
            <td className="px-4 py-3 font-mono text-xs text-white">{r.userId}</td>
            <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
            <td className="px-4 py-3 font-mono text-xs text-slate-400">{r.checkInTime || "—"}</td>
            <td className="px-4 py-3 font-mono text-xs text-slate-400">{r.checkOutTime || "—"}</td>
            <td className="px-4 py-3 text-slate-400 text-xs max-w-xs truncate">{r.remarks || "—"}</td>
            <td className="px-4 py-3">
              <div className="flex gap-2">
                <button onClick={() => setStatusRecord(r)} className="text-xs text-slate-400 hover:text-brand px-2 py-1 rounded hover:bg-brand/10 transition-colors">Status</button>
                <button onClick={() => setDeleteRecord(r)} className="text-xs text-slate-400 hover:text-accent-rose px-2 py-1 rounded hover:bg-accent-rose/10 transition-colors">Delete</button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <AttendanceModal sessionId={sessionId} open={createOpen} onClose={() => setCreateOpen(false)} onSaved={fetchAttendance} />
      <UpdateStatusModal sessionId={sessionId} attendance={statusRecord} open={!!statusRecord} onClose={() => setStatusRecord(null)} onSaved={fetchAttendance} />
      <ConfirmDialog open={!!deleteRecord} onClose={() => setDeleteRecord(null)} onConfirm={handleDelete} loading={deleting} title="Delete Record" message={`Remove attendance record #${deleteRecord?.attentanceId}?`} />
    </div>
  );
}
