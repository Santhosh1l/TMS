// Safe array extractor
const toArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
};

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { courseService, userService, sessionService, taskService } from "../../services/api";
import { Spinner, StatusBadge } from "../../components/common";

const StatCard = ({ label, value, icon, color, sub, loading }) => (
  <div className="glass-card p-5 hover:border-brand/30 transition-all cursor-default group">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-display font-semibold text-slate-500 uppercase tracking-widest">{label}</span>
      <span className={`text-2xl ${color} group-hover:scale-110 transition-transform`}>{icon}</span>
    </div>
    {loading ? <Spinner size="sm" /> : (
      <>
        <p className={`font-display font-bold text-3xl ${color}`}>{value ?? "—"}</p>
        {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
      </>
    )}
  </div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [recentCourses, setRecentCourses] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [usersRes, coursesRes, sessionsRes, tasksRes] = await Promise.allSettled([
          userService.getAll({}),
          courseService.getAll({ active: true }),
          sessionService.getAll({}),
          taskService.getAll({}),
        ]);
        const users   = usersRes.status   === "fulfilled" ? toArray(usersRes.value.data)   : [];
        const courses = coursesRes.status === "fulfilled" ? toArray(coursesRes.value.data) : [];
        const sessions= sessionsRes.status=== "fulfilled" ? toArray(sessionsRes.value.data): [];
        const tasks   = tasksRes.status   === "fulfilled" ? toArray(tasksRes.value.data)   : [];

        setStats({
          totalUsers:   users.length,
          activeUsers:  users.filter(u => u.status === "ACTIVE").length,
          totalCourses: courses.length,
          totalSessions:sessions.length,
          totalTasks:   tasks.length,
          activeTasks:  tasks.filter(t => t.status === "ACTIVE").length,
        });
        setRecentCourses(courses.slice(0, 6));
        setRecentUsers(users.slice(0, 5));
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mb-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
          <h1 className="font-display font-bold text-3xl text-white tracking-tight">System Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Full control of the Training Management System</p>
        </div>
        <div className="flex items-center gap-2 glass-card px-4 py-2 self-start">
          <div className="w-2 h-2 rounded-full bg-accent-rose animate-pulse" />
          <span className="text-xs font-mono text-accent-rose font-semibold">ADMIN</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users"     value={stats.totalUsers}    icon="◈" color="text-brand"       sub={`${stats.activeUsers ?? 0} active`}  loading={loading} />
        <StatCard label="Active Courses"  value={stats.totalCourses}  icon="◎" color="text-accent-teal"                                           loading={loading} />
        <StatCard label="Sessions"        value={stats.totalSessions} icon="◷" color="text-accent-amber"                                          loading={loading} />
        <StatCard label="Tasks"           value={stats.totalTasks}    icon="◫" color="text-accent-rose" sub={`${stats.activeTasks ?? 0} active`}  loading={loading} />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="font-display font-semibold text-lg text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "New Course",    to: "/courses",  icon: "◎", color: "hover:border-accent-teal/60 hover:bg-accent-teal/5"  },
            { label: "New Session",   to: "/sessions", icon: "◷", color: "hover:border-accent-amber/60 hover:bg-accent-amber/5"},
            { label: "New Task",      to: "/tasks",    icon: "◫", color: "hover:border-accent-rose/60 hover:bg-accent-rose/5"  },
            { label: "Manage Users",  to: "/users",    icon: "◈", color: "hover:border-brand/60 hover:bg-brand/5"              },
          ].map(a => (
            <button key={a.label} onClick={() => navigate(a.to)}
              className={`glass-card p-4 flex items-center gap-3 border transition-all cursor-pointer ${a.color}`}>
              <span className="text-lg opacity-50">{a.icon}</span>
              <span className="font-display font-semibold text-sm text-white">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Courses */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg text-white">Recent Courses</h2>
            <button onClick={() => navigate("/courses")} className="text-brand text-sm hover:text-brand-light transition-colors">View all →</button>
          </div>
          <div className="glass-card overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-10"><Spinner /></div>
            ) : recentCourses.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-10">No courses yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-600">
                    {["Course", "Type", "Mode", "Duration"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-display font-semibold text-slate-500 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentCourses.map(c => (
                    <tr key={c.courseId} onClick={() => navigate("/courses")}
                      className="border-b border-ink-700/50 last:border-0 hover:bg-ink-700/50 transition-colors cursor-pointer">
                      <td className="px-4 py-3 font-medium text-white">{c.title}</td>
                      <td className="px-4 py-3"><StatusBadge status={c.type} /></td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">{c.mode}</td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">{c.durationHours}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg text-white">Recent Users</h2>
            <button onClick={() => navigate("/users")} className="text-brand text-sm hover:text-brand-light transition-colors">View all →</button>
          </div>
          <div className="glass-card overflow-hidden divide-y divide-ink-700/50">
            {loading ? (
              <div className="flex justify-center py-10"><Spinner /></div>
            ) : recentUsers.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-10">No users yet.</p>
            ) : recentUsers.map(u => (
              <div key={u.userId} className="px-4 py-3 hover:bg-ink-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{u.name && u.name !== "string" ? u.name : u.email}</p>
                    <p className="text-xs text-slate-500 font-mono">{u.role ? u.role.replace("ROLE_", "") : "—"}</p>
                  </div>
                  <StatusBadge status={u.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
