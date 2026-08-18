import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, SlidersHorizontal, RefreshCw, X, Check } from 'lucide-react'
import api from '@/services/api'
import { normalizeProduct } from '@/hooks/useProductsApi'
import ProductCard from '@/components/shop/ProductCard'
import SkeletonCard from '@/components/shop/SkeletonCard'
import QuickViewModal from '@/components/shop/QuickViewModal'
import FilterSidebar from '@/components/shop/FilterSidebar'
import ProductToolbar from '@/components/shop/ProductToolbar'
import { PRICE_BOUNDS } from '@/constants/shopProducts'
import Services from '@/components/home/Services'
import { cn } from '@/lib/utils'

const CATEGORY_OPTIONS = [
  { label: 'Dresses', slug: 'dresses' },
  { label: 'Tops', slug: 'tops' },
  { label: 'Kurtas & Kurtis', slug: 'kurtis' },
  { label: 'Co-ords', slug: 'coords' },
  { label: 'Bottoms', slug: 'bottoms' },
  { label: 'Lounge & Nightwear', slug: 'lounge' },
  { label: 'Ethnic Wear', slug: 'ethnic' },
]

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const COLOR_OPTIONS = [
  { name: 'rose', hex: '#E0A6C1' },
  { name: 'cream', hex: '#F9F6F0' },
  { name: 'black', hex: '#1C191A' },
  { name: 'mauve', hex: '#A38B96' },
  { name: 'beige', hex: '#D2B9A6' },
  { name: 'sage', hex: '#9FAF9C' },
  { name: 'wine', hex: '#58111A' },
]

export default function Sale() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  // CMS page content state
  const [pageData, setPageData] = useState({
    title: 'Exclusive Sale',
    description: 'Upgrade your wardrobe with our curated seasonal markdowns. Enjoy premium quality JALYN styles at special limited-time pricing.',
    bg_image: '/images/banners/sale-hero.webp',
    slug: 'sale',
    meta_title: 'Seasonal Sale | JALYN Store',
    meta_description: 'Shop the JALYN clearance and seasonal sale. Enjoy massive discounts on premium dresses, tops, accessories, and coordinates.'
  })

  // Filters State
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedSizes, setSelectedSizes] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [sortOption, setSortOption] = useState('newest')

  const [sidebarFilters, setSidebarFilters] = useState({
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

  // UI Dropdowns state
  const [activeDropdown, setActiveDropdown] = useState(null)
  const dropdownRef = useRef(null)

  // Mobile filters sheet
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  // Fetch Page CMS options and products
  const loadData = async () => {
    setLoading(true)
    try {
      const [prodRes, cmsRes] = await Promise.all([
        api.get('/products', { params: { sales: '1', sort: sortOption } }),
        api.get('/cms/homepage')
      ])

      if (prodRes.data?.success && Array.isArray(prodRes.data.products)) {
        setProducts(prodRes.data.products.map(normalizeProduct))
      }

      if (cmsRes.data?.success && cmsRes.data.data?.page_sale) {
        setPageData(cmsRes.data.data.page_sale)
      }
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [sortOption])

  // SEO updates
  useEffect(() => {
    if (pageData) {
      document.title = pageData.meta_title || `${pageData.title} | JALYN`
      let metaDesc = document.querySelector('meta[name="description"]')
      if (!metaDesc) {
        metaDesc = document.createElement('meta')
        metaDesc.setAttribute('name', 'description')
        document.head.appendChild(metaDesc)
      }
      metaDesc.setAttribute('content', pageData.meta_description || pageData.description)
    }
  }, [pageData])

  // Handle clicking outside to close filter dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Client-side filtering logic for Size, Color, Price Range, and Category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (sidebarFilters.categories.length > 0) {
        if (!sidebarFilters.categories.includes(p.category_slug) && !sidebarFilters.categories.includes(p.category)) {
          return false
        }
      }
      if (selectedCategories.length > 0) {
        if (!selectedCategories.includes(p.category_slug) && !selectedCategories.includes(p.category)) {
          return false
        }
      }
      if (sidebarFilters.sizes.length > 0 || selectedSizes.length > 0) {
        const sizesToCheck = [...sidebarFilters.sizes, ...selectedSizes]
        const hasSize = (p.sizes || []).some((s) => sizesToCheck.includes(s))
        if (!hasSize) return false
      }
      if (sidebarFilters.colors.length > 0 || selectedColors.length > 0) {
        const colorsToCheck = [...sidebarFilters.colors, ...selectedColors]
        const hasColor = (p.colors || []).some((c) => colorsToCheck.includes(c?.toLowerCase()))
        if (!hasColor) return false
      }

      const priceVal = Number(p.price)
      if (sidebarFilters.price[0] > PRICE_BOUNDS.min && priceVal < sidebarFilters.price[0]) return false
      if (sidebarFilters.price[1] < PRICE_BOUNDS.max && priceVal > sidebarFilters.price[1]) return false
      if (priceRange.min !== '' && priceVal < Number(priceRange.min)) return false
      if (priceRange.max !== '' && priceVal > Number(priceRange.max)) return false

      if (sidebarFilters.fabric.length && !sidebarFilters.fabric.includes(p.fabric)) return false
      if (sidebarFilters.sleeve.length && !sidebarFilters.sleeve.includes(p.sleeve)) return false
      if (sidebarFilters.occasion.length && !sidebarFilters.occasion.includes(p.occasion)) return false

      return true
    })
  }, [products, sidebarFilters, selectedCategories, selectedSizes, selectedColors, priceRange])

  // Toggle filter selections
  const toggleCategory = (slug) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
  }

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
  }

  const toggleColor = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    )
  }

  const clearAllFilters = () => {
    setSelectedCategories([])
    setSelectedSizes([])
    setSelectedColors([])
    setPriceRange({ min: '', max: '' })
    setSidebarFilters({
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
  }

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (selectedCategories.length) count += selectedCategories.length
    if (selectedSizes.length) count += selectedSizes.length
    if (selectedColors.length) count += selectedColors.length
    if (sidebarFilters.categories.length) count += sidebarFilters.categories.length
    if (sidebarFilters.sizes.length) count += sidebarFilters.sizes.length
    if (sidebarFilters.colors.length) count += sidebarFilters.colors.length
    if (priceRange.min !== '' || priceRange.max !== '') count += 1
    return count
  }, [selectedCategories, selectedSizes, selectedColors, sidebarFilters])

  return (
    <div className="min-h-screen bg-[#FFF6F9]/10 pb-16 text-ink">
      
      {/* Editorial Hero Banner (Full-Width with Background Image) */}
      <div 
        className="relative w-full bg-cover bg-center flex flex-col justify-center py-8 md:py-10 mb-8 overflow-hidden"
        style={{ backgroundImage: `url(${pageData.bg_image || '/images/banners/sale-hero.webp'})` }}
      >
        {/* Dark linear gradient mask overlay for pristine legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2A1A22]/90 via-[#2A1A22]/65 to-transparent z-[1]" />
        
        {/* Content Container */}
        <div className="relative z-10 container-luxury max-w-7xl px-0 sm:px-6 w-full space-y-3">
          
          {/* Top Row: Breadcrumbs over image */}
          <div className="text-xs font-semibold text-rose-blush/80 flex items-center gap-1.5">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <span className="text-white/30">/</span>
            <span className="text-white">{pageData.title}</span>
          </div>

          {/* Middle Row: Content */}
          <div className="max-w-2xl">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-rose-blush mb-1 block">Special Markdowns</span>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-2 drop-shadow-md">
              {pageData.title}
            </h1>
            <p className="text-xs sm:text-sm text-rose-light/95 leading-relaxed drop-shadow-sm">
              {pageData.description}
            </p>
          </div>
        </div>
      </div>

      {/* Desktop Filter Toolbar & Sorters */}
      {/* Filter Toolbar & Sorters */}
      <div className="container-luxury max-w-7xl px-0 sm:px-6 mb-8 z-30 relative" ref={dropdownRef}>
        
        {/* DESKTOP TOOLBAR (lg and up) */}
        <div className="hidden lg:flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-[#EFD7E3]/50">
          {/* Left: Desktop Filters Dropdowns */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-ink-muted flex items-center gap-1.5 uppercase tracking-wider mr-2">
              <SlidersHorizontal className="w-4 h-4 text-primary" /> Filters:
            </span>

            {/* Dropdown: Category */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-ink-muted transition hover:border-primary hover:text-primary bg-white cursor-pointer",
                  selectedCategories.length > 0 && "border-primary text-primary bg-[#FFF6F9]"
                )}
              >
                <span>Category</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {activeDropdown === 'category' && (
                <div className="absolute left-0 mt-2 w-56 rounded-2xl border border-[#EFD7E3] bg-white p-4 shadow-lift z-50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-2">Filter Category</p>
                  <div className="space-y-2 max-h-52 overflow-y-auto">
                    {CATEGORY_OPTIONS.map((cat) => {
                      const isSelected = selectedCategories.includes(cat.slug)
                      return (
                        <label key={cat.slug} className="flex items-center gap-2 text-xs cursor-pointer select-none py-1 hover:text-primary">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleCategory(cat.slug)}
                            className="rounded text-primary focus:ring-primary w-4 h-4 accent-primary"
                          />
                          <span className={cn(isSelected && "font-bold text-primary")}>{cat.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Dropdown: Size */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'size' ? null : 'size')}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-ink-muted transition hover:border-primary hover:text-primary bg-white cursor-pointer",
                  selectedSizes.length > 0 && "border-primary text-primary bg-[#FFF6F9]"
                )}
              >
                <span>Size</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {activeDropdown === 'size' && (
                <div className="absolute left-0 mt-2 w-48 rounded-2xl border border-[#EFD7E3] bg-white p-4 shadow-lift z-50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-2.5">Filter Size</p>
                  <div className="grid grid-cols-3 gap-2">
                    {SIZE_OPTIONS.map((sz) => {
                      const isSelected = selectedSizes.includes(sz)
                      return (
                        <button
                          key={sz}
                          onClick={() => toggleSize(sz)}
                          className={cn(
                            "py-1.5 text-xs font-bold rounded-lg border border-gray-200 hover:border-primary transition cursor-pointer text-center",
                            isSelected ? "bg-primary text-white border-primary" : "bg-white text-ink"
                          )}
                        >
                          {sz}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Dropdown: Color */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'color' ? null : 'color')}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-ink-muted transition hover:border-primary hover:text-primary bg-white cursor-pointer",
                  selectedColors.length > 0 && "border-primary text-primary bg-[#FFF6F9]"
                )}
              >
                <span>Color</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {activeDropdown === 'color' && (
                <div className="absolute left-0 mt-2 w-56 rounded-2xl border border-[#EFD7E3] bg-white p-4 shadow-lift z-50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-3">Filter Color</p>
                  <div className="flex flex-wrap gap-2.5">
                    {COLOR_OPTIONS.map((col) => {
                      const isSelected = selectedColors.includes(col.name)
                      return (
                        <button
                          key={col.name}
                          onClick={() => toggleColor(col.name)}
                          className={cn(
                            "w-7 h-7 rounded-full border relative flex items-center justify-center transition cursor-pointer shadow-xs",
                            isSelected ? "border-primary border-2 scale-110" : "border-gray-200 hover:scale-105"
                          )}
                          style={{ backgroundColor: col.hex }}
                          title={col.name}
                        >
                          {isSelected && (
                            <Check className={cn(
                              "w-3.5 h-3.5",
                              col.name === 'cream' ? "text-ink" : "text-white"
                            )} strokeWidth={3} />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Dropdown: Price */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'price' ? null : 'price')}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-ink-muted transition hover:border-primary hover:text-primary bg-white cursor-pointer",
                  (priceRange.min !== '' || priceRange.max !== '') && "border-primary text-primary bg-[#FFF6F9]"
                )}
              >
                <span>Price</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {activeDropdown === 'price' && (
                <div className="absolute left-0 mt-2 w-64 rounded-2xl border border-[#EFD7E3] bg-white p-4 shadow-lift z-50 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Filter Price (₹)</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 mb-0.5">Min Price</label>
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 mb-0.5">Max Price</label>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 pt-1.5">
                    <button
                      onClick={() => setPriceRange({ min: '', max: '' })}
                      className="text-[10px] font-bold text-gray-400 hover:text-red-500 py-1 px-2"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setActiveDropdown(null)}
                      className="bg-primary text-white text-[10px] font-bold py-1 px-3.5 rounded-lg shadow-sm"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Clear All button */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
              >
                Clear All ({activeFiltersCount})
              </button>
            )}
          </div>

          {/* Right: Sorters */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider whitespace-nowrap">
              Sort By:
            </span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-muted outline-none hover:border-primary transition focus:border-primary cursor-pointer focus:ring-1 focus:ring-primary"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popularity">Popularity</option>
              <option value="top-rated">Top Rated</option>
              <option value="discount">Discount</option>
            </select>
          </div>
        </div>

        {/* MOBILE TOOLBAR (below lg) */}
        <div className="block lg:hidden">
          <div className="flex flex-col gap-3 bg-white p-3 rounded-2xl shadow-soft ring-1 ring-[#EFD7E3]/50">
            <div className="flex items-center justify-between gap-3 w-full">
              {/* Filter button */}
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className={cn(
                  "flex h-12 flex-1 items-center justify-center gap-2 rounded-[18px] border border-primary/15 bg-white px-4 font-label text-sm font-semibold text-ink shadow-sm transition active:scale-[0.98] cursor-pointer",
                  activeFiltersCount > 0 && "border-primary text-primary bg-[#FFF6F9]"
                )}
              >
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                <span>Filter ({activeFiltersCount})</span>
              </button>

              {/* Sort selector */}
              <div className="relative flex-1">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full h-12 rounded-[18px] border border-primary/15 bg-white pl-4 pr-10 text-center font-label text-sm font-semibold text-ink shadow-sm appearance-none outline-none cursor-pointer"
                >
                  <option value="newest">Sort: Newest</option>
                  <option value="price-low">Sort: Price ↑</option>
                  <option value="price-high">Sort: Price ↓</option>
                  <option value="popularity">Sort: Popular</option>
                  <option value="top-rated">Sort: Rating</option>
                  <option value="discount">Sort: Discount</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-primary" />
                </div>
              </div>
            </div>

            {/* Product Count Row */}
            <div className="text-center border-t border-gray-100 pt-2">
              <p className="font-label text-xs text-ink-muted">
                Showing <span className="font-semibold text-ink">{filteredProducts.length}</span> of <span className="font-semibold text-ink">{products.length}</span> Products
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Main Content Area: 2-Column Grid on Desktop */}
      <div className="container-luxury max-w-7xl px-0 sm:px-6 relative z-10 min-h-[300px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Desktop Left Sticky Sidebar (Col-3) */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24 z-20">
            <FilterSidebar
              filters={sidebarFilters}
              onChange={setSidebarFilters}
              onClear={clearAllFilters}
            />
          </aside>

          {/* Right Product Grid & Mobile Toolbar (Col-9) */}
          <div className="lg:col-span-9 space-y-5">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {Array.from({ length: 9 }).map((_, idx) => (
                  <SkeletonCard key={idx} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white border border-[#EFD7E3]/40 rounded-3xl max-w-xl mx-auto shadow-soft">
                <h2 className="font-heading text-lg font-bold text-ink mb-2">Sale Items Coming Soon</h2>
                <p className="text-xs text-ink-muted max-w-xs mb-6">
                  We're preparing something beautiful for you. Check back soon for our latest markdowns.
                </p>
                <Link
                  to="/shop"
                  className="bg-primary hover:bg-primary-deep text-white text-xs font-bold px-6 py-3 rounded-xl transition shadow-md hover:shadow-lg active:scale-95"
                >
                  SHOP ALL PRODUCTS
                </Link>
              </div>
            ) : (
              <>
                <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-2 px-1">
                  Showing {filteredProducts.length} of {products.length} Sale Items
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {filteredProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={{
                        ...prod,
                        badges: prod.discount >= 20 ? ['sale'] : []
                      }}
                      onQuickView={(p) => setQuickViewProduct(p)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Services Strip promises */}
      <div className="mt-16 border-t border-gray-100">
        <Services />
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          isOpen={true}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      {/* Mobile Drawer Slide filters */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-sm bg-white h-full flex flex-col shadow-2xl animate-slide-left">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-[#FFF6F9]">
              <h3 className="font-heading text-sm font-bold text-ink flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-primary" /> Filter Options
              </h3>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-1.5 text-ink-muted hover:text-ink rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Category Options */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-ink-muted border-b pb-1">Categories</h4>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORY_OPTIONS.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.slug)
                    return (
                      <button
                        key={cat.slug}
                        onClick={() => toggleCategory(cat.slug)}
                        className={cn(
                          "py-2 px-2.5 rounded-xl border text-[11px] font-semibold text-center leading-tight transition cursor-pointer",
                          isSelected ? "bg-primary/10 border-primary text-primary font-bold" : "bg-white text-ink border-gray-200"
                        )}
                      >
                        {cat.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Size Options */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-ink-muted border-b pb-1">Sizes</h4>
                <div className="grid grid-cols-3 gap-2">
                  {SIZE_OPTIONS.map((sz) => {
                    const isSelected = selectedSizes.includes(sz)
                    return (
                      <button
                        key={sz}
                        onClick={() => toggleSize(sz)}
                        className={cn(
                          "py-2 rounded-xl border text-xs font-bold text-center transition cursor-pointer",
                          isSelected ? "bg-primary border-primary text-white" : "bg-white text-ink border-gray-200"
                        )}
                      >
                        {sz}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Color Options */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-ink-muted border-b pb-1">Colors</h4>
                <div className="flex flex-wrap gap-2.5">
                  {COLOR_OPTIONS.map((col) => {
                    const isSelected = selectedColors.includes(col.name)
                    return (
                      <button
                        key={col.name}
                        onClick={() => toggleColor(col.name)}
                        className={cn(
                          "w-8 h-8 rounded-full border relative flex items-center justify-center transition cursor-pointer",
                          isSelected ? "border-primary border-2 scale-110 shadow-sm" : "border-gray-200"
                        )}
                        style={{ backgroundColor: col.hex }}
                      >
                        {isSelected && (
                          <Check className={cn(
                            "w-4 h-4",
                            col.name === 'cream' ? "text-ink" : "text-white"
                          )} strokeWidth={3} />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Price Options */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-ink-muted border-b pb-1">Price Range</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:border-primary outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:border-primary outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex gap-2 bg-gray-50">
              <button
                onClick={() => {
                  clearAllFilters()
                  setIsMobileFiltersOpen(false)
                }}
                className="flex-1 py-2.5 text-xs font-bold text-gray-500 hover:text-red-500 rounded-xl border border-gray-200 bg-white transition cursor-pointer text-center"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="flex-1 py-2.5 text-xs font-bold bg-primary text-white hover:bg-primary-deep rounded-xl shadow-md transition cursor-pointer text-center"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
