import { Routes, Route } from "react-router-dom";

/* LAYOUT */
import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "../components/layout/ProtectedRoute";

/* AUTH */
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

/* DASHBOARD */
import Dashboard from "../pages/dashboard/Dashboard";

/* ROOMS */
import Rooms from "../pages/rooms/Rooms";
import RoomDetails from "../pages/rooms/RoomDetails";
import CreateRoom from "../pages/rooms/CreateRoom";
import EditRoom from "../pages/rooms/EditRoom";

/* BOOKINGS */
import Bookings from "../pages/bookings/Bookings";
import MyBookings from "../pages/bookings/MyBookings";
import BookingDetails from "../pages/bookings/BookingDetails";
import CreateBooking from "../pages/bookings/CreateBooking";

/* SERVICES */
import Services from "../pages/services/Services";
import MyServices from "../pages/services/MyServices";
import CreateService from "../pages/services/CreateService";

/* MAINTENANCE */
import Maintenance from "../pages/maintenance/Maintenance";
import MaintenanceDetails from "../pages/maintenance/MaintenanceDetails";
import CreateMaintenance from "../pages/maintenance/CreateMaintenance";

/* HOUSEKEEPING */
import HouseKeeping from "../pages/housekeeping/HouseKeeping";
import HouseKeepingDetails from "../pages/housekeeping/HouseKeepingDetails";

/* FEEDBACK */
import Feedback from "../pages/feedback/Feedback";
import CreateFeedback from "../pages/feedback/CreateFeedback";

/* INVOICES */
import Invoices from "../pages/invoices/Invoices";
import InvoiceDetails from "../pages/invoices/InvoiceDetails";

/* USERS */
import Users from "../pages/users/Users";
import UserDetails from "../pages/users/UserDetails";
import EditUser from "../pages/users/EditUser";
import Guests from "../pages/users/Guests";

/* ERROR */
import NotFound from "../pages/errors/NotFound";

/* ─── Helper: wrap a page in ProtectedRoute + DashboardLayout ─── */
const Protected = ({ children, roles }) => (
  <ProtectedRoute allowedRoles={roles}>
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

const AppRoutes = () => {
  return (
    <Routes>

      {/* ── AUTH (no layout) ── */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ── DASHBOARD ── */}
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />

      {/* ── ROOMS ── */}
      <Route path="/rooms" element={<Protected><Rooms /></Protected>} />
      <Route path="/rooms/:id" element={<Protected><RoomDetails /></Protected>} />
      <Route path="/rooms/create" element={<Protected roles={["Admin", "Manager"]}><CreateRoom /></Protected>} />
      <Route path="/rooms/edit/:id" element={<Protected roles={["Admin", "Manager"]}><EditRoom /></Protected>} />

      {/* ── BOOKINGS ── */}
      <Route path="/bookings" element={<Protected roles={["Admin", "Manager", "Receptionist"]}><Bookings /></Protected>} />
      <Route path="/bookings/my" element={<Protected><MyBookings /></Protected>} />
      <Route path="/bookings/create" element={<Protected><CreateBooking /></Protected>} />
      <Route path="/bookings/:id" element={<Protected><BookingDetails /></Protected>} />

      {/* ── CHECK-IN / OUT ── */}
      <Route path="/checkin/:id" element={<Protected roles={["Admin", "Manager", "Receptionist"]}><BookingDetails /></Protected>} />
      <Route path="/checkout/:id" element={<Protected roles={["Admin", "Manager", "Receptionist"]}><BookingDetails /></Protected>} />

      {/* ── SERVICES ── */}
      <Route path="/services" element={<Protected roles={["Admin", "Manager", "Receptionist"]}><Services /></Protected>} />
      <Route path="/services/my" element={<Protected><MyServices /></Protected>} />
      <Route path="/services/create" element={<Protected><CreateService /></Protected>} />

      {/* ── MAINTENANCE ── */}
      <Route path="/maintenance" element={<Protected roles={["Admin", "Manager", "Receptionist"]}><Maintenance /></Protected>} />
      <Route path="/maintenance/:id" element={<Protected><MaintenanceDetails /></Protected>} />
      <Route path="/maintenance/create" element={<Protected><CreateMaintenance /></Protected>} />

      {/* ── HOUSEKEEPING ── */}
      <Route path="/housekeeping" element={<Protected roles={["Admin", "Manager", "Housekeeping"]}><HouseKeeping /></Protected>} />
      <Route path="/housekeeping/:id" element={<Protected roles={["Admin", "Manager", "Housekeeping"]}><HouseKeepingDetails /></Protected>} />

      {/* ── FEEDBACK ── */}
      <Route path="/feedback" element={<Protected><Feedback /></Protected>} />
      <Route path="/feedback/create" element={<Protected><CreateFeedback /></Protected>} />

      {/* ── INVOICES ── */}
      <Route path="/invoices" element={<Protected roles={["Admin", "Manager", "Receptionist"]}><Invoices /></Protected>} />
      <Route path="/invoices/:id" element={<Protected><InvoiceDetails /></Protected>} />

      {/* ── USERS ── */}
      <Route path="/users" element={<Protected roles={["Admin", "Manager"]}><Users /></Protected>} />
      <Route path="/users/:id" element={<Protected roles={["Admin", "Manager"]}><UserDetails /></Protected>} />
      <Route path="/users/edit/:id" element={<Protected roles={["Admin", "Manager"]}><EditUser /></Protected>} />

      {/* ── GUESTS ── */}
      <Route path="/guests" element={<Protected roles={["Admin", "Manager"]}><Guests /></Protected>} />

      {/* ── 404 ── */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
};

export default AppRoutes;
