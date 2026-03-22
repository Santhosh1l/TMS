import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { courseService, userService, sessionService, taskService, toArray } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Spinner, StatusBadge } from "../../components/common";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats]             = useState({});
  const [recentCourses, setRecentCourses] = useState([]);
  const [recentUsers, setRecentUsers]     = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.allSettled([
      userService.getAll({}),
      courseService.getAll({ active: true }),
      sessionService.getAll({}),
      taskService.getAll({}),
    ]).then(([u, c, s, t]) => {
      const users   = u.status === "fulfilled" ? toArray(u.value.data) : [];
      const courses = c.status === "fulfilled" ? toArray(c.value.data) : [];
      const sessions= s.status === "fulfilled" ? toArray(s.value.data) : [];
      const tasks   = t.status === "fulfilled" ? toArray(t.value.data) : [];
      setStats({
        users: users.length, activeUsers: users.filter(x => x.status === "ACTIVE").length,
        courses: courses.length, sessions: sessions.length,
        tasks: tasks.length, openTasks: tasks.filter(x => x.status === "OPEN").length,
      });
      setRecentCourses(courses.slice(0, 5));
      setRecentUsers(users.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mb-1">
            {new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
          </p>
          <h1 className="font-display font-bold text-3xl text-white">
            {user?.name ? `Welcome, ${user.name.split(" ")[0]}` : "System Overview"}
          </h1>
          <p className="text-slate-400 text-sm mt-1">Full control of the Training Management System</p>
        </div>
        <div className="glass-card px-4 py-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-rose animate-pulse" />
          <span className="text-xs font-mono text-accent-rose font-bold">ADMIN</span>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label:"Total Users",    value: stats.users,    sub:`${stats.activeUsers||0} active`,  color:"text-brand",        bg:"border-brand/20",       icon:"◈" },
          { label:"Active Courses", value: stats.courses,  sub:"currently running",               color:"text-accent-teal",  bg:"border-accent-teal/20", icon:"◎" },
          { label:"Sessions",       value: stats.sessions, sub:"all sessions",                    color:"text-accent-amber", bg:"border-accent-amber/20",icon:"◷" },
          { label:"Tasks",          value: stats.tasks,    sub:`${stats.openTasks||0} open`,      color:"text-accent-rose",  bg:"border-accent-rose/20", icon:"◫" },
        ].map(({ label, value, sub, color, bg, icon }) => (
          <div key={label} className={`glass-card border ${bg} p-5`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-display font-semibold text-slate-500 uppercase tracking-widest">{label}</span>
              <span className={`text-xl ${color}`}>{icon}</span>
            </div>
            {loading ? <Spinner size="sm" /> : <>
              <p className={`font-display font-bold text-3xl ${color}`}>{value ?? "—"}</p>
              <p className="text-slate-500 text-xs mt-1">{sub}</p>
            </>}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="font-display font-semibold text-lg text-white mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label:"+ New Course",  to:"/courses",  color:"hover:border-accent-teal/60 hover:bg-accent-teal/5"  },
            { label:"+ New Session", to:"/sessions", color:"hover:border-accent-amber/60 hover:bg-accent-amber/5"},
            { label:"+ New Task",    to:"/tasks",    color:"hover:border-accent-rose/60 hover:bg-accent-rose/5"  },
            { label:"Manage Users",  to:"/users",    color:"hover:border-brand/60 hover:bg-brand/5"              },
          ].map(a => (
            <button key={a.label} onClick={() => navigate(a.to)}
              className={`glass-card p-4 text-left font-display font-semibold text-sm text-white border transition-all ${a.color}`}>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Two-column tables */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Courses */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-lg text-white">Recent Courses</h2>
            <button onClick={() => navigate("/courses")} className="text-brand text-sm hover:text-brand-light">View all →</button>
          </div>
          <div className="glass-card overflow-hidden">
            {loading ? <div className="flex justify-center py-8"><Spinner /></div>
            : recentCourses.length === 0 ? <p className="text-slate-500 text-sm text-center py-8">No courses yet</p>
            : <table className="w-full text-sm">
              <thead><tr className="border-b border-ink-600">
                {["Course","Type","Mode","Duration"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-display font-semibold text-slate-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {recentCourses.map(c => (
                  <tr key={c.courseId} className="border-b border-ink-700/50 last:border-0 hover:bg-ink-700/50 cursor-pointer"
                    onClick={() => navigate("/courses")}>
                    <td className="px-4 py-3 font-medium text-white">{c.title}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.type} /></td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{c.mode}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{c.durationHours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>}
          </div>
        </div>

        {/* Recent Users */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-lg text-white">Recent Users</h2>
            <button onClick={() => navigate("/users")} className="text-brand text-sm hover:text-brand-light">View all →</button>
          </div>
          <div className="glass-card divide-y divide-ink-700/50">
            {loading ? <div className="flex justify-center py-8"><Spinner /></div>
            : recentUsers.map(u => (
              <div key={u.userId} className="px-4 py-3 flex items-center justify-between hover:bg-ink-700/50">
                <div>
                  <p className="text-sm font-medium text-white">{u.name}</p>
                  <p className="text-xs text-slate-500 font-mono">{u.role?.replace("ROLE_","")}</p>
                </div>
                <StatusBadge status={u.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
