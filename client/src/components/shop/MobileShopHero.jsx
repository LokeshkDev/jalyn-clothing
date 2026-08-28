import { memo } from 'react'
import { Link } from 'react-router-dom'

export default memo(function MobileShopHero() {
  return (
    <section
      className="relative w-full flex flex-col justify-center py-6 px-4 mb-4 overflow-hidden bg-[#2A1A22]"
      aria-labelledby="mobile-shop-heading"
    >
      {/* High-priority Discoverable LCP Hero Image */}
      <img
        src="/images/home/hero/hero-slide-1-768.webp"
        srcSet="/images/home/hero/hero-slide-1-480.webp 480w, /images/home/hero/hero-slide-1-768.webp 768w"
        sizes="(max-width: 480px) 480px, 768px"
        alt="JALYN Luxury All Products Collection"
        fetchPriority="high"
        loading="eager"
        decoding="async"
        width="768"
        height="384"
        className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none"
        onError={(e) => {
          e.currentTarget.src = '/images/home/hero/hero-slide-1.webp'
        }}
      />

      {/* Dark linear gradient mask overlay for pristine legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#2A1A22]/90 via-[#2A1A22]/65 to-transparent z-[1] pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 container-luxury max-w-7xl px-2 w-full space-y-2">
        {/* Top Row: Breadcrumbs over image */}
        <nav aria-label="Breadcrumb" className="text-xs font-semibold text-rose-blush/80 flex items-center gap-1.5">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <span className="text-white/30">/</span>
          <span className="text-white font-bold">Shop</span>
        </nav>

        {/* Middle Row: Content */}
        <div className="max-w-2xl">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-rose-blush mb-1 block">
            Luxury Collection
          </span>
          <h1
            id="mobile-shop-heading"
            className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight mb-1 drop-shadow-md"
          >
            All Products
          </h1>
          <p className="text-xs sm:text-sm text-rose-light/95 leading-relaxed drop-shadow-sm max-w-sm">
            Discover timeless silhouettes and luxury styles thoughtfully crafted for you.
          </p>
        </div>
      </div>
    </section>
  )
})

