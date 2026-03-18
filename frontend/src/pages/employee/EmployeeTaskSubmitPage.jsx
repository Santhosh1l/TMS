import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { taskService, taskAttemptService, toArray } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Alert, Spinner } from "../../components/common";
import { TASK_ATTEMPT_STATUSES } from "../../utils/enums";

export default function EmployeeTaskSubmitPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    score: "", total: "", attachmentLink: "", status: "SUBMITTED",
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [taskRes, attemptsRes] = await Promise.allSettled([
          taskService.getById(taskId),
          taskAttemptService.getAll({ taskId, userId: user?.userId }),
        ]);
        if (taskRes.status === "fulfilled") {
          const t = taskRes.value.data;
          setTask(t);
          setForm(f => ({ ...f, total: t.totalMarks || "" }));
        }
        if (attemptsRes.status === "fulfilled") {
          const arr = toArray(attemptsRes.value.data);
          if (arr.length > 0) setExisting(arr[0]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [taskId, user]);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await taskAttemptService.create({
        taskId: Number(taskId),
        userId: user?.userId,
        type: task?.type,
        status: "SUBMITTED",
        score: form.score ? Number(form.score) : undefined,
        total: form.total ? Number(form.total) : task?.totalMarks,
        attachmentLink: form.attachmentLink || undefined,
      });
      setSuccess(true);
      setTimeout(() => navigate(-1), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="animate-fade-in max-w-xl">
      <div className="mb-2">
        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">← Back</button>
      </div>

      <div className="mb-8">
        <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mb-1">Task Submission</p>
        <h1 className="font-display font-bold text-2xl text-white tracking-tight">{task?.title}</h1>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="text-xs font-mono text-accent-amber bg-accent-amber/10 px-2 py-0.5 rounded-full border border-accent-amber/20">{task?.type}</span>
          <span className="text-slate-500 text-xs font-mono">Due: {task?.submissionDeadline || "—"}</span>
          <span className="text-slate-500 text-xs font-mono">Marks: {task?.totalMarks}</span>
        </div>
      </div>

      {/* Instruction Link */}
      {task?.instructionLink && (
        <div className="glass-card p-4 mb-6">
          <p className="text-xs font-display font-semibold text-slate-500 uppercase tracking-widest mb-2">Instructions</p>
          <a href={task.instructionLink} target="_blank" rel="noreferrer"
            className="text-brand text-sm hover:underline break-all">
            {task.instructionLink}
          </a>
          <p className="text-slate-500 text-xs mt-1">Platform: {task?.platform}</p>
        </div>
      )}

      {/* Already submitted */}
      {existing ? (
        <div className="glass-card p-6 text-center">
          <p className="text-3xl mb-3">✅</p>
          <p className="font-display font-semibold text-white text-lg mb-1">Already Submitted</p>
          <p className="text-slate-400 text-sm">Status: <span className="text-brand font-mono">{existing.status}</span></p>
          {existing.score != null && (
            <p className="text-slate-400 text-sm mt-1">Score: <span className="text-accent-teal font-mono">{existing.score} / {existing.total}</span></p>
          )}
          {existing.feedback && (
            <p className="text-slate-400 text-sm mt-2 italic">Feedback: "{existing.feedback}"</p>
          )}
        </div>
      ) : success ? (
        <div className="glass-card p-6 text-center">
          <p className="text-3xl mb-3">🎉</p>
          <p className="font-display font-semibold text-white text-lg mb-1">Submitted Successfully!</p>
          <p className="text-slate-400 text-sm">Redirecting back...</p>
        </div>
      ) : (
        <div className="glass-card p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Alert message={error} />

            {task?.type === "QUIZ" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Score</label>
                  <input name="score" type="number" value={form.score} onChange={handleChange}
                    className="input-field" min={0} max={task?.totalMarks} required placeholder="Your score" />
                </div>
                <div>
                  <label className="label">Total Marks</label>
                  <input name="total" type="number" value={form.total} onChange={handleChange}
                    className="input-field" min={1} placeholder={task?.totalMarks} />
                </div>
              </div>
            )}

            {task?.type === "ASSIGNMENT" && (
              <div>
                <label className="label">Attachment Link</label>
                <input name="attachmentLink" type="url" value={form.attachmentLink} onChange={handleChange}
                  className="input-field" placeholder="https://github.com/your-submission" required />
                <p className="text-slate-500 text-xs mt-1">Paste your GitHub / Google Drive / submission link</p>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2 border-t border-ink-700">
              <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
                {saving && <Spinner size="sm" />} Submit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
