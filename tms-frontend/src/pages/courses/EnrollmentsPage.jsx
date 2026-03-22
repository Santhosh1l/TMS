import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { enrollService, userService, toArray } from "../../services/api";
import {
  PageHeader, Table, StatusBadge, Modal, ConfirmDialog,
  Alert, EmptyState, Spinner, InputField, SelectField,
} from "../../components/common";
import { COURSE_MEMBER_ROLES, COURSE_MEMBER_STATUSES } from "../../utils/enums";


// ─── Enroll Modal ────────────────────────────────────────────────
function EnrollModal({ courseId, open, onClose, onSaved }) {
  const [form, setForm] = useState({ userId: "", memberRole: "EMPLOYEE", status: "ENROLLED", activeFrom: "", activeTo: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [userPreview, setUserPreview] = useState(null); // { name, role }
  const [previewLoading, setPreviewLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    setForm({ userId: "", memberRole: "EMPLOYEE", status: "ENROLLED", activeFrom: "", activeTo: "" });
    setError("");
    setUserPreview(null);
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));

    // Live user lookup when typing the ID
    if (name === "userId") {
      setUserPreview(null);
      clearTimeout(debounceRef.current);
      if (value && Number(value) > 0) {
        setPreviewLoading(true);
        debounceRef.current = setTimeout(async () => {
          try {
            const res = await userService.getById(Number(value));
            const u = res.data;
            if (u?.name) {
              setUserPreview({ name: u.name, role: u.role?.replace("ROLE_", "") || "—", status: u.status });
            } else {
              setUserPreview({ notFound: true });
            }
          } catch {
            setUserPreview({ notFound: true });
          } finally {
            setPreviewLoading(false);
          }
        }, 400);
      } else {
        setPreviewLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await enrollService.enroll(courseId, { ...form, userId: Number(form.userId), courseId: Number(courseId) });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Enrollment failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Enroll User">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Alert message={error} />

        {/* User ID field + live preview */}
        <div>
          <InputField
            label="User ID"
            name="userId"
            type="number"
            value={form.userId}
            onChange={handleChange}
            placeholder="Enter user ID"
            required
            min={1}
          />
          {/* Preview card */}
          {form.userId && (
            <div className="mt-2 px-3 py-2.5 rounded-lg bg-ink-900 border border-ink-600 flex items-center gap-3 min-h-[42px]">
              {previewLoading ? (
                <Spinner size="sm" />
              ) : userPreview?.notFound ? (
                <span className="text-accent-rose text-xs font-mono">No user found with this ID</span>
              ) : userPreview ? (
                <>
                  <div className="w-7 h-7 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-brand text-xs font-bold">{userPreview.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{userPreview.name}</p>
                    <p className="text-slate-500 text-xs font-mono">{userPreview.role}</p>
                  </div>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
                    userPreview.status === "ACTIVE"
                      ? "text-accent-teal bg-accent-teal/10 border-accent-teal/30"
                      : "text-slate-400 bg-slate-400/10 border-slate-400/30"
                  }`}>{userPreview.status}</span>
                </>
              ) : null}
            </div>
          )}
        </div>

        <SelectField label="Role" name="memberRole" value={form.memberRole} onChange={handleChange} options={COURSE_MEMBER_ROLES} />
        <SelectField label="Status" name="status" value={form.status} onChange={handleChange} options={COURSE_MEMBER_STATUSES} />
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Active From" name="activeFrom" type="date" value={form.activeFrom} onChange={handleChange} />
          <InputField label="Active To" name="activeTo" type="date" value={form.activeTo} onChange={handleChange} />
        </div>
        <div className="flex gap-3 justify-end mt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving || userPreview?.notFound}>
            {saving && <Spinner size="sm" />} Enroll
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Update Progress Modal ────────────────────────────────────────
function UpdateProgressModal({ enrollment, open, onClose, onSaved }) {
  const [form, setForm] = useState({ status: "", progressPercent: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (enrollment) setForm({ courseMemberId: enrollment.enrollmentId, status: enrollment.status, progressPercent: enrollment.progressPercent || 0 });
  }, [enrollment]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await enrollService.updateProgress(enrollment.courseId, { ...form, progressPercent: Number(form.progressPercent) });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Update Progress" size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Alert message={error} />
        <SelectField label="Status" name="status" value={form.status} onChange={handleChange} options={COURSE_MEMBER_STATUSES} />
        <div>
          <label className="label">Progress ({form.progressPercent}%)</label>
          <input name="progressPercent" type="range" min={0} max={100} value={form.progressPercent} onChange={handleChange} className="w-full accent-brand" />
        </div>
        <div className="flex gap-3 justify-end mt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
            {saving && <Spinner size="sm" />} Update
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function EnrollmentsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [progressEnroll, setProgressEnroll] = useState(null);
  const [deleteEnroll, setDeleteEnroll] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await enrollService.getAll(courseId);
      setEnrollments(toArray(res.data));
    } catch {
      setAlert({ type: "error", message: "Failed to load enrollments." });
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { fetchEnrollments(); }, [fetchEnrollments]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await enrollService.delete(courseId, deleteEnroll.enrollmentId);
      setAlert({ type: "success", message: "Enrollment removed." });
      setDeleteEnroll(null);
      fetchEnrollments();
    } catch {
      setAlert({ type: "error", message: "Delete failed." });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-2">
        <button onClick={() => navigate("/courses")} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">← Back to Courses</button>
      </div>
      <PageHeader
        title={`Course #${courseId} Enrollments`}
        subtitle="Manage user enrollments and progress"
        action={<button className="btn-primary" onClick={() => setEnrollOpen(true)}>+ Enroll User</button>}
      />

      {alert.message && <div className="mb-4"><Alert type={alert.type} message={alert.message} /></div>}

      <Table
        headers={["ID", "User ID", "Role", "Status", "Progress", "Assigned On", "Actions"]}
        loading={loading}
        empty={
          !loading && enrollments.length === 0 ? (
            <tr>
              <td colSpan={7}>
                <EmptyState
                  icon="◎"
                  title="No enrollments"
                  description="Enroll users to this course."
                  action={
                    <button className="btn-primary" onClick={() => setEnrollOpen(true)}>
                      + Enroll User
                    </button>
                  }
                />
              </td>
            </tr>
          ) : null
        }
      >
        {enrollments.map((e) => (
          <tr key={e.enrollmentId} className="border-b border-ink-700/50 last:border-0 table-row-hover">
            <td className="px-4 py-3 text-slate-500 font-mono text-xs">#{e.enrollmentId}</td>
            <td className="px-4 py-3 font-mono text-xs text-white">{e.userId}</td>
            <td className="px-4 py-3 text-brand font-mono text-xs">{e.memberRole}</td>
            <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-ink-600 rounded-full overflow-hidden">
                  <div className="h-full bg-brand rounded-full" style={{ width: `${e.progressPercent || 0}%` }} />
                </div>
                <span className="text-slate-400 font-mono text-xs">{e.progressPercent || 0}%</span>
              </div>
            </td>
            <td className="px-4 py-3 text-slate-500 font-mono text-xs">{e.assignedOn || "—"}</td>
            <td className="px-4 py-3">
              <div className="flex gap-2">
                <button onClick={() => setProgressEnroll({ ...e, courseId })} className="text-xs text-slate-400 hover:text-accent-teal px-2 py-1 rounded hover:bg-accent-teal/10 transition-colors">Progress</button>
                <button onClick={() => setDeleteEnroll(e)} className="text-xs text-slate-400 hover:text-accent-rose px-2 py-1 rounded hover:bg-accent-rose/10 transition-colors">Remove</button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <EnrollModal courseId={courseId} open={enrollOpen} onClose={() => setEnrollOpen(false)} onSaved={fetchEnrollments} />
      <UpdateProgressModal enrollment={progressEnroll} open={!!progressEnroll} onClose={() => setProgressEnroll(null)} onSaved={fetchEnrollments} />
      <ConfirmDialog open={!!deleteEnroll} onClose={() => setDeleteEnroll(null)} onConfirm={handleDelete} loading={deleting} title="Remove Enrollment" message={`Remove enrollment #${deleteEnroll?.enrollmentId}?`} />
    </div>
  );
}
