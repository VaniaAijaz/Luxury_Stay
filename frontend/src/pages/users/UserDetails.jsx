import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, updateUser, deactivateUser, activateUser } from "../../api/userApi";
import {
  ArrowLeft, Mail, Phone, MapPin, Shield,
  CheckCircle, XCircle, AlertCircle, Save, User,
} from "lucide-react";

const ROLE_S = {
  Admin:        { bg: "rgba(239,68,68,0.12)",   text: "#f87171"  },
  Manager:      { bg: "rgba(168,85,247,0.12)",  text: "#c084fc"  },
  Receptionist: { bg: "rgba(59,130,246,0.12)",  text: "#60a5fa"  },
  Housekeeping: { bg: "rgba(34,197,94,0.12)",   text: "#22c55e"  },
  Guest:        { bg: "rgba(245,158,11,0.12)",  text: "#fbbf24"  },
};

const INP = {
  width: "100%", background: "#1e2028",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10, padding: "10px 14px",
  color: "#fff", fontSize: 13, outline: "none",
};

const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
const isAdmin    = loggedUser?.role === "Admin";

export default function UserDetails() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [user,      setUser]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [toggling,  setToggling]  = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");
  const [editForm,  setEditForm]  = useState(null);

  useEffect(() => { fetchUser(); }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const data = await getUserById(id);
      setUser(data);
      setEditForm({
        name:    data.name    || "",
        phone:   data.phone   || "",
        address: data.address || "",
        idProof: data.idProof || "",
        role:    data.role    || "Guest",
      });
    } catch (e) { setError("User not found"); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      setSaving(true); setError(""); setSuccess("");
      await updateUser(id, editForm);
      setUser(p => ({ ...p, ...editForm }));
      setSuccess("Profile updated successfully");
    } catch (e) { setError(e?.response?.data?.message || "Update failed"); }
    finally { setSaving(false); }
  };

  const handleToggle = async () => {
    try {
      setToggling(true); setError(""); setSuccess("");
      if (user.isActive) {
        await deactivateUser(id);
        setUser(p => ({ ...p, isActive: false }));
        setSuccess("Account deactivated");
      } else {
        await activateUser(id);
        setUser(p => ({ ...p, isActive: true }));
        setSuccess("Account activated");
      }
    } catch (e) { setError("Action failed"); }
    finally { setToggling(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error && !user) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <AlertCircle size={40} style={{ color: "#334155" }} />
      <p style={{ color: "#64748b" }}>{error}</p>
      <button onClick={() => navigate("/users")}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
        style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa" }}>
        <ArrowLeft size={14} /> Back
      </button>
    </div>
  );

  const rs       = ROLE_S[user.role] || ROLE_S.Guest;
  const initials = (user.name || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-5 text-white">

      {/* Back */}
      <button onClick={() => navigate("/users")}
        className="flex items-center gap-2 text-sm transition"
        style={{ color: "#64748b" }}
        onMouseEnter={e => e.currentTarget.style.color = "#fff"}
        onMouseLeave={e => e.currentTarget.style.color = "#64748b"}>
        <ArrowLeft size={15} /> Back to Users
      </button>

      {/* Alerts */}
      {error && (
        <div className="px-4 py-3 rounded-xl text-sm"
          style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
          {error}
        </div>
      )}
      {success && (
        <div className="px-4 py-3 rounded-xl text-sm"
          style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
          {success}
        </div>
      )}

      {/* Profile header */}
      <div className="rounded-2xl p-6"
        style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0"
            style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{user.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: rs.bg, color: rs.text }}>
                {user.role}
              </span>
              <span className="flex items-center gap-1 text-xs font-medium"
                style={{ color: user.isActive ? "#22c55e" : "#f87171" }}>
                {user.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                {user.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm" style={{ color: "#94a3b8" }}>
            <Mail size={13} style={{ color: "#475569" }} /> {user.email}
          </div>
          {user.phone && (
            <div className="flex items-center gap-2 text-sm" style={{ color: "#94a3b8" }}>
              <Phone size={13} style={{ color: "#475569" }} /> {user.phone}
            </div>
          )}
          {user.address && (
            <div className="flex items-center gap-2 text-sm" style={{ color: "#94a3b8" }}>
              <MapPin size={13} style={{ color: "#475569" }} /> {user.address}
            </div>
          )}
          {user.idProof && (
            <div className="flex items-center gap-2 text-sm" style={{ color: "#94a3b8" }}>
              <Shield size={13} style={{ color: "#475569" }} /> ID: {user.idProof}
            </div>
          )}
          <div className="flex items-center gap-2 text-xs" style={{ color: "#334155" }}>
            <User size={11} /> Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </div>
        </div>
      </div>

      {/* Edit form — admin only */}
      {isAdmin && editForm && (
        <div className="rounded-2xl p-6 space-y-4"
          style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "#94a3b8" }}>Edit Profile</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Full Name</label>
              <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                style={INP} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Role</label>
              <select value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}
                style={{ ...INP, cursor: "pointer" }}>
                {["Manager", "Receptionist", "Housekeeping", "Guest"].map(r => (
                  <option key={r} value={r} className="bg-[#1e2028]">{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Phone</label>
              <input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+1 234 567 890" style={INP} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Address</label>
              <input value={editForm.address} onChange={e => setEditForm(p => ({ ...p, address: e.target.value }))}
                placeholder="City, Country" style={INP} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>ID Proof</label>
            <input value={editForm.idProof} onChange={e => setEditForm(p => ({ ...p, idProof: e.target.value }))}
              placeholder="Passport or National ID" style={INP} />
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition"
            style={{ background: saving ? "#1d4ed8" : "#3b82f6", color: "#fff" }}>
            {saving
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
              : <><Save size={14} />Save Changes</>}
          </button>
        </div>
      )}

      {/* Activate / Deactivate */}
      {isAdmin && user.role !== "Admin" && (
        <div className="rounded-2xl p-6"
          style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "#94a3b8" }}>Account Status</h3>
          <button onClick={handleToggle} disabled={toggling}
            className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition"
            style={{
              background: user.isActive ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
              color:      user.isActive ? "#f87171" : "#22c55e",
              border:     `1px solid ${user.isActive ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)"}`,
            }}>
            {toggling
              ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : user.isActive ? <XCircle size={15} /> : <CheckCircle size={15} />}
            {user.isActive ? "Deactivate Account" : "Activate Account"}
          </button>
        </div>
      )}
    </div>
  );
}
