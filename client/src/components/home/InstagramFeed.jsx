import { Instagram } from 'lucide-react'
import { motion } from 'framer-motion'
import { INSTAGRAM_POSTS } from '@/constants/data'

export default function InstagramFeed({ customData }) {
  const IG_URL = customData?.url || 'https://www.instagram.com/jalyn.apparels/'
  const posts = customData?.posts || INSTAGRAM_POSTS

  return (
    <motion.section
      className="relative overflow-hidden bg-surface py-10 md:py-14"
      aria-labelledby="ig-heading"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="container-luxury">
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
        >
          <h2
            id="ig-heading"
            className="font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl"
          >
            Follow Us{' '}
            <a
              href={IG_URL}
              target="_blank"
              rel="noreferrer"
              className="text-primary transition hover:underline"
            >
              {customData?.handle || '@jalyn.apparels'}
            </a>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6 md:gap-3">
          {posts.map((item, i) => {
            const imgUrl = typeof item === 'string' ? item : item?.image || `/images/home/instagram/instagram-${(i % 6) + 1}.webp`
            const itemLink = item?.link || IG_URL
            return (
              <motion.a
                key={item?.id || i}
                href={itemLink}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, scale: 0.9, y: 16 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                className="group relative aspect-square overflow-hidden rounded-lg ring-1 ring-primary/5"
                aria-label={`JALYN Instagram post ${i + 1}`}
              >
                <img
                  src={imgUrl}
                  alt={`JALYN Instagram post ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  width="240"
                  height="240"
                  className="h-full w-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = `/images/home/instagram/instagram-${(i % 6) + 1}.webp`
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-primary/0 opacity-0 transition-all duration-400 group-hover:bg-primary/50 group-hover:opacity-100">
                  <Instagram className="h-7 w-7 text-white" />
                </div>
              </motion.a>
            )
          })}
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-ink-muted">
          Tag us <strong>{customData?.handle || '@jalyn.apparels'}</strong> in your JALYN moments
        </p>
      </div>
    </motion.section>
  )
}
