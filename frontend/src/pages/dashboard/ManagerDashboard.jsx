import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  BedDouble,
  CalendarDays,
  BadgeDollarSign,
  ClipboardList,
  Wrench,
  Bell,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  Search,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const ManagerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Replace with your real API
        // const response = await axios.get("http://localhost:5000/api/manager/dashboard")
        // setDashboardData(response.data)

        // Temporary Mock Data
        setTimeout(() => {
          setDashboardData({
            stats: {
              totalRooms: 120,
              occupiedRooms: 84,
              availableRooms: 36,
              totalRevenue: 245000,
              totalBookings: 312,
              pendingRequests: 14,
            },

            recentBookings: [
              {
                id: 1,
                guest: "Ali Khan",
                room: "Deluxe Suite",
                status: "Confirmed",
                amount: 22000,
              },
              {
                id: 2,
                guest: "Sara Ahmed",
                room: "Executive Room",
                status: "Pending",
                amount: 18000,
              },
              {
                id: 3,
                guest: "Ahmed Raza",
                room: "Luxury Room",
                status: "Checked-In",
                amount: 32000,
              },
            ],

            housekeeping: [
              {
                room: "102",
                status: "Completed",
              },
              {
                room: "203",
                status: "Pending",
              },
              {
                room: "305",
                status: "In Progress",
              },
            ],

            maintenance: [
              {
                room: "402",
                issue: "AC Repair",
                status: "Pending",
              },
              {
                room: "108",
                issue: "Water Leakage",
                status: "Resolved",
              },
            ],

            monthlyRevenue: [
              { month: "Jan", revenue: 30000 },
              { month: "Feb", revenue: 45000 },
              { month: "Mar", revenue: 55000 },
              { month: "Apr", revenue: 60000 },
              { month: "May", revenue: 70000 },
            ],

            occupancyData: [
              { name: "Occupied", value: 84 },
              { name: "Available", value: 36 },
            ],
          });

          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const filteredBookings = useMemo(() => {
    if (!dashboardData?.recentBookings) return [];

    return dashboardData.recentBookings.filter((booking) =>
      booking.guest.toLowerCase().includes(search.toLowerCase())
    );
  }, [dashboardData, search]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white text-2xl font-semibold">
        Loading Manager Dashboard...
      </div>
    );
  }

  const stats = dashboardData.stats;

  const statCards = [
    {
      title: "Total Rooms",
      value: stats.totalRooms,
      icon: BedDouble,
    },
    {
      title: "Occupied Rooms",
      value: stats.occupiedRooms,
      icon: Users,
    },
    {
      title: "Available Rooms",
      value: stats.availableRooms,
      icon: CheckCircle2,
    },
    {
      title: "Revenue",
      value: `PKR ${stats.totalRevenue}`,
      icon: BadgeDollarSign,
    },
    {
      title: "Bookings",
      value: stats.totalBookings,
      icon: CalendarDays,
    },
    {
      title: "Pending Requests",
      value: stats.pendingRequests,
      icon: Bell,
    },
  ];

  const COLORS = ["#0f172a", "#f59e0b"];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold">Manager Dashboard</h1>
          <p className="text-slate-400 mt-2">
            Monitor hotel operations, bookings, revenue and staff activities.
          </p>
        </div>

        <div className="relative w-full lg:w-[350px]">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search guest booking..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-yellow-500"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
        {statCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg hover:scale-[1.02] duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-slate-400 text-sm">{card.title}</p>
                  <h2 className="text-3xl font-bold mt-2">{card.value}</h2>
                </div>

                <div className="bg-yellow-500/20 p-4 rounded-2xl">
                  <Icon className="text-yellow-400" size={30} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
        {/* Revenue Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-[400px]">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-yellow-400" />
            <h2 className="text-2xl font-semibold">Monthly Revenue</h2>
          </div>

          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={dashboardData.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#f59e0b"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Occupancy */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-[400px]">
          <div className="flex items-center gap-2 mb-6">
            <ClipboardList className="text-yellow-400" />
            <h2 className="text-2xl font-semibold">Room Occupancy</h2>
          </div>

          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={dashboardData.occupancyData}
                dataKey="value"
                outerRadius={120}
                label
              >
                {dashboardData.occupancyData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-10 overflow-x-auto">
        <div className="flex items-center gap-2 mb-6">
          <CalendarDays className="text-yellow-400" />
          <h2 className="text-2xl font-semibold">Recent Bookings</h2>
        </div>

        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-700 text-slate-300">
              <th className="text-left py-4">Guest</th>
              <th className="text-left py-4">Room</th>
              <th className="text-left py-4">Status</th>
              <th className="text-left py-4">Amount</th>
            </tr>
          </thead>

          <tbody>
            {filteredBookings.map((booking) => (
              <tr
                key={booking.id}
                className="border-b border-slate-800 hover:bg-slate-800/50"
              >
                <td className="py-4">{booking.guest}</td>
                <td className="py-4">{booking.room}</td>

                <td className="py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      booking.status === "Confirmed"
                        ? "bg-green-500/20 text-green-400"
                        : booking.status === "Pending"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>

                <td className="py-4">PKR {booking.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Housekeeping & Maintenance */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Housekeeping */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock3 className="text-yellow-400" />
            <h2 className="text-2xl font-semibold">Housekeeping Tasks</h2>
          </div>

          <div className="space-y-4">
            {dashboardData.housekeeping.map((task, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-slate-800 p-4 rounded-2xl"
              >
                <div>
                  <p className="font-semibold">Room {task.room}</p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    task.status === "Completed"
                      ? "bg-green-500/20 text-green-400"
                      : task.status === "Pending"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Wrench className="text-yellow-400" />
            <h2 className="text-2xl font-semibold">Maintenance Requests</h2>
          </div>

          <div className="space-y-4">
            {dashboardData.maintenance.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-slate-800 p-4 rounded-2xl"
              >
                <div>
                  <p className="font-semibold">Room {item.room}</p>
                  <p className="text-slate-400 text-sm">{item.issue}</p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    item.status === "Resolved"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 text-center text-slate-500 text-sm">
        Luxury Stay Hotel Management System — Manager Panel
      </div>
    </div>
  );
};

export default ManagerDashboard;
