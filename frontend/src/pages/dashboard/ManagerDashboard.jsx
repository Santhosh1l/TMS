import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService, courseService, enrollService, toArray } from "../../services/api";
import { Spinner, StatusBadge } from "../../components/common";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [team, setTeam]         = useState([]);
  const [courses, setCourses]   = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.allSettled([
      userService.getAll({ role: "ROLE_EMPLOYEE" }),
      courseService.getAll({ active: true }),
    ]).then(async ([u, c]) => {
      const members = u.status === "fulfilled" ? toArray(u.value.data) : [];
      const courseList = c.status === "fulfilled" ? toArray(c.value.data) : [];
      setTeam(members);
      setCourses(courseList);
      if (courseList.length > 0) {
        const res = await Promise.allSettled(courseList.slice(0,4).map(x => enrollService.getAll(x.courseId)));
        setEnrollments(res.filter(r => r.status==="fulfilled").flatMap(r => toArray(r.value.data)));
      }
    }).finally(() => setLoading(false));
  }, []);

  const completed   = enrollments.filter(e => e.status === "COMPLETED").length;
  const inProgress  = enrollments.filter(e => e.status === "IN_PROGRESS").length;
  const departments = [...new Set(team.map(m => m.department).filter(Boolean))];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mb-1">Manager Dashboard</p>
          <h1 className="font-display font-bold text-3xl text-white">Team Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Monitor your team's training and progress</p>
        </div>
        <div className="glass-card px-4 py-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-amber animate-pulse" />
          <span className="text-xs font-mono text-accent-amber font-bold">MANAGER</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label:"Team Members",  value:team.length,        sub:`${team.filter(m=>m.status==="ACTIVE").length} active`, color:"text-accent-amber", icon:"◈" },
          { label:"Enrollments",   value:enrollments.length, sub:`${inProgress} in progress`,  color:"text-brand",        icon:"◎" },
          { label:"Completed",     value:completed,          sub:"courses finished",            color:"text-accent-teal",  icon:"✓" },
          { label:"Departments",   value:departments.length, sub:"across team",                 color:"text-accent-rose",  icon:"⬡" },
        ].map(({ label, value, sub, color, icon }) => (
          <div key={label} className="glass-card p-5 border border-accent-amber/10 hover:border-accent-amber/30 transition-all">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Team Members */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-lg text-white">Team Members</h2>
            <button onClick={() => navigate("/users")} className="text-accent-amber text-sm hover:text-amber-300">View all →</button>
          </div>
          <div className="glass-card overflow-hidden border border-accent-amber/10">
            {loading ? <div className="flex justify-center py-8"><Spinner /></div>
            : team.length === 0 ? <p className="text-slate-500 text-sm text-center py-8">No team members</p>
            : <table className="w-full text-sm">
              <thead><tr className="border-b border-ink-600">
                {["Name","Department","Status"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-display font-semibold text-slate-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {team.slice(0,7).map(m => (
                  <tr key={m.userId} className="border-b border-ink-700/50 last:border-0 hover:bg-ink-700/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white text-sm">{m.name}</p>
                      <p className="text-slate-500 text-xs">{m.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs font-mono">{m.department || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>}
          </div>
        </div>

        {/* Course Progress */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-lg text-white">Course Progress</h2>
            <button onClick={() => navigate("/courses")} className="text-accent-amber text-sm hover:text-amber-300">Manage →</button>
          </div>
          <div className="glass-card divide-y divide-ink-700/50 border border-accent-amber/10">
            {loading ? <div className="flex justify-center py-8"><Spinner /></div>
            : courses.length === 0 ? <p className="text-slate-500 text-sm text-center py-8">No courses</p>
            : courses.slice(0,5).map(c => {
              const ces = enrollments.filter(e => e.courseId === c.courseId);
              const avg = ces.length ? Math.round(ces.reduce((s,e) => s+(e.progressPercent||0),0)/ces.length) : 0;
              return (
                <div key={c.courseId} className="p-4 hover:bg-ink-700/50 cursor-pointer"
                  onClick={() => navigate(`/courses/${c.courseId}/enrollments`)}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-white text-sm truncate max-w-[200px]">{c.title}</p>
                    <span className="text-xs font-mono text-slate-400 ml-2">{ces.length} enrolled</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-ink-600 rounded-full overflow-hidden">
                      <div className="h-full bg-accent-amber rounded-full transition-all" style={{width:`${avg}%`}} />
                    </div>
                    <span className="text-xs font-mono text-slate-300 w-10 text-right">{avg}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Enrollments Table */}
      <div>
        <h2 className="font-display font-semibold text-lg text-white mb-3">Team Enrollments</h2>
        <div className="glass-card overflow-hidden border border-accent-amber/10">
          {loading ? <div className="flex justify-center py-8"><Spinner /></div>
          : enrollments.length === 0 ? <p className="text-slate-500 text-sm text-center py-8">No enrollments found</p>
          : <table className="w-full text-sm">
            <thead><tr className="border-b border-ink-600">
              {["User","Course","Role","Status","Progress","Assigned"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-display font-semibold text-slate-500 uppercase tracking-widest">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {enrollments.slice(0,8).map(e => (
                <tr key={e.enrollmentId} className="border-b border-ink-700/50 last:border-0 hover:bg-ink-700/50">
                  <td className="px-4 py-3 font-mono text-xs text-white">#{e.userId}</td>
                  <td className="px-4 py-3 font-mono text-xs text-accent-amber">#{e.courseId}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{e.memberRole?.replace("ROLE_","")}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-ink-600 rounded-full overflow-hidden">
                        <div className="h-full bg-accent-amber rounded-full" style={{width:`${e.progressPercent||0}%`}} />
                      </div>
                      <span className="text-xs font-mono text-slate-400">{e.progressPercent||0}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{e.assignedOn||"—"}</td>
                </tr>
              ))}
            </tbody>
          </table>}
        </div>
      </div>
    </div>
  );
}
