import { useState, useMemo, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import ProductGallery from '@/components/pdp/ProductGallery'
import ProductInfoPanel from '@/components/pdp/ProductInfoPanel'
import ProductPurchaseCard from '@/components/pdp/ProductPurchaseCard'
import ProductTabsSection from '@/components/pdp/ProductTabsSection'
import ProductRecommendations from '@/components/pdp/ProductRecommendations'
import Services from '@/components/home/Services'
import { SHOP_PRODUCTS } from '@/constants/shopProducts'

// Mobile-specific PDP components
import MobilePDPGallery from '@/components/pdp/mobile/MobilePDPGallery'
import MobilePDPInfo from '@/components/pdp/mobile/MobilePDPInfo'
import MobileSizeGuideSheet from '@/components/pdp/mobile/MobileSizeGuideSheet'
import MobileServiceCard from '@/components/pdp/mobile/MobileServiceCard'
import MobileProductAccordions from '@/components/pdp/mobile/MobileProductAccordions'
import MobileModelInfo from '@/components/pdp/mobile/MobileModelInfo'
import MobileRelatedProducts from '@/components/pdp/mobile/MobileRelatedProducts'
import MobilePurchaseBar from '@/components/pdp/mobile/MobilePurchaseBar'
import MobileRecentlyViewed from '@/components/shop/MobileRecentlyViewed'

export default function ProductDetails() {
  const { slug } = useParams()
  const reviewsRef = useRef(null)
  const mobileReviewsRef = useRef(null)

  // Dynamically look up product by slug or default to first product
  const product = useMemo(() => {
    return (
      SHOP_PRODUCTS.find((p) => p.slug === slug || p.id === slug) || SHOP_PRODUCTS[0]
    )
  }, [slug])

  // Derive multiple high quality images for gallery
  const galleryImages = useMemo(() => {
    const list = [product.images.primary]
    if (product.images.hover) list.push(product.images.hover)
    list.push(
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598554747436-c9293d6a477c?auto=format&fit=crop&w=800&q=80',
    )
    return list
  }, [product])

  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0] || 'rose',
  )
  const [selectedSize, setSelectedSize] = useState(
    product.sizes?.[1] || 'M',
  )
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)

  const handleScrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleMobileScrollToReviews = () => {
    mobileReviewsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const categoryTitle =
    product.category?.charAt(0).toUpperCase() + product.category?.slice(1) ||
    'Dresses'

  return (
    <div className="bg-surface min-h-screen">
      {/* ============================
          MOBILE PDP VIEW (< 1024px)
         ============================ */}
      <div className="block lg:hidden pb-[140px]">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 px-4 py-3 text-[12px] text-[#666666] overflow-hidden"
        >
          <Link to="/" className="shrink-0 transition hover:text-primary">
            Home
          </Link>
          <span aria-hidden className="text-primary/30 text-[10px]">
            &gt;
          </span>
          <Link to="/shop" className="shrink-0 transition hover:text-primary capitalize">
            {categoryTitle}
          </Link>
          <span aria-hidden className="text-primary/30 text-[10px]">
            &gt;
          </span>
          <span className="font-semibold text-[#222222] truncate">
            {product.title}
          </span>
        </nav>

        {/* Product Gallery */}
        <MobilePDPGallery product={product} images={galleryImages} />

        {/* Product Info Section */}
        <div className="mt-5">
          <MobilePDPInfo
            product={product}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            onOpenSizeGuide={() => setSizeGuideOpen(true)}
            onScrollToReviews={handleMobileScrollToReviews}
          />
        </div>

        {/* Service Card */}
        <div className="mt-6">
          <MobileServiceCard />
        </div>

        {/* Accordions */}
        <div className="mt-6">
          <MobileProductAccordions product={product} reviewsRef={mobileReviewsRef} />
        </div>

        {/* Model Information */}
        <div className="mt-6">
          <MobileModelInfo product={product} />
        </div>

        {/* You May Also Like */}
        <div className="mt-8">
          <MobileRelatedProducts currentProductId={product.id} />
        </div>

        {/* Recently Viewed */}
        <MobileRecentlyViewed />

        {/* Size Guide Bottom Sheet */}
        <MobileSizeGuideSheet
          isOpen={sizeGuideOpen}
          onClose={() => setSizeGuideOpen(false)}
        />

        {/* Fixed Purchase Bar */}
        <MobilePurchaseBar
          product={product}
          selectedSize={selectedSize}
          selectedColor={selectedColor}
        />
      </div>

      {/* ============================
          DESKTOP PDP VIEW (>= 1024px)
         ============================ */}
      <div className="hidden lg:block">
        <div className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6 md:py-6 lg:px-12">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs sm:text-sm text-ink-muted">
            <Link to="/" className="transition hover:text-primary">
              Home
            </Link>
            <span aria-hidden className="text-primary/30 text-[10px]">
              &gt;
            </span>
            <Link to="/shop" className="transition hover:text-primary capitalize">
              {categoryTitle}
            </Link>
            <span aria-hidden className="text-primary/30 text-[10px]">
              &gt;
            </span>
            <span className="font-semibold text-ink truncate max-w-[200px] sm:max-w-none">
              {product.title}
            </span>
          </nav>

          {/* DESKTOP PDP MAIN SPLIT CONTAINER */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-10 lg:items-start">
            {/* LEFT: Product Gallery (Thumbnails + Main Image) */}
            <div className="lg:col-span-7">
              <ProductGallery product={product} images={galleryImages} />
            </div>

            {/* RIGHT: Product Information & Purchase Card (Sticky) */}
            <div className="lg:col-span-5 sticky top-24 space-y-6">
              <ProductInfoPanel
                product={product}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
                onOpenSizeGuide={() => {}}
                onScrollToReviews={handleScrollToReviews}
              />

              <ProductPurchaseCard
                product={product}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
              />
            </div>
          </div>

          {/* Product Information Tabs */}
          <ProductTabsSection product={product} reviewsRef={reviewsRef} />

          {/* You May Also Like Section */}
          <ProductRecommendations currentProductId={product.id} />
        </div>

        {/* Benefits / Services Strip */}
        <Services />
      </div>
    </div>
  )
}
