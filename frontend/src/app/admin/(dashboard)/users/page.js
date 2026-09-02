"use client";
import { useState } from "react";
import { Plus, Edit2, Trash2, Shield, Check } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import { adminUsers as initUsers, roles, permissions } from "@/data/users";

export default function UsersPage() {
  const [users, setUsers] = useState(initUsers);
  const [perms, setPerms] = useState(permissions.matrix);
  const [tab, setTab] = useState("users");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});

  const openAdd = () => { setForm({ name:"", email:"", role:"Support Staff", status:"Active" }); setModal("add"); };
  const openEdit = (u) => { setForm({...u}); setSelected(u); setModal("edit"); };
  const saveUser = () => {
    if (modal === "add") setUsers([...users, { id:`U${Date.now()}`, ...form, avatar: form.name.split(" ").map((n) => n[0]).join("").slice(0,2).toUpperCase(), lastLogin: "Never" }]);
    else setUsers(users.map((u) => u.id === selected.id ? {...u,...form} : u));
    setModal(null);
  };
  const deleteUser = (id) => setUsers(users.filter((u) => u.id !== id));

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

  const actions = ["view","create","edit","delete"];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-white text-2xl font-bold">Users & Roles</h1>
        <p className="text-green-400 text-sm mt-0.5">Manage admin accounts and role permissions</p>
      </div>

      <div className="flex gap-1 bg-green-900 p-1 rounded-xl w-fit">
        {["users","permissions"].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              tab === t ? "bg-gold-600 text-green-950" : "text-green-400 hover:text-white"
            }`}>{t === "users" ? "Staff Accounts" : "Role Permissions"}</button>
        ))}
      </div>

      {tab === "users" ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openAdd}><Plus size={14} /> Add Staff</Button>
          </div>
          <div className="bg-green-900 border border-green-800 rounded-2xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-green-800">
                    {["Staff Member","Email","Role","Last Login","Status","Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-green-400 text-xs font-medium uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-green-800/50 hover:bg-green-800/30 transition-colors">
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
                      <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg bg-green-800 hover:bg-green-700 text-green-300 transition-colors"><Edit2 size={13} /></button>
                          <button onClick={() => deleteUser(u.id)} disabled={u.role === "Super Admin"} className="p-1.5 rounded-lg bg-red-900/50 hover:bg-red-800 text-red-400 disabled:opacity-30 transition-colors"><Trash2 size={13} /></button>
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
            <div key={role} className="bg-green-900 border border-green-800 rounded-2xl shadow-card overflow-hidden">
              <div className="px-5 py-3 border-b border-green-800 flex items-center gap-2">
                <Shield size={15} className="text-gold-400" />
                <p className="text-white font-semibold text-sm">{role}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-green-800">
                      <th className="text-left px-4 py-2 text-green-400 text-xs font-medium">Module</th>
                      {actions.map((a) => (
                        <th key={a} className="text-center px-3 py-2 text-green-400 text-xs font-medium capitalize">{a}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.categories.map((cat) => (
                      <tr key={cat} className="border-b border-green-800/50 hover:bg-green-800/20">
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
                              {perms[role]?.[cat]?.[action] && <Check size={11} className="text-green-950" />}
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
      <Modal open={modal==="add"||modal==="edit"} onClose={() => setModal(null)} title={modal==="add" ? "Add Staff Member" : "Edit Staff Member"} size="sm">
        <div className="space-y-4">
          <FormInput label="Full Name" id="fname" value={form.name||""} onChange={(e) => setForm({...form,name:e.target.value})} placeholder="John Doe" required />
          <FormInput label="Email" id="femail" type="email" value={form.email||""} onChange={(e) => setForm({...form,email:e.target.value})} required />
          <FormInput label="Role" id="frole" type="select" value={form.role||"Support Staff"} onChange={(e) => setForm({...form,role:e.target.value})} options={roles} />
          <FormInput label="Status" id="fstatus" type="select" value={form.status||"Active"} onChange={(e) => setForm({...form,status:e.target.value})} options={["Active","Inactive"]} />
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
          <Button onClick={saveUser}>{modal==="add" ? "Add Staff" : "Save Changes"}</Button>
        </div>
      </Modal>
    </div>
  );
}