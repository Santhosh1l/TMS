import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { sessionService, attendanceService, taskService, toArray } from "../../services/api";
import { Spinner, StatusBadge } from "../../components/common";

export default function TrainerSessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sessionRes, attendRes, tasksRes] = await Promise.allSettled([
          sessionService.getById(sessionId),
          attendanceService.getAll(sessionId),
          taskService.getAll({ sessionId }),
        ]);
        if (sessionRes.status === "fulfilled")  setSession(sessionRes.value.data);
        if (attendRes.status === "fulfilled")   setAttendance(toArray(attendRes.value.data));
        if (tasksRes.status === "fulfilled")    setTasks(toArray(tasksRes.value.data));
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [sessionId]);

  const present = attendance.filter(a => a.status === "PRESENT").length;
  const absent  = attendance.filter(a => a.status === "ABSENT").length;
  const late    = attendance.filter(a => a.status === "LATE").length;
  const total   = attendance.length;

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="animate-fade-in">
      <div className="mb-2">
        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">← Back</button>
      </div>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mb-1">Session Detail</p>
          <h1 className="font-display font-bold text-3xl text-white tracking-tight">{session?.title || `Session #${sessionId}`}</h1>
          <p className="text-slate-400 text-sm mt-1">
            {session?.sessionDate || "Date TBD"} {session?.startTime ? `· ${session.startTime} - ${session.endTime}` : ""}
            {session?.room ? ` · ${session.room}` : ""}
          </p>
        </div>
        <span className="text-sm font-mono text-accent-amber bg-accent-amber/10 px-3 py-1.5 rounded-full border border-accent-amber/20">
          {session?.sessionType}
        </span>
      </div>

      {/* Meeting Link */}
      {session?.deliveryLink && (
        <div className="glass-card p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-display font-semibold text-slate-500 uppercase tracking-widest mb-1">Meeting Link to Attend Session</p>
            <p className="text-brand text-sm font-mono truncate max-w-md">{session.deliveryLink}</p>
          </div>
          <a href={session.deliveryLink} target="_blank" rel="noreferrer" className="btn-primary text-sm ml-4 whitespace-nowrap">
            Join Now
          </a>
        </div>
      )}

      {session?.recordingLink && (
        <div className="glass-card p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-display font-semibold text-slate-500 uppercase tracking-widest mb-1">Recording Link</p>
            <p className="text-slate-400 text-sm font-mono truncate max-w-md">{session.recordingLink}</p>
          </div>
          <a href={session.recordingLink} target="_blank" rel="noreferrer" className="btn-secondary text-sm ml-4 whitespace-nowrap">
            Watch
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Course Summary */}
        <div className="glass-card p-5">
          <h2 className="font-display font-semibold text-white mb-4">Course Summary</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-ink-700/50">
              <span className="text-slate-400 text-sm">Course ID</span>
              <span className="text-white font-mono text-sm">#{session?.courseId}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-ink-700/50">
              <span className="text-slate-400 text-sm">Session Type</span>
              <span className="text-accent-amber font-mono text-sm">{session?.sessionType}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-ink-700/50">
              <span className="text-slate-400 text-sm">Date</span>
              <span className="text-white font-mono text-sm">{session?.sessionDate || "—"}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-ink-700/50">
              <span className="text-slate-400 text-sm">Time</span>
              <span className="text-white font-mono text-sm">
                {session?.startTime && session?.endTime ? `${session.startTime} – ${session.endTime}` : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-400 text-sm">Room</span>
              <span className="text-white font-mono text-sm">{session?.room || "Online"}</span>
            </div>
          </div>
        </div>

        {/* Attendance Glance */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-white">Attendance Glance</h2>
            <button onClick={() => navigate(`/sessions/${sessionId}/attendance`)}
              className="text-brand text-xs hover:text-brand-light transition-colors">
              Manage →
            </button>
          </div>
          {total === 0 ? (
            <div className="text-center py-6">
              <p className="text-slate-500 text-sm">No attendance records yet</p>
              <button onClick={() => navigate(`/sessions/${sessionId}/attendance`)}
                className="btn-primary text-xs mt-3">
                Record Attendance
              </button>
            </div>
          ) : (
            <>
              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>Attendance Rate</span>
                  <span>{total > 0 ? Math.round((present / total) * 100) : 0}%</span>
                </div>
                <div className="h-2 bg-ink-600 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-teal rounded-full transition-all"
                    style={{ width: `${total > 0 ? (present / total) * 100 : 0}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Present", value: present, color: "text-accent-teal", bg: "bg-accent-teal/10 border-accent-teal/20" },
                  { label: "Absent",  value: absent,  color: "text-accent-rose", bg: "bg-accent-rose/10 border-accent-rose/20" },
                  { label: "Late",    value: late,    color: "text-accent-amber",bg: "bg-accent-amber/10 border-accent-amber/20"},
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`rounded-lg border p-3 text-center ${bg}`}>
                    <p className={`font-display font-bold text-2xl ${color}`}>{value}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Session Tasks / Syllabus */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg text-white">Session Syllabus / Tasks</h2>
        </div>
        <div className="glass-card overflow-hidden">
          {tasks.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-2 opacity-30">◫</p>
              <p className="text-slate-500 text-sm">No tasks linked to this session</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-600">
                  {["Title", "Type", "Deadline", "Marks", "Status"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-display font-semibold text-slate-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.taskId} className="border-b border-ink-700/50 last:border-0 hover:bg-ink-700/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{t.title}</td>
                    <td className="px-4 py-3 font-mono text-xs text-accent-amber">{t.type}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{t.submissionDeadline || "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{t.totalMarks}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
