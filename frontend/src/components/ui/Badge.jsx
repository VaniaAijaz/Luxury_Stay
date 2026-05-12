// ===================== BADGE =====================
export function Badge({ children, className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center px-3 py-1
        text-xs font-semibold rounded-full
        bg-gradient-to-r from-emerald-400 to-cyan-400
        text-black shadow
        ${className}
      `}
    >
      {children}
    </span>
  )
}