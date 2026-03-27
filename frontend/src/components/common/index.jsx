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

// ─── TIME PICKER ─────────────────────────────────────────────────
export const TimePickerField = ({ label, value, onChange, name, error }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  // Parse "HH:MM" string → { h, m, period }
  const parse = (v) => {
    if (!v) return { h: 12, m: 0, period: "AM" };
    const [hStr, mStr] = v.split(":");
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    const period = h >= 12 ? "PM" : "AM";
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return { h, m, period };
  };

  // Emit "HH:MM" (24-hour) to parent
  const emit = (h, m, period) => {
    let h24 = h % 12;
    if (period === "PM") h24 += 12;
    const hh = String(h24).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    onChange({ target: { name, value: `${hh}:${mm}` } });
  };

  const { h, m, period } = parse(value);

  const setH = (v) => emit(v, m, period);
  const setM = (v) => emit(h, v, period);
  const togglePeriod = () => emit(h, m, period === "AM" ? "PM" : "AM");

  const display = value
    ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`
    : "Select time";

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const hours   = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  return (
    <div className="flex flex-col gap-1" ref={ref}>
      {label && <label className="label">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`input-field text-left flex items-center justify-between gap-2 ${!value ? "text-slate-600" : "text-slate-200"}`}
      >
        <span>{display}</span>
        <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth="1.5"/>
          <path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 glass-card border border-ink-500 shadow-xl p-4 w-64"
          style={{ position: "absolute" }}
        >
          {/* AM / PM toggle */}
          <div className="flex gap-2 mb-4">
            {["AM", "PM"].map((p) => (
              <button key={p} type="button" onClick={() => emit(h, m, p)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  period === p
                    ? "bg-brand text-white"
                    : "bg-ink-700 text-slate-400 hover:bg-ink-600"
                }`}>
                {p}
              </button>
            ))}
          </div>

          {/* Hours */}
          <p className="text-xs font-display font-semibold text-slate-500 uppercase tracking-widest mb-2">Hour</p>
          <div className="grid grid-cols-6 gap-1 mb-4">
            {hours.map((hv) => (
              <button key={hv} type="button" onClick={() => setH(hv)}
                className={`py-1.5 rounded-lg text-xs font-mono transition-all ${
                  h === hv
                    ? "bg-brand text-white font-semibold"
                    : "bg-ink-700 text-slate-400 hover:bg-ink-600 hover:text-white"
                }`}>
                {String(hv).padStart(2, "0")}
              </button>
            ))}
          </div>

          {/* Minutes */}
          <p className="text-xs font-display font-semibold text-slate-500 uppercase tracking-widest mb-2">Minute</p>
          <div className="grid grid-cols-6 gap-1 mb-4">
            {minutes.map((mv) => (
              <button key={mv} type="button" onClick={() => setM(mv)}
                className={`py-1.5 rounded-lg text-xs font-mono transition-all ${
                  m === mv
                    ? "bg-brand text-white font-semibold"
                    : "bg-ink-700 text-slate-400 hover:bg-ink-600 hover:text-white"
                }`}>
                {String(mv).padStart(2, "0")}
              </button>
            ))}
          </div>

          {/* Selected preview + Done */}
          <div className="flex items-center justify-between pt-3 border-t border-ink-600">
            <span className="text-white font-mono font-semibold text-sm">
              {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")} {period}
            </span>
            <button type="button" onClick={() => setOpen(false)}
              className="btn-primary text-xs px-4 py-1.5">
              Done
            </button>
          </div>
        </div>
      )}
      {error && <span className="text-accent-rose text-xs mt-0.5">{error}</span>}
    </div>
  );
};

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
