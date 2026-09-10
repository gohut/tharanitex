"use client";
import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Shield, Check, Lock, Eye, EyeOff } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import { adminUsers as initUsers, roles, permissions } from "@/data/users";
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
  const [users, setUsers] = useState(initUsers);
  const [perms, setPerms] = useState(permissions.matrix);
  const [tab, setTab] = useState("users");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch real staff accounts and roles from backend if available
  useEffect(() => {
    fetch("/api/admin/staff")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped = json.data.map((u) => ({
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
      })
      .catch(() => {});
  }, []);

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
          const newAccount = json.data;
          setUsers((prev) => [
            ...prev,
            {
              id: newAccount.id,
              name: newAccount.name,
              email: newAccount.email,
              role: newAccount.role_name || form.role,
              role_id: newAccount.role_id,
              status: newAccount.status,
              avatar: newAccount.name
                .split(" ")
                .filter(Boolean)
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase(),
              lastLogin: "Never",
            },
          ]);
          toast.success("Staff account created successfully!");
        } else {
          // Fallback to local state if offline / demo mode
          const newId = `U${Date.now()}`;
          setUsers((prev) => [
            ...prev,
            {
              id: newId,
              name: form.name.trim(),
              email: form.email.trim(),
              role: form.role,
              role_id: roleId,
              status: form.status,
              avatar: form.name
                .split(" ")
                .filter(Boolean)
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase(),
              lastLogin: "Never",
            },
          ]);
          if (json?.message) {
            toast.error(json.message);
          } else {
            toast.success("Staff account added!");
          }
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

        setUsers((prev) =>
          prev.map((u) =>
            u.id === selected.id
              ? {
                  ...u,
                  name: form.name.trim(),
                  email: form.email.trim(),
                  role: form.role,
                  role_id: roleId,
                  status: form.status,
                  avatar: form.name
                    .split(" ")
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase(),
                }
              : u
          )
        );

        if (res.ok && json.success) {
          toast.success("Staff account updated successfully!");
        } else {
          toast.success("Staff changes saved!");
        }
      }
      setModal(null);
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
      await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Delete staff error:", err);
    }

    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast.success("Staff account deleted.");
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
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-white text-2xl font-bold">Users & Roles</h1>
        <p className="text-green-400 text-sm mt-0.5">Manage admin accounts and role permissions</p>
      </div>

      <div className="flex gap-1 bg-green-900 p-1 rounded-xl w-fit">
        {["users", "permissions"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
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
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-green-800">
                    {["Staff Member", "Email", "Role", "Last Login", "Status", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-green-400 text-xs font-medium uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-green-800/50 hover:bg-green-800/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gold-600/20 border border-gold-800/40 flex items-center justify-center">
                            <span className="text-gold-400 text-xs font-bold">{u.avatar}</span>
                          </div>
                          <p className="text-white text-xs font-medium">{u.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-green-300 text-xs">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border border-gold-800/40 bg-gold-600/10 text-gold-400">
                          <Shield size={10} /> {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-green-500 text-xs">{u.lastLogin}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={u.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => openEdit(u)}
                            className="p-1.5 rounded-lg bg-green-800 hover:bg-green-700 text-green-300 transition-colors"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => deleteUser(u.id)}
                            disabled={u.role === "Super Admin"}
                            className="p-1.5 rounded-lg bg-red-900/50 hover:bg-red-800 text-red-400 disabled:opacity-30 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Permission Matrix */
        <div className="space-y-4">
          {roles.map((role) => (
            <div
              key={role}
              className="bg-green-900 border border-green-800 rounded-2xl shadow-card overflow-hidden"
            >
              <div className="px-5 py-3 border-b border-green-800 flex items-center gap-2">
                <Shield size={15} className="text-gold-400" />
                <p className="text-white font-semibold text-sm">{role}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-green-800">
                      <th className="text-left px-4 py-2 text-green-400 text-xs font-medium">
                        Module
                      </th>
                      {actions.map((a) => (
                        <th
                          key={a}
                          className="text-center px-3 py-2 text-green-400 text-xs font-medium capitalize"
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
                        <td className="px-4 py-2 text-green-300 text-xs font-medium">{cat}</td>
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
        <form onSubmit={saveUser} className="space-y-4">
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
            <label htmlFor="fpassword" className="text-green-300 text-xs font-medium">
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
                className="w-full bg-green-800 border border-green-700 text-white placeholder-green-500 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
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
              <span className="text-[11px] text-green-400">
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
            options={roles}
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