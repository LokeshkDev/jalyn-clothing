import { useEffect, useMemo, useState } from 'react'
import ShopHero from '@/components/shop/ShopHero'
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
import MobileShopHero from '@/components/shop/MobileShopHero'
import MobileShopToolbar from '@/components/shop/MobileShopToolbar'
import MobileCategoryChips from '@/components/shop/MobileCategoryChips'
import MobileShopProductCard from '@/components/shop/MobileShopProductCard'
import MobileFilterSheet from '@/components/shop/MobileFilterSheet'
import MobileSortSheet from '@/components/shop/MobileSortSheet'
import MobileFloatingBar from '@/components/shop/MobileFloatingBar'
import MobileRecentlyViewed from '@/components/shop/MobileRecentlyViewed'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
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

export default function Shop() {
  const { products: apiProducts } = useProductsApi()
  const [filters, setFilters] = useState(initialFilters)
  const [sort, setSort] = useState('newest')
  const [view, setView] = useState(4)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [sortSheetOpen, setSortSheetOpen] = useState(false)
  const [quickView, setQuickView] = useState(null)

  useEffect(() => {
    setPage(1)
  }, [filters, sort])

  // Active filter count for badge indicator
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.categories.length) count += filters.categories.length
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

    if (filters.categories.length) {
      list = list.filter((p) => {
        const pCat = (p.category || '').toLowerCase().trim()
        const pSlug = (p.category_slug || '').toLowerCase().trim()
        return filters.categories.some((cat) => {
          const target = cat.toLowerCase().trim()
          return pCat === target || pSlug === target || pCat.includes(target) || target.includes(pCat)
        })
      })
    }
    list = list.filter(
      (p) => p.price >= filters.price[0] && p.price <= filters.price[1],
    )
    if (filters.sizes.length) {
      list = list.filter((p) => p.sizes.some((s) => filters.sizes.includes(s)))
    }
    if (filters.colors.length) {
      list = list.filter((p) =>
        p.colors.some((c) => filters.colors.includes(c)),
      )
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
          return p.discount >= min
        }),
      )
    }
    if (filters.ratings.length) {
      list = list.filter((p) =>
        filters.ratings.some((r) => {
          const min = parseFloat(r)
          return p.rating >= min
        }),
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
        list.sort((a, b) => b.reviews - a.reviews)
        break
      case 'alpha':
        list.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        list.sort((a, b) => (b.badges?.includes('new') ? 1 : 0) - (a.badges?.includes('new') ? 1 : 0))
    }

    return list
  }, [filters, sort, apiProducts])

  // Show exactly 3 rows of data per page dynamically based on grid view (e.g. 4 cols x 3 rows = 12 items per page)
  const itemsPerRow = typeof view === 'number' ? view : 4
  const pageSize = itemsPerRow * 3

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize)
  const from = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, filtered.length)

  const clearFilters = () => setFilters(initialFilters())

  const handleCategorySelect = (categoryId) => {
    if (categoryId === 'all') {
      setFilters((prev) => ({ ...prev, categories: [] }))
    } else {
      setFilters((prev) => ({ ...prev, categories: [categoryId] }))
    }
  }

  const recentlyViewed = SHOP_PRODUCTS.slice(0, 6)
  const alsoLike = SHOP_PRODUCTS.slice(6, 10)
  const activeCategory = filters.categories.length === 1 ? filters.categories[0] : 'all'

  return (
    <div className="bg-surface pb-12 lg:pb-0">
      {/* MOBILE SHOP VIEW (< 1024px / lg) */}
      <div className="block lg:hidden">
        {/* 1. Mobile Shop Hero */}
        <MobileShopHero />

        {/* 2. Filter / Sort Toolbar & Product Count */}
        <MobileShopToolbar
          from={from}
          to={to}
          total={filtered.length}
          onOpenFilter={() => setFilterDrawerOpen(true)}
          onOpenSort={() => setSortSheetOpen(true)}
        />

        {/* 3. Horizontal Category Chips */}
        <MobileCategoryChips
          activeCategory={activeCategory}
          onSelectCategory={handleCategorySelect}
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
                <MobileShopProductCard key={product.id} product={product} />
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
      </div>

      {/* DESKTOP SHOP VIEW (>= 1024px / lg) */}
      <div className="hidden lg:block">
        {/* Clean minimal non-sticky breadcrumb header */}
        <ShopHero />

        <div className="container-luxury py-6 max-w-7xl px-0 sm:px-6">
          {/* Main 2-Column Grid: Col-3 Fixed Sticky Filter Sidebar + Col-9 Product Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Sticky Fixed Filter Sidebar (Col-3) */}
            <aside className="lg:col-span-3 sticky top-24 z-20">
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
                <div className="mt-6">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onChange={(p) => {
                      setPage(p)
                      window.scrollTo({ top: 180, behavior: 'smooth' })
                    }}
                  />
                </div>
              )}
            </main>
          </div>

          {/* Desktop Recently Viewed Swiper */}
          <section className="mt-12" aria-labelledby="recently-viewed-desktop">
            <div className="mb-4 flex items-center justify-between">
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
                  1024: { slidesPerView: 4, spaceBetween: 20 },
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
          <div className="h-[1px] bg-[#AD4A85]/20 my-8" />

          {/* Desktop You May Also Like */}
          <section className="mt-8 mb-10" aria-labelledby="also-like-desktop">
            <h2 id="also-like-desktop" className="mb-4 font-display text-2xl font-medium text-ink md:text-3xl">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {alsoLike.map((p) => (
                <ShopProductCard key={p.id} product={p} onQuickView={setQuickView} />
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
