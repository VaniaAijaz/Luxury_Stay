import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AnimatedButton({
  children,
  className,
  ...props
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={cn(
        "px-4 py-2 rounded-xl font-medium bg-black text-white shadow-md hover:shadow-xl transition-all",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}