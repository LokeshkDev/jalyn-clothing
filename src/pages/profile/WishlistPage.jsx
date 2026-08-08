import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag } from 'lucide-react'
import ShopProductCard from '@/components/shop/ShopProductCard'
import { SHOP_PRODUCTS } from '@/constants/shopProducts'
import { useWishlistStore } from '@/store'

export default function WishlistPage() {
  const wishIds = useWishlistStore((s) => s.ids)

  const wishlistedProducts = useMemo(() => {
    return SHOP_PRODUCTS.filter((p) => wishIds.includes(p.id))
  }, [wishIds])

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex items-center justify-between border-b border-primary/10 pb-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-ink">My Wishlist</h2>
          <p className="text-xs text-ink-muted">
            {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>
      </div>

      {/* Grid or Empty State */}
      {wishlistedProducts.length === 0 ? (
        <div className="rounded-2xl border border-primary/10 bg-white p-12 text-center text-ink-muted">
          <Heart className="mx-auto h-12 w-12 text-primary/30 mb-3" />
          <h3 className="font-heading text-lg font-bold text-ink mb-1">
            Your wishlist is waiting for something beautiful.
          </h3>
          <p className="text-xs mb-5">Save your favorite styles to access them anytime.</p>
          <Link
            to="/shop"
            className="inline-block rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white uppercase tracking-wider shadow-soft hover:bg-primary-deep"
          >
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistedProducts.map((product) => (
            <ShopProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
