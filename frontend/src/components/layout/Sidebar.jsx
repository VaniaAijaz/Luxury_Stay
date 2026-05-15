import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "react-tooltip";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, BedDouble, CalendarCheck, UserCheck,
  Sparkles, Wrench, ConciergeBell, MessageSquare,
  FileText, Users, Settings, LogOut, User,
  ChevronLeft, ChevronRight, Hotel,
} from "lucide-react";

/* ─── Menu definition ─── */
// const NAV = [

//   {
//     group: "MAIN",
//     items: [
//       { label: "Dashboard",    icon: LayoutDashboard, path: "/dashboard",    roles: ["Admin","Manager","Receptionist","Housekeeping","Guest"] },
//       { label: "Rooms",        icon: BedDouble,       path: "/rooms",        roles: ["Admin","Manager","Receptionist","Guest"] },
//       { label: "Bookings",     icon: CalendarCheck,   path: "/bookings",     roles: ["Admin","Manager","Receptionist"] },
//       { label: "Check-In/Out", icon: UserCheck,       path: "/bookings",     roles: ["Admin","Manager","Receptionist"] },
//     ],
//   },
//   {
//     group: "OPERATIONS",
//     items: [
//       { label: "Housekeeping", icon: Sparkles,        path: "/housekeeping", roles: ["Admin","Manager","Housekeeping"] },
//       { label: "Maintenance",  icon: Wrench,          path: "/maintenance",  roles: ["Admin","Manager","Receptionist"] },
//       { label: "Services",     icon: ConciergeBell,   path: "/services",     roles: ["Admin","Manager","Receptionist","Guest"] },
//     ],
//   },
//   {
//     group: "REPORTS",
//     items: [
//       { label: "Feedback",     icon: MessageSquare,   path: "/feedback",     roles: ["Admin","Manager","Guest"] },
//       { label: "Invoices",     icon: FileText,        path: "/invoices",     roles: ["Admin","Manager","Receptionist"] },
//     ],
//   },
//   {
//     group: "ADMIN",
//     items: [
//       { label: "Staff",        icon: Users,           path: "/users",        roles: ["Admin","Manager"] },
//       { label: "Guests",       icon: User,            path: "/guests",       roles: ["Admin","Manager"] },
//       { label: "Settings",     icon: Settings,        path: "/settings",     roles: ["Admin","Manager","Receptionist","Housekeeping","Guest"] },
//     ],
//   },
// ];

const NAV = [
  {
    group: "MAIN",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard",
        roles: ["Admin","Manager","Receptionist","Housekeeping","Guest"]
      },

      {
        label: "Rooms",
        icon: BedDouble,
        path: "/rooms",
        roles: ["Manager","Receptionist","Guest"]
      },

      {
        label: "Bookings",
        icon: CalendarCheck,
        path: "/bookings",
        roles: ["Manager","Receptionist"]
      },

      {
        label: "Check-In/Out",
        icon: UserCheck,
        path: "/bookings",
        roles: ["Receptionist"]
      },
    ],
  },

  {
    group: "OPERATIONS",
    items: [
      {
        label: "Housekeeping",
        icon: Sparkles,
        path: "/housekeeping",
        roles: ["Housekeeping","Manager"]
      },

      {
        label: "Maintenance",
        icon: Wrench,
        path: "/maintenance",
        roles: ["Receptionist","Manager"]
      },

      {
        label: "Services",
        icon: ConciergeBell,
        path: "/services",
        roles: ["Receptionist","Guest"]
      },
    ],
  },

  {
    group: "REPORTS",
    items: [
      {
        label: "Feedback",
        icon: MessageSquare,
        path: "/feedback",
        roles: ["Manager","Guest"]
      },

      {
        label: "Invoices",
        icon: FileText,
        path: "/invoices",
        roles: ["Receptionist","Manager"]
      },
    ],
  },

  {
    group: "ADMIN",
    items: [
      {
        label: "Staff",
        icon: Users,
        path: "/users",
        roles: ["Admin"]
      },

      {
        label: "Guests",
        icon: User,
        path: "/guests",
        roles: ["Admin"]
      },

      

      {
        label: "Settings",
        icon: Settings,
        path: "/settings",
        roles: ["Admin"]
      },
    ],
  },
];

/* ─── Accent colors per active item ─── */
const ACCENT = "#3b82f6"; // blue-500

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "Guest";

  /* persist collapse state */
  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    if (saved !== null) setCollapsed(saved === "true");
  }, []);
  const toggleCollapse = () => {
    setCollapsed(v => {
      localStorage.setItem("sidebar_collapsed", String(!v));
      return !v;
    });
  };

  const isActive = (path) =>
    path === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(path);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  /* ── sidebar width variants ── */
  const sidebarVariants = {
    expanded:  { width: 230 },
    collapsed: { width: 68  },
  };

  return (
    <>
      {/* Tooltip portal — only shown when collapsed */}
      <Tooltip id="nav-tip" place="right" style={{
        background: "#1e1e2e",
        color: "#e2e8f0",
        fontSize: 12,
        fontWeight: 500,
        borderRadius: 8,
        padding: "6px 12px",
        border: "1px solid rgba(255,255,255,0.08)",
        zIndex: 9999,
      }} />

      <motion.aside
        variants={sidebarVariants}
        animate={collapsed ? "collapsed" : "expanded"}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="hidden md:flex flex-col h-screen shrink-0 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #0d0d14 0%, #0a0a10 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >

        {/* ── Logo ── */}
        <div className={cn(
          "flex items-center h-16 px-4 shrink-0",
          collapsed ? "justify-center" : "justify-start gap-2.5",
        )}
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-2.5 min-w-0"
              >
                {/* Icon mark */}
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
                  <Hotel size={14} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-white leading-none tracking-tight truncate">
                    LuxuryStay
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-none">
                    Hotel Management
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {collapsed && (
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
              <Hotel size={14} className="text-white" />
            </div>
          )}
        </div>

        {/* ── Nav groups ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-3 space-y-0.5"
          style={{ scrollbarWidth: "none" }}>

          {NAV.map((group) => {
            const visible = group.items.filter(i => i.roles.includes(role));
            if (visible.length === 0) return null;

            return (
              <div key={group.group} className="mb-1">

                {/* Group label */}
                <AnimatePresence>
                  {!collapsed && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="px-3 pt-3 pb-1.5 text-[10px] font-semibold tracking-widest"
                      style={{ color: "#334155" }}
                    >
                      {group.group}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Items */}
                {visible.map((item) => {
                  const active = isActive(item.path);
                  const Icon   = item.icon;

                  return (
                    <motion.button
                      key={item.label}
                      onClick={() => navigate(item.path)}
                      whileHover={{ x: collapsed ? 0 : 2 }}
                      whileTap={{ scale: 0.97 }}
                      data-tooltip-id={collapsed ? "nav-tip" : undefined}
                      data-tooltip-content={collapsed ? item.label : undefined}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-xl transition-all duration-150 relative group",
                        collapsed ? "justify-center px-0 py-2.5 mx-0" : "px-3 py-2.5",
                      )}
                      style={active ? {
                        background: "rgba(59,130,246,0.12)",
                        color: "#60a5fa",
                      } : {
                        color: "#475569",
                      }}
                      onMouseEnter={e => {
                        if (!active) {
                          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                          e.currentTarget.style.color = "#94a3b8";
                        }
                      }}
                      onMouseLeave={e => {
                        if (!active) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "#475569";
                        }
                      }}
                    >
                      {/* Active indicator bar */}
                      {active && (
                        <motion.span
                          layoutId="activeBar"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                          style={{ background: ACCENT }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}

                      {/* Icon */}
                      <span className={cn(
                        "shrink-0 flex items-center justify-center rounded-lg transition-all",
                        active
                          ? "text-blue-400"
                          : "text-slate-500 group-hover:text-slate-300",
                        collapsed ? "w-8 h-8" : "w-7 h-7",
                      )}>
                        <Icon size={16} />
                      </span>

                      {/* Label */}
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.18 }}
                            className="text-[13px] font-medium leading-none truncate whitespace-nowrap overflow-hidden"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* ── User profile + bottom actions ── */}
        <div className="shrink-0 px-3 pb-3 pt-2 space-y-1"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>

          {/* Collapse button (expanded state) */}
          {!collapsed && (
            <button
              onClick={toggleCollapse}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-[13px] font-medium"
              style={{ color: "#334155" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#64748b"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#334155"; }}
            >
              <span className="w-7 h-7 flex items-center justify-center shrink-0">
                <ChevronLeft size={15} />
              </span>
              <span>Collapse</span>
            </button>
          )}

          {/* Expand button (collapsed state) */}
          {collapsed && (
            <button
              onClick={toggleCollapse}
              data-tooltip-id="nav-tip"
              data-tooltip-content="Expand"
              className="w-full flex items-center justify-center py-2.5 rounded-xl transition-all duration-150"
              style={{ color: "#334155" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#64748b"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#334155"; }}
            >
              <ChevronRight size={15} />
            </button>
          )}

          {/* User card */}
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                {/* Avatar */}
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
                  {(user?.name || "U")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-slate-200 truncate leading-none">
                    {user?.name || "User"}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-none truncate">
                    {user?.role || "Guest"}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Logout */}
          <button
            onClick={handleLogout}
            data-tooltip-id={collapsed ? "nav-tip" : undefined}
            data-tooltip-content={collapsed ? "Logout" : undefined}
            className={cn(
              "w-full flex items-center gap-3 rounded-xl transition-all duration-150 text-[13px] font-medium",
              collapsed ? "justify-center py-2.5" : "px-3 py-2.5",
            )}
            style={{ color: "#475569" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#f87171"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#475569"; }}
          >
            <span className="w-7 h-7 flex items-center justify-center shrink-0">
              <LogOut size={15} />
            </span>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

      </motion.aside>
    </>
  );
}
