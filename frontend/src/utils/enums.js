// ── Matches actual DB check constraints ──────────────────────────
export const USER_ROLES    = ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_TRAINER", "ROLE_CO_TRAINER", "ROLE_EMPLOYEE"];
export const USER_STATUSES = ["ACTIVE", "INACTIVE"];

export const COURSE_TYPES  = ["TECH", "C2C", "SOFT_SKILLS", "COMPLIANCE"];
export const COURSE_MODES  = ["ONLINE", "OFFLINE", "HYBRID"];

export const SESSION_TYPES = ["TECH_MORNING", "TECH_AFTERNOON", "C2C_EVENING", "ASSIGNMENT_WINDOW"];

export const ATTENDANCE_STATUSES = ["PRESENT", "ABSENT", "LATE"];

export const TASK_TYPES    = ["QUIZ", "ASSIGNMENT"];
export const TASK_STATUSES = ["SCHEDULED", "OPEN", "CLOSED"];

export const TASK_ATTEMPT_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "SUBMITTED", "MISSED"];

export const COURSE_MEMBER_ROLES    = ["ROLE_TRAINER", "ROLE_CO_TRAINER", "ROLE_EMPLOYEE"];
export const COURSE_MEMBER_STATUSES = ["ASSIGNED", "IN_PROGRESS", "ON_HOLD", "WITHDRAWN", "COMPLETED"];

export const STATUS_COLORS = {
  // User status
  ACTIVE:   "text-accent-teal bg-accent-teal/10 border-accent-teal/30",
  INACTIVE: "text-slate-400 bg-slate-400/10 border-slate-400/30",

  // Task statuses
  SCHEDULED: "text-slate-400 bg-slate-400/10 border-slate-400/30",
  OPEN:      "text-accent-teal bg-accent-teal/10 border-accent-teal/30",
  CLOSED:    "text-slate-500 bg-slate-500/10 border-slate-500/30",

  // Task attempt statuses
  NOT_STARTED: "text-slate-400 bg-slate-400/10 border-slate-400/30",
  IN_PROGRESS: "text-accent-amber bg-accent-amber/10 border-accent-amber/30",
  SUBMITTED:   "text-brand bg-brand/10 border-brand/30",
  MISSED:      "text-accent-rose bg-accent-rose/10 border-accent-rose/30",

  // Attendance
  PRESENT: "text-accent-teal bg-accent-teal/10 border-accent-teal/30",
  ABSENT:  "text-accent-rose bg-accent-rose/10 border-accent-rose/30",
  LATE:    "text-accent-amber bg-accent-amber/10 border-accent-amber/30",

  // Enrollment / course member
  ASSIGNED:   "text-brand bg-brand/10 border-brand/30",
  ON_HOLD:    "text-accent-amber bg-accent-amber/10 border-accent-amber/30",
  WITHDRAWN:  "text-slate-400 bg-slate-400/10 border-slate-400/30",
  COMPLETED:  "text-accent-teal bg-accent-teal/10 border-accent-teal/30",

  // Course types
  TECH:        "text-brand bg-brand/10 border-brand/30",
  C2C:         "text-accent-amber bg-accent-amber/10 border-accent-amber/30",
  SOFT_SKILLS: "text-accent-teal bg-accent-teal/10 border-accent-teal/30",
  COMPLIANCE:  "text-accent-rose bg-accent-rose/10 border-accent-rose/30",
};
