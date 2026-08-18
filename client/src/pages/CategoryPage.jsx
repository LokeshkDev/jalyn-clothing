import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight, SlidersHorizontal } from 'lucide-react'
import ProductToolbar from '@/components/shop/ProductToolbar'
import ProductGrid from '@/components/shop/ProductGrid'
import SkeletonCard from '@/components/shop/SkeletonCard'
import Pagination from '@/components/shop/Pagination'
import EmptyState from '@/components/shop/EmptyState'
import QuickViewModal from '@/components/shop/QuickViewModal'
import ShopProductCard from '@/components/shop/ShopProductCard'
import FilterDrawer from '@/components/shop/FilterDrawer'
import FilterSidebar from '@/components/shop/FilterSidebar'
import Services from '@/components/home/Services'

// Mobile specific components
import MobileShopToolbar from '@/components/shop/MobileShopToolbar'
import MobileCategoryChips from '@/components/shop/MobileCategoryChips'
import MobileShopProductCard from '@/components/shop/MobileShopProductCard'
import MobileFilterSheet from '@/components/shop/MobileFilterSheet'
import MobileSortSheet from '@/components/shop/MobileSortSheet'
import MobileFloatingBar from '@/components/shop/MobileFloatingBar'
import MobileRecentlyViewed from '@/components/shop/MobileRecentlyViewed'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'

import {
  SHOP_PRODUCTS,
  PRICE_BOUNDS,
} from '@/constants/shopProducts'
import { useProductsApi } from '@/hooks/useProductsApi'

const initialFilters = () => ({
  categories: [],
  price: [PRICE_BOUNDS.min, PRICE_BOUNDS.max],
  sizes: [],
  colors: [],
  availability: [],
  discount: [],
  sleeve: [],
  fabric: [],
  occasion: [],
  fit: [],
  pattern: [],
  season: [],
  ratings: [],
  brand: [],
})

export default function CategoryPage() {
  const { slug } = useParams()
  const { products: apiProducts } = useProductsApi()
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState(initialFilters)
  const [sort, setSort] = useState('newest')
  const [view, setView] = useState(4)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [sortSheetOpen, setSortSheetOpen] = useState(false)
  const [quickView, setQuickView] = useState(null)

  // Fetch category metadata from backend
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data?.categories) {
          setCategories(data.categories)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setPage(1)
  }, [filters, sort, slug])

  // Find matching category details
  const currentCategory = useMemo(() => {
    if (!slug) return null
    const normalizedSlug = slug.toLowerCase().trim()
    return categories.find(
      (c) =>
        (c.slug && c.slug.toLowerCase() === normalizedSlug) ||
        (c.name && c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === normalizedSlug)
    )
  }, [categories, slug])

  const categoryTitle = useMemo(() => {
    if (currentCategory?.name) return currentCategory.name
    if (!slug) return 'Collection'
    return slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }, [currentCategory, slug])

  const categoryDescription = useMemo(() => {
    if (currentCategory?.description) return currentCategory.description
    return `Explore our premium curated ${categoryTitle} collection designed for timeless elegance and effortless comfort.`
  }, [currentCategory, categoryTitle])

  const categoryBanner = useMemo(() => {
    if (currentCategory?.image_url) return currentCategory.image_url
    return '/images/home/hero/hero-slide-1.webp'
  }, [currentCategory])

  // Update document title for SEO
  useEffect(() => {
    document.title = `JALYN | ${categoryTitle} Collection`
  }, [categoryTitle])

  // Active filter count for badge indicator
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.sizes.length) count += filters.sizes.length
    if (filters.colors.length) count += filters.colors.length
    if (filters.fabric.length) count += filters.fabric.length
    if (filters.sleeve.length) count += filters.sleeve.length
    if (filters.occasion.length) count += filters.occasion.length
    if (filters.discount.length) count += filters.discount.length
    if (filters.price[0] > PRICE_BOUNDS.min || filters.price[1] < PRICE_BOUNDS.max) count += 1
    return count
  }, [filters])

  const filtered = useMemo(() => {
    const rawList = apiProducts && apiProducts.length > 0 ? apiProducts : SHOP_PRODUCTS
    let list = rawList.filter((p) => p.is_online !== 0 && p.is_online !== false)

    // Filter strictly by this category slug / name
    if (slug && slug !== 'all') {
      const targetSlug = slug.toLowerCase().trim()
      list = list.filter((p) => {
        const pCat = (p.category || '').toLowerCase().trim()
        const pSlug = (p.category_slug || '').toLowerCase().trim()
        return (
          pCat === targetSlug ||
          pSlug === targetSlug ||
          pCat.replace(/[^a-z0-9]+/g, '-') === targetSlug ||
          pCat.includes(targetSlug) ||
          targetSlug.includes(pCat)
        )
      })
    }

    list = list.filter((p) => p.price >= filters.price[0] && p.price <= filters.price[1])

    if (filters.sizes.length) {
      list = list.filter((p) => (p.sizes || []).some((s) => filters.sizes.includes(s)))
    }
    if (filters.colors.length) {
      list = list.filter((p) => (p.colors || []).some((c) => filters.colors.includes(c)))
    }
    if (filters.fabric.length) {
      list = list.filter((p) => filters.fabric.includes(p.fabric))
    }
    if (filters.sleeve.length) {
      list = list.filter((p) => filters.sleeve.includes(p.sleeve))
    }
    if (filters.occasion.length) {
      list = list.filter((p) => filters.occasion.includes(p.occasion))
    }
    if (filters.fit.length) {
      list = list.filter((p) => filters.fit.includes(p.fit))
    }
    if (filters.pattern.length) {
      list = list.filter((p) => filters.pattern.includes(p.pattern))
    }
    if (filters.season.length) {
      list = list.filter((p) => filters.season.includes(p.season))
    }
    if (filters.brand.length) {
      list = list.filter((p) => filters.brand.includes(p.brand))
    }
    if (filters.discount.length) {
      list = list.filter((p) =>
        filters.discount.some((d) => {
          const min = parseInt(d, 10)
          return (p.discount || 0) >= min
        })
      )
    }
    if (filters.ratings.length) {
      list = list.filter((p) =>
        filters.ratings.some((r) => {
          const min = parseFloat(r)
          return (p.rating || 0) >= min
        })
      )
    }
    if (filters.availability.includes('In Stock')) {
      list = list.filter((p) => p.stock > 0)
    }

    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        list.sort((a, b) => b.price - a.price)
        break
      case 'popularity':
        list.sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
        break
      case 'alpha':
        list.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
        break
      default:
        list.sort((a, b) => (b.badges?.includes('new') ? 1 : 0) - (a.badges?.includes('new') ? 1 : 0))
    }

    return list
  }, [filters, sort, apiProducts, slug])

  const itemsPerRow = typeof view === 'number' ? view : 4
  const pageSize = itemsPerRow * 3

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize)
  const from = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, filtered.length)

  const clearFilters = () => setFilters(initialFilters())

  const recentlyViewed = SHOP_PRODUCTS.slice(0, 6)
  const alsoLike = SHOP_PRODUCTS.slice(6, 10)

  return (
    <div className="bg-surface pb-12 lg:pb-0 min-h-screen">
      
      {/* MOBILE CATEGORY VIEW (< 1024px / lg) */}
      <div className="block lg:hidden">
        
        {/* Mobile Hero Header */}
        <section className="relative w-full bg-cover bg-center flex flex-col justify-center py-6 px-4 mb-3 overflow-hidden"
          style={{ backgroundImage: `url(${categoryBanner})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#2A1A22]/90 via-[#2A1A22]/70 to-transparent z-[1]" />
          <div className="relative z-10 space-y-1.5">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[11px] font-semibold text-rose-blush/80">
              <Link to="/" className="hover:text-white transition">Home</Link>
              <ChevronRight className="h-3 w-3 text-white/40" />
              <Link to="/shop" className="hover:text-white transition">Shop</Link>
              <ChevronRight className="h-3 w-3 text-white/40" />
              <span className="text-white font-bold truncate">{categoryTitle}</span>
            </nav>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-white leading-tight drop-shadow-md">
              {categoryTitle}
            </h1>
            <p className="text-xs text-rose-light/90 line-clamp-2 drop-shadow-sm max-w-sm">
              {categoryDescription}
            </p>
          </div>
        </section>

        {/* 2. Filter / Sort Toolbar & Product Count */}
        <MobileShopToolbar
          from={from}
          to={to}
          total={filtered.length}
          onOpenFilter={() => setFilterDrawerOpen(true)}
          onOpenSort={() => setSortSheetOpen(true)}
        />

        {/* 3. Horizontal Category Navigation Chips */}
        <MobileCategoryChips
          activeCategory={slug || 'all'}
          onSelectCategory={(catSlug) => {
            if (catSlug === 'all') {
              window.location.href = '/shop'
            } else {
              window.location.href = `/category/${catSlug}`
            }
          }}
        />

        {/* 4. Two-column Product Grid */}
        <div className="px-4">
          {loading ? (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState onReset={clearFilters} />
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {pageItems.map((product) => (
                <MobileShopProductCard key={product.id || product.slug} product={product} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={(p) => {
                  setPage(p)
                  window.scrollTo({ top: 120, behavior: 'smooth' })
                }}
              />
            </div>
          )}
        </div>

        {/* 5. Mobile Recently Viewed Carousel */}
        <MobileRecentlyViewed />

        {/* Floating Filter | Sort Pill & Floating Cart Button */}
        <MobileFloatingBar
          onOpenFilter={() => setFilterDrawerOpen(true)}
          onOpenSort={() => setSortSheetOpen(true)}
        />

        {/* Sort Bottom Sheet */}
        <MobileSortSheet
          isOpen={sortSheetOpen}
          onClose={() => setSortSheetOpen(false)}
          sort={sort}
          onSortChange={setSort}
        />

        {/* Filter Drawer */}
        <MobileFilterSheet
          isOpen={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          filters={filters}
          onFilterChange={setFilters}
          onReset={clearFilters}
          activeCategory={slug}
          totalProducts={filtered.length}
        />
      </div>

      {/* DESKTOP CATEGORY VIEW (>= 1024px / lg) */}
      <div className="hidden lg:block">
        
        {/* Editorial Compact Header with Background Banner */}
        <section
          className="relative w-full bg-cover bg-center flex flex-col justify-center py-8 md:py-10 overflow-hidden"
          style={{ backgroundImage: `url(${categoryBanner})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#2A1A22]/90 via-[#2A1A22]/65 to-transparent z-[1]" />
          <div className="relative z-10 container-luxury max-w-7xl px-0 sm:px-6 w-full space-y-2.5">
            {/* Minimal Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-rose-blush/80 font-semibold">
              <Link to="/" className="transition hover:text-white">Home</Link>
              <ChevronRight className="h-3.5 w-3.5 text-white/40" />
              <Link to="/shop" className="transition hover:text-white">Shop</Link>
              <ChevronRight className="h-3.5 w-3.5 text-white/40" />
              <span className="font-bold text-white">{categoryTitle}</span>
            </nav>

            <div className="max-w-2xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-rose-blush mb-1 block">
                Category Collection
              </span>
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-2 drop-shadow-md">
                {categoryTitle}
              </h1>
              <p className="text-xs sm:text-sm text-rose-light/95 leading-relaxed drop-shadow-sm max-w-xl">
                {categoryDescription}
              </p>
            </div>
          </div>
        </section>

        <div className="container-luxury py-6 max-w-7xl px-0 sm:px-6">
          {/* Main 2-Column Grid: Col-3 Fixed Sticky Filter Sidebar + Col-9 Product Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Sticky Fixed Filter Sidebar (Col-3) */}
            <aside className="lg:col-span-3 sticky top-24">
              <FilterSidebar
                filters={filters}
                onChange={setFilters}
                onClear={clearFilters}
              />
            </aside>

            {/* Right Product Grid & Controls (Col-9) */}
            <main className="lg:col-span-9 space-y-5">
              {/* Top Toolbar */}
              <ProductToolbar
                from={from}
                to={to}
                total={filtered.length}
                sort={sort}
                onSortChange={setSort}
                view={view}
                onViewChange={setView}
                onOpenFilter={() => setFilterDrawerOpen(true)}
                activeFilterCount={activeFilterCount}
              />

              {/* Product Grid */}
              <div>
                {!loading && filtered.length === 0 ? (
                  <EmptyState onReset={clearFilters} />
                ) : (
                  <ProductGrid
                    products={pageItems}
                    view={view}
                    loading={loading}
                    onQuickView={setQuickView}
                  />
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onChange={(p) => {
                    setPage(p)
                    window.scrollTo({ top: 200, behavior: 'smooth' })
                  }}
                />
              )}
            </main>
          </div>

          {/* Desktop Recently Viewed Swiper */}
          <section className="mt-16" aria-labelledby="recently-viewed-desktop">
            <div className="mb-5 flex items-center justify-between">
              <h2 id="recently-viewed-desktop" className="font-display text-2xl font-medium text-ink md:text-3xl">
                Recently Viewed
              </h2>
            </div>
            <div className="recently-viewed-swiper relative">
              <Swiper
                grabCursor={true}
                simulateTouch={true}
                spaceBetween={18}
                breakpoints={{
                  640: { slidesPerView: 3, spaceBetween: 16 },
                  1024: { slidesPerView: 5, spaceBetween: 20 },
                }}
                className="pb-4 text-primary"
              >
                {recentlyViewed.map((p) => (
                  <SwiperSlide key={p.id || p.slug} className="h-auto">
                    <ShopProductCard product={p} onQuickView={setQuickView} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </section>

          {/* Brand theme color divider */}
          <div className="h-[1.5px] bg-[#AD4A85]/20 my-10" />

          {/* Desktop You May Also Like */}
          <section className="mt-14" aria-labelledby="also-like-desktop">
            <h2 id="also-like-desktop" className="mb-5 font-display text-2xl font-medium text-ink md:text-3xl">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {alsoLike.map((p) => (
                <ShopProductCard key={p.id || p.slug} product={p} onQuickView={setQuickView} />
              ))}
            </div>
          </section>
        </div>

        <Services />
      </div>

      {/* Slide-over Filter Drawer (Desktop & Mobile) */}
      <FilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filters}
        onChange={setFilters}
        onClear={clearFilters}
        activeFilterCount={activeFilterCount}
      />

      <QuickViewModal
        product={quickView}
        open={!!quickView}
        onClose={() => setQuickView(null)}
      />
    </div>
  )
}
