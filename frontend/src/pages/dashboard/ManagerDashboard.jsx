import React, { useEffect, useState } from "react";
import API from "@/api/axios";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

const ManagerDashboard = () => {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    bookings: 0,
    revenue: 0,
    rooms: 0,
    tasks: 0,
  });

  const [bookings, setBookings] = useState([]);
  const [tasks, setTasks] = useState([]);

  // ================= FETCH DATA =================
  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const [bookingsRes, usersRes, roomsRes] = await Promise.all([
        API.get("/bookings"),
        API.get("/users"),
        API.get("/rooms"),
      ]);

      const bookingsData = bookingsRes.data?.bookings ?? bookingsRes.data ?? [];
      const usersData = usersRes.data?.users ?? usersRes.data ?? [];
      const roomsData = roomsRes.data?.rooms ?? roomsRes.data ?? [];

      setBookings(bookingsData);

      // fake tasks (replace with real API if available)
      setTasks([
        { task: "Approve pending bookings", priority: "High" },
        { task: "Check housekeeping reports", priority: "Medium" },
        { task: "Review maintenance requests", priority: "High" },
      ]);

      // ================= STATS =================
      setStats({
        bookings: bookingsData.length,
        revenue: bookingsData.length * 120, // fake calc (replace with real field)
        rooms: roomsData.length,
        tasks: 3,
      });
    } catch (err) {
      console.log("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-[#0a0a0a] min-h-full text-white">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Manager Dashboard 📊
        </h1>
        <p className="text-gray-500">
          Live system overview (Bookings, Rooms, Revenue)
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <Card>
          <CardHeader><CardTitle>Bookings</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.bookings}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Revenue</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${stats.revenue}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Rooms</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.rooms}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Tasks</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.tasks}</p>
          </CardContent>
        </Card>

      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* BOOKINGS */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {bookings.slice(0, 5).map((b, i) => (
                  <div
                    key={i}
                    className="flex justify-between border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">
                        {b.user?.name || "Guest"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Room: {b.room?.name || "N/A"}
                      </p>
                    </div>

                    <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-600">
                      {b.status || "Active"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* TASKS */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {tasks.map((t, i) => (
              <div
                key={i}
                className="p-3 border rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <p className="text-sm">{t.task}</p>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    t.priority === "High"
                      ? "bg-red-100 text-red-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {t.priority}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>

    </div>
  );
};

export default ManagerDashboard;