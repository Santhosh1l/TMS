import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV_BY_ROLE = {
  ROLE_ADMIN: [
    { group: "Overview", items: [{ to: "/dashboard", label: "Dashboard", icon: "⬡" }] },
    { group: "People",   items: [{ to: "/users",     label: "Users",     icon: "◈" }] },
    { group: "Training", items: [
      { to: "/courses",  label: "Courses",  icon: "◎" },
      { to: "/sessions", label: "Sessions", icon: "◷" },
      { to: "/tasks",    label: "Tasks",    icon: "◫" },
    ]},
  ],
  ROLE_MANAGER: [
    { group: "Overview", items: [{ to: "/dashboard", label: "Dashboard", icon: "⬡" }] },
    { group: "People",   items: [{ to: "/users",     label: "Team",      icon: "◈" }] },
    { group: "Training", items: [{ to: "/courses",   label: "Courses",   icon: "◎" }] },
  ],
  ROLE_TRAINER: [
    { group: "Overview", items: [{ to: "/dashboard", label: "Dashboard", icon: "⬡" }] },
    { group: "Training", items: [
      { to: "/sessions", label: "Sessions",   icon: "◷" },
      { to: "/courses",  label: "My Courses", icon: "◎" },
    ]},
  ],
  ROLE_CO_TRAINER: [
    { group: "Overview", items: [{ to: "/dashboard", label: "Dashboard", icon: "⬡" }] },
    { group: "Training", items: [
      { to: "/tasks",    label: "Tasks",    icon: "◫" },
      { to: "/courses",  label: "Courses",  icon: "◎" },
      { to: "/sessions", label: "Sessions", icon: "◷" },
    ]},
  ],
  ROLE_EMPLOYEE: [
    { group: "Overview",  items: [{ to: "/dashboard", label: "Dashboard", icon: "⬡" }] },
    
  ],
};

const ROLE_COLORS = {
  ROLE_ADMIN:      { dot: "bg-accent-rose",  text: "text-accent-rose",  label: "ADMIN"      },
  ROLE_MANAGER:    { dot: "bg-accent-amber", text: "text-accent-amber", label: "MANAGER"    },
  ROLE_TRAINER:    { dot: "bg-accent-teal",  text: "text-accent-teal",  label: "TRAINER"    },
  ROLE_CO_TRAINER: { dot: "bg-brand",        text: "text-brand",        label: "CO-TRAINER" },
  ROLE_EMPLOYEE:   { dot: "bg-brand",        text: "text-brand",        label: "EMPLOYEE"   },
};

export default function AppLayout() {
  const { logout, role, user } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const navItems  = NAV_BY_ROLE[role] || NAV_BY_ROLE.ROLE_EMPLOYEE;
  const roleColor = ROLE_COLORS[role]  || ROLE_COLORS.ROLE_EMPLOYEE;

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className={`flex flex-col border-r border-ink-700 bg-ink-900 transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}>
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-ink-700">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center flex-shrink-0 shadow-glow-sm">
            <span className="text-white font-display font-bold text-sm">T</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="font-display font-bold text-white text-sm tracking-tight leading-tight">TMS</p>
              <p className="text-slate-500 text-xs">Training System</p>
            </div>
          )}
        </div>

        {/* Role badge */}
        {!collapsed && role && (
          <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-ink-800 border border-ink-600">
            <div className="flex items-center gap-2 mb-0.5">
              <div className={`w-2 h-2 rounded-full ${roleColor.dot} animate-pulse flex-shrink-0`} />
              <span className={`text-xs font-mono font-semibold ${roleColor.text}`}>{roleColor.label}</span>
            </div>
            {user?.name && (
              <p className="text-xs text-slate-300 font-body truncate mt-0.5 pl-4">{user.name}</p>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {navItems.map(group => (
            <div key={group.group} className="mb-5">
              {!collapsed && (
                <p className="text-xs font-display font-semibold text-slate-600 uppercase tracking-widest px-2 mb-1">
                  {group.group}
                </p>
              )}
              {group.items.map(item => (
                <NavLink key={item.to} to={item.to}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""} ${collapsed ? "justify-center px-2" : ""}`
                  }
                >
                  <span className="text-base flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-ink-700 p-3">
          <button onClick={() => setCollapsed(c => !c)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-slate-500 hover:text-white hover:bg-ink-700 transition-all text-xs font-body">
            {collapsed ? "→" : "← Collapse"}
          </button>
          <button onClick={handleLogout}
            className={`w-full flex items-center gap-2 py-2 px-2 rounded-lg text-slate-500 hover:text-accent-rose hover:bg-accent-rose/5 transition-all text-xs font-body mt-1 ${collapsed ? "justify-center" : ""}`}>
            <span>⎋</span>
            {!collapsed && "Sign out"}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto grid-bg">
        <div className="max-w-7xl mx-auto p-6 md:p-8 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
