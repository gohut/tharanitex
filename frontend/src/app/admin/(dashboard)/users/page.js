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
        <h1 className="text-[#2F2B27] text-2xl font-bold font-sans tracking-tight">Users & Roles</h1>
        <p className="text-[#7C7267] text-sm mt-0.5 font-sans">Manage admin accounts and role permissions</p>
      </div>

      <div className="flex gap-1 bg-white border border-[#E8DCC8] p-1 rounded-xl w-fit shadow-xs">
        {["users", "permissions"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all font-sans cursor-pointer ${
              tab === t ? "bg-[#D4AF37] text-[#2F2B27] shadow-xs" : "text-[#7C7267] hover:text-[#2F2B27] hover:bg-[#FAF6F0]"
            }`}
          >
            {t === "users" ? "Staff Accounts" : "Role Permissions"}
          </button>
        ))}
      </div>

      {tab === "users" ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openAdd} variant="primary">
              <Plus size={14} /> Add Staff
            </Button>
          </div>
          <div className="bg-white border border-[#E8DCC8] rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead>
                  <tr className="bg-[#FAF3E0] border-b border-[#E8DCC8]">
                    {["Staff Member", "Email", "Role", "Last Login", "Status", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3.5 text-[#5A1F2F] text-xs font-bold uppercase tracking-wider font-sans"
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
                      <td colSpan={6} className="px-5 py-8 text-center text-[#7C7267] text-xs font-sans">
                        No staff accounts found. Click &quot;Add Staff&quot; to create one.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-[#FDFBF7] transition-colors font-sans"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#FAF3E0] border border-[#D4AF37]/40 flex items-center justify-center">
                              <span className="text-[#8C6D1F] text-xs font-bold font-sans">{u.avatar}</span>
                            </div>
                            <p className="text-[#2F2B27] text-sm font-bold font-sans">{u.name}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[#7C7267] text-xs font-sans">{u.email}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-[#D4AF37]/40 bg-[#FAF3E0] text-[#8C6D1F] font-sans">
                            <Shield size={11} /> {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[#7C7267] text-xs font-sans">{u.lastLogin}</td>
                        <td className="px-5 py-4">
                          <StatusBadge status={u.status} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEdit(u)}
                              className="p-2 rounded-xl bg-[#FAF6F0] hover:bg-[#FAF3E0] text-[#5A1F2F] border border-[#E8DCC8] hover:border-[#D4AF37] transition cursor-pointer"
                              title="Edit Staff Member"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => deleteUser(u.id)}
                              disabled={u.role === "Super Admin"}
                              className="p-2 rounded-xl bg-[#FDEEEC] hover:bg-[#F8BDB8] text-[#C5221F] border border-[#F8BDB8] disabled:opacity-30 transition cursor-pointer"
                              title={u.role === "Super Admin" ? "Super Admin cannot be deleted" : "Delete Staff Member"}
                            >
                              <Trash2 size={14} />
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
              className="bg-white border border-[#E8DCC8] rounded-2xl shadow-xs overflow-hidden font-sans"
            >
              <div className="px-5 py-3.5 border-b border-[#E8DCC8] bg-[#FDFBF7] flex items-center gap-2">
                <Shield size={16} className="text-[#8C6D1F]" />
                <p className="text-[#2F2B27] font-bold text-sm font-sans">{role}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-sans">
                  <thead>
                    <tr className="bg-[#FAF3E0] border-b border-[#E8DCC8]">
                      <th className="text-left px-5 py-2.5 text-[#5A1F2F] text-xs font-bold uppercase font-sans">
                        Module
                      </th>
                      {actions.map((a) => (
                        <th
                          key={a}
                          className="text-center px-3 py-2.5 text-[#5A1F2F] text-xs font-bold uppercase font-sans"
                        >
                          {a}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DCC8]/60 bg-white">
                    {permissions.categories.map((cat) => (
                      <tr
                        key={cat}
                        className="hover:bg-[#FDFBF7] transition-colors"
                      >
                        <td className="px-5 py-3 text-[#2F2B27] text-xs font-semibold font-sans">{cat}</td>
                        {actions.map((action) => (
                          <td key={action} className="px-3 py-3 text-center">
                            <button
                              onClick={() => togglePerm(role, cat, action)}
                              className={`w-5 h-5 rounded-md border transition-all flex items-center justify-center mx-auto cursor-pointer ${
                                perms[role]?.[cat]?.[action]
                                  ? "bg-[#D4AF37] border-[#D4AF37]"
                                  : "bg-white border-[#E8DCC8] hover:border-[#D4AF37]"
                              }`}
                            >
                              {perms[role]?.[cat]?.[action] && (
                                <Check size={12} className="text-[#2F2B27] font-bold stroke-[3]" />
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
          <div className="flex flex-col gap-1.5 font-sans">
            <label htmlFor="fpassword" className="text-[#2F2B27] text-xs font-semibold font-sans">
              {modal === "add" ? (
                <>
                  Login Password<span className="text-[#C5221F] ml-0.5">*</span>
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
                className="w-full bg-white border border-[#E8DCC8] text-[#2F2B27] placeholder-[#8A8175] rounded-xl pl-3.5 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors font-sans"
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
              <span className="text-[11px] text-[#7C7267] font-sans">
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

          <div className="flex justify-end gap-3 mt-5 pt-3 border-t border-[#E8DCC8]">
            <Button type="button" variant="secondary" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
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