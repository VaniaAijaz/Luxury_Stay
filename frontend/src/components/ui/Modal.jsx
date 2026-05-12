// ===================== MODAL =====================
import { useEffect } from 'react'

export function Modal({ open, onClose, children }) {
  useEffect(() => {
    const closeOnEsc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', closeOnEsc)
    return () => window.removeEventListener('keydown', closeOnEsc)
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl w-[90%] max-w-lg">
        {children}
      </div>
    </div>
  )
}