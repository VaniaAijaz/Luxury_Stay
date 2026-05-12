import React, { useEffect, useState } from "react";
import API from "@/api/axios";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

const GuestDashboard = () => {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    bookings: 0,
    pending: 0,
    spent: 0,
    points: 0,
  });

  const [bookings, setBookings] = useState([]);
  const [activities, setActivities] = useState([]);

  // ================= FETCH DATA =================
  const fetchGuestDashboard = async () => {
    try {
      setLoading(true);

      const res = await API.get("/bookings/my");
      const myBookings = res.data?.bookings || res.data || [];

      setBookings(myBookings);

      // ================= STATS CALCULATION =================
      const pending = myBookings.filter(
        (b) => b.status === "Pending"
      ).length;

      const spent = myBookings.reduce(
        (acc, b) => acc + (b.totalPrice || 0),
        0
      );

      setStats({
        bookings: myBookings.length,
        pending,
        spent,
        points: myBookings.length * 100, // fake loyalty system
      });

      // ================= ACTIVITIES =================
      setActivities([
        "Room booking confirmed",
        "Payment received",
        "Service request completed",
      ]);
    } catch (err) {
      console.log("Guest dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuestDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-gray-500">
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-[#0a0a0a] min-h-full text-white">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome Back 👋
        </h1>
        <p className="text-gray-500">
          Manage your bookings & stay experience
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <Card>
          <CardHeader><CardTitle>Total Bookings</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.bookings}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pending</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.pending}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Total Spent</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${stats.spent}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Loyalty Points</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.points}</p>
          </CardContent>
        </Card>

      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* BOOKINGS */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>My Bookings</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {bookings.slice(0, 5).map((b, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center border-b pb-3 last:border-none"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {b.room?.name || "Room"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(b.createdAt).toDateString()}
                      </p>
                    </div>

                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        b.status === "Confirmed"
                          ? "bg-green-100 text-green-600"
                          : b.status === "Pending"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QUICK ACTIONS */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <button className="w-full py-2 rounded-xl bg-black text-white hover:opacity-90">
              Book New Room
            </button>

            <button className="w-full py-2 rounded-xl border hover:bg-gray-100 dark:hover:bg-gray-800">
              Request Service
            </button>

            <button className="w-full py-2 rounded-xl border hover:bg-gray-100 dark:hover:bg-gray-800">
              View Invoices
            </button>
          </CardContent>
        </Card>

      </div>

      {/* ACTIVITY FEED */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>

        <CardContent>
          <ul className="space-y-3">
            {activities.map((a, i) => (
              <li
                key={i}
                className="text-sm text-gray-600 dark:text-gray-300"
              >
                ✔ {a}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

    </div>
  );
};

export default GuestDashboard;