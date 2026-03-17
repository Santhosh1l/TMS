import React, { useEffect, useState, useCallback } from "react";
import { userService } from "../../services/api";
import {
  PageHeader, Table, StatusBadge, Modal, ConfirmDialog,
  Alert, EmptyState, Spinner, SelectField, InputField,
} from "../../components/common";
import { USER_ROLES, USER_STATUSES } from "../../utils/enums";

const toArray = (d) => Array.isArray(d) ? d : Array.isArray(d?.content) ? d.content : Array.isArray(d?.data) ? d.data : [];


// ─── Edit Modal ──────────────────────────────────────────────────
function EditUserModal({ user, open, onClose, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) setForm({ userId: user.userId, role: user.role, status: user.status, department: user.department || "", location: user.location || "", managerId: user.managerId || "" });
  }, [user]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await userService.update({ ...form, managerId: form.managerId ? Number(form.managerId) : undefined });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Edit User #${user?.userId}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Alert message={error} />
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="label">Role</label>
            <select name="role" value={form.role || ""} onChange={handleChange} className="input-field appearance-none">
              {USER_ROLES.map((r) => (
                <option key={r} value={r}>{r.replace("ROLE_", "")}</option>
              ))}
            </select>
          </div>
          <SelectField label="Status" name="status" value={form.status} onChange={handleChange} options={USER_STATUSES} />
          <InputField label="Department" name="department" value={form.department} onChange={handleChange} placeholder="Engineering" maxLength={80} />
          <InputField label="Location" name="location" value={form.location} onChange={handleChange} placeholder="Remote" maxLength={80} />
          <div className="col-span-2">
            <InputField label="Manager ID" name="managerId" type="number" value={form.managerId} onChange={handleChange} placeholder="Optional" min={1} />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
            {saving && <Spinner size="sm" />} Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: "", status: "" }); // empty = All Roles
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
      <PageHeader title="Users" subtitle="Manage system users and their roles" />

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          value={filters.role} onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}
          className="input-field w-48"
        >
          <option value="">All Roles</option>
          {USER_ROLES.map((r) => (
            <option key={r} value={r}>{r.replace("ROLE_", "")}</option>
          ))}
        </select>
        <select
          value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="input-field w-40"
        >
          <option value="">All Statuses</option>
          {USER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {alert.message && (
        <div className="mb-4"><Alert type={alert.type} message={alert.message} /></div>
      )}

      <Table
        headers={["ID", "Name", "Email", "Role", "Department", "Status", "Actions"]}
        loading={loading}
        empty={
          <tr><td colSpan={7}>
            <EmptyState icon="◈" title="No users found" description="Try adjusting your filters." />
          </td></tr>
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
                <button
                  onClick={() => setEditUser(u)}
                  className="text-xs text-slate-400 hover:text-brand transition-colors px-2 py-1 rounded hover:bg-brand/10"
                >Edit</button>
                <button
                  onClick={() => setDeleteUser(u)}
                  className="text-xs text-slate-400 hover:text-accent-rose transition-colors px-2 py-1 rounded hover:bg-accent-rose/10"
                >Delete</button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <EditUserModal
        user={editUser}
        open={!!editUser}
        onClose={() => setEditUser(null)}
        onSaved={fetchUsers}
      />

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
