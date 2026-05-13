import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUsers, createStaff, updateUser,
  deactivateUser, activateUser,
} from "../../api/userApi";
import {
  Search, Plus, X, RefreshCw, Users as UsersIcon,
  MoreVertical, CheckCircle, XCircle,
  Mail, Phone, MapPin, Shield, Eye, User,
} from "lucide-react";

const INP = {
  width: "100%", background: "#1e2028",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10, padding: "10px 14px",
  color: "#fff", fontSize: 13, outline: "none",
};

const GRADIENT = [
  "linear-gradient(135deg,#f59e0b,#ef4444)",
  "linear-gradient(135deg,#3b82f6,#8b5cf6)",
  "linear-gradient(135deg,#22c55e,#14b8a6)",
  "linear-gradient(135deg,#6366f1,#ec4899)",
  "linear-gradient(135deg,#14b8a6,#3b82f6)",
];

const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
const isAdmin    = ["Admin", "Manager"].includes(loggedUser?.role);

export default function Guests() {
  const navigate = useNavigate();

  const [guests,    setGuests]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editGuest, setEditGuest] = useState(null);
  const [menuOpen,  setMenuOpen]  = useState(null);
  const [actioning, setActioning] = useState(null);

  useEffect(() => { fetchGuests(); }, []);
  useEffect(() => {
    const close = () => setMenuOpen(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setGuests(Array.isArray(data) ? data.filter(u => u.role === "Guest") : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const stats = useMemo(() => ({
    total:    guests.length,
    active:   guests.filter(g => g.isActive).length,
    inactive: guests.filter(g => !g.isActive).length,
  }), [guests]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return guests.filter(g =>
      !q ||
      g.name?.toLowerCase().includes(q) ||
      g.email?.toLowerCase().includes(q) ||
      g.phone?.toLowerCase().includes(q) ||
      g.idProof?.toLowerCase().includes(q)
    );
  }, [guests, search]);

  const handleToggleActive = async (g) => {
    try {
      setActioning(g._id);
      if (g.isActive) await deactivateUser(g._id);
      else            await activateUser(g._id);
      setGuests(p => p.map(x => x._id === g._id ? { ...x, isActive: !x.isActive } : x));
    } catch (e) { console.error(e); }
    finally { setActioning(null); setMenuOpen(null); }
  };

  const initials = (name) => (name || "G").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 text-white">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Guest Management</h1>
          <p className="text-xs mt-1" style={{ color: "#64748b" }}>
            Manage guest profiles and personal information
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={fetchGuests} className="p-2 rounded-xl transition"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <RefreshCw size={15} style={{ color: "#64748b" }} />
          </button>
          {isAdmin && (
            <button onClick={() => { setEditGuest(null); setShowModal(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: "#f59e0b", color: "#000" }}
              onMouseEnter={e => e.currentTarget.style.background = "#d97706"}
              onMouseLeave={e => e.currentTarget.style.background = "#f59e0b"}>
              <Plus size={15} /> Add Guest
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Guests", value: stats.total,    color: "#fbbf24", bg: "rgba(245,158,11,0.1)"  },
          { label: "Active",       value: stats.active,   color: "#22c55e", bg: "rgba(34,197,94,0.1)"   },
          { label: "Inactive",     value: stats.inactive, color: "#f87171", bg: "rgba(239,68,68,0.1)"   },
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

      {/* Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2 rounded-xl"
          style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Search size={14} style={{ color: "#475569" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search guests by name, email, phone, ID..."
            className="bg-transparent text-sm outline-none flex-1 placeholder-slate-600" />
          {search && <button onClick={() => setSearch("")}><X size={13} style={{ color: "#475569" }} /></button>}
        </div>
        <p className="ml-auto text-xs" style={{ color: "#475569" }}>
          <span className="text-white font-medium">{filtered.length}</span> guests
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <User size={40} style={{ color: "#1e293b" }} />
          <p className="text-sm" style={{ color: "#334155" }}>No guests found</p>
        </div>
      )}

      {/* Guest cards */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((g, i) => (
            <div key={g._id} className="rounded-2xl overflow-hidden transition-all duration-200"
              style={{
                background: "#16181d",
                border: `1px solid ${g.isActive ? "rgba(255,255,255,0.07)" : "rgba(239,68,68,0.15)"}`,
                opacity: g.isActive ? 1 : 0.7,
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = g.isActive ? "rgba(255,255,255,0.14)" : "rgba(239,68,68,0.3)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = g.isActive ? "rgba(255,255,255,0.07)" : "rgba(239,68,68,0.15)"}>

              <div className="p-5 pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ background: GRADIENT[i % GRADIENT.length] }}>
                      {initials(g.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{g.name}</p>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 w-fit flex items-center gap-1"
                        style={{ background: "rgba(245,158,11,0.12)", color: "#fbbf24" }}>
                        <User size={10} /> Guest
                      </span>
                    </div>
                  </div>

                  <div className="relative" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setMenuOpen(menuOpen === g._id ? null : g._id)}
                      className="p-1.5 rounded-lg transition"
                      style={{ color: "#475569" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <MoreVertical size={14} />
                    </button>
                    {menuOpen === g._id && (
                      <div className="absolute right-0 top-8 z-30 rounded-xl overflow-hidden shadow-2xl"
                        style={{ background: "#1e2028", border: "1px solid rgba(255,255,255,0.1)", minWidth: 155 }}>
                        <MItem label="View Profile" color="#60a5fa"
                          onClick={() => { navigate(`/users/${g._id}`); setMenuOpen(null); }} />
                        {isAdmin && (
                          <MItem label="Edit Profile" color="#fbbf24"
                            onClick={() => { setEditGuest(g); setShowModal(true); setMenuOpen(null); }} />
                        )}
                        {isAdmin && (
                          <MItem
                            label={g.isActive ? "Deactivate" : "Activate"}
                            color={g.isActive ? "#f87171" : "#22c55e"}
                            loading={actioning === g._id}
                            onClick={() => handleToggleActive(g)} />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-5 pb-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs" style={{ color: "#64748b" }}>
                  <Mail size={11} /><span className="truncate">{g.email}</span>
                </div>
                {g.phone && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: "#64748b" }}>
                    <Phone size={11} /><span>{g.phone}</span>
                  </div>
                )}
                {g.address && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: "#64748b" }}>
                    <MapPin size={11} /><span className="truncate">{g.address}</span>
                  </div>
                )}
                {g.idProof && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: "#64748b" }}>
                    <Shield size={11} /><span className="truncate">ID: {g.idProof}</span>
                  </div>
                )}
              </div>

              <div className="px-5 pb-4 flex items-center justify-between">
                <span className="flex items-center gap-1 text-[10px] font-medium"
                  style={{ color: g.isActive ? "#22c55e" : "#f87171" }}>
                  {g.isActive ? <CheckCircle size={11} /> : <XCircle size={11} />}
                  {g.isActive ? "Active" : "Inactive"}
                </span>
                <button onClick={() => navigate(`/users/${g._id}`)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition"
                  style={{ background: "rgba(245,158,11,0.1)", color: "#fbbf24" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(245,158,11,0.2)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(245,158,11,0.1)"}>
                  <Eye size={11} /> View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <GuestModal
          guest={editGuest}
          onClose={() => { setShowModal(false); setEditGuest(null); }}
          onSaved={(saved, isEdit) => {
            if (isEdit) setGuests(p => p.map(g => g._id === saved._id ? { ...g, ...saved } : g));
            else        setGuests(p => [saved, ...p]);
            setShowModal(false); setEditGuest(null);
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

function GuestModal({ guest, onClose, onSaved }) {
  const isEdit = !!guest;
  const [form, setForm] = useState({
    name:     guest?.name     || "",
    email:    guest?.email    || "",
    password: "",
    phone:    guest?.phone    || "",
    address:  guest?.address  || "",
    idProof:  guest?.idProof  || "",
    role:     "Guest",
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [apiErr,  setApiErr]  = useState("");

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = "Required";
    if (!form.email.trim()) e.email = "Required";
    if (!isEdit && !form.password)           e.password = "Required";
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
        saved = await updateUser(guest._id, { name: form.name, phone: form.phone, address: form.address, idProof: form.idProof });
      } else {
        saved = await createStaff(form); // POST /api/users with role: Guest
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
            <h2 className="text-base font-semibold">{isEdit ? "Edit Guest" : "Add Guest"}</h2>
            <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
              {isEdit ? "Update guest information" : "Create a new guest profile"}
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

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>
              Full Name <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Guest full name"
              style={{ ...INP, borderColor: errors.name ? "#ef4444" : "rgba(255,255,255,0.08)" }} />
            {errors.name && <p className="text-[11px] mt-1" style={{ color: "#f87171" }}>{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>
              Email <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
              placeholder="guest@email.com" disabled={isEdit}
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

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>
              ID Proof / Passport No.
            </label>
            <input value={form.idProof} onChange={e => set("idProof", e.target.value)}
              placeholder="Passport or National ID number" style={INP} />
          </div>

          <div className="flex gap-3 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
              style={{ background: loading ? "#b45309" : "#f59e0b", color: "#000" }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#d97706"; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#f59e0b"; }}>
              {loading
                ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />{isEdit ? "Saving..." : "Creating..."}</>
                : <><Plus size={14} />{isEdit ? "Save Changes" : "Add Guest"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
