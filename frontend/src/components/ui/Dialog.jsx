// ===================== DIALOG =====================
export function Dialog({ title, description, children }) {
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="text-white/70 text-sm">{description}</p>
      <div className="mt-4">{children}</div>
    </div>
  )
}
