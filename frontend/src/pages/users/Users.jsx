import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUsers, createStaff, updateUser,
  deactivateUser, activateUser,
} from "../../api/userApi";
import {
  Search, Plus, X, RefreshCw, Users as UsersIcon,
  Shield, UserCheck, Sparkles, User,
  MoreVertical, CheckCircle, XCircle,
  Mail, Phone, MapPin, Eye,
} from "lucide-react";

const ROLE_S = {
  Admin:        { bg: "rgba(239,68,68,0.12)",   text: "#f87171",  icon: <Shield size={12}/>    },
  Manager:      { bg: "rgba(168,85,247,0.12)",  text: "#c084fc",  icon: <UserCheck size={12}/> },
  Receptionist: { bg: "rgba(59,130,246,0.12)",  text: "#60a5fa",  icon: <User size={12}/>      },
  Housekeeping: { bg: "rgba(34,197,94,0.12)",   text: "#22c55e",  icon: <Sparkles size={12}/>  },
};

const INP = {
  width: "100%", background: "#1e2028",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10, padding: "10px 14px",
  color: "#fff", fontSize: 13, outline: "none",
};

const GRADIENT = [
  "linear-gradient(135deg,#3b82f6,#8b5cf6)",
  "linear-gradient(135deg,#6366f1,#ec4899)",
  "linear-gradient(135deg,#14b8a6,#3b82f6)",
  "linear-gradient(135deg,#f59e0b,#ef4444)",
  "linear-gradient(135deg,#22c55e,#14b8a6)",
];

const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
const isAdmin    = loggedUser?.role === "Admin";

export default function Users() {
  const navigate = useNavigate();

  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showModal,  setShowModal]  = useState(false);
  const [editUser,   setEditUser]   = useState(null);
  const [menuOpen,   setMenuOpen]   = useState(null);
  const [actioning,  setActioning]  = useState(null);

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => {
    const close = () => setMenuOpen(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      // Only staff — no guests
      setUsers(Array.isArray(data) ? data.filter(u => u.role !== "Guest") : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const stats = useMemo(() => ({
    total:    users.length,
    active:   users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
  }), [users]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u => {
      const matchSearch = !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q);
      const matchRole = roleFilter === "All" || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const handleToggleActive = async (u) => {
    try {
      setActioning(u._id);
      if (u.isActive) await deactivateUser(u._id);
      else            await activateUser(u._id);
      setUsers(p => p.map(x => x._id === u._id ? { ...x, isActive: !x.isActive } : x));
    } catch (e) { console.error(e); }
    finally { setActioning(null); setMenuOpen(null); }
  };

  const initials = (name) => (name || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 text-white">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-xs mt-1" style={{ color: "#64748b" }}>
            Manage staff profiles and access levels
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={fetchUsers} className="p-2 rounded-xl transition"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <RefreshCw size={15} style={{ color: "#64748b" }} />
          </button>
          {isAdmin && (
            <button onClick={() => { setEditUser(null); setShowModal(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: "#3b82f6", color: "#fff" }}
              onMouseEnter={e => e.currentTarget.style.background = "#2563eb"}
              onMouseLeave={e => e.currentTarget.style.background = "#3b82f6"}>
              <Plus size={15} /> Add Staff
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Staff", value: stats.total,    color: "#60a5fa", bg: "rgba(59,130,246,0.1)"  },
          { label: "Active",      value: stats.active,   color: "#22c55e", bg: "rgba(34,197,94,0.1)"   },
          { label: "Inactive",    value: stats.inactive, color: "#f87171", bg: "rgba(239,68,68,0.1)"   },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: s.bg, color: s.color }}>
              <UsersIcon size={17} />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">{s.value}</p>
              <p className="text-[11px] mt-1" style={{ color: "#64748b" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2 rounded-xl"
          style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Search size={14} style={{ color: "#475569" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search staff..."
            className="bg-transparent text-sm outline-none flex-1 placeholder-slate-600" />
          {search && <button onClick={() => setSearch("")}><X size={13} style={{ color: "#475569" }} /></button>}
        </div>

        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.08)" }}>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="bg-transparent text-sm outline-none text-white cursor-pointer">
            {["All", "Admin", "Manager", "Receptionist", "Housekeeping"].map(r => (
              <option key={r} value={r} className="bg-[#1e2028]">{r === "All" ? "All Roles" : r}</option>
            ))}
          </select>
        </div>

        {(roleFilter !== "All" || search) && (
          <button onClick={() => { setSearch(""); setRoleFilter("All"); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"
            style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
            <X size={12} /> Clear
          </button>
        )}

        <p className="ml-auto text-xs" style={{ color: "#475569" }}>
          <span className="text-white font-medium">{filtered.length}</span> staff members
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <UsersIcon size={40} style={{ color: "#1e293b" }} />
          <p className="text-sm" style={{ color: "#334155" }}>No staff members found</p>
        </div>
      )}

      {/* Cards */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((u, i) => {
            const rs = ROLE_S[u.role] || ROLE_S.Receptionist;
            return (
              <div key={u._id} className="rounded-2xl overflow-hidden transition-all duration-200"
                style={{
                  background: "#16181d",
                  border: `1px solid ${u.isActive ? "rgba(255,255,255,0.07)" : "rgba(239,68,68,0.15)"}`,
                  opacity: u.isActive ? 1 : 0.7,
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = u.isActive ? "rgba(255,255,255,0.14)" : "rgba(239,68,68,0.3)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = u.isActive ? "rgba(255,255,255,0.07)" : "rgba(239,68,68,0.15)"}>

                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                        style={{ background: GRADIENT[i % GRADIENT.length] }}>
                        {initials(u.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{u.name}</p>
                        <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 w-fit"
                          style={{ background: rs.bg, color: rs.text }}>
                          {rs.icon} {u.role}
                        </span>
                      </div>
                    </div>

                    <div className="relative" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setMenuOpen(menuOpen === u._id ? null : u._id)}
                        className="p-1.5 rounded-lg transition"
                        style={{ color: "#475569" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <MoreVertical size={14} />
                      </button>
                      {menuOpen === u._id && (
                        <div className="absolute right-0 top-8 z-30 rounded-xl overflow-hidden shadow-2xl"
                          style={{ background: "#1e2028", border: "1px solid rgba(255,255,255,0.1)", minWidth: 155 }}>
                          <MItem label="View Profile" color="#60a5fa"
                            onClick={() => { navigate(`/users/${u._id}`); setMenuOpen(null); }} />
                          {isAdmin && (
                            <MItem label="Edit Profile" color="#fbbf24"
                              onClick={() => { setEditUser(u); setShowModal(true); setMenuOpen(null); }} />
                          )}
                          {isAdmin && (
                            <MItem
                              label={u.isActive ? "Deactivate" : "Activate"}
                              color={u.isActive ? "#f87171" : "#22c55e"}
                              loading={actioning === u._id}
                              onClick={() => handleToggleActive(u)} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs" style={{ color: "#64748b" }}>
                    <Mail size={11} /><span className="truncate">{u.email}</span>
                  </div>
                  {u.phone && (
                    <div className="flex items-center gap-2 text-xs" style={{ color: "#64748b" }}>
                      <Phone size={11} /><span>{u.phone}</span>
                    </div>
                  )}
                  {u.address && (
                    <div className="flex items-center gap-2 text-xs" style={{ color: "#64748b" }}>
                      <MapPin size={11} /><span className="truncate">{u.address}</span>
                    </div>
                  )}
                </div>

                <div className="px-5 pb-4 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[10px] font-medium"
                    style={{ color: u.isActive ? "#22c55e" : "#f87171" }}>
                    {u.isActive ? <CheckCircle size={11} /> : <XCircle size={11} />}
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                  <button onClick={() => navigate(`/users/${u._id}`)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition"
                    style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(59,130,246,0.2)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(59,130,246,0.1)"}>
                    <Eye size={11} /> View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <StaffModal
          user={editUser}
          onClose={() => { setShowModal(false); setEditUser(null); }}
          onSaved={(saved, isEdit) => {
            if (isEdit) setUsers(p => p.map(u => u._id === saved._id ? { ...u, ...saved } : u));
            else        setUsers(p => [saved, ...p]);
            setShowModal(false); setEditUser(null);
          }}
        />
      )}
    </div>
  );
}

function MItem({ label, color, onClick, loading = false }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="w-full text-left px-4 py-2.5 text-xs font-medium transition flex items-center gap-2"
      style={{ color }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      {loading && <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />}
      {label}
    </button>
  );
}

function StaffModal({ user, onClose, onSaved }) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    name: user?.name || "", email: user?.email || "", password: "",
    role: user?.role || "Receptionist", phone: user?.phone || "", address: user?.address || "",
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [apiErr, setApiErr]   = useState("");

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = "Required";
    if (!form.email.trim()) e.email = "Required";
    if (!isEdit && !form.password)        e.password = "Required";
    if (!isEdit && form.password.length < 6) e.password = "Min 6 chars";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true); setApiErr("");
      let saved;
      if (isEdit) {
        saved = await updateUser(user._id, { name: form.name, role: form.role, phone: form.phone, address: form.address });
      } else {
        saved = await createStaff(form);
      }
      onSaved(saved || { ...form, _id: Date.now(), isActive: true }, isEdit);
    } catch (err) {
      setApiErr(err?.response?.data?.message || "Operation failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl"
        style={{ background: "#13151a", border: "1px solid rgba(255,255,255,0.1)" }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <h2 className="text-base font-semibold">{isEdit ? "Edit Staff" : "Add Staff Member"}</h2>
            <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
              {isEdit ? "Update staff information" : "Create a new staff account"}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.05)", color: "#64748b" }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "#64748b"}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {apiErr && (
            <div className="px-4 py-3 rounded-xl text-sm"
              style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
              {apiErr}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>
                Full Name <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="John Doe"
                style={{ ...INP, borderColor: errors.name ? "#ef4444" : "rgba(255,255,255,0.08)" }} />
              {errors.name && <p className="text-[11px] mt-1" style={{ color: "#f87171" }}>{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Role</label>
              <select value={form.role} onChange={e => set("role", e.target.value)}
                style={{ ...INP, cursor: "pointer" }}>
                {["Manager", "Receptionist", "Housekeeping"].map(r => (
                  <option key={r} value={r} className="bg-[#1e2028]">{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>
              Email <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
              placeholder="email@example.com" disabled={isEdit}
              style={{ ...INP, borderColor: errors.email ? "#ef4444" : "rgba(255,255,255,0.08)", opacity: isEdit ? 0.6 : 1 }} />
            {errors.email && <p className="text-[11px] mt-1" style={{ color: "#f87171" }}>{errors.email}</p>}
          </div>

          {!isEdit && (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>
                Password <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input type="password" value={form.password} onChange={e => set("password", e.target.value)}
                placeholder="Min 6 characters"
                style={{ ...INP, borderColor: errors.password ? "#ef4444" : "rgba(255,255,255,0.08)" }} />
              {errors.password && <p className="text-[11px] mt-1" style={{ color: "#f87171" }}>{errors.password}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Phone</label>
              <input value={form.phone} onChange={e => set("phone", e.target.value)}
                placeholder="+1 234 567 890" style={INP} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Address</label>
              <input value={form.address} onChange={e => set("address", e.target.value)}
                placeholder="City, Country" style={INP} />
            </div>
          </div>

          <div className="flex gap-3 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
              style={{ background: loading ? "#1d4ed8" : "#3b82f6", color: "#fff" }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#2563eb"; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#3b82f6"; }}>
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{isEdit ? "Saving..." : "Creating..."}</>
                : <><Plus size={14} />{isEdit ? "Save Changes" : "Create Staff"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
