import { memo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export default memo(function ShopHero() {
  return (
    <section className="bg-gradient-to-b from-rose-light/30 via-rose-light/10 to-white py-8 md:py-10">
      <div className="container-luxury max-w-7xl">
        {/* Minimal Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-muted">
          <Link to="/" className="transition hover:text-primary">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-primary/40" />
          <span className="font-semibold text-primary">Shop</span>
        </nav>

        {/* Clean Minimal Title */}
        <div className="mt-3">
          <h1 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl md:text-5xl">
            Shop All Collection
          </h1>
        </div>
      </div>
    </section>
  )
})
