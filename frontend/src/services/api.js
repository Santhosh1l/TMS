import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8081";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tms_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("tms_token");
      localStorage.removeItem("tms_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ─── Safe array extractor ─────────────────────────────────────────
// Handles: plain array, array-like object {0:..,1:..}, Spring Page,
//          wrapped { data: [] }
export const toArray = (data) => {
  if (!data) return [];
  // Plain JS array
  if (Array.isArray(data)) return data;
  // Spring Page<T>
  if (Array.isArray(data.content)) return data.content;
  // Wrapped response
  if (Array.isArray(data.data)) return data.data;
  // Array-like object with numeric keys {0:.., 1:.., length:..}
  // This happens when Spring returns a JSON array that axios parses oddly
  if (typeof data === "object") {
    const keys = Object.keys(data);
    // Check if all keys are numeric — it's an array-like object
    const numericKeys = keys.filter(k => !isNaN(k));
    if (numericKeys.length > 0 && numericKeys.length === keys.length) {
      return Object.values(data);
    }
    // Any property that is an array
    for (const key of keys) {
      if (Array.isArray(data[key])) return data[key];
    }
  }
  return [];
};

// ─── AUTH ────────────────────────────────────────────────────────
export const authService = {
  login:    (data) => api.post("/api/tms/auth/login", data),
  register: (data) => api.post("/api/tms/auth/register", data),
};

// ─── USERS ───────────────────────────────────────────────────────
export const userService = {
  getAll: (params) => api.get("/api/tms/users", { params }),
  getById: (id)    => api.get(`/api/tms/users/${id}`),
  update:  (data)  => api.put("/api/tms/users", data),
  delete:  (id)    => api.delete(`/api/tms/users/${id}`),
};

// ─── COURSES ─────────────────────────────────────────────────────
export const courseService = {
  getAll:  (params) => api.get("/api/tms/courses", { params }),
  getById: (id)     => api.get(`/api/tms/courses/${id}`),
  create:  (data)   => api.post("/api/tms/courses", data),
  update:  (data)   => api.put("/api/tms/courses", data),
  delete:  (id)     => api.delete(`/api/tms/courses/${id}`),
};

// ─── ENROLLMENTS ─────────────────────────────────────────────────
export const enrollService = {
  getAll:         (courseId, params) => api.get(`/api/tms/course/${courseId}/enrollments`, { params }),
  getById:        (courseId, enrollmentId) => api.get(`/api/tms/course/${courseId}/enrollments/${enrollmentId}`),
  enroll:         (courseId, data)   => api.post(`/api/tms/course/${courseId}/enrollments`, data),
  updateProgress: (courseId, data)   => api.put(`/api/tms/course/${courseId}/enrollments`, data),
  delete:         (courseId, enrollmentId) => api.delete(`/api/tms/course/${courseId}/enrollments/${enrollmentId}`),
};

// ─── SESSIONS ────────────────────────────────────────────────────
export const sessionService = {
  getAll:          (params) => api.get("/api/tms/sessions", { params }),
  getById:         (id)     => api.get(`/api/tms/sessions/${id}`),
  create:          (data)   => api.post("/api/tms/sessions", data),
  update:          (data)   => api.put("/api/tms/sessions", data),
  toggleRecurring: (id)     => api.patch(`/api/tms/sessions/${id}`),
  delete:          (id)     => api.delete(`/api/tms/sessions/${id}`),
};

// ─── ATTENDANCE ──────────────────────────────────────────────────
export const attendanceService = {
  getAll:       (sessionId, params) => api.get(`/api/tms/session/${sessionId}/attendance`, { params }),
  getById:      (sessionId, attendanceId) => api.get(`/api/tms/session/${sessionId}/attendance/${attendanceId}`),
  create:       (sessionId, data)   => api.post(`/api/tms/session/${sessionId}/attendance`, data),
  update:       (sessionId, data)   => api.put(`/api/tms/session/${sessionId}/attendance`, data),
  updateStatus: (sessionId, attendanceId, status) =>
    api.patch(`/api/tms/session/${sessionId}/attendance/${attendanceId}`, null, { params: { status } }),
  delete:       (sessionId, attendanceId) => api.delete(`/api/tms/session/${sessionId}/attendance/${attendanceId}`),
};

// ─── TASKS ───────────────────────────────────────────────────────
export const taskService = {
  getAll:  (params) => api.get("/api/tms/tasks", { params }),
  getById: (id)     => api.get(`/api/tms/tasks/${id}`),
  create:  (data)   => api.post("/api/tms/tasks", data),
  update:  (data)   => api.put("/api/tms/tasks", data),
  delete:  (id)     => api.delete(`/api/tms/tasks/${id}`),
};

// ─── TASK ATTEMPTS ───────────────────────────────────────────────
export const taskAttemptService = {
  getAll:  (params) => api.get("/api/tms/task-attempts", { params }),
  getById: (id)     => api.get(`/api/tms/task-attempts/${id}`),
  create:  (data)   => api.post("/api/tms/task-attempts", data),
  update:  (data)   => api.put("/api/tms/task-attempts", data),
  delete:  (id)     => api.delete(`/api/tms/task-attempts/${id}`),
};

export default api;
