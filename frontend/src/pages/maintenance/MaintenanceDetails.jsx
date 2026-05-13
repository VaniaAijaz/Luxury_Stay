import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getMaintenanceRequestById,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
} from "../../api/maintenanceApi";
import { getUsers } from "../../api/userApi";
import {
  ArrowLeft, Wrench, Trash2, AlertCircle,
  CheckCircle, Clock, User, Save,
} from "lucide-react";

const STATUS_S = {
  Open:       { bg: "rgba(59,130,246,0.15)",  text: "#60a5fa"  },
  InProgress: { bg: "rgba(245,158,11,0.15)",  text: "#fbbf24"  },
  Resolved:   { bg: "rgba(34,197,94,0.15)",   text: "#22c55e"  },
  Closed:     { bg: "rgba(100,116,139,0.15)", text: "#94a3b8"  },
};
const PRIORITY_S = {
  Low:    { bg: "rgba(100,116,139,0.15)", text: "#94a3b8" },
  Medium: { bg: "rgba(59,130,246,0.15)",  text: "#60a5fa" },
  High:   { bg: "rgba(245,158,11,0.15)",  text: "#fbbf24" },
  Urgent: { bg: "rgba(239,68,68,0.15)",   text: "#f87171" },
};

const INP = {
  width: "100%", background: "#1e2028",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10, padding: "10px 14px",
  color: "#fff", fontSize: 13, outline: "none",
};

const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
const isAdmin    = ["Admin", "Manager"].includes(loggedUser?.role);

export default function MaintenanceDetails() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [req,      setReq]      = useState(null);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");
  const [editForm, setEditForm] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [r, u] = await Promise.all([
        getMaintenanceRequestById(id),
        getUsers(),
      ]);
      setReq(r);
      setEditForm({
        status:     r.status,
        priority:   r.priority,
        assignedTo: r.assignedTo?._id || "",
        notes:      r.notes || "",
      });
      setUsers(Array.isArray(u) ? u.filter(x => ["Admin","Manager","Receptionist","Housekeeping"].includes(x.role)) : []);
    } catch (e) { setError("Request not found"); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await updateMaintenanceRequest(id, editForm);
      setReq(p => ({ ...p, ...updated }));
    } catch (e) { setError(e?.response?.data?.message || "Update failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this request?")) return;
    try {
      await deleteMaintenanceRequest(id);
      navigate("/maintenance");
    } catch (e) { setError("Delete failed"); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !req) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <AlertCircle size={40} style={{ color: "#334155" }} />
      <p style={{ color: "#64748b" }}>{error || "Not found"}</p>
      <button onClick={() => navigate("/maintenance")}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
        style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa" }}>
        <ArrowLeft size={14} /> Back
      </button>
    </div>
  );

  const ss = STATUS_S[req.status]     || STATUS_S.Open;
  const ps = PRIORITY_S[req.priority] || PRIORITY_S.Medium;

  return (
    <div className="max-w-2xl mx-auto space-y-5 text-white">

      {/* Back */}
      <button onClick={() => navigate("/maintenance")}
        className="flex items-center gap-2 text-sm transition"
        style={{ color: "#64748b" }}
        onMouseEnter={e => e.currentTarget.style.color = "#fff"}
        onMouseLeave={e => e.currentTarget.style.color = "#64748b"}>
        <ArrowLeft size={15} /> Back to Maintenance
      </button>

      {/* Header */}
      <div className="rounded-2xl p-6"
        style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: ps.bg, color: ps.text }}>
              <Wrench size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold">{req.title}</h1>
              <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
                Room {req.room?.roomNumber || "—"} · {req.room?.type || ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: ss.bg, color: ss.text }}>{req.status}</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: ps.bg, color: ps.text }}>{req.priority}</span>
          </div>
        </div>

        <p className="text-sm mt-4" style={{ color: "#94a3b8" }}>{req.description}</p>

        <div className="flex items-center gap-4 mt-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "#475569" }}>
            <Clock size={12} />
            {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "#475569" }}>
            <User size={12} />
            Reported by {req.reportedBy?.name || "—"} ({req.reportedBy?.role || "—"})
          </div>
          {req.resolvedAt && (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "#22c55e" }}>
              <CheckCircle size={12} />
              Resolved {new Date(req.resolvedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Edit panel — admin only */}
      {isAdmin && editForm && (
        <div className="rounded-2xl p-6 space-y-4"
          style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "#94a3b8" }}>Update Request</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Status</label>
              <select value={editForm.status}
                onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
                style={{ ...INP, cursor: "pointer" }}>
                {["Open","InProgress","Resolved","Closed"].map(s => (
                  <option key={s} value={s} className="bg-[#1e2028]">{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Priority</label>
              <select value={editForm.priority}
                onChange={e => setEditForm(p => ({ ...p, priority: e.target.value }))}
                style={{ ...INP, cursor: "pointer" }}>
                {["Low","Medium","High","Urgent"].map(p => (
                  <option key={p} value={p} className="bg-[#1e2028]">{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Assign To</label>
            <select value={editForm.assignedTo}
              onChange={e => setEditForm(p => ({ ...p, assignedTo: e.target.value }))}
              style={{ ...INP, cursor: "pointer" }}>
              <option value="" className="bg-[#1e2028]">Unassigned</option>
              {users.map(u => (
                <option key={u._id} value={u._id} className="bg-[#1e2028]">
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Notes</label>
            <textarea value={editForm.notes}
              onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Add notes or estimated cost..." rows={2}
              style={{ ...INP, resize: "none" }} />
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

      {/* Delete */}
      {isAdmin && (
        <div className="rounded-2xl p-6"
          style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "#94a3b8" }}>Danger Zone</h3>
          <button onClick={handleDelete}
            className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition"
            style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.15)" }}>
            <Trash2 size={14} /> Delete Request
          </button>
        </div>
      )}
    </div>
  );
}