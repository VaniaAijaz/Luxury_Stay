import { useState } from "react";
import Sidebar from "./Sidebar";
import MobileMenu from "./MobileMenu";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex bg-[#0d0f14] min-h-screen text-white p-4 md:p-6">

      {/* Desktop Sidebar */}
      <div className="hidden md:block mr-5">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 rounded-3xl overflow-hidden border border-white/10 bg-[#111111]">

        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-5 md:px-7 border-b border-white/10 bg-[#0d0d0d] shrink-0">

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10"
          >
            <Menu size={20} />
          </button>

          {/* Page title placeholder */}
          <div className="hidden md:block" />

          {/* Right — user info */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-none">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {user?.role || "Guest"}
              </p>
            </div>

            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold uppercase">
              {user?.name?.[0] || "U"}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-5 md:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
    </div>
  );
}