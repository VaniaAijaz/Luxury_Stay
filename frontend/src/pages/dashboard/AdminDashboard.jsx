import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api/axios";
import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Legend,
} from "recharts";
import {
  DollarSign, BedDouble, Users, TrendingUp,
  CalendarCheck, LogIn, Sparkles, FileText,
  ArrowUpRight, ChevronRight, RefreshCw,
} from "lucide-react";

/* ─── constants ─── */
const MONTHS  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS    = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const PALETTE = ["#6366f1","#22c55e","#f59e0b","#ec4899","#14b8a6"];

const TOOLTIP_STYLE = {
  contentStyle: {
    background: "#161616",
    border: "1px solid #2a2a2a",
    borderRadius: 10,
    color: "#fff",
    fontSize: 12,
  },
  cursor: { fill: "rgba(255,255,255,0.03)" },
};

const fmtMoney = (n = 0) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M`
  : n >= 1_000   ? `$${(n / 1_000).toFixed(1)}k`
  : `$${n.toFixed(0)}`;

/* ─── helpers ─── */
const isToday = (d) =>
  new Date(d).toDateString() === new Date().toDateString();

const groupByMonth = (arr, field) => {
  const map = Array(12).fill(0);
  arr.forEach((item) => {
    const m = new Date(item.createdAt).getMonth();
    map[m] += item[field] || 0;
  });
  return MONTHS.map((name, i) => ({ name, value: map[i] }));
};

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading,  setLoading]  = useState(true);
  const [refresh,  setRefresh]  = useState(0);

  /* raw */
  const [bookings,  setBookings]  = useState([]);
  const [rooms,     setRooms]     = useState([]);
  const [users,     setUsers]     = useState([]);
  const [invoices,  setInvoices]  = useState([]);
  const [services,  setServices]  = useState([]);
  const [tasks,     setTasks]     = useState([]);

  useEffect(() => { fetchAll(); }, [refresh]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [bR, rR, uR, iR, sR, tR] = await Promise.all([
        API.get("/bookings"),
        API.get("/rooms"),
        API.get("/users"),
        API.get("/invoices"),
        API.get("/services"),
        API.get("/housekeeping"),
      ]);
      setBookings(bR.data?.bookings  ?? []);
      setRooms   (rR.data?.rooms     ?? []);
      setUsers   (uR.data?.users     ?? []);
      setInvoices(iR.data?.invoices  ?? []);
      setServices(sR.data?.requests  ?? []);
      setTasks   (tR.data?.tasks     ?? []);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  /* ── derived stats ── */
  const totalRevenue   = invoices.reduce((s, i) => s + (i.totalAmount || 0), 0);
  const paidRevenue    = invoices.filter(i => i.paymentStatus === "Paid")
                                 .reduce((s, i) => s + (i.totalAmount || 0), 0);
  const occupancyRate  = rooms.length
    ? Math.round((rooms.filter(r => r.status === "Occupied").length / rooms.length) * 100)
    : 0;
  const totalGuests    = users.filter(u => u.role === "Guest").length;
  const avgDailyRate   = rooms.length
    ? Math.round(rooms.reduce((s, r) => s + (r.pricePerNight || 0), 0) / rooms.length)
    : 0;
  const checkinsToday  = bookings.filter(b => isToday(b.checkInDate)).length;
  const checkoutsToday = bookings.filter(b => isToday(b.checkOutDate)).length;
  const availRooms     = rooms.filter(r => r.status === "Available").length;
  const pendingServices= services.filter(s => s.status === "Pending").length;

  /* ── chart data ── */

  // Revenue Analytics — monthly from invoices (real)
  const revenueChartData = groupByMonth(invoices, "totalAmount");

  // Weekly Occupancy — bookings per day of week (real)
  const occMap = Array(7).fill(0);
  bookings.forEach(b => {
    const d = new Date(b.checkInDate).getDay(); // 0=Sun
    const idx = d === 0 ? 6 : d - 1;           // Mon=0
    occMap[idx]++;
  });
  const occupancyChartData = DAYS.map((name, i) => ({
    name,
    bookings: occMap[i],
    capacity: rooms.length || 10,
  }));

  // Room Distribution — bookings by room type (real)
  const typeMap = {};
  bookings.forEach(b => {
    const type = b.room?.type || "Unknown";
    typeMap[type] = (typeMap[type] || 0) + 1;
  });
  // fallback to rooms count if no bookings yet
  if (Object.keys(typeMap).length === 0) {
    rooms.forEach(r => { typeMap[r.type] = (typeMap[r.type] || 0) + 1; });
  }
  const roomDistData = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

  // Booking Trends — bookings per day last 7 days (real)
  const trendMap = {};
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    trendMap[d.toDateString()] = 0;
  }
  bookings.forEach(b => {
    const key = new Date(b.createdAt).toDateString();
    if (key in trendMap) trendMap[key]++;
  });
  const bookingTrendData = Object.entries(trendMap).map(([dateStr, count]) => {
    const d = new Date(dateStr);
    return {
      name: d.toLocaleDateString("en-US", { weekday: "short" }),
      bookings: count,
    };
  });

  // Upcoming check-ins
  const upcoming = [...bookings]
    .filter(b => b.status === "Confirmed")
    .sort((a, b) => new Date(a.checkInDate) - new Date(b.checkInDate))
    .slice(0, 5);

  // Live activity feed (real events)
  const activityFeed = [
    ...bookings.filter(b => b.status === "CheckedIn").slice(0, 2).map(b => ({
      icon: <LogIn size={13} />,
      color: "text-green-400", bg: "bg-green-500/10",
      label: "Guest Check-in",
      desc: `${b.guest?.name || "Guest"} · Room ${b.room?.roomNumber || "—"}`,
      time: new Date(b.actualCheckIn || b.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    })),
    ...invoices.filter(i => i.paymentStatus === "Paid").slice(0, 1).map(i => ({
      icon: <DollarSign size={13} />,
      color: "text-blue-400", bg: "bg-blue-500/10",
      label: "Payment Received",
      desc: `${i.guest?.name || "Guest"} · ${fmtMoney(i.totalAmount)}`,
      time: new Date(i.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    })),
    ...tasks.filter(t => t.status === "InProgress").slice(0, 1).map(t => ({
      icon: <Sparkles size={13} />,
      color: "text-yellow-400", bg: "bg-yellow-500/10",
      label: "Room Cleaning",
      desc: `Room ${t.room?.roomNumber || "—"} · ${t.assignedTo?.name || "Staff"}`,
      time: new Date(t.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    })),
    ...bookings.slice(0, 1).map(b => ({
      icon: <CalendarCheck size={13} />,
      color: "text-purple-400", bg: "bg-purple-500/10",
      label: "New Booking",
      desc: `${b.guest?.name || "Guest"} · Room ${b.room?.roomNumber || "—"}`,
      time: new Date(b.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    })),
  ].slice(0, 5);

  /* ── loading ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6 min-h-full text-white">

      {/* ── Header ── */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-500 text-xs mt-1">
            Welcome back! Here's what's happening at LuxuryStay today.
          </p>
        </div>
        <button
          onClick={() => setRefresh(r => r + 1)}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition hover:bg-white/5"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* ── Top 4 KPI cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KpiCard
          label="Total Revenue"
          value={fmtMoney(totalRevenue)}
          sub={`${fmtMoney(paidRevenue)} collected`}
          icon={<DollarSign size={15} />}
          trend="+12.5% vs last month"
          accent="blue"
        />
        <KpiCard
          label="Occupancy Rate"
          value={`${occupancyRate}%`}
          sub={`${rooms.filter(r=>r.status==="Occupied").length} of ${rooms.length} rooms`}
          icon={<BedDouble size={15} />}
          trend="+4.3% vs last month"
          accent="green"
        />
        <KpiCard
          label="Total Guests"
          value={totalGuests.toLocaleString()}
          sub={`${bookings.filter(b=>b.status==="CheckedIn").length} currently staying`}
          icon={<Users size={15} />}
          trend="+8.1% vs last month"
          accent="purple"
        />
        <KpiCard
          label="Avg. Daily Rate"
          value={`$${avgDailyRate}`}
          sub={`across ${rooms.length} rooms`}
          icon={<TrendingUp size={15} />}
          trend="+2.4% vs last month"
          accent="orange"
        />
      </div>

      {/* ── Second row — 4 mini stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Check-ins Today",   value: checkinsToday,   icon: <LogIn size={18} />,        color: "text-green-400",  bg: "bg-green-500/10"  },
          { label: "Check-outs Today",  value: checkoutsToday,  icon: <CalendarCheck size={18} />, color: "text-blue-400",   bg: "bg-blue-500/10"   },
          { label: "Available Rooms",   value: availRooms,      icon: <BedDouble size={18} />,     color: "text-yellow-400", bg: "bg-yellow-500/10" },
          { label: "Pending Services",  value: pendingServices, icon: <FileText size={18} />,      color: "text-pink-400",   bg: "bg-pink-500/10"   },
        ].map((s, i) => (
          <div key={i} className="bg-[#16181d] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center ${s.color} shrink-0`}>
              {s.icon}
            </div>
            <div>
              <p className="text-3xl font-bold leading-none">{s.value}</p>
              <p className="text-[12px] text-gray-500 mt-1.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Revenue Analytics */}
        <ChartCard title="Revenue Analytics" sub="Monthly revenue and booking trends">
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
              <XAxis dataKey="name" tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`$${v.toFixed(0)}`, "Revenue"]} />
              <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Weekly Occupancy */}
        <ChartCard title="Weekly Occupancy" sub="Room occupancy rate by day">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={occupancyChartData} barSize={36} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
              <XAxis dataKey="name" tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="bookings"  fill="#22c55e" radius={[4,4,0,0]} name="Bookings" />
              <Bar dataKey="capacity"  fill="#1a2e1a" radius={[4,4,0,0]} name="Capacity" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Charts row 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Room Distribution */}
        <ChartCard title="Room Distribution" sub="Bookings by room type">
          {roomDistData.length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="flex flex-col items-center gap-4">
              {/* Donut chart centered */}
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={roomDistData}
                    dataKey="value"
                    innerRadius={58}
                    outerRadius={90}
                    paddingAngle={3}
                    startAngle={90}
                    endAngle={-270}
                  >
                    {roomDistData.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    {...TOOLTIP_STYLE}
                    formatter={(value, name) => {
                      const total = roomDistData.reduce((s, d) => s + d.value, 0);
                      const pct = total ? Math.round((value / total) * 100) : 0;
                      return [`${value} (${pct}%)`, name];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend — bottom, horizontal, with percentage */}
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                {roomDistData.map((d, i) => {
                  const total = roomDistData.reduce((s, x) => s + x.value, 0);
                  const pct   = total ? Math.round((d.value / total) * 100) : 0;
                  return (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-gray-400">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: PALETTE[i % PALETTE.length] }}
                      />
                      {d.name} ({pct}%)
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </ChartCard>

        {/* Booking Trends */}
        <ChartCard title="Booking Trends" sub="Daily booking patterns this week">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={bookingTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
              <XAxis dataKey="name" tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [v, "Bookings"]} />
              <Line
                type="monotone"
                dataKey="bookings"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ fill: "#f59e0b", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Upcoming Check-ins */}
        <div className="lg:col-span-2 bg-[#16181d] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold">Upcoming Check-ins</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Next {upcoming.length} arrivals</p>
            </div>
            <button
              onClick={() => navigate("/bookings")}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
            >
              View All <ChevronRight size={13} />
            </button>
          </div>

          {upcoming.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-8">No upcoming check-ins</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((bk, i) => (
                <div
                  key={i}
                  onClick={() => navigate(`/bookings/${bk._id}`)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition"
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold shrink-0">
                    {(bk.guest?.name || "G")[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium truncate">{bk.guest?.name || "Guest"}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 shrink-0">
                        {bk.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500 flex-wrap">
                      <span>{bk.guest?.email || "—"}</span>
                      <span>·</span>
                      <span>Room {bk.room?.roomNumber || "—"}</span>
                      <span>·</span>
                      <span>{bk.numberOfGuests} guest{bk.numberOfGuests > 1 ? "s" : ""}</span>
                      <span>·</span>
                      <span>
                        {new Date(bk.checkInDate).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
                        {" → "}
                        {new Date(bk.checkOutDate).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
                      </span>
                    </div>
                  </div>

                  {/* Amount */}
                  <p className="text-sm font-semibold text-green-400 shrink-0">
                    ${bk.totalAmount?.toLocaleString() || "—"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Activity */}
        <div className="bg-[#16181d] border border-white/10 rounded-2xl p-6">
          <div className="mb-5">
            <h3 className="text-base font-semibold">Live Activity</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Recent system events</p>
          </div>

          {activityFeed.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {activityFeed.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl ${a.bg} flex items-center justify-center ${a.color} shrink-0`}>
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{a.label}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">{a.desc}</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   SUB-COMPONENTS
════════════════════════════════════════════════════════ */

const ACCENT = {
  blue:   { bg: "bg-blue-500/10",   text: "text-blue-400"   },
  green:  { bg: "bg-green-500/10",  text: "text-green-400"  },
  purple: { bg: "bg-purple-500/10", text: "text-purple-400" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-400" },
};

function KpiCard({ label, value, sub, icon, trend, accent = "blue" }) {
  const a = ACCENT[accent];
  return (
    <div className="bg-[#16181d] border border-white/10 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold">{label}</p>
        <div className={`w-9 h-9 rounded-xl ${a.bg} flex items-center justify-center ${a.text}`}>
          {icon}
        </div>
      </div>
      <p className="text-4xl font-bold tracking-tight">{value}</p>
      <div className="flex items-center justify-between pt-1">
        <p className="text-[11px] text-gray-600">{sub}</p>
        <span className="flex items-center gap-0.5 text-[11px] text-green-400 font-medium">
          <ArrowUpRight size={12} />{trend}
        </span>
      </div>
    </div>
  );
}

function ChartCard({ title, sub, children }) {
  return (
    <div className="bg-[#16181d] border border-white/10 rounded-2xl p-6">
      <div className="mb-5">
        <h3 className="text-base font-semibold">{title}</h3>
        {sub && <p className="text-[11px] text-gray-500 mt-1">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-[180px] text-gray-600 text-sm">
      No room data yet
    </div>
  );
}
