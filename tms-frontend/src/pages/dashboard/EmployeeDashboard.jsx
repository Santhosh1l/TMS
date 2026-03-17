import React, { useEffect, useState } from "react";
import { sessionService, taskAttemptService, courseService, enrollService } from "../../services/api";
import { Spinner, StatusBadge } from "../../components/common";
import { useAuth } from "../../context/AuthContext";

// Safely extract array from any API response shape
const toArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content; // Page<T>
  if (data && Array.isArray(data.data)) return data.data;
  return [];
};

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [sessions, setSessions]       = useState([]);
  const [attempts, setAttempts]       = useState([]);
  const [courses, setCourses]         = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sessionsRes, coursesRes, attemptsRes] = await Promise.allSettled([
          sessionService.getAll({ active: true }),
          courseService.getAll({ active: true }),
          user?.userId
            ? taskAttemptService.getAll({ userId: user.userId })
            : Promise.resolve({ data: [] }),
        ]);

        const courseList = coursesRes.status === "fulfilled"
          ? toArray(coursesRes.value.data) : [];
        setCourses(courseList);

        if (sessionsRes.status === "fulfilled")
          setSessions(toArray(sessionsRes.value.data));

        if (attemptsRes.status === "fulfilled")
          setAttempts(toArray(attemptsRes.value.data));

        // Fetch my enrollments
        if (user?.userId && courseList.length > 0) {
          const enrollRes = await Promise.allSettled(
            courseList.slice(0, 6).map(c =>
              enrollService.getAll(c.courseId, { userId: user.userId })
            )
          );
          const myEnrollments = enrollRes
            .filter(r => r.status === "fulfilled")
            .flatMap(r => toArray(r.value.data))
            .filter(e => e.userId === user.userId);
          setEnrollments(myEnrollments);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  const pendingAttempts  = attempts.filter(a => a.status === "IN_PROGRESS" || a.status === "NOT_STARTED").length;
  const submittedAttempts= attempts.filter(a => a.status === "SUBMITTED").length;
  const completedCourses = enrollments.filter(e => e.status === "COMPLETED").length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mb-1">Employee Dashboard</p>
          <h1 className="font-display font-bold text-3xl text-white tracking-tight">My Training</h1>
          <p className="text-slate-400 text-sm mt-1">Your courses, sessions, tasks and certificates</p>
        </div>
        <div className="flex items-center gap-2 glass-card px-4 py-2 self-start">
          <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
          <span className="text-xs font-mono text-brand font-semibold">EMPLOYEE</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "My Courses",        value: enrollments.length,   sub: `${completedCourses} completed`, icon: "◎", color: "text-accent-teal"  },
          { label: "Upcoming Sessions", value: sessions.length,      sub: "scheduled",                    icon: "◷", color: "text-accent-amber" },
          { label: "Pending Tasks",     value: pendingAttempts,      sub: "needs attention",               icon: "◫", color: "text-accent-rose"  },
          { label: "Submitted",         value: submittedAttempts,    sub: "awaiting review",               icon: "✓", color: "text-brand"        },
        ].map(({ label, value, sub, icon, color }) => (
          <div key={label} className="glass-card p-5 hover:border-brand/30 transition-all cursor-default">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-display font-semibold text-slate-500 uppercase tracking-widest">{label}</span>
              <span className={`text-2xl ${color}`}>{icon}</span>
            </div>
            {loading ? <Spinner size="sm" /> : (
              <>
                <p className={`font-display font-bold text-3xl ${color}`}>{value ?? 0}</p>
                {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* My Enrolled Courses & Progress */}
        <div>
          <h2 className="font-display font-semibold text-lg text-white mb-4">My Enrolled Courses</h2>
          <div className="glass-card divide-y divide-ink-700/50">
            {loading ? (
              <div className="flex justify-center py-10"><Spinner /></div>
            ) : enrollments.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-3xl mb-2 opacity-30">◎</p>
                <p className="text-slate-500 text-sm">You are not enrolled in any courses yet</p>
              </div>
            ) : enrollments.map(e => {
              const course = courses.find(c => c.courseId === e.courseId);
              return (
                <div key={e.enrollmentId} className="p-4 hover:bg-ink-700/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-white text-sm">{course?.title || `Course #${e.courseId}`}</p>
                      <p className="text-slate-500 text-xs font-mono mt-0.5">{e.memberRole}</p>
                    </div>
                    <StatusBadge status={e.status} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-ink-600 rounded-full overflow-hidden">
                      <div className="h-full bg-brand rounded-full transition-all duration-500"
                        style={{ width: `${e.progressPercent || 0}%` }} />
                    </div>
                    <span className="text-xs font-mono text-slate-300 w-10 text-right">{e.progressPercent || 0}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div>
          <h2 className="font-display font-semibold text-lg text-white mb-4">Upcoming Sessions</h2>
          <div className="glass-card divide-y divide-ink-700/50">
            {loading ? (
              <div className="flex justify-center py-10"><Spinner /></div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-3xl mb-2 opacity-30">◷</p>
                <p className="text-slate-500 text-sm">No upcoming sessions scheduled</p>
              </div>
            ) : sessions.slice(0, 5).map(s => (
              <div key={s.sessionId} className="p-4 hover:bg-ink-700/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-white text-sm">{s.title}</p>
                    <p className="text-slate-500 text-xs font-mono mt-0.5">
                      {s.sessionDate || "Date TBD"}{s.startTime ? ` · ${s.startTime}` : ""}
                      {s.room ? ` · ${s.room}` : ""}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-accent-amber bg-accent-amber/10 px-2 py-0.5 rounded-full border border-accent-amber/20 whitespace-nowrap">
                    {s.sessionType}
                  </span>
                </div>
                {s.deliveryLink && (
                  <a href={s.deliveryLink} target="_blank" rel="noreferrer"
                    className="text-brand text-xs hover:underline mt-1.5 block">
                    Join session →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Task Attempts */}
        <div>
          <h2 className="font-display font-semibold text-lg text-white mb-4">My Task Attempts</h2>
          <div className="glass-card divide-y divide-ink-700/50">
            {loading ? (
              <div className="flex justify-center py-10"><Spinner /></div>
            ) : attempts.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-3xl mb-2 opacity-30">◫</p>
                <p className="text-slate-500 text-sm">No task attempts yet</p>
              </div>
            ) : attempts.slice(0, 5).map(a => (
              <div key={a.taskAttemptId} className="p-4 hover:bg-ink-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">Task #{a.taskId}</p>
                    <p className="text-slate-500 text-xs font-mono mt-0.5">
                      {a.type} · {a.attemptedAt || "—"}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                {a.score != null && (
                  <p className="text-xs font-mono text-slate-400 mt-1">
                    Score: {a.score}{a.total ? ` / ${a.total}` : ""}
                  </p>
                )}
                {a.feedback && (
                  <p className="text-slate-400 text-xs mt-1 italic">"{a.feedback}"</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* My Certificates */}
        <div>
          <h2 className="font-display font-semibold text-lg text-white mb-4">My Certificates</h2>
          <div className="glass-card divide-y divide-ink-700/50">
            {loading ? (
              <div className="flex justify-center py-10"><Spinner /></div>
            ) : completedCourses === 0 ? (
              <div className="text-center py-10">
                <p className="text-3xl mb-2 opacity-30">🎓</p>
                <p className="text-slate-500 text-sm">Complete a course to earn certificates</p>
                <p className="text-slate-600 text-xs mt-1">
                  {enrollments.length > 0
                    ? `${enrollments.length} course(s) in progress`
                    : "Enroll in a course to get started"}
                </p>
              </div>
            ) : enrollments
                .filter(e => e.status === "COMPLETED")
                .map(e => {
                  const course = courses.find(c => c.courseId === e.courseId);
                  return (
                    <div key={e.enrollmentId} className="p-4 hover:bg-ink-700/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent-teal/10 border border-accent-teal/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg">🎓</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white text-sm">{course?.title || `Course #${e.courseId}`}</p>
                          <p className="text-slate-500 text-xs font-mono mt-0.5">
                            Completed · {e.completionDate || "N/A"}
                          </p>
                        </div>
                        <StatusBadge status="COMPLETED" />
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>
      </div>
    </div>
  );
}
