import { motion } from 'framer-motion'

const ease = [0.22, 1, 0.36, 1]

export default function SectionHeader({
  label,
  title,
  id,
  className = '',
  light = false,
}) {
  return (
    <motion.div
      className={`mb-10 text-center ${className}`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease }}
    >
      {label && (
        <p className={`section-label ${light ? 'text-rose-light' : ''}`}>{label}</p>
      )}
      <h2
        id={id}
        className={`section-title ${light ? 'text-white' : ''}`}
      >
        {title}
      </h2>
    </motion.div>
  )
}
