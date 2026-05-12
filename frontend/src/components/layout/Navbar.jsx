import { Menu } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar({ onMenuClick }) {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full h-16 flex items-center justify-between px-4 border-b bg-black/80 backdrop-blur-md text-white"
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-white/10"
        >
          <Menu size={20} />
        </button>

        <h1 className="font-semibold text-lg tracking-tight">
          Luxury Dashboard
        </h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/10" />
      </div>
    </motion.nav>
  );
}