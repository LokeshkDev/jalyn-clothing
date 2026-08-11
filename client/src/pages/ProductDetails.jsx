import { useState, useMemo, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import ProductGallery from '@/components/pdp/ProductGallery'
import ProductInfoPanel from '@/components/pdp/ProductInfoPanel'
import ProductPurchaseCard from '@/components/pdp/ProductPurchaseCard'
import ProductRightAccordions from '@/components/pdp/ProductRightAccordions'
import ProductRecommendations from '@/components/pdp/ProductRecommendations'
import PdpCoupons from '@/components/pdp/PdpCoupons'
import Services from '@/components/home/Services'
import { SHOP_PRODUCTS } from '@/constants/shopProducts'
import { useProductsApi, normalizeProduct } from '@/hooks/useProductsApi'

// Mobile-specific PDP components
import MobilePDPGallery from '@/components/pdp/mobile/MobilePDPGallery'
import MobilePDPInfo from '@/components/pdp/mobile/MobilePDPInfo'
import MobileSizeGuideSheet from '@/components/pdp/mobile/MobileSizeGuideSheet'
import SizeGuideModal from '@/components/pdp/SizeGuideModal'
import MobileServiceCard from '@/components/pdp/mobile/MobileServiceCard'
import MobileProductAccordions from '@/components/pdp/mobile/MobileProductAccordions'
import MobileModelInfo from '@/components/pdp/mobile/MobileModelInfo'
import MobileRelatedProducts from '@/components/pdp/mobile/MobileRelatedProducts'
import MobilePurchaseBar from '@/components/pdp/mobile/MobilePurchaseBar'
import MobileRecentlyViewed from '@/components/shop/MobileRecentlyViewed'

export default function ProductDetails() {
  const { slug } = useParams()
  const { products: apiProducts } = useProductsApi()
  const reviewsRef = useRef(null)
  const mobileReviewsRef = useRef(null)

  // Dynamically look up product by slug or default to first product
  const product = useMemo(() => {
    const rawList = apiProducts && apiProducts.length > 0 ? apiProducts : SHOP_PRODUCTS.map(normalizeProduct)
    const match = rawList.find((p) => p.slug === slug || String(p.id) === String(slug))
    return match ? normalizeProduct(match) : normalizeProduct(rawList[0])
  }, [slug, apiProducts])

  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0] || 'rose',
  )
  const [selectedSize, setSelectedSize] = useState(
    product.sizes?.[1] || 'M',
  )
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)

  // Derive multiple high quality images for gallery based on color selection
  const galleryImages = useMemo(() => {
    // Check if color specific images exist
    const colorSpecific = product.color_images?.[selectedColor] || product.color_images?.[typeof selectedColor === 'object' ? selectedColor.name : selectedColor]
    if (colorSpecific && colorSpecific.length > 0) {
      return colorSpecific
    }

    const primaryImg = product.image || product.primary_image || product.images?.primary
    const hoverImg = product.hoverImage || product.hover_image || product.images?.hover
    const list = [primaryImg]
    if (hoverImg && hoverImg !== primaryImg) list.push(hoverImg)
    list.push(
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=800&q=80',
    )
    return list
  }, [product, selectedColor])


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

        {/* Offers & Coupons Carousel (next to product highlight, only when 2+ coupons live) */}
        <div className="px-4 mt-5">
          <PdpCoupons />
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
            {/* LEFT: Product Gallery (STICKY on Desktop) */}
            <div className="lg:col-span-7 lg:sticky lg:top-24 lg:self-start">
              <ProductGallery product={product} images={galleryImages} />
            </div>

            {/* RIGHT: Product Information, Delivery Pincode Checker & Right Column Accordions (SCROLLS ALONG) */}
            <div className="lg:col-span-5 space-y-6">
              <ProductInfoPanel
                product={product}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
                onOpenSizeGuide={() => setSizeGuideOpen(true)}
                onScrollToReviews={handleScrollToReviews}
              />

              {/* Offers & Coupons Carousel (next to product highlight, only when 2+ coupons live) */}
              <PdpCoupons />

              <ProductPurchaseCard
                product={product}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
              />

              {/* Accordions (Description, Fabric Care, Shipping, Reviews) stacked in Right Column */}
              <ProductRightAccordions
                product={product}
                reviewsRef={reviewsRef}
              />
            </div>
          </div>

          {/* You May Also Like Section */}
          <div className="mt-16">
            <ProductRecommendations currentProductId={product.id} />
          </div>
        </div>

        {/* Benefits / Services Strip */}
        <Services />

        {/* Size Guide Popup (Desktop) */}
        <SizeGuideModal
          isOpen={sizeGuideOpen}
          onClose={() => setSizeGuideOpen(false)}
        />
      </div>
    </div>
  )
}
