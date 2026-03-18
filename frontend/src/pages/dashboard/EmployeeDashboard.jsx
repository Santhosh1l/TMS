import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sessionService, taskAttemptService, courseService, enrollService, toArray } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Spinner, StatusBadge } from "../../components/common";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [sessions, setSessions]       = useState([]);
  const [attempts, setAttempts]       = useState([]);
  const [courses, setCourses]         = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sRes, cRes, aRes] = await Promise.allSettled([
          sessionService.getAll({ active: true }),
          courseService.getAll({ active: true }),
          user?.userId ? taskAttemptService.getAll({ userId: user.userId }) : Promise.resolve({ data: [] }),
        ]);
        const courseList = cRes.status==="fulfilled" ? toArray(cRes.value.data) : [];
        setCourses(courseList);
        if (sRes.status==="fulfilled") setSessions(toArray(sRes.value.data));
        if (aRes.status==="fulfilled") setAttempts(toArray(aRes.value.data));
        if (user?.userId && courseList.length > 0) {
          const eRes = await Promise.allSettled(
            courseList.slice(0,6).map(c => enrollService.getAll(c.courseId, { userId: user.userId }))
          );
          setEnrollments(eRes.filter(r=>r.status==="fulfilled")
            .flatMap(r=>toArray(r.value.data)).filter(e=>e.userId===user.userId));
        }
      } finally { setLoading(false); }
    };
    fetchAll();
  }, [user]);

  const pending   = attempts.filter(a => a.status==="IN_PROGRESS"||a.status==="NOT_STARTED").length;
  const submitted = attempts.filter(a => a.status==="SUBMITTED").length;
  const completed = enrollments.filter(e => e.status==="COMPLETED").length;
  const today     = new Date().toLocaleDateString("en-US",{weekday:"long"}).toUpperCase();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mb-1">Employee Dashboard</p>
          <h1 className="font-display font-bold text-3xl text-white">My Training</h1>
          <p className="text-slate-400 text-sm mt-1">Track your courses, sessions and tasks</p>
        </div>
        <div className="glass-card px-4 py-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
          <span className="text-xs font-mono text-brand font-bold">EMPLOYEE</span>
        </div>
      </div>

      {/* Today's Assignment Banner */}
      {pending > 0 && (
        <div className="glass-card p-4 mb-6 border border-accent-amber/30 bg-accent-amber/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-amber animate-pulse" />
              <h2 className="font-display font-semibold text-white text-sm">{today} ASSIGNMENT</h2>
            </div>
            <button onClick={() => navigate("/employee/tasks")} className="text-accent-amber text-xs hover:underline">View all →</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {attempts.filter(a=>a.status==="NOT_STARTED"||a.status==="IN_PROGRESS").slice(0,2).map(a => (
              <div key={a.taskAttemptId} className="bg-ink-800 rounded-lg p-3 flex items-center justify-between border border-ink-600">
                <div>
                  <p className="text-white text-sm font-medium">Task #{a.taskId}</p>
                  <p className="text-slate-500 text-xs font-mono">{a.type}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label:"My Courses",  value:enrollments.length, sub:`${completed} completed`, color:"text-accent-teal",  icon:"◎" },
          { label:"Sessions",    value:sessions.length,    sub:"upcoming",               color:"text-accent-amber", icon:"◷" },
          { label:"Pending",     value:pending,            sub:"tasks to do",            color:"text-accent-rose",  icon:"◫" },
          { label:"Submitted",   value:submitted,          sub:"awaiting review",        color:"text-brand",        icon:"✓" },
        ].map(({ label, value, sub, color, icon }) => (
          <div key={label} className="glass-card p-5 border border-brand/10 hover:border-brand/25 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-display font-semibold text-slate-500 uppercase tracking-widest">{label}</span>
              <span className={`text-xl ${color}`}>{icon}</span>
            </div>
            {loading ? <Spinner size="sm" /> : <>
              <p className={`font-display font-bold text-3xl ${color}`}>{value ?? 0}</p>
              <p className="text-slate-500 text-xs mt-1">{sub}</p>
            </>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* My Courses */}
        <div>
          <h2 className="font-display font-semibold text-lg text-white mb-3">MY COURSES</h2>
          <div className="glass-card divide-y divide-ink-700/50 border border-brand/10">
            {loading ? <div className="flex justify-center py-8"><Spinner /></div>
            : enrollments.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-3xl mb-2 opacity-30">◎</p>
                <p className="text-slate-500 text-sm">Not enrolled in any courses yet</p>
              </div>
            ) : enrollments.map(e => {
              const course = courses.find(c => c.courseId === e.courseId);
              return (
                <div key={e.enrollmentId} className="p-4 hover:bg-ink-700/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/employee/courses/${e.courseId}`)}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-white text-sm">{course?.title || `Course #${e.courseId}`}</p>
                      <p className="text-slate-500 text-xs font-mono mt-0.5">{e.memberRole?.replace("ROLE_","")}</p>
                    </div>
                    <StatusBadge status={e.status} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-ink-600 rounded-full overflow-hidden">
                      <div className="h-full bg-brand rounded-full" style={{width:`${e.progressPercent||0}%`}} />
                    </div>
                    <span className="text-xs font-mono text-slate-300 w-10 text-right">{e.progressPercent||0}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div>
          <h2 className="font-display font-semibold text-lg text-white mb-3">UPCOMING SESSIONS</h2>
          <div className="glass-card divide-y divide-ink-700/50 border border-brand/10">
            {loading ? <div className="flex justify-center py-8"><Spinner /></div>
            : sessions.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-3xl mb-2 opacity-30">◷</p>
                <p className="text-slate-500 text-sm">No upcoming sessions</p>
              </div>
            ) : sessions.slice(0,5).map(s => (
              <div key={s.sessionId} className="p-4 hover:bg-ink-700/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-white text-sm">{s.title}</p>
                    <p className="text-slate-500 text-xs font-mono mt-0.5">
                      {s.sessionDate||"TBD"}{s.startTime?` · ${s.startTime}`:""}{s.room?` · ${s.room}`:""}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-accent-amber bg-accent-amber/10 px-2 py-0.5 rounded-full border border-accent-amber/20 ml-2 whitespace-nowrap">{s.sessionType}</span>
                </div>
                {s.deliveryLink && (
                  <a href={s.deliveryLink} target="_blank" rel="noreferrer"
                    className="text-brand text-xs hover:underline mt-1.5 block">Join session →</a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <div>
          <h2 className="font-display font-semibold text-lg text-white mb-3">MY PENDING TASKS</h2>
          <div className="glass-card divide-y divide-ink-700/50 border border-brand/10">
            {loading ? <div className="flex justify-center py-8"><Spinner /></div>
            : pending === 0 ? (
              <div className="text-center py-10">
                <p className="text-3xl mb-2 opacity-30">◫</p>
                <p className="text-slate-500 text-sm">All caught up!</p>
              </div>
            ) : attempts.filter(a=>a.status==="NOT_STARTED"||a.status==="IN_PROGRESS").slice(0,5).map(a => (
              <div key={a.taskAttemptId} className="p-4 hover:bg-ink-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">Task #{a.taskId}</p>
                    <p className="text-slate-500 text-xs font-mono mt-0.5">{a.type} · {a.attemptedAt||"—"}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                {a.feedback && <p className="text-slate-400 text-xs mt-1.5 italic">"{a.feedback}"</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Certificates */}
        <div>
          <h2 className="font-display font-semibold text-lg text-white mb-3">MY CERTIFICATES</h2>
          <div className="glass-card divide-y divide-ink-700/50 border border-brand/10">
            {loading ? <div className="flex justify-center py-8"><Spinner /></div>
            : completed === 0 ? (
              <div className="text-center py-10">
                <p className="text-3xl mb-2 opacity-30">🎓</p>
                <p className="text-slate-500 text-sm">Complete a course to earn certificates</p>
                <p className="text-slate-600 text-xs mt-1">{enrollments.length > 0 ? `${enrollments.length} in progress` : "Enroll to get started"}</p>
              </div>
            ) : enrollments.filter(e=>e.status==="COMPLETED").map(e => {
              const course = courses.find(c => c.courseId === e.courseId);
              return (
                <div key={e.enrollmentId} className="p-4 hover:bg-ink-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent-teal/10 border border-accent-teal/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">🎓</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white text-sm">{course?.title||`Course #${e.courseId}`}</p>
                      <p className="text-slate-500 text-xs font-mono mt-0.5">Completed · {e.completionDate||"N/A"}</p>
                    </div>
                    <StatusBadge status="COMPLETED" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
