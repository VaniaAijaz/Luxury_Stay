import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBookingById, cancelBooking } from "../../api/bookingApi";
import { checkInGuest, checkOutGuest } from "../../api/checkInOutApi";

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const isStaff = ["Admin", "Manager", "Receptionist"].includes(user?.role);

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchBooking();
  }, []);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const data = await getBookingById(id);
      // API may return { booking } or the booking directly
      setBooking(data.booking || data);
    } catch (err) {
      setError("Failed to load booking details.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setError("");
      const res = await checkInGuest(id);
      setSuccessMsg(res.message || "Guest checked in successfully.");
      setBooking(res.booking);
    } catch (err) {
      setError(err?.response?.data?.message || "Check-in failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setError("");
      const res = await checkOutGuest(id);
      setSuccessMsg(res.message || "Guest checked out successfully.");
      setBooking(res.booking);
    } catch (err) {
      setError(err?.response?.data?.message || "Check-out failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      setActionLoading(true);
      setError("");
      await cancelBooking(id);
      setSuccessMsg("Booking cancelled successfully.");
      navigate("/bookings");
    } catch (err) {
      setError(err?.response?.data?.message || "Cancellation failed.");
    } finally {
      setActionLoading(false);
    }
  };

  /* ─── STATUS BADGE ─── */
  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-700",
    Confirmed: "bg-blue-100 text-blue-700",
    CheckedIn: "bg-green-100 text-green-700",
    CheckedOut: "bg-gray-100 text-gray-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        Loading booking details...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-red-400">
        Booking not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Booking Details</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            ← Back
          </button>
        </div>

        {/* ALERTS */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg">
            {successMsg}
          </div>
        )}

        {/* BOOKING CARD */}
        <div className="bg-slate-800 rounded-2xl p-6 space-y-4">

          {/* STATUS */}
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Booking ID</span>
            <span className="text-xs font-mono text-gray-300">{booking._id}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Status</span>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                statusColors[booking.status] || "bg-gray-700 text-gray-300"
              }`}
            >
              {booking.status}
            </span>
          </div>

          <hr className="border-slate-700" />

          {/* GUEST INFO */}
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Guest</span>
            <span>{booking.user?.name || "N/A"}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Email</span>
            <span>{booking.user?.email || "N/A"}</span>
          </div>

          <hr className="border-slate-700" />

          {/* ROOM INFO */}
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Room</span>
            <span>
              {booking.room?.roomNumber
                ? `Room ${booking.room.roomNumber} — ${booking.room.type}`
                : "N/A"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Floor</span>
            <span>{booking.room?.floor ?? "N/A"}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Price / Night</span>
            <span>
              {booking.room?.pricePerNight
                ? `$${booking.room.pricePerNight}`
                : "N/A"}
            </span>
          </div>

          <hr className="border-slate-700" />

          {/* DATES */}
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Check-In Date</span>
            <span>
              {booking.checkInDate
                ? new Date(booking.checkInDate).toLocaleDateString()
                : "N/A"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Check-Out Date</span>
            <span>
              {booking.checkOutDate
                ? new Date(booking.checkOutDate).toLocaleDateString()
                : "N/A"}
            </span>
          </div>

          {booking.actualCheckIn && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Actual Check-In</span>
              <span>{new Date(booking.actualCheckIn).toLocaleString()}</span>
            </div>
          )}

          {booking.actualCheckOut && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Actual Check-Out</span>
              <span>{new Date(booking.actualCheckOut).toLocaleString()}</span>
            </div>
          )}

          <hr className="border-slate-700" />

          {/* GUESTS & TOTAL */}
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Number of Guests</span>
            <span>{booking.numberOfGuests}</span>
          </div>

          {booking.totalPrice != null && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Total Price</span>
              <span className="text-green-400 font-semibold">
                ${booking.totalPrice}
              </span>
            </div>
          )}
        </div>

        {/* ─── ACTION BUTTONS ─── */}
        <div className="flex flex-wrap gap-3">

          {/* CHECK-IN — only staff, only when Confirmed */}
          {isStaff && booking.status === "Confirmed" && (
            <button
              onClick={handleCheckIn}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-medium transition"
            >
              {actionLoading ? "Processing..." : "✅ Check In"}
            </button>
          )}

          {/* CHECK-OUT — only staff, only when CheckedIn */}
          {isStaff && booking.status === "CheckedIn" && (
            <button
              onClick={handleCheckOut}
              disabled={actionLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-medium transition"
            >
              {actionLoading ? "Processing..." : "🚪 Check Out"}
            </button>
          )}

          {/* CANCEL — guest (own booking) or staff, only when Pending/Confirmed */}
          {["Pending", "Confirmed"].includes(booking.status) && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-medium transition"
            >
              {actionLoading ? "Processing..." : "✖ Cancel Booking"}
            </button>
          )}

        </div>

      </div>
    </div>
  );
};

export default BookingDetails;
