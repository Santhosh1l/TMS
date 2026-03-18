import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { taskService } from "../../services/api";
import { Alert, Spinner, InputField, SelectField } from "../../components/common";
import { TASK_TYPES, TASK_STATUSES } from "../../utils/enums";

export default function CoTrainerTaskForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    courseId: "", type: "QUIZ", title: "", scheduledDate: "",
    submissionDeadline: "", startTime: "", endTime: "",
    durationMinutes: "", totalMarks: "", instructionLink: "",
    platform: "", weeklyMandatory: false, status: "SCHEDULED",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await taskService.create({
        ...form,
        courseId: Number(form.courseId),
        durationMinutes: Number(form.durationMinutes),
        totalMarks: Number(form.totalMarks),
      });
      navigate("/cotrainer");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="mb-2">
        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">← Back</button>
      </div>

      <div className="mb-8">
        <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mb-1">Co-Trainer</p>
        <h1 className="font-display font-bold text-3xl text-white tracking-tight">Create Task</h1>
        <p className="text-slate-400 text-sm mt-1">Create a quiz or assignment for your course</p>
      </div>

      <div className="glass-card p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Alert message={error} />

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Course ID" name="courseId" type="number" value={form.courseId} onChange={handleChange} required min={1} placeholder="Course ID" />
            <SelectField label="Task Type" name="type" value={form.type} onChange={handleChange} options={TASK_TYPES} />
          </div>

          <InputField label="Title" name="title" value={form.title} onChange={handleChange} required maxLength={160} placeholder="Task title" />

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Scheduled Date" name="scheduledDate" type="date" value={form.scheduledDate} onChange={handleChange} required />
            <InputField label="Submission Deadline" name="submissionDeadline" type="date" value={form.submissionDeadline} onChange={handleChange} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Start Time" name="startTime" type="time" value={form.startTime} onChange={handleChange} />
            <InputField label="End Time" name="endTime" type="time" value={form.endTime} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Duration (minutes)" name="durationMinutes" type="number" value={form.durationMinutes} onChange={handleChange} required min={1} max={1440} />
            <InputField label="Total Marks" name="totalMarks" type="number" value={form.totalMarks} onChange={handleChange} required min={0} />
          </div>

          <InputField label="Instruction Link" name="instructionLink" type="url" value={form.instructionLink} onChange={handleChange} required placeholder="https://..." />

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Platform" name="platform" value={form.platform} onChange={handleChange} required placeholder="e.g. HackerRank, Google Forms" maxLength={60} />
            <SelectField label="Status" name="status" value={form.status} onChange={handleChange} options={TASK_STATUSES} />
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input type="checkbox" name="weeklyMandatory" checked={form.weeklyMandatory} onChange={handleChange} className="accent-brand w-4 h-4" />
            <span className="text-sm text-slate-300">Weekly Mandatory Assignment</span>
          </label>

          <div className="flex gap-3 justify-end pt-2 border-t border-ink-700">
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
              {saving && <Spinner size="sm" />} Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
