import { motion } from 'framer-motion'

const VALUES = [
  {
    title: 'Designed for Comfort',
    description: 'Soft, breathable & skin friendly fabrics',
    icon: ComfortIcon,
  },
  {
    title: 'Made for Every Woman',
    description: 'Styles that celebrate every body type',
    icon: WomanIcon,
  },
  {
    title: 'Sustainable Choices',
    description: 'Conscious fashion for a better tomorrow',
    icon: EcoIcon,
  },
  {
    title: 'Loved by Thousands',
    description: 'Join our growing community of women',
    icon: CommunityIcon,
  },
]

export default function WhyJalyn() {
  return (
    <motion.section
      className="bg-white pt-8 md:pt-16 mb-[15px] lg:mb-5"
      aria-labelledby="why-heading"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="container-luxury max-w-7xl px-4 sm:px-6">
        <motion.h2
          id="why-heading"
          className="mb-6 text-center font-display text-xl font-medium tracking-tight text-[#4A2F3C] sm:text-2xl md:mb-12 md:text-4xl"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          Fashion That Feels Like You
        </motion.h2>

        <div className="grid grid-cols-4 gap-1.5 sm:gap-4 lg:gap-8">
          {VALUES.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title || i}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="flex flex-col items-center text-center px-0.5"
              >
                <div className="mb-2 text-[#4A2F3C] flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12">
                  <Icon />
                </div>
                <h3 className="font-label text-[10px] font-bold tracking-tight text-[#4A2F3C] sm:text-[14px] leading-tight">
                  {item.title}
                </h3>
                <p className="mt-1 text-[8.5px] sm:text-[12px] leading-tight text-[#7A5A6A]">
                  {item.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.section>
  )
}

function ComfortIcon() {
  return (
    <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M24 38c-7.5-5.2-12.5-10.4-12.5-16.2C11.5 16.2 16 12 20.8 12c2.6 0 4.8 1.3 6.2 3.3C28.4 13.3 30.6 12 33.2 12c4.8 0 9.3 4.2 9.3 9.8C42.5 27.6 37.5 32.8 30 38c-1.8 1.3-4.2 1.3-6 0Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M24 8v3.5M24 36.5V41M10 24H6.5M41.5 24H38" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function WomanIcon() {
  return (
    <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="18" cy="15" r="6.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M8 37c1.1-6.8 4.9-10.5 10-10.5S26.9 30.2 28 37"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="34" cy="22" r="7" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function EcoIcon() {
  return (
    <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="16" cy="17" r="8" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="32" cy="16" r="7.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="24" cy="32.5" r="8" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function CommunityIcon() {
  return (
    <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="18" cy="15" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M8 36c1-6.5 4.8-10 10-10s9 3.5 10 10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="33.5" cy="20" r="6.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}
