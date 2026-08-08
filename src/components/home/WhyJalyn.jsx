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
    <section className="bg-white py-14 md:py-16" aria-labelledby="why-heading">
      <div className="container-luxury">
        <motion.h2
          id="why-heading"
          className="mb-12 text-center font-display text-3xl font-medium tracking-tight text-[#5C3344] md:mb-14 md:text-4xl"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          Fashion That Feels Like You
        </motion.h2>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {VALUES.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-4 text-[#5C3344]">
                  <Icon />
                </div>
                <h3 className="font-label text-[15px] font-bold tracking-tight text-[#5C3344]">
                  {item.title}
                </h3>
                <p className="mt-1.5 max-w-[230px] text-[13px] leading-snug text-[#5C3344]/75">
                  {item.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ComfortIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M24 38c-7.5-5.2-12.5-10.4-12.5-16.2C11.5 16.2 16 12 20.8 12c2.6 0 4.8 1.3 6.2 3.3C28.4 13.3 30.6 12 33.2 12c4.8 0 9.3 4.2 9.3 9.8C42.5 27.6 37.5 32.8 30 38c-1.8 1.3-4.2 1.3-6 0Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M24 8v3.5M24 36.5V41M10 24H6.5M41.5 24H38" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M13.2 13.2l-2.2-2.2M36.8 13.2l2.2-2.2M13.2 34.8l-2.2 2.2M36.8 34.8l2.2 2.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function WomanIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="18" cy="15" r="6.2" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8 37c1.1-6.8 4.9-10.5 10-10.5S26.9 30.2 28 37"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="34" cy="22" r="7" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function EcoIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="16" cy="17" r="8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M16 12.2c2 1.8 3 3.8 3 5.8s-1.2 3.6-3 4.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="32" cy="16" r="7.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M29.5 16.5h5M32 14v5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="24" cy="32.5" r="8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M24 27.5c1.6 1.8 2.5 3.6 2.5 5.5S25.4 36.5 24 37.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function CommunityIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="18" cy="15" r="6" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8 36c1-6.5 4.8-10 10-10s9 3.5 10 10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="33.5" cy="20" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M30 26.5c2-1 5-1 7 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
