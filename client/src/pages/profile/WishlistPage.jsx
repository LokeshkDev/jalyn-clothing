import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWishlistStore, useCartStore } from '@/store'
import { useProductsApi, normalizeProduct } from '@/hooks/useProductsApi'
import { formatINR } from '@/lib/utils'

export default function WishlistPage() {
  const wishIds = useWishlistStore((s) => s.ids)
  const toggleWish = useWishlistStore((s) => s.toggle)
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)

  const { products: rawProducts } = useProductsApi()

  // Match wishlisted products from live API or fallback shop products
  const wishlistedProducts = useMemo(() => {
    return rawProducts.filter((p) => wishIds.includes(p.id))
  }, [wishIds, rawProducts])

  // Recommendations for empty state or bottom carousel
  const recommendations = useMemo(() => {
    return rawProducts.filter((p) => !wishIds.includes(p.id)).slice(0, 4)
  }, [wishIds, rawProducts])

  const handleMoveToCart = (product) => {
    addItem({
      id: product.id,
      name: product.title || product.name,
      price: product.price,
      image: product.primary_image || product.image,
      size: product.sizes?.[0] || 'M',
      color: product.colors?.[0] || 'rose',
      href: `/products/${product.slug || product.id}`,
    })
    openCart()
  }

  const handleMoveAllToCart = () => {
    wishlistedProducts.forEach((product) => {
      addItem({
        id: product.id,
        name: product.title || product.name,
        price: product.price,
        image: product.primary_image || product.image,
        size: product.sizes?.[0] || 'M',
        color: product.colors?.[0] || 'rose',
        href: `/products/${product.slug || product.id}`,
      })
    })
    openCart()
  }

  return (
    <div className="bg-[#FFF6F9]/40 min-h-screen pb-16">
      {/* Top Header Banner */}
      <div className="bg-[#FFF6F9] border-b border-[#EFD7E3] py-6 sm:py-10">
        <div className="container-luxury max-w-7xl px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ink-muted mb-3">
            <Link to="/" className="hover:text-primary transition">Home</Link>
            <span>&gt;</span>
            <span className="font-semibold text-ink">Wishlist</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink flex items-center gap-2.5">
                <span>My Saved Favorites</span>
              </h1>
              <p className="text-xs sm:text-sm text-ink-muted mt-1">
                {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'item' : 'items'} saved in your luxury wishlist
              </p>
            </div>

            {wishlistedProducts.length > 0 && (
              <button
                type="button"
                onClick={handleMoveAllToCart}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-soft hover:bg-primary-deep transition active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Move All to Bag</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="container-luxury max-w-7xl px-4 sm:px-6 pt-8">
        {wishlistedProducts.length === 0 ? (
          /* LUXURY EMPTY STATE */
          <div className="max-w-xl mx-auto my-8 p-8 sm:p-12 text-center rounded-3xl border border-[#EFD7E3] bg-white shadow-soft space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF6F9] border border-primary/20 shadow-inner">
              <Heart className="h-10 w-10 text-primary animate-pulse" strokeWidth={1.5} />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-ink">
                Your wishlist is empty
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Save your favorite silk dresses, co-ords, and ethnic wear while browsing to easily compare and shop them anytime.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-lift hover:bg-primary-deep transition cursor-pointer"
              >
                <span>EXPLORE COLLECTION</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Recommended Products grid if wishlist empty */}
            {recommendations.length > 0 && (
              <div className="pt-8 border-t border-primary/10 space-y-4 text-left">
                <h4 className="font-display text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  Trending Recommendations
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {recommendations.map((p) => (
                    <Link
                      key={p.id}
                      to={`/products/${p.slug}`}
                      className="group flex items-center gap-3 p-2 rounded-xl border border-primary/10 bg-[#FFF6F9]/50 hover:bg-white hover:border-primary transition"
                    >
                      <img
                        src={p.primary_image || p.image}
                        alt={p.title}
                        className="h-14 w-11 rounded-lg object-cover border border-black/5"
                      />
                      <div className="min-w-0 flex-1 text-xs">
                        <p className="font-semibold text-ink truncate group-hover:text-primary transition">
                          {p.title}
                        </p>
                        <p className="font-bold text-primary text-xs mt-0.5">{formatINR(p.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* WISHLIST PRODUCT GRID (Mobile 2-cols, Desktop 4-cols) */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            <AnimatePresence>
              {wishlistedProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative flex flex-col rounded-2xl border border-[#EFD7E3] bg-white overflow-hidden shadow-sm hover:shadow-md transition duration-300"
                >
                  {/* Top Product Image Container */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F7F1F2]">
                    <Link to={`/products/${product.slug || product.id}`} className="block h-full w-full">
                      <img
                        src={product.primary_image || product.image}
                        alt={product.title}
                        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>

                    {/* Remove button badge */}
                    <button
                      type="button"
                      onClick={() => toggleWish(product.id)}
                      title="Remove from wishlist"
                      className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-md backdrop-blur-sm transition hover:bg-red-500 hover:text-white cursor-pointer z-10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    {/* Discount Badge */}
                    {product.discount > 0 && (
                      <span className="absolute top-2.5 left-2.5 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                        {product.discount}% OFF
                      </span>
                    )}
                  </div>

                  {/* Card Content & Action Button */}
                  <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block">
                        {product.brand || 'JALYN'}
                      </span>
                      <Link
                        to={`/products/${product.slug || product.id}`}
                        className="font-semibold text-xs sm:text-sm text-ink hover:text-primary transition line-clamp-1 block mt-0.5"
                      >
                        {product.title}
                      </Link>

                      <div className="flex items-baseline gap-2 mt-1.5">
                        <span className="font-bold text-sm sm:text-base text-primary">
                          {formatINR(product.price)}
                        </span>
                        {product.original_price > product.price && (
                          <span className="text-xs text-ink-muted line-through">
                            {formatINR(product.original_price)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Move to Bag Action Button */}
                    <button
                      type="button"
                      onClick={() => handleMoveToCart(product)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white py-2.5 text-xs font-bold uppercase tracking-wider transition duration-200 cursor-pointer active:scale-98"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span>Move to Bag</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
