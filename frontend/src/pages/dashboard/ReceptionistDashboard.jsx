import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api/axios";
import { checkInGuest, checkOutGuest } from "@/api/checkInOutApi";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  CalendarCheck,
  Users,
  BedDouble,
  ClipboardList,
} from "lucide-react";

export default function ReceptionistDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [bookingIdInput, setBookingIdInput] = useState("");
  const [actionMsg, setActionMsg] = useState({ type: "", text: "" });

  const [stats, setStats] = useState({
    bookings: 0,
    checkins: 0,
    checkouts: 0,
    availableRooms: 0,
  });

  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);

  // ================= FETCH DATA =================
  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const [bookingsRes, roomsRes] = await Promise.all([
        API.get("/bookings"),
        API.get("/rooms"),
      ]);

      const bookingsData = bookingsRes.data?.bookings ?? bookingsRes.data ?? [];
      const roomsData = roomsRes.data?.rooms ?? roomsRes.data ?? [];

      setBookings(bookingsData);
      setRooms(roomsData);

      // ================= CALCULATIONS =================
      const checkins = bookingsData.filter(
        (b) => b.status === "CheckedIn"
      ).length;

      const checkouts = bookingsData.filter(
        (b) => b.status === "CheckedOut"
      ).length;

      const availableRooms = roomsData.filter(
        (r) => r.status === "Available"
      ).length;

      setStats({
        bookings: bookingsData.length,
        checkins,
        checkouts,
        availableRooms,
      });

    } catch (err) {
      console.log("Receptionist dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  /* ─── QUICK CHECK-IN ─── */
  const handleQuickCheckIn = async () => {
    if (!bookingIdInput.trim()) {
      setActionMsg({ type: "error", text: "Please enter a Booking ID." });
      return;
    }
    try {
      setActionLoading(true);
      setActionMsg({ type: "", text: "" });
      const res = await checkInGuest(bookingIdInput.trim());
      setActionMsg({ type: "success", text: res.message || "Guest checked in!" });
      setBookingIdInput("");
      fetchDashboard(); // refresh stats
    } catch (err) {
      setActionMsg({
        type: "error",
        text: err?.response?.data?.message || "Check-in failed.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  /* ─── QUICK CHECK-OUT ─── */
  const handleQuickCheckOut = async () => {
    if (!bookingIdInput.trim()) {
      setActionMsg({ type: "error", text: "Please enter a Booking ID." });
      return;
    }
    try {
      setActionLoading(true);
      setActionMsg({ type: "", text: "" });
      const res = await checkOutGuest(bookingIdInput.trim());
      setActionMsg({ type: "success", text: res.message || "Guest checked out!" });
      setBookingIdInput("");
      fetchDashboard(); // refresh stats
    } catch (err) {
      setActionMsg({
        type: "error",
        text: err?.response?.data?.message || "Check-out failed.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-400">
        Loading Reception Dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-[#0a0a0a] min-h-full text-white">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Reception Dashboard 🏨
        </h1>
        <p className="text-gray-500">
          Manage check-ins, bookings & room availability
        </p>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <StatCard
          icon={<ClipboardList />}
          title="Total Bookings"
          value={stats.bookings}
        />

        <StatCard
          icon={<CalendarCheck />}
          title="Check-Ins"
          value={stats.checkins}
        />

        <StatCard
          icon={<Users />}
          title="Check-Outs"
          value={stats.checkouts}
        />

        <StatCard
          icon={<BedDouble />}
          title="Available Rooms"
          value={stats.availableRooms}
        />

      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* BOOKINGS */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold mb-4">
                Recent Bookings
              </h2>

              <div className="space-y-3">
                {bookings.slice(0, 6).map((b, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">
                        {b.user?.name || "Guest"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Room: {b.room?.name || "N/A"}
                      </p>
                    </div>

                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        b.status === "CheckedIn"
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
          <CardContent className="p-5 space-y-3">
            <h2 className="text-lg font-semibold">
              Quick Actions
            </h2>

            {/* Booking ID input for check-in/out */}
            <input
              type="text"
              placeholder="Enter Booking ID..."
              value={bookingIdInput}
              onChange={(e) => setBookingIdInput(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Feedback message */}
            {actionMsg.text && (
              <p
                className={`text-xs px-2 py-1 rounded ${
                  actionMsg.type === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {actionMsg.text}
              </p>
            )}

            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={handleQuickCheckIn}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing..." : "✅ Check-In Guest"}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleQuickCheckOut}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing..." : "🚪 Check-Out Guest"}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/bookings/create")}
            >
              📋 Create Booking
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/rooms")}
            >
              🛏 View Rooms
            </Button>
          </CardContent>
        </Card>

      </div>

    </div>
  );
}

/* ================= SMALL UI COMPONENT ================= */

const StatCard = ({ icon, title, value }) => (
  <Card className="hover:scale-[1.02] transition-all">
    <CardContent className="p-5 flex items-center gap-4">
      <div className="text-blue-600">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-xl font-bold">{value}</h3>
      </div>
    </CardContent>
  </Card>
);