import { useEffect, useState } from "react";

import AdminDashboard        from "./AdminDashboard";
import ManagerDashboard      from "./ManagerDashboard";
import ReceptionistDashboard from "./ReceptionistDashboard";
import GuestDashboard        from "./GuestDashboard";
import HousekeepingDashboard from "./HousekeepingDashboard";

const Dashboard = () => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  if (loading) return null;

  if (!user) return (
    <div className="flex items-center justify-center min-h-[60vh] text-gray-400">
      Not authenticated. Please login again.
    </div>
  );

  return (
    <>
      {user.role === "Admin"        && <AdminDashboard />}
      {user.role === "Manager"      && <ManagerDashboard />}
      {user.role === "Receptionist" && <ReceptionistDashboard />}
      {user.role === "Guest"        && <GuestDashboard />}
      {user.role === "Housekeeping" && <HousekeepingDashboard />}
    </>
  );
};

export default Dashboard;
