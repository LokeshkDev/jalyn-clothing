import { memo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BlossomBadge } from '@/components/ui/BlossomDecor'

export default memo(function ShopHero() {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-r from-[#F7EDE8] via-[#F6E8EF] to-[#EFD7E3]"
      aria-labelledby="shop-heading"
    >
      <div className="pointer-events-none absolute -right-8 top-0 hidden h-full w-[42%] md:block">
        <img
          src="https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=1000&q=80"
          alt=""
          className="h-full w-full object-cover object-top opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#F6E8EF] via-[#F6E8EF]/40 to-transparent" />
      </div>

      <img
        src="/blossoms/cherry-blossom.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-6 right-[38%] hidden h-10 w-10 opacity-70 md:block lg:right-[40%]"
      />
      <img
        src="/blossoms/hibiscus.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute right-8 top-8 hidden h-8 w-8 opacity-60 md:block"
      />

      <div className="container-luxury relative flex min-h-[300px] items-center py-12 md:min-h-[340px] lg:min-h-[360px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-lg"
        >
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-sm text-ink-muted">
            <Link to="/" className="transition hover:text-primary">
              Home
            </Link>
            <span aria-hidden className="text-primary/40">
              ›
            </span>
            <span className="font-medium text-primary">Shop</span>
          </nav>
          <div className="mb-2 flex items-center gap-2">
            <BlossomBadge className="!h-6 !w-6" />
            <p className="section-label">Collection</p>
          </div>
          <h1
            id="shop-heading"
            className="font-display text-5xl font-medium tracking-tight text-ink md:text-6xl"
          >
            Shop
          </h1>
          <p className="mt-3 max-w-md text-base text-ink-muted md:text-lg">
            Discover styles that are made for you.
          </p>
        </motion.div>
      </div>
    </section>
  )
})
