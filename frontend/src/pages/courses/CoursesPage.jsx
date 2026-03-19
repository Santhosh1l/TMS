import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { courseService } from "../../services/api";
import {
  PageHeader, Table, StatusBadge, Modal, ConfirmDialog,
  Alert, EmptyState, Spinner, InputField, SelectField,
} from "../../components/common";

const COURSE_TYPES = ["TECH", "C2C", "SOFT_SKILLS", "COMPLIANCE"];
const COURSE_MODES = ["ONLINE", "OFFLINE", "HYBRID"];

// ✅ Safe array extractor (FIX)
const safeArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.content)) return data.content; // Spring pageable
  return [];
};

// ─── Course Modal ─────────────────────────────
function CourseModal({ course, open, onClose, onSaved }) {
  const isEdit = !!course;

  const blank = {
    title: "",
    type: COURSE_TYPES[0],
    mode: COURSE_MODES[0],
    durationHours: "",
    description: "",
    prerequisites: "",
    certificateTemplateId: "",
  };

  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    setForm(course ? { ...course } : blank);
  }, [course, open]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        durationHours: Number(form.durationHours),
      };

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
            <InputField label="Title" name="title" value={form.title} onChange={handleChange} required />
          </div>

          <SelectField label="Type" name="type" value={form.type} onChange={handleChange} options={COURSE_TYPES} />
          <SelectField label="Mode" name="mode" value={form.mode} onChange={handleChange} options={COURSE_MODES} />

          <InputField
            label="Duration (hours)"
            name="durationHours"
            type="number"
            value={form.durationHours}
            onChange={handleChange}
            required
          />

          <InputField
            label="Certificate Template ID"
            name="certificateTemplateId"
            value={form.certificateTemplateId || ""}
            onChange={handleChange}
          />

          <div className="col-span-2">
            <textarea
              name="description"
              value={form.description || ""}
              onChange={handleChange}
              placeholder="Description"
              className="input-field"
            />
          </div>

          <div className="col-span-2">
            <InputField
              label="Prerequisites"
              name="prerequisites"
              value={form.prerequisites || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving && <Spinner size="sm" />} {isEdit ? "Save" : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Main Page ─────────────────────────────
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

      console.log("API RAW:", res);
      console.log("API DATA:", res.data);

      const list = safeArray(res.data);

      console.log("PARSED COURSES:", list);

      setCourses(list);
    } catch (err) {
      setAlert({
        type: "error",
        message: err.response?.data?.message || "Failed to load courses.",
      });
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

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
    <div>
      <PageHeader
        title="Courses"
        subtitle="Manage training courses"
        action={
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            + New Course
          </button>
        }
      />

      {/* Filter */}
      <div className="mb-4">
        <label>
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
          />
          Active only
        </label>
      </div>

      {alert.message && <Alert type={alert.type} message={alert.message} />}

      <Table
        headers={["ID", "Title", "Type", "Mode", "Duration", "Actions"]}
        loading={loading}
        empty={
          <tr>
            <td colSpan={6}>
              <EmptyState
                title="No courses found"
                description="Create your first course"
                action={
                  <button className="btn-primary" onClick={() => setModalOpen(true)}>
                    + New Course
                  </button>
                }
              />
            </td>
          </tr>
        }
      >
        {courses.map((c) => (
          <tr key={c.courseId}>
            <td>#{c.courseId}</td>
            <td>{c.title}</td>
            <td><StatusBadge status={c.type} /></td>
            <td>{c.mode}</td>
            <td>{c.durationHours}h</td>
            <td>
              <button onClick={() => navigate(`/courses/${c.courseId}/enrollments`)}>
                Enrollments
              </button>

              <button onClick={() => { setEditCourse(c); setModalOpen(true); }}>
                Edit
              </button>

              <button onClick={() => setDeleteCourse(c)}>
                Delete
              </button>
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
        message={`Delete "${deleteCourse?.title}"?`}
      />
    </div>
  );
}