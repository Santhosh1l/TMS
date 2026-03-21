import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

// Auth
import LoginPage from "./pages/auth/LoginPage";

// Shared pages
import DashboardPage      from "./pages/DashboardPage";
import UsersPage          from "./pages/users/UsersPage";
import CoursesPage        from "./pages/courses/CoursesPage";
import EnrollmentsPage    from "./pages/courses/EnrollmentsPage";
import SessionsPage       from "./pages/sessions/SessionsPage";
import AttendancePage     from "./pages/sessions/AttendancePage";
import TasksPage          from "./pages/tasks/TasksPage";
import TaskAttemptsPage   from "./pages/tasks/TaskAttemptsPage";

// Trainer pages
import TrainerSessionPage from "./pages/trainer/TrainerSessionPage";

// Co-Trainer pages
import CoTrainerTaskForm  from "./pages/cotrainer/CoTrainerTaskForm";

// Employee pages
import EmployeeCourseSessionPage from "./pages/employee/EmployeeCourseSessionPage";
import EmployeeTaskSubmitPage    from "./pages/employee/EmployeeTaskSubmitPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />

            {/* Admin / Manager shared */}
            <Route path="users"    element={<UsersPage />} />
            <Route path="courses"  element={<CoursesPage />} />
            <Route path="courses/:courseId/enrollments" element={<EnrollmentsPage />} />
            <Route path="sessions" element={<SessionsPage />} />
            <Route path="sessions/:sessionId/attendance" element={<AttendancePage />} />
            <Route path="tasks"    element={<TasksPage />} />
            <Route path="tasks/:taskId/attempts" element={<TaskAttemptsPage />} />

            {/* Trainer */}
            <Route path="trainer/sessions/:sessionId" element={<TrainerSessionPage />} />

            {/* Co-Trainer */}
            <Route path="cotrainer/tasks/create" element={<CoTrainerTaskForm />} />

            {/* Employee */}
            <Route path="employee/courses/:courseId" element={<EmployeeCourseSessionPage />} />
            <Route path="employee/tasks/:taskId/submit" element={<EmployeeTaskSubmitPage />} />
            <Route path="employee/tasks"  element={<TaskAttemptsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
