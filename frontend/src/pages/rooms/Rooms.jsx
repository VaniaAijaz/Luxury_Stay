import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getRooms, deleteRoom, updateRoom, createRoom } from "../../api/roomApi";
import {
  Search, Plus, SlidersHorizontal, BedDouble,
  Users, Wifi, Tv, Coffee, Droplets, Car, Star,
  Pencil, Trash2, Eye, RefreshCw, LayoutGrid, List,
  ChevronUp, X, Upload, CheckSquare, Square,
} from "lucide-react";

/* ─── constants ─── */
const STATUSES = ["All", "Available", "Occupied", "Cleaning", "Maintenance"];
const TYPES    = ["All", "Single", "Double", "Suite", "Deluxe", "Presidential"];
const SORTS    = [
  { label: "Room No. ↑",    key: "roomNumber", dir: "asc"  },
  { label: "Room No. ↓",    key: "roomNumber", dir: "desc" },
  { label: "Price ↑",       key: "pricePerNight", dir: "asc"  },
  { label: "Price ↓",       key: "pricePerNight", dir: "desc" },
  { label: "Floor ↑",       key: "floor", dir: "asc"  },
  { label: "Floor ↓",       key: "floor", dir: "desc" },
];

const STATUS_STYLE = {
  Available:   { bg: "rgba(34,197,94,0.12)",  text: "#22c55e",  dot: "#22c55e"  },
  Occupied:    { bg: "rgba(59,130,246,0.12)", text: "#60a5fa",  dot: "#3b82f6"  },
  Cleaning:    { bg: "rgba(245,158,11,0.12)", text: "#fbbf24",  dot: "#f59e0b"  },
  Maintenance: { bg: "rgba(239,68,68,0.12)",  text: "#f87171",  dot: "#ef4444"  },
};

const TYPE_GRADIENT = {
  Single:       "from-blue-900/30 to-transparent",
  Double:       "from-purple-900/30 to-transparent",
  Suite:        "from-amber-900/30 to-transparent",
  Deluxe:       "from-emerald-900/30 to-transparent",
  Presidential: "from-rose-900/30 to-transparent",
};

const AMENITY_ICON = {
  WiFi:        <Wifi size={12} />,
  TV:          <Tv size={12} />,
  "Mini Bar":  <Coffee size={12} />,
  Jacuzzi:     <Droplets size={12} />,
  Balcony:     <Star size={12} />,
  "Butler Service": <Star size={12} />,
  "Private Pool":   <Droplets size={12} />,
  AC:          <Car size={12} />,
};

const user = JSON.parse(localStorage.getItem("user") || "{}");
const isAdmin = ["Admin", "Manager"].includes(user?.role);

/* ════════════════════════════════════════════════════════ */
export default function Rooms() {
  const navigate = useNavigate();

  const [rooms,       setRooms]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [statusFilter,setStatusFilter]= useState("All");
  const [typeFilter,  setTypeFilter]  = useState("All");
  const [sortIdx,     setSortIdx]     = useState(0);
  const [viewMode,    setViewMode]    = useState("grid"); // grid | list
  const [deleting,    setDeleting]    = useState(null);
  const [confirmDel,  setConfirmDel]  = useState(null);
  const [showAddModal,setShowAddModal]= useState(false);

  useEffect(() => { fetchRooms(); }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await getRooms();
      setRooms(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* ── derived stats ── */
  const stats = useMemo(() => {
    const total = rooms.length || 1;
    return STATUSES.slice(1).map(s => ({
      label: s,
      count: rooms.filter(r => r.status === s).length,
      pct:   Math.round((rooms.filter(r => r.status === s).length / total) * 100),
    }));
  }, [rooms]);

  /* ── filtered + sorted ── */
  const filtered = useMemo(() => {
    const sort = SORTS[sortIdx];
    return rooms
      .filter(r => {
        const q = search.toLowerCase();
        const matchSearch =
          !q ||
          r.roomNumber.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q);
        const matchStatus = statusFilter === "All" || r.status === statusFilter;
        const matchType   = typeFilter   === "All" || r.type   === typeFilter;
        return matchSearch && matchStatus && matchType;
      })
      .sort((a, b) => {
        const av = sort.key === "roomNumber" ? parseInt(a[sort.key]) : a[sort.key];
        const bv = sort.key === "roomNumber" ? parseInt(b[sort.key]) : b[sort.key];
        return sort.dir === "asc" ? av - bv : bv - av;
      });
  }, [rooms, search, statusFilter, typeFilter, sortIdx]);

  /* ── delete ── */
  const handleDelete = async (id) => {
    try {
      setDeleting(id);
      await deleteRoom(id);
      setRooms(prev => prev.filter(r => r._id !== id));
      setConfirmDel(null);
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(null);
    }
  };

  /* ── quick status update ── */
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateRoom(id, { status: newStatus });
      setRooms(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
    } catch (e) {
      console.error(e);
    }
  };

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6 text-white">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Room Management</h1>
          <p className="text-xs mt-1" style={{ color: "#64748b" }}>
            Manage your hotel rooms and their status
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchRooms}
            className="p-2 rounded-xl transition"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            title="Refresh"
          >
            <RefreshCw size={15} style={{ color: "#64748b" }} />
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition"
              style={{ background: "#3b82f6", color: "#fff" }}
              onMouseEnter={e => e.currentTarget.style.background = "#2563eb"}
              onMouseLeave={e => e.currentTarget.style.background = "#3b82f6"}
            >
              <Plus size={15} /> Add Room
            </button>
          )}
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const st = STATUS_STYLE[s.label];
          return (
            <button
              key={s.label}
              onClick={() => setStatusFilter(statusFilter === s.label ? "All" : s.label)}
              className="rounded-2xl p-5 text-left transition"
              style={{
                background: statusFilter === s.label ? st.bg : "#16181d",
                border: `1px solid ${statusFilter === s.label ? st.dot + "40" : "rgba(255,255,255,0.07)"}`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-3xl font-bold">{s.count}</p>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: st.bg, color: st.text }}>
                  {s.pct}%
                </span>
              </div>
              <p className="text-sm font-medium" style={{ color: st.text }}>{s.label}</p>
            </button>
          );
        })}
      </div>

      {/* ── Filters bar ── */}
      <div className="flex flex-wrap items-center gap-3">

        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2 rounded-xl"
          style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Search size={14} style={{ color: "#475569" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search rooms..."
            className="bg-transparent text-sm outline-none flex-1 placeholder-slate-600"
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X size={13} style={{ color: "#475569" }} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.08)" }}>
          <SlidersHorizontal size={13} style={{ color: "#475569" }} />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-transparent text-sm outline-none text-white cursor-pointer"
          >
            {STATUSES.map(s => <option key={s} value={s} className="bg-[#1e2028]">{s === "All" ? "All Status" : s}</option>)}
          </select>
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.08)" }}>
          <BedDouble size={13} style={{ color: "#475569" }} />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-transparent text-sm outline-none text-white cursor-pointer"
          >
            {TYPES.map(t => <option key={t} value={t} className="bg-[#1e2028]">{t === "All" ? "All Types" : t}</option>)}
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.08)" }}>
          <ChevronUp size={13} style={{ color: "#475569" }} />
          <select
            value={sortIdx}
            onChange={e => setSortIdx(Number(e.target.value))}
            className="bg-transparent text-sm outline-none text-white cursor-pointer"
          >
            {SORTS.map((s, i) => <option key={i} value={i} className="bg-[#1e2028]">{s.label}</option>)}
          </select>
        </div>

        {/* Active filters clear */}
        {(statusFilter !== "All" || typeFilter !== "All" || search) && (
          <button
            onClick={() => { setSearch(""); setStatusFilter("All"); setTypeFilter("All"); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition"
            style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <X size={12} /> Clear filters
          </button>
        )}

        {/* View toggle */}
        <div className="ml-auto flex items-center gap-1 p-1 rounded-xl"
          style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={() => setViewMode("grid")}
            className="p-1.5 rounded-lg transition"
            style={{ background: viewMode === "grid" ? "rgba(59,130,246,0.2)" : "transparent", color: viewMode === "grid" ? "#60a5fa" : "#475569" }}>
            <LayoutGrid size={15} />
          </button>
          <button onClick={() => setViewMode("list")}
            className="p-1.5 rounded-lg transition"
            style={{ background: viewMode === "list" ? "rgba(59,130,246,0.2)" : "transparent", color: viewMode === "list" ? "#60a5fa" : "#475569" }}>
            <List size={15} />
          </button>
        </div>
      </div>

      {/* ── Results count ── */}
      <p className="text-xs" style={{ color: "#475569" }}>
        Showing <span className="text-white font-medium">{filtered.length}</span> of {rooms.length} rooms
        {(statusFilter !== "All" || typeFilter !== "All" || search) && " (filtered)"}
      </p>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm" style={{ color: "#475569" }}>Loading rooms...</p>
          </div>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <BedDouble size={40} style={{ color: "#1e293b" }} />
          <p className="text-sm" style={{ color: "#334155" }}>No rooms found</p>
          {(statusFilter !== "All" || typeFilter !== "All" || search) && (
            <button onClick={() => { setSearch(""); setStatusFilter("All"); setTypeFilter("All"); }}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa" }}>
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* ── Grid view ── */}
      {!loading && filtered.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(room => (
            <RoomCard
              key={room._id}
              room={room}
              onView={() => navigate(`/rooms/${room._id}`)}
              onEdit={() => navigate(`/rooms/edit/${room._id}`)}
              onDelete={() => setConfirmDel(room)}
              onStatusChange={handleStatusChange}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* ── List view ── */}
      {!loading && filtered.length > 0 && viewMode === "list" && (
        <div className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          {/* Header */}
          <div className="grid grid-cols-12 px-5 py-3 text-[11px] font-semibold uppercase tracking-widest"
            style={{ background: "#16181d", color: "#334155", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="col-span-2">Room</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-1">Floor</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Capacity</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          {filtered.map((room, i) => {
            const st = STATUS_STYLE[room.status] || STATUS_STYLE.Available;
            return (
              <div key={room._id}
                className="grid grid-cols-12 px-5 py-4 items-center transition"
                style={{
                  background: i % 2 === 0 ? "#13151a" : "#16181d",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(59,130,246,0.05)"}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#13151a" : "#16181d"}
              >
                <div className="col-span-2 font-semibold text-sm">Room {room.roomNumber}</div>
                <div className="col-span-2 text-sm" style={{ color: "#94a3b8" }}>{room.type}</div>
                <div className="col-span-1 text-sm" style={{ color: "#64748b" }}>Floor {room.floor}</div>
                <div className="col-span-2">
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                    style={{ background: st.bg, color: st.text }}>
                    {room.status}
                  </span>
                </div>
                <div className="col-span-1 flex items-center gap-1 text-sm" style={{ color: "#94a3b8" }}>
                  <Users size={12} /> {room.capacity}
                </div>
                <div className="col-span-2 font-semibold text-sm" style={{ color: "#22c55e" }}>
                  ${room.pricePerNight}<span className="text-[10px] font-normal" style={{ color: "#475569" }}>/night</span>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <ActionBtn icon={<Eye size={13} />} onClick={() => navigate(`/rooms/${room._id}`)} title="View" />
                  {isAdmin && <ActionBtn icon={<Pencil size={13} />} onClick={() => navigate(`/rooms/edit/${room._id}`)} title="Edit" color="#f59e0b" />}
                  {isAdmin && <ActionBtn icon={<Trash2 size={13} />} onClick={() => setConfirmDel(room)} title="Delete" color="#ef4444" />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setConfirmDel(null)}>
          <div className="rounded-2xl p-6 w-full max-w-sm mx-4 space-y-4"
            style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.1)" }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(239,68,68,0.1)" }}>
                <Trash2 size={18} style={{ color: "#ef4444" }} />
              </div>
              <div>
                <p className="font-semibold">Delete Room {confirmDel.roomNumber}?</p>
                <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setConfirmDel(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition"
                style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }}>
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDel._id)}
                disabled={deleting === confirmDel._id}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition"
                style={{ background: "#ef4444", color: "#fff" }}>
                {deleting === confirmDel._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Room Modal ── */}
      {showAddModal && (
        <AddRoomModal
          onClose={() => setShowAddModal(false)}
          onCreated={(newRoom) => {
            setRooms(prev => [newRoom, ...prev]);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   ADD ROOM MODAL
════════════════════════════════════════════════════════ */
const ALL_AMENITIES = ["WiFi", "TV", "AC", "Mini Bar", "Jacuzzi", "Balcony", "Butler Service", "Private Pool"];
const ROOM_TYPES    = ["Single", "Double", "Suite", "Deluxe", "Presidential"];

const FIELD_STYLE = {
  width: "100%",
  background: "#1e2028",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  padding: "10px 14px",
  color: "#fff",
  fontSize: 13,
  outline: "none",
};

function AddRoomModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    roomNumber: "", type: "Single", floor: "",
    pricePerNight: "", capacity: "", description: "",
    status: "Available",
  });
  const [amenities, setAmenities] = useState([]);
  const [images,    setImages]    = useState([]);
  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(false);
  const [apiError,  setApiError]  = useState("");

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: "" }));
  };

  const toggleAmenity = (a) =>
    setAmenities(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a]);

  const validate = () => {
    const e = {};
    if (!form.roomNumber.trim()) e.roomNumber = "Required";
    if (!form.floor || isNaN(form.floor)) e.floor = "Must be a number";
    if (!form.pricePerNight || isNaN(form.pricePerNight)) e.pricePerNight = "Must be a number";
    if (!form.capacity || isNaN(form.capacity)) e.capacity = "Must be a number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      setApiError("");
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      amenities.forEach(a => fd.append("amenities", a));
      images.forEach(img => fd.append("images", img));
      const newRoom = await createRoom(fd);
      onCreated(newRoom);
    } catch (err) {
      setApiError(err?.response?.data?.message || "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: "#13151a", border: "1px solid rgba(255,255,255,0.1)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <h2 className="text-base font-semibold text-white">Add New Room</h2>
            <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>Fill in the details to create a new room</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition"
            style={{ background: "rgba(255,255,255,0.05)", color: "#64748b" }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "#64748b"}>
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

          {/* API error */}
          {apiError && (
            <div className="px-4 py-3 rounded-xl text-sm"
              style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
              {apiError}
            </div>
          )}

          {/* Row 1 — Room Number + Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>
                Room Number <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                value={form.roomNumber}
                onChange={e => set("roomNumber", e.target.value)}
                placeholder="e.g. 101"
                style={{ ...FIELD_STYLE, borderColor: errors.roomNumber ? "#ef4444" : "rgba(255,255,255,0.08)" }}
              />
              {errors.roomNumber && <p className="text-[11px] mt-1" style={{ color: "#f87171" }}>{errors.roomNumber}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Room Type</label>
              <select
                value={form.type}
                onChange={e => set("type", e.target.value)}
                style={{ ...FIELD_STYLE, cursor: "pointer" }}
              >
                {ROOM_TYPES.map(t => <option key={t} value={t} className="bg-[#1e2028]">{t}</option>)}
              </select>
            </div>
          </div>

          {/* Row 2 — Floor + Capacity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>
                Floor <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="number" min="1"
                value={form.floor}
                onChange={e => set("floor", e.target.value)}
                placeholder="e.g. 3"
                style={{ ...FIELD_STYLE, borderColor: errors.floor ? "#ef4444" : "rgba(255,255,255,0.08)" }}
              />
              {errors.floor && <p className="text-[11px] mt-1" style={{ color: "#f87171" }}>{errors.floor}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>
                Capacity <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="number" min="1"
                value={form.capacity}
                onChange={e => set("capacity", e.target.value)}
                placeholder="e.g. 2"
                style={{ ...FIELD_STYLE, borderColor: errors.capacity ? "#ef4444" : "rgba(255,255,255,0.08)" }}
              />
              {errors.capacity && <p className="text-[11px] mt-1" style={{ color: "#f87171" }}>{errors.capacity}</p>}
            </div>
          </div>

          {/* Row 3 — Price + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>
                Price / Night ($) <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="number" min="0"
                value={form.pricePerNight}
                onChange={e => set("pricePerNight", e.target.value)}
                placeholder="e.g. 250"
                style={{ ...FIELD_STYLE, borderColor: errors.pricePerNight ? "#ef4444" : "rgba(255,255,255,0.08)" }}
              />
              {errors.pricePerNight && <p className="text-[11px] mt-1" style={{ color: "#f87171" }}>{errors.pricePerNight}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Initial Status</label>
              <select
                value={form.status}
                onChange={e => set("status", e.target.value)}
                style={{ ...FIELD_STYLE, cursor: "pointer" }}
              >
                {["Available", "Occupied", "Cleaning", "Maintenance"].map(s => (
                  <option key={s} value={s} className="bg-[#1e2028]">{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Description</label>
            <textarea
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="Brief description of the room..."
              rows={2}
              style={{ ...FIELD_STYLE, resize: "none" }}
            />
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "#94a3b8" }}>Amenities</label>
            <div className="flex flex-wrap gap-2">
              {ALL_AMENITIES.map(a => {
                const selected = amenities.includes(a);
                return (
                  <button
                    key={a} type="button"
                    onClick={() => toggleAmenity(a)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition"
                    style={{
                      background: selected ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)",
                      color: selected ? "#60a5fa" : "#64748b",
                      border: `1px solid ${selected ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.07)"}`,
                    }}
                  >
                    {selected ? <CheckSquare size={12} /> : <Square size={12} />}
                    {a}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>
              Room Images <span style={{ color: "#475569" }}>(optional, max 5)</span>
            </label>
            <label
              className="flex flex-col items-center justify-center gap-2 py-6 rounded-xl cursor-pointer transition"
              style={{ border: "1px dashed rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
            >
              <Upload size={20} style={{ color: "#334155" }} />
              <p className="text-xs" style={{ color: "#475569" }}>
                {images.length > 0 ? `${images.length} file(s) selected` : "Click to upload images"}
              </p>
              <input
                type="file" multiple accept="image/*" className="hidden"
                onChange={e => setImages(Array.from(e.target.files).slice(0, 5))}
              />
            </label>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {images.map((img, i) => (
                  <span key={i} className="text-[11px] px-2 py-1 rounded-lg flex items-center gap-1"
                    style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa" }}>
                    {img.name}
                    <button type="button" onClick={() => setImages(p => p.filter((_, j) => j !== i))}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="flex gap-3 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition"
              style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
              style={{ background: loading ? "#1d4ed8" : "#3b82f6", color: "#fff" }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#2563eb"; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#3b82f6"; }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <><Plus size={14} /> Create Room</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   ROOM CARD
════════════════════════════════════════════════════════ */
function RoomCard({ room, onView, onEdit, onDelete, onStatusChange, isAdmin }) {
  const st = STATUS_STYLE[room.status] || STATUS_STYLE.Available;
  const grad = TYPE_GRADIENT[room.type] || "from-slate-900/30 to-transparent";
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  return (
    <div className="rounded-2xl overflow-hidden group transition-all duration-200 cursor-pointer"
      style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.07)" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
    >
      {/* Image / placeholder area */}
      <div className={`relative h-36 bg-linear-to-br ${grad} flex items-center justify-center`}
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        onClick={onView}>
        <BedDouble size={40} style={{ color: "rgba(255,255,255,0.08)" }} />

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          {isAdmin ? (
            <div className="relative">
              <button
                onClick={e => { e.stopPropagation(); setShowStatusMenu(v => !v); }}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full cursor-pointer"
                style={{ background: st.bg, color: st.text }}>
                {room.status}
              </button>
              {showStatusMenu && (
                <div className="absolute right-0 top-7 z-20 rounded-xl overflow-hidden shadow-xl"
                  style={{ background: "#1e2028", border: "1px solid rgba(255,255,255,0.1)", minWidth: 130 }}>
                  {STATUSES.slice(1).map(s => (
                    <button key={s}
                      onClick={e => { e.stopPropagation(); onStatusChange(room._id, s); setShowStatusMenu(false); }}
                      className="w-full text-left px-3 py-2 text-xs transition"
                      style={{ color: STATUS_STYLE[s].text }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{ background: st.bg, color: st.text }}>
              {room.status}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3" onClick={onView}>
        <div>
          <p className="font-semibold text-sm">Room {room.roomNumber}</p>
          <p className="text-[11px] mt-0.5" style={{ color: "#64748b" }}>
            {room.type} · Floor {room.floor}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs" style={{ color: "#94a3b8" }}>
            <Users size={12} /> {room.capacity}
          </div>
          <p className="text-sm font-bold" style={{ color: "#22c55e" }}>
            ${room.pricePerNight}
            <span className="text-[10px] font-normal" style={{ color: "#475569" }}>/night</span>
          </p>
        </div>

        {/* Amenities */}
        {room.amenities?.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {room.amenities.slice(0, 4).map((a, i) => (
              <span key={i}
                className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.05)", color: "#64748b" }}>
                {AMENITY_ICON[a] || null}{a}
              </span>
            ))}
            {room.amenities.length > 4 && (
              <span className="text-[10px]" style={{ color: "#475569" }}>
                +{room.amenities.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions footer */}
      <div className="flex items-center gap-1 px-4 pb-4">
        <button onClick={onView}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition"
          style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(59,130,246,0.2)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(59,130,246,0.1)"}>
          <Eye size={12} /> View
        </button>
        {isAdmin && (
          <>
            <button onClick={onEdit}
              className="flex items-center justify-center p-2 rounded-xl transition"
              style={{ background: "rgba(245,158,11,0.1)", color: "#fbbf24" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(245,158,11,0.2)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(245,158,11,0.1)"}>
              <Pencil size={13} />
            </button>
            <button onClick={onDelete}
              className="flex items-center justify-center p-2 rounded-xl transition"
              style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.2)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}>
              <Trash2 size={13} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Small action button for list view ── */
function ActionBtn({ icon, onClick, title, color = "#60a5fa" }) {
  return (
    <button onClick={onClick} title={title}
      className="p-1.5 rounded-lg transition"
      style={{ color, background: "transparent" }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      {icon}
    </button>
  );
}
