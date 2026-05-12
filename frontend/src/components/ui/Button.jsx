import { motion } from 'framer-motion'

export function Button({ children, className = '', ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`
        px-4 py-2 rounded-xl font-medium
        bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
        text-white shadow-lg hover:shadow-xl
        transition-all duration-200
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  )
}