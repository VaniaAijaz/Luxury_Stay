import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getServiceRequests,
  updateServiceRequest,
} from "../../api/serviceApi";
import {
  Search, X, RefreshCw, ConciergeBell,
  Clock, CheckCircle, Loader2, MoreVertical,
  User, BedDouble,
} from "lucide-react";

const STATUSES = ["All", "Pending", "InProgress", "Completed", "Cancelled"];

const S = {
  Pending:    { bg: "rgba(245,158,11,0.12)",  text: "#fbbf24" },
  InProgress: { bg: "rgba(59,130,246,0.12)",  text: "#60a5fa" },
  Completed:  { bg: "rgba(34,197,94,0.12)",   text: "#22c55e" },
  Cancelled:  { bg: "rgba(239,68,68,0.12)",   text: "#f87171" },
};

const SERVICE_ICONS = {
  RoomService:    "🍽️",
  WakeUpCall:     "⏰",
  Transportation: "🚗",
  Laundry:        "👕",
  Other:          "📋",
};

const timeAgo = (d) => {
  const mins = Math.round((Date.now() - new Date(d)) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
};

const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
const isStaff = ["Admin", "Manager", "Receptionist"].includes(loggedUser?.role);

export default function Services() {
  const navigate = useNavigate();
  const [services,     setServices]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [menuOpen,     setMenuOpen]     = useState(null);
  const [updating,     setUpdating]     = useState(null);

  useEffect(() => { fetchServices(); }, []);
  useEffect(() => {
    const close = () => setMenuOpen(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await getServiceRequests();
      setServices(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const stats = useMemo(() => ({
    total:      services.length,
    pending:    services.filter(s => s.status === "Pending").length,
    inProgress: services.filter(s => s.status === "InProgress").length,
    completed:  services.filter(s => s.status === "Completed").length,
  }), [services]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return services.filter(s => {
      const matchSearch = !q ||
        s.serviceType?.toLowerCase().includes(q) ||
        s.guest?.name?.toLowerCase().includes(q) ||
        s.room?.roomNumber?.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [services, search, statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdating(id);
      await updateServiceRequest(id, { status: newStatus });
      setServices(p => p.map(s => s._id === id ? { ...s, status: newStatus } : s));
    } catch (e) { console.error(e); }
    finally { setUpdating(null); setMenuOpen(null); }
  };

  return (
    <div className="space-y-6 text-white">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Services</h1>
          <p className="text-xs mt-1" style={{ color: "#64748b" }}>
            Manage guest service requests
          </p>
        </div>
        <button onClick={fetchServices} className="p-2 rounded-xl transition"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <RefreshCw size={15} style={{ color: "#64748b" }} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total",       value: stats.total,      color: "#60a5fa", bg: "rgba(59,130,246,0.1)"  },
          { label: "Pending",     value: stats.pending,    color: "#fbbf24", bg: "rgba(245,158,11,0.1)"  },
          { label: "In Progress", value: stats.inProgress, color: "#60a5fa", bg: "rgba(59,130,246,0.1)"  },
          { label: "Completed",   value: stats.completed,  color: "#22c55e", bg: "rgba(34,197,94,0.1)"   },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: s.bg, color: s.color }}>
              <ConciergeBell size={17} />
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
            placeholder="Search services..."
            className="bg-transparent text-sm outline-none flex-1 placeholder-slate-600" />
          {search && <button onClick={() => setSearch("")}><X size={13} style={{ color: "#475569" }} /></button>}
        </div>

        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.08)" }}>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-transparent text-sm outline-none text-white cursor-pointer">
            {STATUSES.map(s => (
              <option key={s} value={s} className="bg-[#1e2028]">{s === "All" ? "All Status" : s}</option>
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
          <span className="text-white font-medium">{filtered.length}</span> of {services.length} requests
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
          <ConciergeBell size={40} style={{ color: "#1e293b" }} />
          <p className="text-sm" style={{ color: "#334155" }}>No service requests found</p>
        </div>
      )}

      {/* Table */}
      {!loading && filtered.length > 0 && (
        <div className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}>

          {/* Head */}
          <div className="grid grid-cols-12 px-5 py-3 text-[11px] font-semibold uppercase tracking-widest"
            style={{ background: "#16181d", color: "#334155", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="col-span-2">Type</div>
            <div className="col-span-3">Guest</div>
            <div className="col-span-2">Room</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Time</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Rows */}
          {filtered.map((svc, i) => {
            const ss = S[svc.status] || S.Pending;
            return (
              <div key={svc._id}
                className="grid grid-cols-12 px-5 py-4 items-center transition"
                style={{
                  background: i % 2 === 0 ? "#13151a" : "#16181d",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(59,130,246,0.04)"}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#13151a" : "#16181d"}>

                {/* Type */}
                <div className="col-span-2 flex items-center gap-2">
                  <span className="text-lg">{SERVICE_ICONS[svc.serviceType] || "📋"}</span>
                  <span className="text-xs font-medium" style={{ color: "#94a3b8" }}>
                    {svc.serviceType}
                  </span>
                </div>

                {/* Guest */}
                <div className="col-span-3 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
                    {(svc.guest?.name || "G")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{svc.guest?.name || "—"}</p>
                    <p className="text-[10px]" style={{ color: "#475569" }}>{svc.guest?.phone || ""}</p>
                  </div>
                </div>

                {/* Room */}
                <div className="col-span-2 flex items-center gap-1.5 text-sm" style={{ color: "#94a3b8" }}>
                  <BedDouble size={13} />
                  Room {svc.room?.roomNumber || "—"}
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: ss.bg, color: ss.text }}>
                    {svc.status}
                  </span>
                </div>

                {/* Time */}
                <div className="col-span-2 flex items-center gap-1 text-xs" style={{ color: "#475569" }}>
                  <Clock size={11} /> {timeAgo(svc.createdAt)}
                </div>

                {/* Actions */}
                {isStaff && (
                  <div className="col-span-1 flex justify-end" onClick={e => e.stopPropagation()}>
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpen(menuOpen === svc._id ? null : svc._id)}
                        className="p-1.5 rounded-lg transition"
                        style={{ color: "#475569" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <MoreVertical size={15} />
                      </button>

                      {menuOpen === svc._id && (
                        <div className="absolute right-0 top-8 z-30 rounded-xl overflow-hidden shadow-2xl"
                          style={{ background: "#1e2028", border: "1px solid rgba(255,255,255,0.1)", minWidth: 155 }}>
                          {svc.status === "Pending" && (
                            <MItem label="Mark In Progress" color="#60a5fa"
                              loading={updating === svc._id}
                              onClick={() => handleStatusChange(svc._id, "InProgress")} />
                          )}
                          {svc.status === "InProgress" && (
                            <MItem label="Mark Completed" color="#22c55e"
                              loading={updating === svc._id}
                              onClick={() => handleStatusChange(svc._id, "Completed")} />
                          )}
                          {["Pending", "InProgress"].includes(svc.status) && (
                            <MItem label="Cancel" color="#f87171"
                              loading={updating === svc._id}
                              onClick={() => handleStatusChange(svc._id, "Cancelled")} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
