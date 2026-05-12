import { motion } from "framer-motion";

export default function EmptyState({
  title = "No Data Found",
  description = "Nothing to show here yet.",
  icon
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center p-10 text-gray-500"
    >
      {icon && <div className="mb-3">{icon}</div>}
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="text-sm text-gray-400">{description}</p>
    </motion.div>
  );
}