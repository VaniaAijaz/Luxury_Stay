import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMaintenanceRequests,
  createMaintenanceRequest,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
} from "../../api/maintenanceApi";
import { getRooms } from "../../api/roomApi";
import { getUsers } from "../../api/userApi";
import {
  Search, Plus, X, RefreshCw, Wrench,
  AlertTriangle, CheckCircle, Clock, Zap,
  BedDouble, User, MoreVertical, Trash2,
  ChevronDown, ArrowUpRight,
} from "lucide-react";

/* ─── constants ─── */
const STATUSES   = ["All", "Open", "InProgress", "Resolved", "Closed"];
const PRIORITIES = ["All", "Low", "Medium", "High", "Urgent"];

const STATUS_S = {
  Open:       { bg: "rgba(59,130,246,0.15)",  text: "#60a5fa",  label: "Open"       },
  InProgress: { bg: "rgba(245,158,11,0.15)",  text: "#fbbf24",  label: "In Progress"},
  Resolved:   { bg: "rgba(34,197,94,0.15)",   text: "#22c55e",  label: "Resolved"   },
  Closed:     { bg: "rgba(100,116,139,0.15)", text: "#94a3b8",  label: "Closed"     },
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

const timeAgo = (d) => {
  const mins = Math.round((Date.now() - new Date(d)) / 60000);
  if (mins < 60)  return `${mins} min${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24)   return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  return `${Math.round(hrs / 24)} day${Math.round(hrs/24)!==1?"s":""} ago`;
};

const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
const isAdmin    = ["Admin", "Manager"].includes(loggedUser?.role);
const isStaff    = ["Admin", "Manager", "Receptionist"].includes(loggedUser?.role);

/* ════════════════════════════════════════════════════════ */
export default function Maintenance() {
  const navigate = useNavigate();

  const [requests,      setRequests]      = useState([]);
  const [rooms,         setRooms]         = useState([]);
  const [users,         setUsers]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState("All");
  const [priorityFilter,setPriorityFilter]= useState("All");
  const [showModal,     setShowModal]     = useState(false);
  const [menuOpen,      setMenuOpen]      = useState(null);
  const [updating,      setUpdating]      = useState(null);

  useEffect(() => { fetchAll(); }, []);

  // close menu on outside click
  useEffect(() => {
    const handler = () => setMenuOpen(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [r, rm, u] = await Promise.all([
        getMaintenanceRequests(),
        getRooms(),
        getUsers(),
      ]);
      setRequests(Array.isArray(r)  ? r  : []);
      setRooms   (Array.isArray(rm) ? rm : []);
      setUsers   (Array.isArray(u)  ? u  : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  /* ── stats ── */
  const stats = useMemo(() => [
    { label: "Open Requests", value: requests.filter(r => r.status === "Open").length,       icon: <AlertTriangle size={18}/>, color: "#f87171", bg: "rgba(239,68,68,0.1)"   },
    { label: "In Progress",   value: requests.filter(r => r.status === "InProgress").length, icon: <Wrench size={18}/>,        color: "#fbbf24", bg: "rgba(245,158,11,0.1)" },
    { label: "Completed",     value: requests.filter(r => r.status === "Resolved" || r.status === "Closed").length, icon: <CheckCircle size={18}/>, color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
    { label: "Critical Issues",value: requests.filter(r => r.priority === "Urgent").length,  icon: <Zap size={18}/>,           color: "#f87171", bg: "rgba(239,68,68,0.1)"   },
  ], [requests]);

  /* ── filtered ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return requests.filter(r => {
      const matchSearch = !q ||
        r.title?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.room?.roomNumber?.toLowerCase().includes(q);
      const matchStatus   = statusFilter   === "All" || r.status   === statusFilter;
      const matchPriority = priorityFilter === "All" || r.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [requests, search, statusFilter, priorityFilter]);

  /* ── status update ── */
  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdating(id);
      await updateMaintenanceRequest(id, { status: newStatus });
      setRequests(p => p.map(r => r._id === id ? { ...r, status: newStatus } : r));
    } catch (e) { console.error(e); }
    finally { setUpdating(null); setMenuOpen(null); }
  };

  /* ── delete ── */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this request?")) return;
    try {
      await deleteMaintenanceRequest(id);
      setRequests(p => p.filter(r => r._id !== id));
    } catch (e) { console.error(e); }
    setMenuOpen(null);
  };

  return (
    <div className="space-y-6 text-white">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Maintenance</h1>
          <p className="text-xs mt-1" style={{ color: "#64748b" }}>
            Track and manage maintenance requests
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={fetchAll} className="p-2 rounded-xl transition"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <RefreshCw size={15} style={{ color: "#64748b" }} />
          </button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: "#3b82f6", color: "#fff" }}
            onMouseEnter={e => e.currentTarget.style.background = "#2563eb"}
            onMouseLeave={e => e.currentTarget.style.background = "#3b82f6"}>
            <Plus size={15} /> New Request
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div>
              <p className="text-3xl font-bold leading-none">{s.value}</p>
              <p className="text-[11px] mt-1.5" style={{ color: "#64748b" }}>{s.label}</p>
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
            placeholder="Search requests..."
            className="bg-transparent text-sm outline-none flex-1 placeholder-slate-600" />
          {search && <button onClick={() => setSearch("")}><X size={13} style={{ color: "#475569" }} /></button>}
        </div>

        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.08)" }}>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-transparent text-sm outline-none text-white cursor-pointer">
            {STATUSES.map(s => <option key={s} value={s} className="bg-[#1e2028]">{s === "All" ? "All Status" : s}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.08)" }}>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
            className="bg-transparent text-sm outline-none text-white cursor-pointer">
            {PRIORITIES.map(p => <option key={p} value={p} className="bg-[#1e2028]">{p === "All" ? "All Priority" : p}</option>)}
          </select>
        </div>

        {(statusFilter !== "All" || priorityFilter !== "All" || search) && (
          <button onClick={() => { setSearch(""); setStatusFilter("All"); setPriorityFilter("All"); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"
            style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
            <X size={12} /> Clear
          </button>
        )}

        <p className="ml-auto text-xs" style={{ color: "#475569" }}>
          <span className="text-white font-medium">{filtered.length}</span> of {requests.length} requests
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
          <Wrench size={40} style={{ color: "#1e293b" }} />
          <p className="text-sm" style={{ color: "#334155" }}>No maintenance requests found</p>
          <button onClick={() => setShowModal(true)}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa" }}>
            + Create first request
          </button>
        </div>
      )}

      {/* Request list — image style */}
      {!loading && filtered.length > 0 && (
        <div className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          {filtered.map((req, i) => {
            const ss = STATUS_S[req.status]   || STATUS_S.Open;
            const ps = PRIORITY_S[req.priority] || PRIORITY_S.Medium;
            const initials = (req.assignedTo?.name || req.reportedBy?.name || "?")
              .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

            return (
              <div key={req._id}
                className="flex items-start gap-4 px-5 py-4 transition cursor-pointer"
                style={{
                  background: i % 2 === 0 ? "#13151a" : "#16181d",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(59,130,246,0.04)"}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#13151a" : "#16181d"}
                onClick={() => navigate(`/maintenance/${req._id}`)}
              >
                {/* Icon */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: ps.bg, color: ps.text }}>
                  <Wrench size={16} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title + badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold">{req.title}</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: ss.bg, color: ss.text }}>
                      {ss.label}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: ps.bg, color: ps.text }}>
                      {req.priority}
                    </span>
                  </div>

                  {/* Room */}
                  <p className="text-[11px] mt-0.5" style={{ color: "#475569" }}>
                    Room {req.room?.roomNumber || "—"} · {req.room?.type || ""}
                  </p>

                  {/* Description */}
                  <p className="text-xs mt-1.5 line-clamp-1" style={{ color: "#64748b" }}>
                    {req.description}
                  </p>

                  {/* Meta row */}
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    {/* Assigned / Unassigned */}
                    <div className="flex items-center gap-1.5">
                      {req.assignedTo ? (
                        <>
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                            style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
                            {initials}
                          </div>
                          <span className="text-[11px]" style={{ color: "#94a3b8" }}>
                            {req.assignedTo.name}
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: "rgba(255,255,255,0.06)" }}>
                            <User size={10} style={{ color: "#475569" }} />
                          </div>
                          <span className="text-[11px]" style={{ color: "#334155" }}>Unassigned</span>
                        </>
                      )}
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-1 text-[11px]" style={{ color: "#475569" }}>
                      <Clock size={11} /> {timeAgo(req.createdAt)}
                    </div>

                    {/* Reported by */}
                    <span className="text-[11px]" style={{ color: "#334155" }}>
                      Reported by {req.reportedBy?.role || "Guest"}
                    </span>

                    {/* Est cost */}
                    {req.notes && req.notes.match(/\$\d+/) && (
                      <span className="text-[11px] font-semibold" style={{ color: "#22c55e" }}>
                        Est. {req.notes.match(/\$\d+/)[0]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions menu */}
                <div className="relative shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => setMenuOpen(menuOpen === req._id ? null : req._id)}
                    className="p-1.5 rounded-lg transition"
                    style={{ color: "#475569" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <MoreVertical size={15} />
                  </button>

                  {menuOpen === req._id && (
                    <div className="absolute right-0 top-8 z-30 rounded-xl overflow-hidden shadow-2xl"
                      style={{ background: "#1e2028", border: "1px solid rgba(255,255,255,0.1)", minWidth: 160 }}>

                      {/* Status changes */}
                      {req.status === "Open" && (
                        <MenuItem label="Mark In Progress" color="#fbbf24"
                          onClick={() => handleStatusChange(req._id, "InProgress")} />
                      )}
                      {req.status === "InProgress" && (
                        <MenuItem label="Mark Resolved" color="#22c55e"
                          onClick={() => handleStatusChange(req._id, "Resolved")} />
                      )}
                      {(req.status === "Resolved" || req.status === "InProgress") && (
                        <MenuItem label="Close Request" color="#94a3b8"
                          onClick={() => handleStatusChange(req._id, "Closed")} />
                      )}

                      <MenuItem label="View Details" color="#60a5fa"
                        onClick={() => { navigate(`/maintenance/${req._id}`); setMenuOpen(null); }} />

                      {isAdmin && (
                        <MenuItem label="Delete" color="#f87171"
                          onClick={() => handleDelete(req._id)} />
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <NewRequestModal
          rooms={rooms}
          users={users}
          onClose={() => setShowModal(false)}
          onCreated={nr => { setRequests(p => [nr, ...p]); setShowModal(false); }}
        />
      )}
    </div>
  );
}

/* ── Menu item ── */
function MenuItem({ label, color, onClick }) {
  return (
    <button onClick={onClick}
      className="w-full text-left px-4 py-2.5 text-xs font-medium transition"
      style={{ color }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      {label}
    </button>
  );
}

/* ════════════════════════════════════════════════════════
   NEW REQUEST MODAL
════════════════════════════════════════════════════════ */
function NewRequestModal({ rooms, users, onClose, onCreated }) {
  const [form, setForm] = useState({
    room: "", title: "", description: "",
    priority: "Medium", notes: "",
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [apiErr,  setApiErr]  = useState("");

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.room)        e.room        = "Select a room";
    if (!form.title.trim()) e.title      = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true); setApiErr("");
      const nr = await createMaintenanceRequest(form);
      onCreated(nr);
    } catch (err) {
      setApiErr(err?.response?.data?.message || "Failed to create request");
    } finally { setLoading(false); }
  };

  const PRIORITIES_LIST = ["Low", "Medium", "High", "Urgent"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }} onClick={onClose}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: "#13151a", border: "1px solid rgba(255,255,255,0.1)" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <h2 className="text-base font-semibold">New Maintenance Request</h2>
            <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
              Report a maintenance issue
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
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

          {/* Room */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>
              Room <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select value={form.room} onChange={e => set("room", e.target.value)}
              style={{ ...INP, cursor: "pointer", borderColor: errors.room ? "#ef4444" : "rgba(255,255,255,0.08)" }}>
              <option value="" className="bg-[#1e2028]">Select room</option>
              {rooms.map(r => (
                <option key={r._id} value={r._id} className="bg-[#1e2028]">
                  Room {r.roomNumber} — {r.type} — Floor {r.floor}
                </option>
              ))}
            </select>
            {errors.room && <p className="text-[11px] mt-1" style={{ color: "#f87171" }}>{errors.room}</p>}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>
              Issue Title <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input value={form.title} onChange={e => set("title", e.target.value)}
              placeholder="e.g. AC not cooling properly"
              style={{ ...INP, borderColor: errors.title ? "#ef4444" : "rgba(255,255,255,0.08)" }} />
            {errors.title && <p className="text-[11px] mt-1" style={{ color: "#f87171" }}>{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>
              Description <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)}
              placeholder="Describe the issue in detail..."
              rows={3} style={{ ...INP, resize: "none", borderColor: errors.description ? "#ef4444" : "rgba(255,255,255,0.08)" }} />
            {errors.description && <p className="text-[11px] mt-1" style={{ color: "#f87171" }}>{errors.description}</p>}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "#94a3b8" }}>Priority</label>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITIES_LIST.map(p => {
                const ps = PRIORITY_S[p];
                return (
                  <button key={p} type="button" onClick={() => set("priority", p)}
                    className="py-2 rounded-xl text-xs font-medium transition"
                    style={{
                      background: form.priority === p ? ps.bg : "rgba(255,255,255,0.04)",
                      color:      form.priority === p ? ps.text : "#64748b",
                      border:     `1px solid ${form.priority === p ? ps.text + "40" : "rgba(255,255,255,0.07)"}`,
                    }}>
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes / Est. cost */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>
              Notes / Est. Cost
            </label>
            <input value={form.notes} onChange={e => set("notes", e.target.value)}
              placeholder="e.g. Est. $150 — needs technician"
              style={INP} />
          </div>

          {/* Buttons */}
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
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</>
                : <><Plus size={14} />Submit Request</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
