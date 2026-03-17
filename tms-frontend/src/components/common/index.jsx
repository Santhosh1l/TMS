import React from "react";
import { STATUS_COLORS } from "../../utils/enums";

// ─── STATUS BADGE ───────────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const cls = STATUS_COLORS[status] || "text-slate-400 bg-slate-400/10 border-slate-400/30";
  return (
    <span className={`status-badge border ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
};

// ─── SPINNER ────────────────────────────────────────────────────
export const Spinner = ({ size = "md", className = "" }) => {
  const s = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-10 h-10" : "w-6 h-6";
  return (
    <div className={`${s} ${className} border-2 border-brand/20 border-t-brand rounded-full animate-spin`} />
  );
};

// ─── MODAL ──────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, size = "md" }) => {
  if (!open) return null;
  const maxW = size === "lg" ? "max-w-2xl" : size === "sm" ? "max-w-sm" : "max-w-lg";
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-box ${maxW}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ─── CONFIRM DIALOG ─────────────────────────────────────────────
export const ConfirmDialog = ({ open, onClose, onConfirm, title, message, loading }) => (
  <Modal open={open} onClose={onClose} title={title} size="sm">
    <p className="text-slate-400 text-sm mb-6">{message}</p>
    <div className="flex gap-3 justify-end">
      <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
      <button className="btn-danger" onClick={onConfirm} disabled={loading}>
        {loading ? <Spinner size="sm" className="mx-auto" /> : "Confirm"}
      </button>
    </div>
  </Modal>
);

// ─── EMPTY STATE ────────────────────────────────────────────────
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="text-5xl mb-4 opacity-40">{icon}</div>
    <p className="font-display font-semibold text-white text-lg mb-1">{title}</p>
    <p className="text-slate-500 text-sm mb-6">{description}</p>
    {action}
  </div>
);

// ─── FORM FIELD ─────────────────────────────────────────────────
export const FormField = ({ label, error, children }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="label">{label}</label>}
    {children}
    {error && <span className="text-accent-rose text-xs mt-0.5">{error}</span>}
  </div>
);

// ─── SELECT FIELD ───────────────────────────────────────────────
export const SelectField = ({ label, value, onChange, options, placeholder, error, name }) => (
  <FormField label={label} error={error}>
    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      className="input-field appearance-none"
    >
      <option value="">{placeholder || "Select..."}</option>
      {options.map((opt) => (
        <option key={opt.value ?? opt} value={opt.value ?? opt}>
          {opt.label ?? opt}
        </option>
      ))}
    </select>
  </FormField>
);

// ─── INPUT FIELD WRAPPER ─────────────────────────────────────────
export const InputField = ({ label, error, ...props }) => (
  <FormField label={label} error={error}>
    <input className="input-field" {...props} />
  </FormField>
);

// ─── PAGE HEADER ─────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-8">
    <div>
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
    </div>
    {action}
  </div>
);

// ─── TABLE ───────────────────────────────────────────────────────
export const Table = ({ headers, children, loading, empty }) => (
  <div className="glass-card overflow-hidden">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-ink-600">
          {headers.map((h) => (
            <th key={h} className="text-left px-4 py-3 text-xs font-display font-semibold text-slate-500 uppercase tracking-widest">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr><td colSpan={headers.length} className="text-center py-16"><Spinner className="mx-auto" /></td></tr>
        ) : empty ? (
          <tr><td colSpan={headers.length}>{empty}</td></tr>
        ) : children}
      </tbody>
    </table>
  </div>
);

// ─── ALERT ───────────────────────────────────────────────────────
export const Alert = ({ type = "error", message }) => {
  if (!message) return null;
  const cls = type === "error"
    ? "bg-accent-rose/10 border-accent-rose/30 text-accent-rose"
    : "bg-accent-teal/10 border-accent-teal/30 text-accent-teal";
  return (
    <div className={`border rounded-lg px-4 py-3 text-sm ${cls}`}>{message}</div>
  );
};
