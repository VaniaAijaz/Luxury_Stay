import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getHouseKeepingTaskById,
  updateHouseKeepingTask,
  deleteHouseKeepingTask,
} from "../../api/housekeepingApi";
import {
  BedDouble, ArrowLeft, Trash2, CheckCircle,
  Loader2, AlertCircle, Clock, User,
} from "lucide-react";

const S = {
  Pending:    { bg: "rgba(245,158,11,0.12)",  text: "#fbbf24" },
  InProgress: { bg: "rgba(59,130,246,0.12)",  text: "#60a5fa" },
  Completed:  { bg: "rgba(34,197,94,0.12)",   text: "#22c55e" },
};

const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
const isAdmin = ["Admin", "Manager"].includes(loggedUser?.role);

export default function HouseKeepingDetails() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [task,     setTask]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error,    setError]    = useState("");

  useEffect(() => { fetchTask(); }, [id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const data = await getHouseKeepingTaskById(id);
      setTask(data);
    } catch (e) { setError("Task not found"); }
    finally { setLoading(false); }
  };

  const handleStatus = async (newStatus) => {
    try {
      setUpdating(true);
      const updated = await updateHouseKeepingTask(id, { status: newStatus });
      setTask(p => ({ ...p, ...updated, status: newStatus }));
    } catch (e) { setError(e?.response?.data?.message || "Update failed"); }
    finally { setUpdating(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteHouseKeepingTask(id);
      navigate("/housekeeping");
    } catch (e) { setError("Delete failed"); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !task) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <AlertCircle size={40} style={{ color: "#334155" }} />
      <p style={{ color: "#64748b" }}>{error || "Task not found"}</p>
      <button onClick={() => navigate("/housekeeping")}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
        style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa" }}>
        <ArrowLeft size={14} /> Back
      </button>
    </div>
  );

  const st       = S[task.status] || S.Pending;
  const initials = (task.assignedTo?.name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-5 text-white">

      {/* Back */}
      <button onClick={() => navigate("/housekeeping")}
        className="flex items-center gap-2 text-sm transition"
        style={{ color: "#64748b" }}
        onMouseEnter={e => e.currentTarget.style.color = "#fff"}
        onMouseLeave={e => e.currentTarget.style.color = "#64748b"}>
        <ArrowLeft size={15} /> Back to Housekeeping
      </button>

      {/* Header */}
      <div className="rounded-2xl p-6"
        style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(99,102,241,0.12)" }}>
              <BedDouble size={22} style={{ color: "#818cf8" }} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Room {task.room?.roomNumber || "—"}</h1>
              <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
                {task.room?.type || ""} · Floor {task.room?.floor || "—"}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: st.bg, color: st.text }}>
            {task.status}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="rounded-2xl p-6 space-y-1"
        style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.07)" }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "#94a3b8" }}>Task Details</h3>

        {[
          {
            label: "Task Type",
            value: (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa" }}>
                {task.taskType}
              </span>
            ),
          },
          {
            label: "Status",
            value: (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: st.bg, color: st.text }}>
                {task.status}
              </span>
            ),
          },
          {
            label: "Assigned To",
            value: task.assignedTo ? (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                  {initials}
                </div>
                <span>{task.assignedTo.name}</span>
              </div>
            ) : "Unassigned",
          },
          { label: "Assigned By",  value: task.assignedBy?.name || "—" },
          { label: "Created",      value: new Date(task.createdAt).toLocaleString() },
          {
            label: "Completed At",
            value: task.completedAt
              ? new Date(task.completedAt).toLocaleString()
              : "—",
          },
          { label: "Notes", value: task.notes || "—" },
        ].map((row, i) => (
          <div key={i} className="flex items-center justify-between py-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <span className="text-xs font-medium" style={{ color: "#475569" }}>{row.label}</span>
            <span className="text-sm text-right">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="rounded-2xl p-6 space-y-3"
        style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.07)" }}>
        <h3 className="text-sm font-semibold mb-2" style={{ color: "#94a3b8" }}>Actions</h3>

        {task.status === "Pending" && (
          <button onClick={() => handleStatus("InProgress")} disabled={updating}
            className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition"
            style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}>
            {updating
              ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <Loader2 size={15} />}
            Start Task
          </button>
        )}

        {task.status === "InProgress" && (
          <button onClick={() => handleStatus("Completed")} disabled={updating}
            className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition"
            style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
            {updating
              ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <CheckCircle size={15} />}
            Mark as Completed
          </button>
        )}

        {task.status === "Completed" && (
          <div className="w-full py-3 rounded-xl text-sm font-medium text-center"
            style={{ background: "rgba(34,197,94,0.08)", color: "#22c55e" }}>
            Task Completed
          </div>
        )}

        {isAdmin && (
          <button onClick={handleDelete}
            className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition"
            style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.15)" }}>
            <Trash2 size={15} /> Delete Task
          </button>
        )}
      </div>
    </div>
  );
}
