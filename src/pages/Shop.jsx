import { useEffect, useMemo, useState } from 'react'
import ShopHero from '@/components/shop/ShopHero'
import FilterSidebar from '@/components/shop/FilterSidebar'
import ProductToolbar from '@/components/shop/ProductToolbar'
import ProductGrid from '@/components/shop/ProductGrid'
import Pagination from '@/components/shop/Pagination'
import EmptyState from '@/components/shop/EmptyState'
import QuickViewModal from '@/components/shop/QuickViewModal'
import ShopProductCard from '@/components/shop/ShopProductCard'
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

import {
  SHOP_PRODUCTS,
  PRICE_BOUNDS,
} from '@/constants/shopProducts'

const PAGE_SIZE = 12

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
  const [filters, setFilters] = useState(initialFilters)
  const [sort, setSort] = useState('newest')
  const [view, setView] = useState(4)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [sortSheetOpen, setSortSheetOpen] = useState(false)
  const [quickView, setQuickView] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    setPage(1)
  }, [filters, sort])

  const filtered = useMemo(() => {
    let list = [...SHOP_PRODUCTS]

    if (filters.categories.length) {
      list = list.filter((p) => filters.categories.includes(p.category))
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
  }, [filters, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const from = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, filtered.length)

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
          onOpenFilter={() => setFilterSheetOpen(true)}
          onOpenSort={() => setSortSheetOpen(true)}
        />

        {/* 3. Horizontal Category Chips */}
        <MobileCategoryChips
          activeCategory={activeCategory}
          onSelectCategory={handleCategorySelect}
        />

        {/* 4. Two-column Product Grid */}
        <div className="px-4">
          {!loading && filtered.length === 0 ? (
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
          onOpenFilter={() => setFilterSheetOpen(true)}
          onOpenSort={() => setSortSheetOpen(true)}
        />

        {/* Filter Bottom Sheet */}
        <MobileFilterSheet
          isOpen={filterSheetOpen}
          onClose={() => setFilterSheetOpen(false)}
          filters={filters}
          onChange={setFilters}
          onClear={clearFilters}
          totalResults={filtered.length}
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
        <ShopHero />

        <div className="container-luxury py-8 md:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
            {/* Desktop sidebar */}
            <div className="hidden w-[300px] shrink-0 lg:block">
              <div className="sticky top-28">
                <FilterSidebar
                  filters={filters}
                  onChange={setFilters}
                  onClear={clearFilters}
                />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <ProductToolbar
                from={from}
                to={to}
                total={filtered.length}
                sort={sort}
                onSortChange={setSort}
                view={view}
                onViewChange={setView}
                sticky
              />

              <div className="mt-6">
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

              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={(p) => {
                  setPage(p)
                  window.scrollTo({ top: 360, behavior: 'smooth' })
                }}
              />
            </div>
          </div>

          {/* Desktop Recently Viewed */}
          <section className="mt-16" aria-labelledby="recently-viewed-desktop">
            <div className="mb-5 flex items-center justify-between">
              <h2 id="recently-viewed-desktop" className="font-display text-2xl font-medium text-ink md:text-3xl">
                Recently Viewed
              </h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {recentlyViewed.map((p) => (
                <div key={p.id} className="w-[200px] shrink-0 sm:w-[220px]">
                  <ShopProductCard product={p} onQuickView={setQuickView} />
                </div>
              ))}
            </div>
          </section>

          {/* Desktop You May Also Like */}
          <section className="mt-14" aria-labelledby="also-like-desktop">
            <h2 id="also-like-desktop" className="mb-5 font-display text-2xl font-medium text-ink md:text-3xl">
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

      <QuickViewModal
        product={quickView}
        open={!!quickView}
        onClose={() => setQuickView(null)}
      />
    </div>
  )
}
