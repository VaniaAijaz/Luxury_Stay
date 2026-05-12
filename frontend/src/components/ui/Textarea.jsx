// ===================== TEXTAREA =====================
export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`
        w-full px-4 py-3 rounded-xl
        bg-white/10 backdrop-blur-md
        border border-white/20
        text-white placeholder-white/50
        focus:outline-none focus:ring-2 focus:ring-purple-500
        resize-none
        ${className}
      `}
      {...props}
    />
  )
}