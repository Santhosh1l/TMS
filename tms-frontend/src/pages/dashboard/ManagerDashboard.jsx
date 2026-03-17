// Safe array extractor
const toArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
};

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService, courseService, enrollService } from "../../services/api";
import { Spinner, StatusBadge } from "../../components/common";
import { useAuth } from "../../context/AuthContext";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [usersRes, coursesRes] = await Promise.allSettled([
          userService.getAll({ role: "EMPLOYEE" }),
          courseService.getAll({ active: true }),
        ]);
        const members = usersRes.status === "fulfilled" ? toArray(usersRes.value.data) : [];
        const courseList = coursesRes.status === "fulfilled" ? toArray(coursesRes.value.data) : [];
        setTeamMembers(members);
        setCourses(courseList);

        // Fetch enrollments for first few courses to show progress
        if (courseList.length > 0) {
          const enrollRes = await Promise.allSettled(
            courseList.slice(0, 4).map(c => enrollService.getAll(c.courseId))
          );
          const allEnrollments = enrollRes
            .filter(r => r.status === "fulfilled")
            .flatMap(r => toArray(r.value.data));
          setEnrollments(allEnrollments);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const activeMembers   = teamMembers.filter(m => m.status === "ACTIVE").length;
  const completedEnroll = enrollments.filter(e => e.status === "COMPLETED").length;
  const inProgress      = enrollments.filter(e => e.status === "IN_PROGRESS").length;
  const departments     = [...new Set(teamMembers.map(m => m.department).filter(Boolean))];

  // Group enrollments by courseId for progress display
  const enrollByCourse = courses.slice(0, 4).map(c => {
    const ces = enrollments.filter(e => e.courseId === c.courseId);
    const avg = ces.length
      ? Math.round(ces.reduce((s, e) => s + (e.progressPercent || 0), 0) / ces.length)
      : 0;
    return { ...c, enrollCount: ces.length, avgProgress: avg };
  });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mb-1">Manager Dashboard</p>
          <h1 className="font-display font-bold text-3xl text-white tracking-tight">Team Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Monitor your team's training progress and enrollments</p>
        </div>
        <div className="flex items-center gap-2 glass-card px-4 py-2 self-start">
          <div className="w-2 h-2 rounded-full bg-accent-amber animate-pulse" />
          <span className="text-xs font-mono text-accent-amber font-semibold">MANAGER</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Team Members",  value: teamMembers.length,  sub: `${activeMembers} active`,    icon: "◈", color: "text-brand"        },
          { label: "Enrollments",   value: enrollments.length,  sub: `${inProgress} in progress`,  icon: "◎", color: "text-accent-teal"  },
          { label: "Completed",     value: completedEnroll,     sub: "courses finished",           icon: "✓", color: "text-accent-teal"  },
          { label: "Departments",   value: departments.length,  sub: "across team",                icon: "⬡", color: "text-accent-amber" },
        ].map(({ label, value, sub, icon, color }) => (
          <div key={label} className="glass-card p-5 hover:border-brand/30 transition-all cursor-default">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-display font-semibold text-slate-500 uppercase tracking-widest">{label}</span>
              <span className={`text-2xl ${color}`}>{icon}</span>
            </div>
            {loading ? <Spinner size="sm" /> : (
              <>
                <p className={`font-display font-bold text-3xl ${color}`}>{value ?? "—"}</p>
                {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Team Members */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg text-white">Team Members</h2>
            <button onClick={() => navigate("/users")} className="text-brand text-sm hover:text-brand-light transition-colors">View all →</button>
          </div>
          <div className="glass-card overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-10"><Spinner /></div>
            ) : teamMembers.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-10">No team members found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-600">
                    {["Name", "Department", "Status"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-display font-semibold text-slate-500 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.slice(0, 7).map(m => (
                    <tr key={m.userId} className="border-b border-ink-700/50 last:border-0 hover:bg-ink-700/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-white text-sm">{m.name}</p>
                        <p className="text-slate-500 text-xs">{m.email}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs font-mono">{m.department || "—"}</td>
                      <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Overall Course Progress */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg text-white">Course Progress</h2>
            <button onClick={() => navigate("/courses")} className="text-brand text-sm hover:text-brand-light transition-colors">Manage →</button>
          </div>
          <div className="glass-card divide-y divide-ink-700/50">
            {loading ? (
              <div className="flex justify-center py-10"><Spinner /></div>
            ) : enrollByCourse.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-10">No course data available.</p>
            ) : enrollByCourse.map(c => (
              <div key={c.courseId} className="p-4 hover:bg-ink-700/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/courses/${c.courseId}/enrollments`)}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-white text-sm truncate max-w-[200px]">{c.title}</p>
                  <span className="text-xs font-mono text-slate-400">{c.enrollCount} enrolled</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-ink-600 rounded-full overflow-hidden">
                    <div className="h-full bg-brand rounded-full transition-all duration-500"
                      style={{ width: `${c.avgProgress}%` }} />
                  </div>
                  <span className="text-xs font-mono text-slate-300 w-10 text-right">{c.avgProgress}%</span>
                </div>
                <p className="text-xs text-brand mt-1">View enrollments →</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Enrollments Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg text-white">Team Course Enrollments</h2>
        </div>
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : enrollments.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-10">No enrollments found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-600">
                  {["User ID", "Course ID", "Role", "Status", "Progress", "Assigned On"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-display font-semibold text-slate-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enrollments.slice(0, 8).map(e => (
                  <tr key={e.enrollmentId} className="border-b border-ink-700/50 last:border-0 hover:bg-ink-700/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-white">#{e.userId}</td>
                    <td className="px-4 py-3 font-mono text-xs text-brand">#{e.courseId}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{e.memberRole}</td>
                    <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-ink-600 rounded-full overflow-hidden">
                          <div className="h-full bg-brand rounded-full" style={{ width: `${e.progressPercent || 0}%` }} />
                        </div>
                        <span className="text-xs font-mono text-slate-400">{e.progressPercent || 0}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{e.assignedOn || "—"}</td>
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
