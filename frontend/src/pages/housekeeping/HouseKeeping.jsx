import { useEffect, useState, useMemo } from "react";
import {
  getHouseKeepingTasks,
  createHouseKeepingTask,
  updateHouseKeepingTask,
  deleteHouseKeepingTask,
} from "../../api/housekeepingApi";
import { getRooms } from "../../api/roomApi";
import { getUsers } from "../../api/userApi";
import {
  Search, Plus, X, RefreshCw, Sparkles,
  Clock, CheckCircle, Loader2, BedDouble, User, Trash2,
} from "lucide-react";

const STATUSES   = ["All", "Pending", "InProgress", "Completed"];
const TASK_TYPES = ["Cleaning", "Turndown", "DeepCleaning", "Inspection"];

const S = {
  Pending:    { bg: "rgba(245,158,11,0.12)",  text: "#fbbf24" },
  InProgress: { bg: "rgba(59,130,246,0.12)",  text: "#60a5fa" },
  Completed:  { bg: "rgba(34,197,94,0.12)",   text: "#22c55e" },
};

const CARD = { background: "#16181d", border: "1px solid rgba(255,255,255,0.07)" };
const INP  = {
  width: "100%", background: "#1e2028",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10, padding: "10px 14px",
  color: "#fff", fontSize: 13, outline: "none",
};

const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
const isAdmin = ["Admin", "Manager"].includes(loggedUser?.role);

export default function HouseKeeping() {
  const [tasks,        setTasks]        = useState([]);
  const [rooms,        setRooms]        = useState([]);
  const [staff,        setStaff]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal,    setShowModal]    = useState(false);
  const [updating,     setUpdating]     = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [t, r, u] = await Promise.all([
        getHouseKeepingTasks(),
        getRooms(),
        getUsers(),
      ]);
      setTasks(Array.isArray(t) ? t : []);
      setRooms(Array.isArray(r) ? r : []);
      // Include Housekeeping, Admin, Manager as assignable staff
      setStaff(Array.isArray(u) ? u.filter(x => ["Housekeeping", "Admin", "Manager"].includes(x.role)) : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const stats = useMemo(() => ({
    total:      tasks.length,
    pending:    tasks.filter(t => t.status === "Pending").length,
    inProgress: tasks.filter(t => t.status === "InProgress").length,
    completed:  tasks.filter(t => t.status === "Completed").length,
  }), [tasks]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return tasks.filter(t => {
      const matchSearch = !q ||
        t.room?.roomNumber?.toLowerCase().includes(q) ||
        t.assignedTo?.name?.toLowerCase().includes(q) ||
        t.taskType?.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tasks, search, statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdating(id);
      const updated = await updateHouseKeepingTask(id, { status: newStatus });
      setTasks(p => p.map(t => t._id === id ? { ...t, ...updated, status: newStatus } : t));
    } catch (e) { console.error(e); }
    finally { setUpdating(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteHouseKeepingTask(id);
      setTasks(p => p.filter(t => t._id !== id));
    } catch (e) { console.error(e); }
  };

  const progressPct = stats.total
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  return (
    <div className="space-y-6 text-white">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Housekeeping</h1>
          <p className="text-xs mt-1" style={{ color: "#64748b" }}>
            Manage cleaning tasks and staff assignments
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={fetchAll} className="p-2 rounded-xl transition"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <RefreshCw size={15} style={{ color: "#64748b" }} />
          </button>
          {isAdmin && (
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: "#6366f1", color: "#fff" }}
              onMouseEnter={e => e.currentTarget.style.background = "#4f46e5"}
              onMouseLeave={e => e.currentTarget.style.background = "#6366f1"}>
              <Plus size={15} /> New Task
            </button>
          )}
        </div>
      </div>

      {/* Progress + Active Staff */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Progress card */}
        <div className="lg:col-span-2 rounded-2xl p-6" style={CARD}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Today's Progress</h3>
              <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                {stats.completed} of {stats.total} tasks completed
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa" }}>
              {progressPct}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full mb-6" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-2 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%`, background: "linear-gradient(90deg,#6366f1,#22c55e)" }} />
          </div>

          {/* Stat boxes */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Pending",     value: stats.pending,    key: "Pending"    },
              { label: "In Progress", value: stats.inProgress, key: "InProgress" },
              { label: "Completed",   value: stats.completed,  key: "Completed"  },
            ].map(s => {
              const st = S[s.key];
              return (
                <button key={s.key}
                  onClick={() => setStatusFilter(statusFilter === s.key ? "All" : s.key)}
                  className="rounded-xl p-4 text-center transition"
                  style={{
                    background: statusFilter === s.key ? st.bg : "rgba(255,255,255,0.03)",
                    border: `1px solid ${statusFilter === s.key ? st.text + "40" : "rgba(255,255,255,0.06)"}`,
                  }}>
                  <p className="text-2xl font-bold" style={{ color: st.text }}>{s.value}</p>
                  <p className="text-xs mt-1" style={{ color: st.text }}>{s.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Staff */}
        <div className="rounded-2xl p-6" style={CARD}>
          <h3 className="text-sm font-semibold mb-4">Active Staff</h3>
          {staff.length === 0 ? (
            <p className="text-xs text-center py-8" style={{ color: "#334155" }}>
              No housekeeping staff found
            </p>
          ) : (
            <div className="space-y-3">
              {staff.map(s => {
                const myTasks   = tasks.filter(t =>
                  t.assignedTo?._id === s._id || t.assignedTo === s._id
                );
                const active    = myTasks.filter(t => t.status === "InProgress").length;
                const completed = myTasks.filter(t => t.status === "Completed").length;
                const initials  = s.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <div key={s._id} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                      style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{s.name}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "#475569" }}>
                        {active} active · {completed} done
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={active > 0
                        ? { background: "rgba(59,130,246,0.12)", color: "#60a5fa" }
                        : { background: "rgba(34,197,94,0.12)",  color: "#22c55e" }}>
                      {active > 0 ? "Active" : "Free"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2 rounded-xl"
          style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Search size={14} style={{ color: "#475569" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="bg-transparent text-sm outline-none flex-1 placeholder-slate-600" />
          {search && (
            <button onClick={() => setSearch("")}>
              <X size={13} style={{ color: "#475569" }} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.08)" }}>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-transparent text-sm outline-none text-white cursor-pointer">
            {STATUSES.map(s => (
              <option key={s} value={s} className="bg-[#1e2028]">
                {s === "All" ? "All Status" : s}
              </option>
            ))}
          </select>
        </div>

        {(statusFilter !== "All" || search) && (
          <button onClick={() => { setSearch(""); setStatusFilter("All"); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"
            style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
            <X size={12} /> Clear
          </button>
        )}

        <p className="ml-auto text-xs" style={{ color: "#475569" }}>
          <span className="text-white font-medium">{filtered.length}</span> of {tasks.length} tasks
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
          <Sparkles size={40} style={{ color: "#1e293b" }} />
          <p className="text-sm" style={{ color: "#334155" }}>No tasks found</p>
          {isAdmin && (
            <button onClick={() => setShowModal(true)}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8" }}>
              + Assign first task
            </button>
          )}
        </div>
      )}

      {/* Task Cards */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              isAdmin={isAdmin}
              updating={updating === task._id}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <NewTaskModal
          rooms={rooms}
          staff={staff}
          onClose={() => setShowModal(false)}
          onCreated={nt => { setTasks(p => [nt, ...p]); setShowModal(false); }}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   TASK CARD
════════════════════════════════════════════════════════ */
function TaskCard({ task, isAdmin, updating, onStatusChange, onDelete }) {
  const st       = S[task.status] || S.Pending;
  const nextStatus = task.status === "Pending" ? "InProgress" : task.status === "InProgress" ? "Completed" : null;
  const nextLabel  = task.status === "Pending" ? "Start Task" : task.status === "InProgress" ? "Mark Complete" : null;
  const initials   = (task.assignedTo?.name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const elapsed    = task.createdAt
    ? Math.round((Date.now() - new Date(task.createdAt)) / (1000 * 60))
    : 0;

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.07)" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.13)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}>

      {/* Top */}
      <div className="p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(99,102,241,0.12)" }}>
              <BedDouble size={15} style={{ color: "#818cf8" }} />
            </div>
            <div>
              <p className="text-sm font-semibold">Room {task.room?.roomNumber || "—"}</p>
              <p className="text-[11px]" style={{ color: "#475569" }}>
                {task.room?.type || ""} · Floor {task.room?.floor || "—"}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0"
            style={{ background: st.bg, color: st.text }}>
            {task.status}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa" }}>
            {task.taskType}
          </span>
          <div className="flex items-center gap-1 text-[11px]" style={{ color: "#475569" }}>
            <Clock size={11} /> {elapsed} min ago
          </div>
        </div>

        <div className="flex items-center gap-2">
          {task.assignedTo ? (
            <>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                {initials}
              </div>
              <p className="text-xs" style={{ color: "#94a3b8" }}>{task.assignedTo.name}</p>
            </>
          ) : (
            <>
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,255,255,0.05)" }}>
                <User size={11} style={{ color: "#475569" }} />
              </div>
              <p className="text-xs" style={{ color: "#334155" }}>Unassigned</p>
            </>
          )}
        </div>

        {task.notes && (
          <p className="text-[11px] px-3 py-2 rounded-lg"
            style={{ background: "rgba(255,255,255,0.03)", color: "#64748b" }}>
            {task.notes}
          </p>
        )}

        {task.completedAt && (
          <p className="text-[11px]" style={{ color: "#22c55e" }}>
            Completed {new Date(task.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 flex items-center gap-2">
        {nextStatus && (
          <button
            onClick={() => onStatusChange(task._id, nextStatus)}
            disabled={updating}
            className="flex-1 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition"
            style={{
              background: task.status === "Pending" ? "rgba(59,130,246,0.12)" : "rgba(34,197,94,0.12)",
              color:      task.status === "Pending" ? "#60a5fa" : "#22c55e",
            }}>
            {updating
              ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
              : nextLabel}
          </button>
        )}
        {task.status === "Completed" && (
          <div className="flex-1 py-2 rounded-xl text-xs font-medium text-center"
            style={{ background: "rgba(34,197,94,0.08)", color: "#22c55e" }}>
            Done
          </div>
        )}
        {isAdmin && (
          <button onClick={() => onDelete(task._id)}
            className="p-2 rounded-xl transition"
            style={{ background: "rgba(239,68,68,0.08)", color: "#f87171" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.18)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}>
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   NEW TASK MODAL
════════════════════════════════════════════════════════ */
function NewTaskModal({ rooms, staff, onClose, onCreated }) {
  const [form,    setForm]    = useState({ room: "", assignedTo: "", taskType: "Cleaning", notes: "" });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [apiErr,  setApiErr]  = useState("");

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.room)       e.room       = "Select a room";
    if (!form.assignedTo) e.assignedTo = "Select staff";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true); setApiErr("");
      const nt = await createHouseKeepingTask(form);
      onCreated(nt);
    } catch (err) {
      setApiErr(err?.response?.data?.message || "Failed to create task");
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
            <h2 className="text-base font-semibold">New Housekeeping Task</h2>
            <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>Assign a cleaning task to staff</p>
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

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>
              Room <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select value={form.room} onChange={e => set("room", e.target.value)}
              style={{ ...INP, cursor: "pointer", borderColor: errors.room ? "#ef4444" : "rgba(255,255,255,0.08)" }}>
              <option value="" className="bg-[#1e2028]">Select room</option>
              {rooms.map(r => (
                <option key={r._id} value={r._id} className="bg-[#1e2028]">
                  Room {r.roomNumber} — {r.type} — Floor {r.floor} ({r.status})
                </option>
              ))}
            </select>
            {errors.room && <p className="text-[11px] mt-1" style={{ color: "#f87171" }}>{errors.room}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>
              Assign To <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select value={form.assignedTo} onChange={e => set("assignedTo", e.target.value)}
              style={{ ...INP, cursor: "pointer", borderColor: errors.assignedTo ? "#ef4444" : "rgba(255,255,255,0.08)" }}>
              <option value="" className="bg-[#1e2028]">Select staff member</option>
              {staff.map(s => (
                <option key={s._id} value={s._id} className="bg-[#1e2028]">{s.name} ({s.role})</option>
              ))}
            </select>
            {errors.assignedTo && <p className="text-[11px] mt-1" style={{ color: "#f87171" }}>{errors.assignedTo}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "#94a3b8" }}>Task Type</label>
            <div className="grid grid-cols-2 gap-2">
              {TASK_TYPES.map(t => (
                <button key={t} type="button" onClick={() => set("taskType", t)}
                  className="py-2 rounded-xl text-xs font-medium transition"
                  style={{
                    background: form.taskType === t ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
                    color:      form.taskType === t ? "#818cf8" : "#64748b",
                    border:     `1px solid ${form.taskType === t ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.07)"}`,
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Notes</label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
              placeholder="Any special instructions..." rows={2}
              style={{ ...INP, resize: "none" }} />
          </div>

          <div className="flex gap-3 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
              style={{ background: loading ? "#4338ca" : "#6366f1", color: "#fff" }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#4f46e5"; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#6366f1"; }}>
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</>
                : <><Plus size={14} />Assign Task</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
