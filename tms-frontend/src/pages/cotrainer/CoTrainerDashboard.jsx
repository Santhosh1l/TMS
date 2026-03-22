import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { taskService, courseService, toArray } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Spinner, StatusBadge } from "../../components/common";

export default function CoTrainerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [daily, setDaily]     = useState([]);
  const [weekly, setWeekly]   = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      taskService.getAll({ userId: user?.userId }),
      courseService.getAll({ trainerId: user?.userId, active: true }),
    ]).then(([t, c]) => {
      if (t.status === "fulfilled") {
        const all = toArray(t.value.data);
        setDaily(all.filter(x => !x.weeklyMandatory));
        setWeekly(all.filter(x => x.weeklyMandatory));
      }
      if (c.status === "fulfilled") setCourses(toArray(c.value.data));
    }).finally(() => setLoading(false));
  }, [user]);

  const allTasks = [...daily, ...weekly];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mb-1">Co-Trainer Dashboard</p>
          <h1 className="font-display font-bold text-3xl text-white">
            {user?.name ? `Welcome, ${user.name.split(" ")[0]}` : "Task Management"}
          </h1>
          <p className="text-slate-400 text-sm mt-1">Create and manage daily tasks and weekly assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            <span className="text-xs font-mono text-brand font-bold">CO-TRAINER</span>
          </div>
          <button onClick={() => navigate("/cotrainer/tasks/create")} className="btn-primary">
            + Create Task
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label:"Daily Tasks",   value:daily.length,                                              color:"text-brand",        icon:"◫" },
          { label:"Weekly Tasks",  value:weekly.length,                                             color:"text-accent-amber", icon:"◎" },
          { label:"Open Tasks",    value:allTasks.filter(t=>t.status==="OPEN").length,              color:"text-accent-teal",  icon:"→" },
          { label:"My Courses",    value:courses.length,                                            color:"text-accent-rose",  icon:"◷" },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="glass-card p-5 border border-brand/10 hover:border-brand/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-display font-semibold text-slate-500 uppercase tracking-widest">{label}</span>
              <span className={`text-xl ${color}`}>{icon}</span>
            </div>
            {loading ? <Spinner size="sm" /> :
              <p className={`font-display font-bold text-3xl ${color}`}>{value}</p>}
          </div>
        ))}
      </div>

      {/* Completed Daily Tasks */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-lg text-white">Completed Daily Tasks</h2>
          <button onClick={() => navigate("/tasks")} className="text-brand text-sm hover:text-brand-light">View all →</button>
        </div>
        <div className="glass-card overflow-hidden border border-brand/10">
          {loading ? <div className="flex justify-center py-8"><Spinner /></div>
          : daily.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-2 opacity-30">◫</p>
              <p className="text-slate-500 text-sm mb-3">No daily tasks yet</p>
              <button onClick={() => navigate("/cotrainer/tasks/create")} className="btn-primary text-xs">+ Create Task</button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-ink-600">
                {["Title","Type","Course","Deadline","Status","Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-display font-semibold text-slate-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {daily.map(t => (
                  <tr key={t.taskId} className="border-b border-ink-700/50 last:border-0 hover:bg-ink-700/50">
                    <td className="px-4 py-3 font-medium text-white max-w-xs truncate">{t.title}</td>
                    <td className="px-4 py-3 font-mono text-xs text-accent-amber">{t.type}</td>
                    <td className="px-4 py-3 font-mono text-xs text-brand">#{t.courseId}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{t.submissionDeadline||"—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3">
                      <button onClick={() => navigate(`/tasks/${t.taskId}/attempts`)}
                        className="text-xs text-slate-400 hover:text-brand px-2 py-1 rounded hover:bg-brand/10 transition-colors">Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Completed Weekly Assignments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-lg text-white">Completed Weekly Assignments</h2>
          <button onClick={() => navigate("/cotrainer/tasks/create")} className="btn-secondary text-xs">+ Create Assignment</button>
        </div>
        <div className="glass-card overflow-hidden border border-brand/10">
          {loading ? <div className="flex justify-center py-8"><Spinner /></div>
          : weekly.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-2 opacity-30">◎</p>
              <p className="text-slate-500 text-sm">No weekly assignments yet</p>
            </div>
          ) : (
            <div className="divide-y divide-ink-700/50">
              {weekly.map(t => (
                <div key={t.taskId} className="p-4 flex items-center justify-between hover:bg-ink-700/50">
                  <div>
                    <p className="font-medium text-white text-sm">{t.title}</p>
                    <p className="text-slate-500 text-xs font-mono mt-0.5">
                      Course #{t.courseId} · Due: {t.submissionDeadline||"—"} · {t.totalMarks} marks
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <StatusBadge status={t.status} />
                    <button onClick={() => navigate(`/tasks/${t.taskId}/attempts`)}
                      className="text-xs text-slate-400 hover:text-brand px-2 py-1 rounded hover:bg-brand/10 transition-colors">Details</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
