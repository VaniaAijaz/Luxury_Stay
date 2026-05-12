import { cn } from "@/lib/utils";

export default function GlassCard({ children, className }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl p-4",
        className
      )}
    >
      {children}
    </div>
  );
}