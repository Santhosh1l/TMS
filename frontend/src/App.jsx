import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

// Auth
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Pages
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/users/UsersPage";
import CoursesPage from "./pages/courses/CoursesPage";
import EnrollmentsPage from "./pages/courses/EnrollmentsPage";
import SessionsPage from "./pages/sessions/SessionsPage";
import AttendancePage from "./pages/sessions/AttendancePage";
import TasksPage from "./pages/tasks/TasksPage";
import TaskAttemptsPage from "./pages/tasks/TaskAttemptsPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="courses/:courseId/enrollments" element={<EnrollmentsPage />} />
            <Route path="sessions" element={<SessionsPage />} />
            <Route path="sessions/:sessionId/attendance" element={<AttendancePage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="tasks/:taskId/attempts" element={<TaskAttemptsPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
