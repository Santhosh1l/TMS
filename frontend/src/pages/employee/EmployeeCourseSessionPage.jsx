import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { sessionService, taskService, courseService, toArray } from "../../services/api";
import { Spinner, StatusBadge } from "../../components/common";

export default function EmployeeCourseSessionPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sessionsRes, tasksRes, courseRes] = await Promise.allSettled([
          sessionService.getAll({ courseId }),
          taskService.getAll({ courseId }),
          courseService.getById(courseId),
        ]);
        if (sessionsRes.status === "fulfilled") setSessions(toArray(sessionsRes.value.data));
        if (tasksRes.status === "fulfilled")    setTasks(toArray(tasksRes.value.data));
        if (courseRes.status === "fulfilled")   setCourse(courseRes.value.data);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [courseId]);

  return (
    <div className="animate-fade-in">
      <div className="mb-2">
        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">← Back</button>
      </div>

      <div className="mb-8">
        <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mb-1">Course Sessions</p>
        <h1 className="font-display font-bold text-3xl text-white tracking-tight">
          {course?.title || `Course #${courseId}`}
        </h1>
        {course && (
          <p className="text-slate-400 text-sm mt-1">{course.mode} · {course.durationHours}h · {course.type}</p>
        )}
      </div>

      {/* Sessions with Join links and tasks */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : sessions.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-3xl mb-2 opacity-30">◷</p>
          <p className="text-slate-500 text-sm">No sessions scheduled for this course yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map(s => {
            const sessionTasks = tasks.filter(t => t.sessionId === s.sessionId);
            return (
              <div key={s.sessionId} className="glass-card p-5 hover:border-brand/20 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-display font-semibold text-white">{s.title}</p>
                    <p className="text-slate-500 text-xs font-mono mt-0.5">
                      {s.sessionDate || "Date TBD"}{s.startTime ? ` · ${s.startTime} - ${s.endTime}` : ""}
                      {s.room ? ` · 📍 ${s.room}` : ""}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-accent-amber bg-accent-amber/10 px-2 py-0.5 rounded-full border border-accent-amber/20 ml-3 whitespace-nowrap">
                    {s.sessionType}
                  </span>
                </div>

                {/* Session links */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {s.deliveryLink && (
                    <a href={s.deliveryLink} target="_blank" rel="noreferrer"
                      className="text-xs btn-primary py-1.5 px-3">
                      Session Link for GMeet
                    </a>
                  )}
                  {s.recordingLink && (
                    <a href={s.recordingLink} target="_blank" rel="noreferrer"
                      className="text-xs btn-secondary py-1.5 px-3">
                      Recorded Video
                    </a>
                  )}
                </div>

                {/* Daily Quiz / Tasks for this session */}
                {sessionTasks.length > 0 && (
                  <div className="border-t border-ink-700/50 pt-3 space-y-2">
                    {sessionTasks.map(t => (
                      <div key={t.taskId} className="flex items-center justify-between bg-ink-700/40 rounded-lg p-3">
                        <div>
                          <p className="text-white text-sm font-medium">{t.title}</p>
                          <p className="text-slate-500 text-xs font-mono">Due: {t.submissionDeadline || "—"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={t.status} />
                          <button
                            onClick={() => navigate(`/employee/tasks/${t.taskId}/submit`)}
                            className="text-xs bg-brand/20 hover:bg-brand/30 text-brand px-3 py-1 rounded border border-brand/30 transition-colors whitespace-nowrap"
                          >
                            Daily {t.type === "QUIZ" ? "Quiz" : "Task"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
