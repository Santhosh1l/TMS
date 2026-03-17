import React from "react";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "./dashboard/AdminDashboard";
import ManagerDashboard from "./dashboard/ManagerDashboard";
import EmployeeDashboard from "./dashboard/EmployeeDashboard";

export default function DashboardPage() {
  const { role } = useAuth();

  if (role === "ADMIN") return <AdminDashboard />;
  if (role === "MANAGER") return <ManagerDashboard />;
  return <EmployeeDashboard />;
}
