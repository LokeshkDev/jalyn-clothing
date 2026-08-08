import { motion } from 'framer-motion'
import { Flower2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const PETALS = [
  { left: '8%', delay: 0, duration: 14, size: 18 },
  { left: '22%', delay: 2.2, duration: 16, size: 14 },
  { left: '48%', delay: 1.1, duration: 13, size: 20 },
  { left: '68%', delay: 3.4, duration: 15, size: 12 },
  { left: '86%', delay: 0.8, duration: 17, size: 16 },
]

function Petal({ size = 16, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M12 21c0-4.5 3.2-8 5.5-9.5C19.8 9.8 21 7.8 21 5.5 21 3 19 1.5 16.8 2.2c-1.4.4-2.5 1.6-3.2 3-1.1-2.6-3.2-4-5.4-4C5.5 1.2 3 3.4 3 6.2c0 2.6 1.5 4.8 4 6.3C9.5 14.2 12 17.2 12 21Z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  )
}

export function FloatingPetals({ className }) {
  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      aria-hidden
    >
      {PETALS.map((p, i) => (
        <motion.span
          key={i}
          className="absolute top-[-10%] text-primary/40"
          style={{ left: p.left }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, 18, -12, 8, 0],
            rotate: [0, 40, 80, 120, 180],
            opacity: [0, 0.7, 0.7, 0.4, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <Petal size={p.size} />
        </motion.span>
      ))}
    </div>
  )
}

export function BlossomDivider({ className }) {
  return (
    <div
      className={cn('flex items-center justify-center gap-3 text-primary', className)}
      aria-hidden
    >
      <span className="h-px w-10 bg-gradient-to-r from-transparent to-primary/40 sm:w-16" />
      <motion.span
        animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Flower2 className="h-5 w-5" strokeWidth={1.4} />
      </motion.span>
      <span className="h-px w-10 bg-gradient-to-l from-transparent to-primary/40 sm:w-16" />
    </div>
  )
}

export function BlossomBadge({ className }) {
  return (
    <motion.img
      src="/blossoms/cherry-blossom.png"
      alt=""
      aria-hidden
      className={cn('h-7 w-7 select-none drop-shadow-sm sm:h-8 sm:w-8', className)}
      animate={{ y: [0, -6, 0], rotate: [0, 6, -4, 0] }}
      transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.src =
          'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f338.png'
      }}
    />
  )
}

export function SectionBloom({ className }) {
  return (
    <div className={cn('relative mb-3 flex justify-center', className)}>
      <BlossomBadge />
      <img
        src="/blossoms/hibiscus.png"
        alt=""
        aria-hidden
        className="absolute -left-8 top-1 h-5 w-5 opacity-70 sm:-left-10 sm:h-6 sm:w-6"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src =
            'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f33a.png'
        }}
      />
      <img
        src="/blossoms/tulip.png"
        alt=""
        aria-hidden
        className="absolute -right-8 top-1 h-5 w-5 opacity-70 sm:-right-10 sm:h-6 sm:w-6"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src =
            'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f337.png'
        }}
      />
    </div>
  )
}
