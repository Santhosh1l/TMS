import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { courseService } from "../../services/api";
import {
  PageHeader, Table, StatusBadge, Modal, ConfirmDialog,
  Alert, EmptyState, Spinner, InputField, SelectField,
} from "../../components/common";

// ── match your actual DB check constraints ──────────────────────
const COURSE_TYPES = ["TECH", "C2C", "SOFT_SKILLS", "COMPLIANCE"];
const COURSE_MODES = ["ONLINE", "OFFLINE", "HYBRID"];

// Safe array extractor — handles plain array, Spring Page<T>, or wrapped response
const toArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
};

// ─── Course Form Modal ───────────────────────────────────────────
function CourseModal({ course, open, onClose, onSaved }) {
  const isEdit = !!course;
  const blank = { title: "", type: COURSE_TYPES[0], mode: COURSE_MODES[0], durationHours: "", description: "", prerequisites: "", certificateTemplateId: "" };
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    if (course) setForm({ ...course });
    else setForm(blank);
  }, [course, open]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, durationHours: Number(form.durationHours) };
      if (isEdit) await courseService.update(payload);
      else await courseService.create(payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Course" : "Create Course"} size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Alert message={error} />
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <InputField label="Title" name="title" value={form.title} onChange={handleChange} placeholder="Course title" required maxLength={140} />
          </div>
          <SelectField label="Type" name="type" value={form.type} onChange={handleChange} options={COURSE_TYPES} />
          <SelectField label="Mode" name="mode" value={form.mode} onChange={handleChange} options={COURSE_MODES} />
          <InputField label="Duration (hours)" name="durationHours" type="number" value={form.durationHours} onChange={handleChange} min={1} max={10000} required />
          <InputField label="Certificate Template ID" name="certificateTemplateId" value={form.certificateTemplateId || ""} onChange={handleChange} placeholder="Optional" maxLength={80} />
          <div className="col-span-2">
            <label className="label">Description</label>
            <textarea name="description" value={form.description || ""} onChange={handleChange} placeholder="Course overview..." rows={3} maxLength={10000} className="input-field resize-none" />
          </div>
          <div className="col-span-2">
            <InputField label="Prerequisites" name="prerequisites" value={form.prerequisites || ""} onChange={handleChange} placeholder="Optional" maxLength={200} />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
            {saving && <Spinner size="sm" />} {isEdit ? "Save Changes" : "Create Course"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function CoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOnly, setActiveOnly] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [deleteCourse, setDeleteCourse] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setAlert({ type: "", message: "" });
    try {
      const res = await courseService.getAll({ active: activeOnly });
      setCourses(toArray(res.data));
    } catch (err) {
      setAlert({ type: "error", message: err.response?.data?.message || "Failed to load courses." });
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await courseService.delete(deleteCourse.courseId);
      setAlert({ type: "success", message: "Course deleted." });
      setDeleteCourse(null);
      fetchCourses();
    } catch {
      setAlert({ type: "error", message: "Delete failed." });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Courses"
        subtitle="Manage training courses and enrollments"
        action={
          <button className="btn-primary" onClick={() => { setEditCourse(null); setModalOpen(true); }}>
            + New Course
          </button>
        }
      />

      {/* Filter */}
      <div className="flex items-center gap-3 mb-6">
        <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
            className="accent-brand"
          />
          Active only
        </label>
        <span className="text-slate-600 text-xs font-mono">{courses.length} course{courses.length !== 1 ? "s" : ""}</span>
      </div>

      {alert.message && <div className="mb-4"><Alert type={alert.type} message={alert.message} /></div>}

      <Table
        headers={["ID", "Title", "Type", "Mode", "Duration", "Actions"]}
        loading={loading}
        empty={
          <tr><td colSpan={6}>
            <EmptyState
              icon="◎"
              title="No courses found"
              description={activeOnly ? "Try unchecking 'Active only' to see all courses." : "Create your first course to get started."}
              action={<button className="btn-primary" onClick={() => setModalOpen(true)}>+ New Course</button>}
            />
          </td></tr>
        }
      >
        {courses.map((c) => (
          <tr key={c.courseId} className="border-b border-ink-700/50 last:border-0 table-row-hover">
            <td className="px-4 py-3 text-slate-500 font-mono text-xs">#{c.courseId}</td>
            <td className="px-4 py-3 font-body font-medium text-white">{c.title}</td>
            <td className="px-4 py-3"><StatusBadge status={c.type} /></td>
            <td className="px-4 py-3 text-slate-400 font-mono text-xs">{c.mode}</td>
            <td className="px-4 py-3 text-slate-400 font-mono text-xs">{c.durationHours}h</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <button onClick={() => navigate(`/courses/${c.courseId}/enrollments`)} className="text-xs text-slate-400 hover:text-accent-teal transition-colors px-2 py-1 rounded hover:bg-accent-teal/10">Enrollments</button>
                <button onClick={() => { setEditCourse(c); setModalOpen(true); }} className="text-xs text-slate-400 hover:text-brand transition-colors px-2 py-1 rounded hover:bg-brand/10">Edit</button>
                <button onClick={() => setDeleteCourse(c)} className="text-xs text-slate-400 hover:text-accent-rose transition-colors px-2 py-1 rounded hover:bg-accent-rose/10">Delete</button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <CourseModal
        course={editCourse}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditCourse(null); }}
        onSaved={fetchCourses}
      />

      <ConfirmDialog
        open={!!deleteCourse}
        onClose={() => setDeleteCourse(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Course"
        message={`Delete "${deleteCourse?.title}"? This cannot be undone.`}
      />
    </div>
  );
}
