import ShopProductCard from '@/components/shop/ShopProductCard'
import { SHOP_PRODUCTS } from '@/constants/shopProducts'

export default function ProductRecommendations({ currentProductId }) {
  const recommendations = SHOP_PRODUCTS.filter((p) => p.id !== currentProductId).slice(0, 4)

  return (
    <section className="mt-14 mb-10" aria-labelledby="recommendations-heading">
      <div className="mb-6 flex items-center justify-between">
        <h2
          id="recommendations-heading"
          className="font-display text-2xl font-medium tracking-tight text-ink md:text-3xl"
        >
          You May Also Like
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {recommendations.map((p) => (
          <ShopProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
