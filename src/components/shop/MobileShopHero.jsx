import { memo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default memo(function MobileShopHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mx-4 my-4 relative overflow-hidden rounded-[18px] bg-gradient-to-r from-[#F7EDE8] via-[#F6E8EF] to-[#EFD7E3] p-5 sm:p-6"
      aria-labelledby="mobile-shop-heading"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left Text Box */}
        <div className="z-10 max-w-[62%]">
          <nav aria-label="Breadcrumb" className="mb-1.5 flex items-center gap-1.5 text-xs text-ink-muted">
            <Link to="/" className="transition hover:text-primary">
              Home
            </Link>
            <span aria-hidden className="text-primary/40 text-[10px]">
              &gt;
            </span>
            <span className="font-semibold text-primary">Shop</span>
          </nav>

          <h1
            id="mobile-shop-heading"
            className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl"
          >
            Shop
          </h1>

          <p className="mt-1 text-xs text-ink-muted leading-relaxed sm:text-sm">
            Discover styles that are made for you.
          </p>
        </div>

        {/* Right Fashion Image */}
        <div className="relative aspect-[4/5] w-[34%] shrink-0 overflow-hidden rounded-xl">
          <img
            src="https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=600&q=80"
            alt="JALYN Fashion Collection"
            loading="eager"
            className="h-full w-full object-cover object-top"
          />
        </div>
      </div>
    </motion.section>
  )
})
