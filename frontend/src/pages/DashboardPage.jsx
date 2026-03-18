import React from "react";
import { useAuth } from "../context/AuthContext";
import AdminDashboard     from "./dashboard/AdminDashboard";
import ManagerDashboard   from "./dashboard/ManagerDashboard";
import EmployeeDashboard  from "./dashboard/EmployeeDashboard";
import TrainerDashboard   from "./trainer/TrainerDashboard";
import CoTrainerDashboard from "./cotrainer/CoTrainerDashboard";

export default function DashboardPage() {
  const { role, user } = useAuth();

  // Debug — remove after confirming role works
  console.log("Dashboard role:", role, "user:", user);

  if (role === "ROLE_ADMIN")       return <AdminDashboard />;
  if (role === "ROLE_MANAGER")     return <ManagerDashboard />;
  if (role === "ROLE_TRAINER")     return <TrainerDashboard />;
  if (role === "ROLE_CO_TRAINER")  return <CoTrainerDashboard />;
  if (role === "ROLE_EMPLOYEE")    return <EmployeeDashboard />;

  // Fallback while role loads
  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-8 h-8 border-2 border-brand/20 border-t-brand rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-mono">Loading dashboard...</p>
        <p className="text-slate-600 text-xs">Role detected: {String(role)}</p>
      </div>
    );
  }

  return <EmployeeDashboard />;
}
