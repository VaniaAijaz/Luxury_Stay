import { X } from "lucide-react";
import { motion } from "framer-motion";

export default function MobileMenu({ onClose }) {
  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      className="fixed inset-0 bg-black text-white z-50 p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold">Menu</h2>
        <button onClick={onClose}>
          <X />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <p>Dashboard</p>
        <p>Hotels</p>
        <p>Users</p>
        <p>Settings</p>
      </div>
    </motion.div>
  );
}