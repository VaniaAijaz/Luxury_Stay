import { motion } from "framer-motion";

export default function PageLoader() {
  return (
    <div className="h-screen flex items-center justify-center">
      <motion.div
        className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
    </div>
  );
}