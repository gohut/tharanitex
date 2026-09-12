"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Shield, Check, Eye, EyeOff, Save, Loader2 } from "lucide-react";
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
  const [savingPerms, setSavingPerms] = useState(false);

  const fetchStaffAndRoles = useCallback(async () => {
    try {
      const [staffRes, rolesRes] = await Promise.all([
        fetch("/api/admin/staff", { cache: "no-store" }),
        fetch("/api/admin/roles", { cache: "no-store" }),
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
            lastLogin: u.last_login ? new Date(u.last_login).toLocaleString("en-IN") : "Never",
          }));
          setUsers(mapped);
        }
      }

      if (rolesRes.ok) {
        const rolesJson = await rolesRes.json();
        if (rolesJson?.success && Array.isArray(rolesJson.data) && rolesJson.data.length > 0) {
          const names = rolesJson.data.map((r) => r.name);
          setAvailableRoles(names);

          // Populate live permission matrix if available
          const updatedPerms = { ...permissions.matrix };
          rolesJson.data.forEach((r) => {
            if (Array.isArray(r.permissions)) {
              if (!updatedPerms[r.name]) updatedPerms[r.name] = {};
              r.permissions.forEach((p) => {
                updatedPerms[r.name][p.module] = {
                  view: Boolean(p.can_view),
                  create: Boolean(p.can_create),
                  edit: Boolean(p.can_edit),
                  delete: Boolean(p.can_delete),
                };
              });
            }
          });
          setPerms(updatedPerms);
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
    setForm({ name: "", email: "", password: "", role: "Manager", status: "Active" });
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
    const roleId = roleIdMap[form.role] || 2;

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

  const deleteUser = async (id, roleName) => {
    if (roleName === "Super Admin") {
      toast.error("The primary Super Admin account cannot be deleted.");
      return;
    }

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
    if (role === "Super Admin") return; // Super admin always has full permissions
    setPerms((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [cat]: {
          ...prev[role]?.[cat],
          [action]: !prev[role]?.[cat]?.[action],
        },
      },
    }));
  };

  const saveRolePermissions = async (roleName) => {
    const roleId = roleIdMap[roleName];
    if (!roleId || roleName === "Super Admin") return;

    setSavingPerms(true);
    try {
      const rolePerms = perms[roleName] || {};
      const payload = permissions.categories.map((cat) => ({
        module: cat,
        can_view: rolePerms[cat]?.view ? 1 : 0,
        can_create: rolePerms[cat]?.create ? 1 : 0,
        can_edit: rolePerms[cat]?.edit ? 1 : 0,
        can_delete: rolePerms[cat]?.delete ? 1 : 0,
      }));

      const res = await fetch(`/api/admin/roles/${roleId}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: payload }),
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        toast.success(`Permissions for ${roleName} updated successfully!`);
        await fetchStaffAndRoles();
      } else {
        toast.error(json.message || "Failed to update permissions.");
      }
    } catch (err) {
      console.error("Save role permissions error:", err);
      toast.error("Failed to update role permissions.");
    } finally {
      setSavingPerms(false);
    }
  };

  const actions = ["view", "create", "edit", "delete"];

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-[#2F2B27]">Users & Roles</h1>
        <p className="text-sm text-[#7C7267] mt-0.5">
          Manage administrator and staff accounts with granular module permission matrix
        </p>
      </div>

      <div className="flex gap-1 bg-[#FAF6F0] border border-[#E8DCC8] p-1 rounded-xl w-fit shadow-xs">
        {["users", "permissions"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              tab === t
                ? "bg-[#D4AF37] text-[#2F2B27] shadow-xs"
                : "text-[#7C7267] hover:text-[#2F2B27] hover:bg-white/60"
            }`}
          >
            {t === "users" ? "Staff Accounts" : "Role Permissions Matrix"}
          </button>
        ))}
      </div>

      {tab === "users" ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openAdd} variant="primary">
              <Plus size={15} /> Add Staff Account
            </Button>
          </div>

          <div className="bg-white border border-[#E8DCC8] rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#FAF6F0] border-b border-[#E8DCC8]">
                    {["Staff Member", "Email", "Role", "Last Login", "Status", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3.5 text-[#7C7267] text-xs font-bold uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DCC8]/60 bg-white">
                  {loading ? (
                    [1, 2, 3].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#FAF6F0]" />
                            <div className="h-3 w-28 bg-[#FAF6F0] rounded" />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-3 w-36 bg-[#FAF6F0] rounded" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-4 w-20 bg-[#FAF6F0] rounded-full" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-3 w-24 bg-[#FAF6F0] rounded" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-4 w-14 bg-[#FAF6F0] rounded-full" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-6 w-14 bg-[#FAF6F0] rounded-lg" />
                        </td>
                      </tr>
                    ))
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-[#7C7267] text-xs">
                        No staff accounts found. Click &quot;Add Staff Account&quot; to create one.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => {
                      const isSuperAdmin = u.role === "Super Admin" || u.role_id === 1;
                      return (
                        <tr key={u.id} className="hover:bg-[#FAF6F0]/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border ${
                                  isSuperAdmin
                                    ? "bg-[#D4AF37] text-[#2F2B27] border-[#D4AF37]"
                                    : "bg-[#FAF3E0] text-[#8C6D1F] border-[#E8DCC8]"
                                }`}
                              >
                                {u.avatar}
                              </div>
                              <div>
                                <p className="text-[#2F2B27] text-sm font-bold">{u.name}</p>
                                {isSuperAdmin && (
                                  <span className="text-[10px] text-[#8C6D1F] font-semibold">
                                    Primary Store Admin
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-[#7C7267] text-xs font-medium">{u.email}</td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                isSuperAdmin
                                  ? "bg-[#FAF3E0] text-[#8C6D1F] border-[#D4AF37]/50"
                                  : "bg-[#FAF6F0] text-[#2F2B27] border-[#E8DCC8]"
                              }`}
                            >
                              <Shield size={11} /> {u.role}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-[#7C7267] text-xs whitespace-nowrap">{u.lastLogin}</td>
                          <td className="px-5 py-4">
                            <StatusBadge status={u.status} />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEdit(u)}
                                className="p-2 rounded-xl bg-white hover:bg-[#FAF6F0] text-[#2F2B27] border border-[#E8DCC8] hover:border-[#D4AF37] transition cursor-pointer"
                                title="Edit Staff Member"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => deleteUser(u.id, u.role)}
                                disabled={isSuperAdmin}
                                className={`p-2 rounded-xl border transition cursor-pointer ${
                                  isSuperAdmin
                                    ? "bg-[#FAF6F0] text-[#A89F91] border-[#E8DCC8] opacity-40 cursor-not-allowed"
                                    : "bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                                }`}
                                title={isSuperAdmin ? "Super Admin cannot be deleted" : "Delete Staff Member"}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Permission Matrix */
        <div className="space-y-6">
          {availableRoles.map((role) => {
            const isSuperAdmin = role === "Super Admin";
            return (
              <div
                key={role}
                className="bg-white border border-[#E8DCC8] rounded-2xl shadow-xs overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-[#E8DCC8] bg-[#FAF6F0] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className={isSuperAdmin ? "text-[#D4AF37]" : "text-[#8C6D1F]"} />
                    <p className="text-[#2F2B27] font-bold text-sm">{role}</p>
                    {isSuperAdmin && (
                      <span className="text-[11px] text-[#8C6D1F] font-semibold ml-2">
                        (Unrestricted Master Access)
                      </span>
                    )}
                  </div>
                  {!isSuperAdmin && (
                    <Button
                      size="sm"
                      onClick={() => saveRolePermissions(role)}
                      disabled={savingPerms}
                    >
                      {savingPerms ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Save size={13} />
                      )}
                      Save Permissions
                    </Button>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#FAF6F0]/60 border-b border-[#E8DCC8]">
                        <th className="text-left px-5 py-2.5 text-[#7C7267] text-xs font-bold uppercase">
                          Module
                        </th>
                        {actions.map((a) => (
                          <th
                            key={a}
                            className="text-center px-4 py-2.5 text-[#7C7267] text-xs font-bold uppercase"
                          >
                            {a}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8DCC8]/60 bg-white">
                      {permissions.categories.map((cat) => (
                        <tr key={cat} className="hover:bg-[#FAF6F0]/40 transition-colors">
                          <td className="px-5 py-3 text-[#2F2B27] text-xs font-bold">{cat}</td>
                          {actions.map((action) => {
                            const isChecked = isSuperAdmin || perms[role]?.[cat]?.[action];
                            return (
                              <td key={action} className="px-4 py-3 text-center">
                                <button
                                  type="button"
                                  disabled={isSuperAdmin}
                                  onClick={() => togglePerm(role, cat, action)}
                                  className={`w-5 h-5 rounded-md border transition-all flex items-center justify-center mx-auto cursor-pointer ${
                                    isChecked
                                      ? "bg-[#D4AF37] border-[#D4AF37] text-[#2F2B27]"
                                      : "bg-white border-[#E8DCC8] hover:border-[#D4AF37]"
                                  } ${isSuperAdmin ? "cursor-default opacity-80" : ""}`}
                                >
                                  {isChecked && (
                                    <Check size={12} className="stroke-[3]" />
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
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
            label="Email Address"
            id="femail"
            type="email"
            value={form.email || ""}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="staff@tharanitextiles.com"
            required
          />

          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fpassword" className="text-[#2F2B27] text-xs font-semibold">
              {modal === "add" ? (
                <>
                  Login Password<span className="text-red-600 ml-0.5">*</span>
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
                className="w-full bg-white border border-[#E8DCC8] text-[#2F2B27] placeholder-[#A89F91] rounded-xl pl-3.5 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7C7267] hover:text-[#2F2B27] transition cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {modal === "edit" && (
              <span className="text-[11px] text-[#7C7267]">
                Leave blank if you do not wish to reset this staff member's password.
              </span>
            )}
          </div>

          <FormInput
            label="Role"
            id="frole"
            type="select"
            value={form.role || "Manager"}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={availableRoles}
          />

          <FormInput
            label="Account Status"
            id="fstatus"
            type="select"
            value={form.status || "Active"}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={["Active", "Inactive"]}
          />

          <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-[#E8DCC8]">
            <Button type="button" variant="secondary" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting
                ? "Saving..."
                : modal === "add"
                ? "Create Account"
                : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}