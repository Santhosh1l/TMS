import React, { useEffect, useState, useCallback } from "react";
import { userService, authService, toArray } from "../../services/api";
import {
  PageHeader, Table, StatusBadge, Modal, ConfirmDialog,
  Alert, EmptyState, Spinner, InputField, SelectField,
} from "../../components/common";
import { USER_ROLES, USER_STATUSES } from "../../utils/enums";

// ─── Add User Modal ───────────────────────────────────────────────
function AddUserModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "ROLE_EMPLOYEE",
    status: "ACTIVE", department: "", location: "", managerId: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm({
        name: "", email: "", password: "",
        role: "ROLE_EMPLOYEE", status: "ACTIVE",
        department: "", location: "", managerId: ""
      });
      setError("");
    }
  }, [open]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await authService.register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        status: form.status,
        department: form.department || undefined,
        managerId: form.managerId ? Number(form.managerId) : undefined,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New User" size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Alert message={error} />

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <InputField label="Full Name" name="name" value={form.name} onChange={handleChange} required />
          </div>

          <div className="col-span-2">
            <InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>

          <div className="col-span-2">
            <InputField label="Password" name="password" type="password" value={form.password} onChange={handleChange} required />
          </div>

          <select name="role" value={form.role} onChange={handleChange} className="input-field">
            {USER_ROLES.map(r => <option key={r} value={r}>{r.replace("ROLE_", "")}</option>)}
          </select>

          <select name="status" value={form.status} onChange={handleChange} className="input-field">
            {USER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <InputField name="department" value={form.department} onChange={handleChange} placeholder="Department" />
          <InputField name="location" value={form.location} onChange={handleChange} placeholder="Location" />

          <div className="col-span-2">
            <InputField name="managerId" type="number" value={form.managerId} onChange={handleChange} placeholder="Manager ID" />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={saving}>
            {saving ? <Spinner size="sm" /> : "Add User"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Edit User Modal ─────────────────────────────────────────────
function EditUserModal({ user, open, onClose, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        userId: user.userId,
        name: user.name || "",
        email: user.email || "",
        role: user.role,
        status: user.status,
        department: user.department || "",
        location: user.location || "",
        managerId: user.managerId || "",
      });
    }
  }, [user]);

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await userService.update({
        ...form,
        managerId: form.managerId ? Number(form.managerId) : undefined,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Edit User — ${user?.name}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Alert message={error} />

        <div className="grid grid-cols-2 gap-4">

          {/* ✅ NEW */}
          <div className="col-span-2">
            <InputField label="Full Name" name="name" value={form.name || ""} onChange={handleChange} />
          </div>

          <div className="col-span-2">
            <InputField label="Email" name="email" type="email" value={form.email || ""} onChange={handleChange} />
          </div>

          <select name="role" value={form.role || ""} onChange={handleChange} className="input-field">
            {USER_ROLES.map(r => <option key={r} value={r}>{r.replace("ROLE_", "")}</option>)}
          </select>

          <SelectField label="Status" name="status" value={form.status} onChange={handleChange} options={USER_STATUSES} />

          <InputField name="department" value={form.department} onChange={handleChange} />
          <InputField name="location" value={form.location} onChange={handleChange} />

          <div className="col-span-2">
            <InputField name="managerId" type="number" value={form.managerId} onChange={handleChange} />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={saving}>
            {saving ? <Spinner size="sm" /> : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
// ─── Main Page ────────────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: "", status: "" });
  const [addOpen, setAddOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.role) params.role = filters.role;
      if (filters.status) params.status = filters.status;
      const res = await userService.getAll(params);
      setUsers(toArray(res.data));
    } catch {
      setAlert({ type: "error", message: "Failed to load users." });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await userService.delete(deleteUser.userId);
      setAlert({ type: "success", message: "User deleted successfully." });
      setDeleteUser(null);
      fetchUsers();
    } catch {
      setAlert({ type: "error", message: "Delete failed." });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Users"
        subtitle="Manage system users and their roles"
        action={
          <button className="btn-primary" onClick={() => setAddOpen(true)}>
            + Add User
          </button>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          value={filters.role}
          onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}
          className="input-field w-44"
        >
          <option value="">All Roles</option>
          {USER_ROLES.map((r) => (
            <option key={r} value={r}>{r.replace("ROLE_", "")}</option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="input-field w-40"
        >
          <option value="">All Statuses</option>
          {USER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-slate-500 text-xs font-mono self-center">{users.length} user{users.length !== 1 ? "s" : ""}</span>
      </div>

      {alert.message && <div className="mb-4"><Alert type={alert.type} message={alert.message} /></div>}

      <Table
        headers={["ID", "Name", "Email", "Role", "Department", "Status", "Actions"]}
        loading={loading}
       empty={
  (!loading && users.length === 0) ? (
    <tr>
      <td colSpan={7}>
        <EmptyState
          icon="◈"
          title="No users found"
          description="Try adjusting your filters or add a new user."
          action={
            <button
              className="btn-primary"
              onClick={() => setAddOpen(true)}
            >
              + Add User
            </button>
          }
        />
      </td>
    </tr>
  ) : null
}
      >
        {users.map((u) => (
          <tr key={u.userId} className="border-b border-ink-700/50 last:border-0 table-row-hover">
            <td className="px-4 py-3 text-slate-500 font-mono text-xs">#{u.userId}</td>
            <td className="px-4 py-3 font-body font-medium text-white">{u.name}</td>
            <td className="px-4 py-3 text-slate-400 text-xs">{u.email}</td>
            <td className="px-4 py-3"><span className="font-mono text-xs text-brand">{u.role ? u.role.replace("ROLE_", "") : "—"}</span></td>
            <td className="px-4 py-3 text-slate-400 text-xs">{u.department || "—"}</td>
            <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <button onClick={() => setEditUser(u)} className="text-xs text-slate-400 hover:text-brand transition-colors px-2 py-1 rounded hover:bg-brand/10">Edit</button>
                <button onClick={() => setDeleteUser(u)} className="text-xs text-slate-400 hover:text-accent-rose transition-colors px-2 py-1 rounded hover:bg-accent-rose/10">Delete</button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <AddUserModal open={addOpen} onClose={() => setAddOpen(false)} onSaved={fetchUsers} />
      <EditUserModal user={editUser} open={!!editUser} onClose={() => setEditUser(null)} onSaved={fetchUsers} />
      <ConfirmDialog
        open={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteUser?.name}? This action cannot be undone.`}
      />
    </div>
  );
}
