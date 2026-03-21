import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sessionService, courseService, toArray } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Spinner, StatusBadge } from "../../components/common";

export default function TrainerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.allSettled([
      sessionService.getAll({ trainerId: user?.userId }),
      courseService.getAll({ trainerId: user?.userId, active: true }),
    ]).then(([s, c]) => {
      if (s.status === "fulfilled") setSessions(toArray(s.value.data));
      if (c.status === "fulfilled") setCourses(toArray(c.value.data));
    }).finally(() => setLoading(false));
  }, [user]);

  const upcoming = sessions.filter(s => s.sessionDate && new Date(s.sessionDate) >= new Date());
  const past     = sessions.filter(s => !s.sessionDate || new Date(s.sessionDate) < new Date());

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mb-1">Trainer Dashboard</p>
          <h1 className="font-display font-bold text-3xl text-white">Welcome, Trainer</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your sessions and track attendance</p>
        </div>
        <div className="glass-card px-4 py-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-teal animate-pulse" />
          <span className="text-xs font-mono text-accent-teal font-bold">TRAINER</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label:"My Courses",    value:courses.length,  color:"text-accent-teal",  icon:"◎" },
          { label:"Total Sessions",value:sessions.length, color:"text-brand",        icon:"◷" },
          { label:"Upcoming",      value:upcoming.length, color:"text-accent-amber", icon:"→" },
          { label:"Completed",     value:past.length,     color:"text-accent-teal",  icon:"✓" },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="glass-card p-5 border border-accent-teal/10 hover:border-accent-teal/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-display font-semibold text-slate-500 uppercase tracking-widest">{label}</span>
              <span className={`text-xl ${color}`}>{icon}</span>
            </div>
            {loading ? <Spinner size="sm" /> :
              <p className={`font-display font-bold text-3xl ${color}`}>{value}</p>}
          </div>
        ))}
      </div>

      {/* Session Cards */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-lg text-white">My Sessions</h2>
          <button onClick={() => navigate("/sessions")} className="text-accent-teal text-sm hover:text-teal-300">View all →</button>
        </div>
        {loading ? <div className="flex justify-center py-10"><Spinner /></div>
        : sessions.length === 0 ? (
          <div className="glass-card p-10 text-center border border-accent-teal/10">
            <p className="text-4xl mb-3 opacity-30">◷</p>
            <p className="text-slate-500">No sessions assigned yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map(s => (
              <div key={s.sessionId} className="glass-card p-5 border border-accent-teal/10 hover:border-accent-teal/40 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-display font-semibold text-white text-sm flex-1 truncate mr-2">{s.title}</p>
                  <span className="text-xs font-mono text-accent-teal bg-accent-teal/10 px-2 py-0.5 rounded-full border border-accent-teal/20 whitespace-nowrap">{s.sessionType}</span>
                </div>
                <p className="text-slate-500 text-xs font-mono mb-1">
                  {s.sessionDate || "Date TBD"}{s.startTime ? ` · ${s.startTime}` : ""}
                </p>
                {s.room && <p className="text-slate-500 text-xs mb-3">📍 {s.room}</p>}
                <div className="flex gap-2 mt-3">
                  {s.deliveryLink ? (
                    <a href={s.deliveryLink} target="_blank" rel="noreferrer"
                      className="flex-1 text-center text-xs py-1.5 bg-accent-teal/20 hover:bg-accent-teal/30 text-accent-teal rounded-lg border border-accent-teal/30 transition-all">
                      Join Session
                    </a>
                  ) : <span className="flex-1" />}
                  <button onClick={() => navigate(`/sessions/${s.sessionId}/attendance`)}
                    className="flex-1 text-center text-xs py-1.5 bg-ink-700 hover:bg-ink-600 text-slate-300 rounded-lg border border-ink-600 transition-all">
                    Attendance
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Courses */}
      <div>
        <h2 className="font-display font-semibold text-lg text-white mb-3">My Courses</h2>
        {loading ? <div className="flex justify-center py-6"><Spinner /></div>
        : courses.length === 0 ? (
          <div className="glass-card p-8 text-center border border-accent-teal/10">
            <p className="text-slate-500 text-sm">No courses assigned</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(c => (
              <div key={c.courseId} className="glass-card p-4 border border-accent-teal/10 hover:border-accent-teal/30 transition-all cursor-pointer"
                onClick={() => navigate(`/courses/${c.courseId}/enrollments`)}>
                <div className="flex items-start justify-between mb-2">
                  <p className="font-display font-semibold text-white text-sm">{c.title}</p>
                  <StatusBadge status={c.type} />
                </div>
                <p className="text-slate-500 text-xs font-mono">{c.mode} · {c.durationHours}h</p>
                <p className="text-accent-teal text-xs mt-2">View enrollments →</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
