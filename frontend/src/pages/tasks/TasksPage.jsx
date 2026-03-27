import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { taskService, courseService, toArray } from "../../services/api";
import {
  PageHeader, Table, StatusBadge, Modal, ConfirmDialog,
  Alert, EmptyState, Spinner, InputField, SelectField, TimePickerField,
} from "../../components/common";
import { TASK_TYPES, TASK_STATUSES } from "../../utils/enums";


// ─── Task Form Modal ─────────────────────────────────────────────
function TaskModal({ task, open, onClose, onSaved }) {
  const isEdit = !!task;
  const blank = {
    courseId: "", type: TASK_TYPES[0], title: "", scheduledDate: "", submissionDeadline: "",
    startTime: "", endTime: "", durationMinutes: "", totalMarks: "", instructionLink: "",
    platform: "", weeklyMandatory: false, status: "DRAFT",
  };
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [coursePreview, setCoursePreview] = useState(null); // { title, type } | { notFound: true }
  const [previewLoading, setPreviewLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    setError("");
    setCoursePreview(null);
    if (task) {
      setForm({ ...task });
      // Pre-fill preview when editing
      if (task.courseId) {
        courseService.getById(task.courseId)
          .then(res => { if (res.data?.title) setCoursePreview({ title: res.data.title, type: res.data.type }); })
          .catch(() => {});
      }
    } else {
      setForm(blank);
    }
  }, [task, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));

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
              setCoursePreview({ title: c.title, type: c.type });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        courseId: Number(form.courseId),
        durationMinutes: Number(form.durationMinutes),
        totalMarks: Number(form.totalMarks),
      };
      if (isEdit) {
        await taskService.update({
          taskId: payload.taskId,
          status: payload.status,
          link: payload.instructionLink,
          durationMinutes: payload.durationMinutes,
          totalMarks: payload.totalMarks,
          title: payload.title,
          scheduledDate: payload.scheduledDate,
          submissionDeadline: payload.submissionDeadline,
          startTime: payload.startTime,
          endTime: payload.endTime,
        });
      } else {
        await taskService.create(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Task" : "Create Task"} size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Alert message={error} />
        <div className="grid grid-cols-2 gap-4">
          {!isEdit && (
            <div className="col-span-2">
              <InputField
                label="Course ID"
                name="courseId"
                type="number"
                value={form.courseId}
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
                      <p className="text-white text-xs font-medium flex-1 truncate">{coursePreview.title}</p>
                      {coursePreview.type && (
                        <span className="text-xs font-mono text-accent-amber bg-accent-amber/10 px-1.5 py-0.5 rounded border border-accent-amber/20 whitespace-nowrap">
                          {coursePreview.type}
                        </span>
                      )}
                    </>
                  ) : null}
                </div>
              )}
            </div>
          )}
          <SelectField label="Type" name="type" value={form.type} onChange={handleChange} options={TASK_TYPES} />
          <div className="col-span-2">
            <InputField label="Title" name="title" value={form.title} onChange={handleChange} placeholder="Task title" required maxLength={160} />
          </div>
          <InputField label="Scheduled Date" name="scheduledDate" type="date" value={form.scheduledDate} onChange={handleChange} required />
          <InputField label="Submission Deadline" name="submissionDeadline" type="date" value={form.submissionDeadline} onChange={handleChange} required />
          <TimePickerField label="Start Time" name="startTime" value={form.startTime} onChange={handleChange} />
          <TimePickerField label="End Time" name="endTime" value={form.endTime} onChange={handleChange} />
          <InputField label="Duration (min)" name="durationMinutes" type="number" value={form.durationMinutes} onChange={handleChange} required min={1} max={1440} />
          <InputField label="Total Marks" name="totalMarks" type="number" value={form.totalMarks} onChange={handleChange} required min={0} max={10000} />
          <div className="col-span-2">
            <InputField label="Instruction Link" name="instructionLink" type="url" value={form.instructionLink} onChange={handleChange} placeholder="https://..." required maxLength={200} />
          </div>
          <InputField label="Platform" name="platform" value={form.platform} onChange={handleChange} placeholder="e.g. HackerRank" maxLength={60} required />
          <SelectField label="Status" name="status" value={form.status} onChange={handleChange} options={TASK_STATUSES} />
          <div className="col-span-2 flex items-center gap-2">
            <input type="checkbox" name="weeklyMandatory" id="weeklyMandatory" checked={form.weeklyMandatory} onChange={handleChange} className="accent-brand" />
            <label htmlFor="weeklyMandatory" className="text-sm text-slate-300 cursor-pointer select-none">Weekly Mandatory</label>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
            disabled={saving || coursePreview?.notFound}
          >
            {saving && <Spinner size="sm" />} {isEdit ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function TasksPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", type: "", courseId: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteTask, setDeleteTask] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;
      if (filters.courseId) params.courseId = filters.courseId;
      const res = await taskService.getAll(params);
      setTasks(toArray(res.data));
    } catch {
      setAlert({ type: "error", message: "Failed to load tasks." });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await taskService.delete(deleteTask.taskId);
      setAlert({ type: "success", message: "Task deleted." });
      setDeleteTask(null);
      fetchTasks();
    } catch {
      setAlert({ type: "error", message: "Delete failed." });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Tasks"
        subtitle="Create and manage training tasks and assessments"
        action={
          <button className="btn-primary" onClick={() => { setEditTask(null); setModalOpen(true); }}>
            + New Task
          </button>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))} className="input-field w-40">
          <option value="">All Types</option>
          {TASK_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} className="input-field w-40">
          <option value="">All Statuses</option>
          {TASK_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <input
          type="number" placeholder="Course ID" value={filters.courseId}
          onChange={(e) => setFilters((f) => ({ ...f, courseId: e.target.value }))}
          className="input-field w-36" min={1}
        />
      </div>

      {alert.message && <div className="mb-4"><Alert type={alert.type} message={alert.message} /></div>}

      <Table
        headers={["ID", "Title", "Type", "Course", "Deadline", "Marks", "Status", "Actions"]}
        loading={loading}
empty={
  !loading && tasks.length === 0 ? (
    <tr>
      <td colSpan={8}>
        <EmptyState
          icon="◫"
          title={
            filters.courseId
              ? `No tasks for Course #${filters.courseId}`
              : "Enter Course ID"
          }
          description={
            filters.courseId
              ? "No tasks found for this course."
              : "Please enter a Course ID to view tasks."
          }
          action={
            !filters.courseId && (
              <span className="text-slate-500 text-sm">
                ↑ Enter Course ID above
              </span>
            )
          }
        />
      </td>
    </tr>
  ) : null
}
      >
        {tasks.map((t) => (
          <tr key={t.taskId} className="border-b border-ink-700/50 last:border-0 table-row-hover">
            <td className="px-4 py-3 text-slate-500 font-mono text-xs">#{t.taskId}</td>
            <td className="px-4 py-3 font-body font-medium text-white max-w-xs truncate">{t.title}</td>
            <td className="px-4 py-3 font-mono text-xs text-accent-amber">{t.type}</td>
            <td className="px-4 py-3 font-mono text-xs text-brand">#{t.courseId}</td>
            <td className="px-4 py-3 font-mono text-xs text-slate-400">{t.submissionDeadline || "—"}</td>
            <td className="px-4 py-3 font-mono text-xs text-slate-300">{t.totalMarks}</td>
            <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => navigate(`/tasks/${t.taskId}/attempts`)}
                  className="text-xs text-slate-400 hover:text-accent-teal px-2 py-1 rounded hover:bg-accent-teal/10 transition-colors"
                >
                  Attempts
                </button>
                <button
                  onClick={() => { setEditTask(t); setModalOpen(true); }}
                  className="text-xs text-slate-400 hover:text-brand px-2 py-1 rounded hover:bg-brand/10 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTask(t)}
                  className="text-xs text-slate-400 hover:text-accent-rose px-2 py-1 rounded hover:bg-accent-rose/10 transition-colors"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <TaskModal
        task={editTask}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTask(null); }}
        onSaved={fetchTasks}
      />

      <ConfirmDialog
        open={!!deleteTask}
        onClose={() => setDeleteTask(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Task"
        message={`Delete "${deleteTask?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
