# TMS Frontend — Training Management System

A production-ready React frontend for the TMS Spring Boot backend.

## Tech Stack

- **React 18** with React Router v6
- **Tailwind CSS** — dark theme with custom design system
- **React Context + hooks** — global auth state
- **Axios** — API layer with JWT interceptors

## Project Structure

```
src/
├── context/
│   └── AuthContext.jsx          # Global auth state (login/logout/register)
├── services/
│   └── api.js                   # All API calls (axios, JWT headers)
├── utils/
│   └── enums.js                 # Enum constants + status color map
├── components/
│   ├── common/index.jsx         # Shared UI: Table, Modal, Badge, etc.
│   └── layout/
│       ├── AppLayout.jsx        # Sidebar + main layout
│       └── ProtectedRoute.jsx   # Auth guard
└── pages/
    ├── auth/
    │   ├── LoginPage.jsx
    │   └── RegisterPage.jsx
    ├── users/
    │   └── UsersPage.jsx
    ├── courses/
    │   ├── CoursesPage.jsx
    │   └── EnrollmentsPage.jsx
    ├── sessions/
    │   ├── SessionsPage.jsx
    │   └── AttendancePage.jsx
    ├── tasks/
    │   ├── TasksPage.jsx
    │   └── TaskAttemptsPage.jsx
    └── DashboardPage.jsx
```

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env: set REACT_APP_API_URL=http://localhost:8080

# 3. Start dev server
npm start
```

App runs at `http://localhost:3000`

## Pages & Features

| Page | Route | Features |
|------|-------|---------|
| Login | `/login` | JWT auth, form validation |
| Register | `/register` | All RegisterDTO fields |
| Dashboard | `/dashboard` | Stats, quick actions, recent courses |
| Users | `/users` | List, filter by role/status, edit, delete |
| Courses | `/courses` | CRUD, active filter |
| Enrollments | `/courses/:id/enrollments` | Enroll, progress slider, remove |
| Sessions | `/sessions` | CRUD, toggle recurring, filter |
| Attendance | `/sessions/:id/attendance` | Record, update status, delete, summary |
| Tasks | `/tasks` | CRUD, filter by type/status/course |
| Task Attempts | `/tasks/:id/attempts` | Record, grade (score + feedback), delete |

## API Configuration

The JWT token is automatically attached to every request via an Axios interceptor.
A 401 response automatically clears the session and redirects to `/login`.

Set `REACT_APP_API_URL` in `.env` to point to your Spring Boot backend.
