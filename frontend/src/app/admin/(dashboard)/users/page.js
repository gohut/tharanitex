"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Shield, Check, Eye, EyeOff } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import { roles as staticRoles, permissions } from "@/data/users";
import toast from "react-hot-toast";

const roleIdMap = {
  "Super Admin": 1,
  "Manager": 2,
  "Support Staff": 3,
};

const roleNameMap = {
  1: "Super Admin",
  2: "Manager",
  3: "Support Staff",
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableRoles, setAvailableRoles] = useState(staticRoles);
  const [perms, setPerms] = useState(permissions.matrix);
  const [tab, setTab] = useState("users");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchStaffAndRoles = useCallback(async () => {
    try {
      const [staffRes, rolesRes] = await Promise.all([
        fetch("/api/admin/staff"),
        fetch("/api/admin/roles"),
      ]);

      if (staffRes.ok) {
        const staffJson = await staffRes.json();
        if (staffJson?.success && Array.isArray(staffJson.data)) {
          const mapped = staffJson.data.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role_name || roleNameMap[u.role_id] || "Support Staff",
            role_id: u.role_id,
            status: u.status || "Active",
            avatar: u.name
              ? u.name
                  .split(" ")
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "ST",
            lastLogin: u.last_login ? new Date(u.last_login).toLocaleString() : "Never",
          }));
          setUsers(mapped);
        }
      }

      if (rolesRes.ok) {
        const rolesJson = await rolesRes.json();
        if (rolesJson?.success && Array.isArray(rolesJson.data) && rolesJson.data.length > 0) {
          const names = rolesJson.data.map((r) => r.name);
          setAvailableRoles(names);
        }
      }
    } catch {
      // Non-blocking
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffAndRoles();
  }, [fetchStaffAndRoles]);

  const openAdd = () => {
    setForm({ name: "", email: "", password: "", role: "Support Staff", status: "Active" });
    setShowPassword(false);
    setModal("add");
  };

  const openEdit = (u) => {
    setForm({ ...u, password: "" });
    setSelected(u);
    setShowPassword(false);
    setModal("edit");
  };

  const saveUser = async (e) => {
    if (e) e.preventDefault();

    if (!form.name?.trim()) {
      toast.error("Full name is required.");
      return;
    }
    if (!form.email?.trim()) {
      toast.error("Email address is required.");
      return;
    }
    if (modal === "add" && (!form.password || form.password.length < 6)) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    if (modal === "edit" && form.password && form.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setSubmitting(true);
    const roleId = roleIdMap[form.role] || 3;

    try {
      if (modal === "add") {
        const res = await fetch("/api/admin/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password.trim(),
            role_id: roleId,
            status: form.status || "Active",
          }),
        });

        const json = await res.json().catch(() => ({}));

        if (res.ok && json.success) {
          toast.success("Staff account created successfully!");
          await fetchStaffAndRoles();
          setModal(null);
        } else {
          toast.error(json.message || "Failed to create staff account.");
        }
      } else {
        // Edit existing staff
        const payload = {
          name: form.name.trim(),
          email: form.email.trim(),
          role_id: roleId,
          status: form.status,
        };
        if (form.password && form.password.trim()) {
          payload.password = form.password.trim();
        }

        const res = await fetch(`/api/admin/staff/${selected.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = await res.json().catch(() => ({}));

        if (res.ok && json.success) {
          toast.success("Staff account updated successfully!");
          await fetchStaffAndRoles();
          setModal(null);
        } else {
          toast.error(json.message || "Failed to update staff account.");
        }
      }
    } catch (err) {
      console.error("Save staff error:", err);
      toast.error("An error occurred while saving staff account.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;

    try {
      const res = await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        toast.success("Staff account deleted.");
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        toast.error(json.message || "Failed to delete staff account.");
      }
    } catch (err) {
      console.error("Delete staff error:", err);
      toast.error("An error occurred while deleting staff account.");
    }
  };

  const togglePerm = (role, cat, action) => {
    setPerms((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [cat]: {
          ...prev[role][cat],
          [action]: !prev[role][cat][action],
        },
      },
    }));
  };

  const actions = ["view", "create", "edit", "delete"];

  return (
    <div className="space-y-5 animate-fade-in font-sans">
      <div>
        <h1 className="text-white text-2xl font-bold font-sans tracking-tight">Users & Roles</h1>
        <p className="text-green-400 text-sm mt-0.5 font-sans">Manage admin accounts and role permissions</p>
      </div>

      <div className="flex gap-1 bg-green-900 p-1 rounded-xl w-fit">
        {["users", "permissions"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all font-sans ${
              tab === t ? "bg-gold-600 text-green-950" : "text-green-400 hover:text-white"
            }`}
          >
            {t === "users" ? "Staff Accounts" : "Role Permissions"}
          </button>
        ))}
      </div>

      {tab === "users" ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openAdd}>
              <Plus size={14} /> Add Staff
            </Button>
          </div>
          <div className="bg-green-900 border border-green-800 rounded-2xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead>
                  <tr className="border-b border-green-800">
                    {["Staff Member", "Email", "Role", "Last Login", "Status", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-green-400 text-xs font-medium uppercase tracking-wider font-sans"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [1, 2, 3].map((i) => (
                      <tr key={i} className="border-b border-green-800/50 animate-pulse">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-800/60" />
                            <div className="h-3 w-28 bg-green-800/60 rounded" />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-3 w-36 bg-green-800/60 rounded" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-20 bg-green-800/60 rounded-full" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-3 w-24 bg-green-800/60 rounded" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-14 bg-green-800/60 rounded-full" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-6 w-14 bg-green-800/60 rounded-lg" />
                        </td>
                      </tr>
                    ))
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-green-400 text-xs font-sans">
                        No staff accounts found. Click &quot;Add Staff&quot; to create one.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-green-800/50 hover:bg-green-800/30 transition-colors font-sans"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gold-600/20 border border-gold-800/40 flex items-center justify-center">
                              <span className="text-gold-400 text-xs font-bold font-sans">{u.avatar}</span>
                            </div>
                            <p className="text-white text-xs font-medium font-sans">{u.name}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-green-300 text-xs font-sans">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border border-gold-800/40 bg-gold-600/10 text-gold-400 font-sans">
                            <Shield size={10} /> {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-green-500 text-xs font-sans">{u.lastLogin}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={u.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => openEdit(u)}
                              className="p-1.5 rounded-lg bg-green-800 hover:bg-green-700 text-green-300 transition-colors"
                              title="Edit Staff Member"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => deleteUser(u.id)}
                              disabled={u.role === "Super Admin"}
                              className="p-1.5 rounded-lg bg-red-900/50 hover:bg-red-800 text-red-400 disabled:opacity-30 transition-colors"
                              title={u.role === "Super Admin" ? "Super Admin cannot be deleted" : "Delete Staff Member"}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Permission Matrix */
        <div className="space-y-4">
          {availableRoles.map((role) => (
            <div
              key={role}
              className="bg-green-900 border border-green-800 rounded-2xl shadow-card overflow-hidden"
            >
              <div className="px-5 py-3 border-b border-green-800 flex items-center gap-2">
                <Shield size={15} className="text-gold-400" />
                <p className="text-white font-semibold text-sm font-sans">{role}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-sans">
                  <thead>
                    <tr className="border-b border-green-800">
                      <th className="text-left px-4 py-2 text-green-400 text-xs font-medium font-sans">
                        Module
                      </th>
                      {actions.map((a) => (
                        <th
                          key={a}
                          className="text-center px-3 py-2 text-green-400 text-xs font-medium capitalize font-sans"
                        >
                          {a}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.categories.map((cat) => (
                      <tr
                        key={cat}
                        className="border-b border-green-800/50 hover:bg-green-800/20"
                      >
                        <td className="px-4 py-2 text-green-300 text-xs font-medium font-sans">{cat}</td>
                        {actions.map((action) => (
                          <td key={action} className="px-3 py-2 text-center">
                            <button
                              onClick={() => togglePerm(role, cat, action)}
                              className={`w-5 h-5 rounded border transition-all flex items-center justify-center mx-auto ${
                                perms[role]?.[cat]?.[action]
                                  ? "bg-gold-600 border-gold-500"
                                  : "bg-transparent border-green-700 hover:border-gold-700"
                              }`}
                            >
                              {perms[role]?.[cat]?.[action] && (
                                <Check size={11} className="text-green-950" />
                              )}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Staff Modal */}
      <Modal
        open={modal === "add" || modal === "edit"}
        onClose={() => setModal(null)}
        title={modal === "add" ? "Add Staff Member" : "Edit Staff Member"}
        size="sm"
      >
        <form onSubmit={saveUser} className="space-y-4 font-sans">
          <FormInput
            label="Full Name"
            id="fname"
            value={form.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="John Doe"
            required
          />

          <FormInput
            label="Email"
            id="femail"
            type="email"
            value={form.email || ""}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="staff@tharanitex.com"
            required
          />

          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fpassword" className="text-green-300 text-xs font-medium font-sans">
              {modal === "add" ? (
                <>
                  Login Password<span className="text-gold-500 ml-0.5">*</span>
                </>
              ) : (
                "New Login Password (Optional)"
              )}
            </label>
            <div className="relative">
              <input
                id="fpassword"
                type={showPassword ? "text" : "password"}
                value={form.password || ""}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={
                  modal === "add"
                    ? "Min. 6 characters password"
                    : "Leave blank to keep existing password"
                }
                required={modal === "add"}
                className="w-full bg-green-800 border border-green-700 text-white placeholder-green-500 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 hover:text-gold-400 transition"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {modal === "edit" && (
              <span className="text-[11px] text-green-400 font-sans">
                Leave blank if you do not want to change this staff member's password.
              </span>
            )}
          </div>

          <FormInput
            label="Role"
            id="frole"
            type="select"
            value={form.role || "Support Staff"}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={availableRoles}
          />

          <FormInput
            label="Status"
            id="fstatus"
            type="select"
            value={form.status || "Active"}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={["Active", "Inactive"]}
          />

          <div className="flex justify-end gap-3 mt-5 pt-2 border-t border-green-800">
            <Button type="button" variant="secondary" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Saving..."
                : modal === "add"
                ? "Add Staff"
                : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}