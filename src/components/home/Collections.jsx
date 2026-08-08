import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { COLLECTIONS } from '@/constants/data'
import SectionHeader from '@/components/ui/SectionHeader'

export default function Collections() {
  return (
    <section className="relative overflow-hidden py-16 md:py-20" aria-labelledby="collections-heading">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(239,215,227,0.55),_transparent_55%)]" />
      <div className="container-luxury relative">
        <SectionHeader
          label="Shop by Collection"
          title="Curated for Every You"
          id="collections-heading"
        />

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
          {COLLECTIONS.map((collection, i) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 32, rotateX: 8 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8 }}
              style={{ transformPerspective: 800 }}
            >
              <Link
                to={collection.href}
                className="group relative block overflow-hidden rounded-xl shadow-soft ring-1 ring-primary/5"
              >
                <div className="aspect-[3/4] overflow-hidden bg-rose-light/40">
                  <img
                    src={collection.image}
                    alt={collection.title}
                    loading="lazy"
                    className="img-zoom h-full w-full object-cover duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#2a0f1c]/70 via-primary/20 to-transparent transition-opacity group-hover:from-[#AD4A85]/75" />
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                  <h3 className="font-display text-base font-medium text-white sm:text-lg">
                    {collection.title}
                  </h3>
                  <p className="mt-0.5 translate-y-1 text-[11px] text-rose-light opacity-90 transition group-hover:translate-y-0 sm:text-xs">
                    {collection.subtitle}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
