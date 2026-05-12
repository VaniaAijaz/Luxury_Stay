import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBookings, createBooking, updateBooking, cancelBooking,
} from "../../api/bookingApi";
import { getRooms } from "../../api/roomApi";
import { getUsers } from "../../api/userApi";
import { checkInGuest, checkOutGuest } from "../../api/checkInOutApi";
import {
  Search, Plus, X, RefreshCw, BedDouble,
  CalendarCheck, Users, LogIn, LogOut,
  ChevronRight, Trash2, Eye, SlidersHorizontal,
} from "lucide-react";

const STATUSES = ["All","Pending","Confirmed","CheckedIn","CheckedOut","Cancelled"];

const S = {
  Pending:    { bg:"rgba(245,158,11,0.12)",  text:"#fbbf24" },
  Confirmed:  { bg:"rgba(59,130,246,0.12)",  text:"#60a5fa" },
  CheckedIn:  { bg:"rgba(34,197,94,0.12)",   text:"#22c55e" },
  CheckedOut: { bg:"rgba(148,163,184,0.12)", text:"#94a3b8" },
  Cancelled:  { bg:"rgba(239,68,68,0.12)",   text:"#f87171" },
};

const CARD = { background:"#16181d", border:"1px solid rgba(255,255,255,0.07)" };
const FIELD = {
  width:"100%", background:"#1e2028",
  border:"1px solid rgba(255,255,255,0.08)",
  borderRadius:10, padding:"10px 14px",
  color:"#fff", fontSize:13, outline:"none",
};

const fmt = (d) => d ? new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—";
const initials = (name="") => name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
const avatarColor = (name="") => {
  const colors = ["#3b82f6","#8b5cf6","#ec4899","#f59e0b","#22c55e","#14b8a6"];
  return colors[name.charCodeAt(0) % colors.length];
};

const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
const isStaff = ["Admin","Manager","Receptionist"].includes(loggedUser?.role);

export default function Bookings() {
  const navigate = useNavigate();
  const [bookings,  setBookings]  = useState([]);
  const [rooms,     setRooms]     = useState([]);
  const [guests,    setGuests]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [statusF,   setStatusF]   = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [actionId,  setActionId]  = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [b, r, u] = await Promise.all([
        getBookings(),
        getRooms(),
        isStaff ? getUsers() : Promise.resolve([]),
      ]);
      setBookings(Array.isArray(b) ? b : []);
      setRooms(Array.isArray(r) ? r : []);
      setGuests((Array.isArray(u) ? u : []).filter(x => x.role === "Guest"));
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const stats = useMemo(() => {
    const total = bookings.length;
    return STATUSES.slice(1).map(s => ({
      label: s, count: bookings.filter(b => b.status === s).length,
    }));
  }, [bookings]);

  const filtered = useMemo(() => bookings.filter(b => {
    const q = search.toLowerCase();
    const matchS = statusF === "All" || b.status === statusF;
    const matchQ = !q ||
      b.guest?.name?.toLowerCase().includes(q) ||
      b.room?.roomNumber?.toLowerCase().includes(q) ||
      b._id?.toLowerCase().includes(q);
    return matchS && matchQ;
  }), [bookings, search, statusF]);

  const handleCheckIn = async (id) => {
    try { setActionId(id); const res = await checkInGuest(id); setBookings(p => p.map(b => b._id===id ? res.booking||{...b,status:"CheckedIn"} : b)); }
    catch(e) { alert(e?.response?.data?.message || "Check-in failed"); }
    finally { setActionId(null); }
  };

  const handleCheckOut = async (id) => {
    try { setActionId(id); const res = await checkOutGuest(id); setBookings(p => p.map(b => b._id===id ? res.booking||{...b,status:"CheckedOut"} : b)); }
    catch(e) { alert(e?.response?.data?.message || "Check-out failed"); }
    finally { setActionId(null); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try { setActionId(id); await cancelBooking(id); setBookings(p => p.map(b => b._id===id ? {...b,status:"Cancelled"} : b)); }
    catch(e) { alert(e?.response?.data?.message || "Cancel failed"); }
    finally { setActionId(null); }
  };

  return (
    <div className="space-y-6 text-white">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
          <p className="text-xs mt-1" style={{color:"#64748b"}}>Manage reservations and guest bookings</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={fetchAll} className="p-2 rounded-xl transition"
            style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}>
            <RefreshCw size={15} style={{color:"#64748b"}} />
          </button>
          {isStaff && (
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{background:"#3b82f6",color:"#fff"}}
              onMouseEnter={e=>e.currentTarget.style.background="#2563eb"}
              onMouseLeave={e=>e.currentTarget.style.background="#3b82f6"}>
              <Plus size={15}/> New Booking
            </button>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map(s => {
          const st = S[s.label] || S.Pending;
          return (
            <button key={s.label}
              onClick={() => setStatusF(statusF===s.label?"All":s.label)}
              className="rounded-2xl p-5 text-left transition"
              style={{
                ...CARD,
                background: statusF===s.label ? st.bg : "#16181d",
                border: `1px solid ${statusF===s.label ? st.text+"40" : "rgba(255,255,255,0.07)"}`,
              }}>
              <p className="text-3xl font-bold">{s.count}</p>
              <p className="text-xs mt-1.5 font-medium" style={{color: st.text}}>{s.label}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2 rounded-xl"
          style={{background:"#16181d",border:"1px solid rgba(255,255,255,0.08)"}}>
          <Search size={14} style={{color:"#475569"}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search bookings..."
            className="bg-transparent text-sm outline-none flex-1 placeholder-slate-600"/>
          {search && <button onClick={()=>setSearch("")}><X size={13} style={{color:"#475569"}}/></button>}
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{background:"#16181d",border:"1px solid rgba(255,255,255,0.08)"}}>
          <SlidersHorizontal size={13} style={{color:"#475569"}}/>
          <select value={statusF} onChange={e=>setStatusF(e.target.value)}
            className="bg-transparent text-sm outline-none text-white cursor-pointer">
            {STATUSES.map(s=><option key={s} value={s} className="bg-[#1e2028]">{s==="All"?"All Status":s}</option>)}
          </select>
        </div>
        {(statusF!=="All"||search) && (
          <button onClick={()=>{setSearch("");setStatusF("All");}}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"
            style={{background:"rgba(239,68,68,0.1)",color:"#f87171",border:"1px solid rgba(239,68,68,0.2)"}}>
            <X size={12}/> Clear
          </button>
        )}
        <p className="ml-auto text-xs" style={{color:"#475569"}}>
          <span className="text-white font-medium">{filtered.length}</span> of {bookings.length} bookings
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length===0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <CalendarCheck size={40} style={{color:"#1e293b"}}/>
          <p className="text-sm" style={{color:"#334155"}}>No bookings found</p>
        </div>
      )}

      {/* Table */}
      {!loading && filtered.length>0 && (
        <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(255,255,255,0.07)"}}>
          {/* Head */}
          <div className="grid grid-cols-12 px-5 py-3 text-[11px] font-semibold uppercase tracking-widest"
            style={{background:"#16181d",color:"#334155",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
            <div className="col-span-3">Guest</div>
            <div className="col-span-2">Room</div>
            <div className="col-span-2">Check-in</div>
            <div className="col-span-2">Check-out</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Amount</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Rows */}
          {filtered.map((b, i) => {
            const st = S[b.status] || S.Pending;
            const name = b.guest?.name || "Guest";
            const busy = actionId === b._id;
            return (
              <div key={b._id}
                className="grid grid-cols-12 px-5 py-4 items-center transition"
                style={{
                  background: i%2===0 ? "#13151a" : "#16181d",
                  borderBottom:"1px solid rgba(255,255,255,0.04)",
                }}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(59,130,246,0.04)"}
                onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#13151a":"#16181d"}>

                {/* Guest */}
                <div className="col-span-3 flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
                    style={{background: avatarColor(name)}}>
                    {initials(name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{name}</p>
                    <p className="text-[10px] truncate" style={{color:"#475569"}}>
                      {b.guest?.email || `B${b._id?.slice(-4).toUpperCase()}`}
                    </p>
                  </div>
                </div>

                {/* Room */}
                <div className="col-span-2">
                  <div className="flex items-center gap-1.5">
                    <BedDouble size={13} style={{color:"#475569"}}/>
                    <div>
                      <p className="text-sm font-semibold">{b.room?.roomNumber || "—"}</p>
                      <p className="text-[10px]" style={{color:"#475569"}}>{b.room?.type || ""}</p>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="col-span-2 text-sm" style={{color:"#94a3b8"}}>{fmt(b.checkInDate)}</div>
                <div className="col-span-2 text-sm" style={{color:"#94a3b8"}}>{fmt(b.checkOutDate)}</div>

                {/* Status */}
                <div className="col-span-1">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{background:st.bg, color:st.text}}>
                    {b.status}
                  </span>
                </div>

                {/* Amount */}
                <div className="col-span-1">
                  <p className="text-sm font-bold" style={{color:"#22c55e"}}>
                    ${b.totalAmount?.toLocaleString() || "—"}
                  </p>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center justify-end gap-1">
                  <Btn icon={<Eye size={13}/>} title="View" onClick={()=>navigate(`/bookings/${b._id}`)} color="#60a5fa"/>
                  {isStaff && b.status==="Confirmed" && (
                    <Btn icon={busy?<Spin/>:<LogIn size={13}/>} title="Check In" onClick={()=>handleCheckIn(b._id)} color="#22c55e" disabled={busy}/>
                  )}
                  {isStaff && b.status==="CheckedIn" && (
                    <Btn icon={busy?<Spin/>:<LogOut size={13}/>} title="Check Out" onClick={()=>handleCheckOut(b._id)} color="#f59e0b" disabled={busy}/>
                  )}
                  {["Pending","Confirmed"].includes(b.status) && (
                    <Btn icon={busy?<Spin/>:<Trash2 size={13}/>} title="Cancel" onClick={()=>handleCancel(b._id)} color="#f87171" disabled={busy}/>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Booking Modal */}
      {showModal && (
        <CreateBookingModal
          rooms={rooms}
          guests={guests}
          onClose={()=>setShowModal(false)}
          onCreated={(nb)=>{ setBookings(p=>[nb,...p]); setShowModal(false); }}
        />
      )}
    </div>
  );
}

/* ── Small icon button ── */
function Btn({ icon, title, onClick, color="#60a5fa", disabled=false }) {
  return (
    <button onClick={onClick} title={title} disabled={disabled}
      className="p-1.5 rounded-lg transition disabled:opacity-50"
      style={{color, background:"transparent"}}
      onMouseEnter={e=>{ if(!disabled) e.currentTarget.style.background="rgba(255,255,255,0.06)"; }}
      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
      {icon}
    </button>
  );
}

function Spin() {
  return <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"/>;
}

/* ════════════════════════════════════════════════════════
   CREATE BOOKING MODAL
════════════════════════════════════════════════════════ */
function CreateBookingModal({ rooms, guests, onClose, onCreated }) {
  const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isStaff = ["Admin","Manager","Receptionist"].includes(loggedUser?.role);

  const [form, setForm] = useState({
    room:"", checkInDate:"", checkOutDate:"",
    numberOfGuests:"1", specialRequests:"",
    guest:"",
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [apiErr,  setApiErr]  = useState("");
  const [nights,  setNights]  = useState(0);
  const [total,   setTotal]   = useState(0);

  const set = (k,v) => {
    setForm(p=>({...p,[k]:v}));
    setErrors(p=>({...p,[k]:""}));
  };

  /* calc nights + total */
  useEffect(() => {
    if (form.checkInDate && form.checkOutDate && form.room) {
      const n = Math.max(0, Math.ceil(
        (new Date(form.checkOutDate) - new Date(form.checkInDate)) / 86400000
      ));
      const room = rooms.find(r=>r._id===form.room);
      setNights(n);
      setTotal(n * (room?.pricePerNight || 0));
    } else { setNights(0); setTotal(0); }
  }, [form.checkInDate, form.checkOutDate, form.room, rooms]);

  const validate = () => {
    const e = {};
    if (!form.room) e.room = "Select a room";
    if (!form.checkInDate) e.checkInDate = "Required";
    if (!form.checkOutDate) e.checkOutDate = "Required";
    if (form.checkInDate && form.checkOutDate && new Date(form.checkInDate)>=new Date(form.checkOutDate))
      e.checkOutDate = "Must be after check-in";
    if (isStaff && !form.guest) e.guest = "Select a guest";
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true); setApiErr("");
      const payload = {
        room: form.room,
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
        numberOfGuests: Number(form.numberOfGuests),
        specialRequests: form.specialRequests,
        ...(isStaff && form.guest ? { guest: form.guest } : {}),
      };
      const nb = await createBooking(payload);
      onCreated(nb);
    } catch(err) {
      setApiErr(err?.response?.data?.message || "Failed to create booking");
    } finally { setLoading(false); }
  };

  const selectedRoom = rooms.find(r=>r._id===form.room);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{background:"rgba(0,0,0,0.75)"}} onClick={onClose}>
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{background:"#13151a",border:"1px solid rgba(255,255,255,0.1)"}}
        onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
          <div>
            <h2 className="text-base font-semibold">Create New Booking</h2>
            <p className="text-xs mt-0.5" style={{color:"#64748b"}}>Add a new reservation to the system</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{background:"rgba(255,255,255,0.05)",color:"#64748b"}}
            onMouseEnter={e=>e.currentTarget.style.color="#fff"}
            onMouseLeave={e=>e.currentTarget.style.color="#64748b"}>
            <X size={15}/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {apiErr && (
            <div className="px-4 py-3 rounded-xl text-sm"
              style={{background:"rgba(239,68,68,0.1)",color:"#f87171",border:"1px solid rgba(239,68,68,0.2)"}}>
              {apiErr}
            </div>
          )}

          {/* Guest select (staff only) */}
          {isStaff && (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{color:"#94a3b8"}}>
                Guest <span style={{color:"#ef4444"}}>*</span>
              </label>
              <select value={form.guest} onChange={e=>set("guest",e.target.value)}
                style={{...FIELD, borderColor: errors.guest?"#ef4444":"rgba(255,255,255,0.08)", cursor:"pointer"}}>
                <option value="" className="bg-[#1e2028]">Select guest...</option>
                {guests.map(g=>(
                  <option key={g._id} value={g._id} className="bg-[#1e2028]">{g.name} — {g.email}</option>
                ))}
              </select>
              {errors.guest && <p className="text-[11px] mt-1" style={{color:"#f87171"}}>{errors.guest}</p>}
            </div>
          )}

          {/* Room */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{color:"#94a3b8"}}>
              Room <span style={{color:"#ef4444"}}>*</span>
            </label>
            <select value={form.room} onChange={e=>set("room",e.target.value)}
              style={{...FIELD, borderColor:errors.room?"#ef4444":"rgba(255,255,255,0.08)", cursor:"pointer"}}>
              <option value="" className="bg-[#1e2028]">Select room...</option>
              {rooms.filter(r=>r.status==="Available").map(r=>(
                <option key={r._id} value={r._id} className="bg-[#1e2028]">
                  Room {r.roomNumber} — {r.type} · Floor {r.floor} · ${r.pricePerNight}/night
                </option>
              ))}
            </select>
            {errors.room && <p className="text-[11px] mt-1" style={{color:"#f87171"}}>{errors.room}</p>}
          </div>

          {/* Selected room preview */}
          {selectedRoom && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.2)"}}>
              <BedDouble size={16} style={{color:"#60a5fa"}}/>
              <div className="text-xs" style={{color:"#94a3b8"}}>
                <span className="text-white font-medium">Room {selectedRoom.roomNumber}</span>
                {" · "}{selectedRoom.type}{" · "}Floor {selectedRoom.floor}
                {" · "}<span style={{color:"#22c55e"}}>${selectedRoom.pricePerNight}/night</span>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{color:"#94a3b8"}}>
                Check-in Date <span style={{color:"#ef4444"}}>*</span>
              </label>
              <input type="date" value={form.checkInDate} onChange={e=>set("checkInDate",e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                style={{...FIELD, borderColor:errors.checkInDate?"#ef4444":"rgba(255,255,255,0.08)", colorScheme:"dark"}}/>
              {errors.checkInDate && <p className="text-[11px] mt-1" style={{color:"#f87171"}}>{errors.checkInDate}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{color:"#94a3b8"}}>
                Check-out Date <span style={{color:"#ef4444"}}>*</span>
              </label>
              <input type="date" value={form.checkOutDate} onChange={e=>set("checkOutDate",e.target.value)}
                min={form.checkInDate || new Date().toISOString().split("T")[0]}
                style={{...FIELD, borderColor:errors.checkOutDate?"#ef4444":"rgba(255,255,255,0.08)", colorScheme:"dark"}}/>
              {errors.checkOutDate && <p className="text-[11px] mt-1" style={{color:"#f87171"}}>{errors.checkOutDate}</p>}
            </div>
          </div>

          {/* Nights + Total preview */}
          {nights > 0 && (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.15)"}}>
              <span className="text-xs" style={{color:"#94a3b8"}}>{nights} night{nights>1?"s":""}</span>
              <span className="text-sm font-bold" style={{color:"#22c55e"}}>${total.toLocaleString()} total</span>
            </div>
          )}

          {/* Guests count */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{color:"#94a3b8"}}>Number of Guests</label>
            <input type="number" min="1" max={selectedRoom?.capacity||10}
              value={form.numberOfGuests} onChange={e=>set("numberOfGuests",e.target.value)}
              style={FIELD}/>
          </div>

          {/* Special requests */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{color:"#94a3b8"}}>Special Requests</label>
            <textarea value={form.specialRequests} onChange={e=>set("specialRequests",e.target.value)}
              placeholder="Any special requests or notes..."
              rows={2} style={{...FIELD, resize:"none"}}/>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2" style={{borderTop:"1px solid rgba(255,255,255,0.06)"}}>
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{background:"rgba(255,255,255,0.05)",color:"#94a3b8",border:"1px solid rgba(255,255,255,0.08)"}}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
              style={{background:loading?"#1d4ed8":"#3b82f6",color:"#fff"}}
              onMouseEnter={e=>{ if(!loading) e.currentTarget.style.background="#2563eb"; }}
              onMouseLeave={e=>{ if(!loading) e.currentTarget.style.background="#3b82f6"; }}>
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Creating...</>
              ) : (
                <><Plus size={14}/> Create Booking</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
