import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import MobileShopProductCard from '@/components/shop/MobileShopProductCard'
import { SHOP_PRODUCTS } from '@/constants/shopProducts'

export default function MobileRelatedProducts({ currentProductId }) {
  const related = SHOP_PRODUCTS.filter((p) => p.id !== currentProductId).slice(0, 8)

  return (
    <section className="mt-2 px-4" aria-labelledby="mobile-related-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2
          id="mobile-related-heading"
          className="font-display text-[20px] font-semibold tracking-tight text-[#222222]"
        >
          You May Also Like
        </h2>
        <Link
          to="/shop"
          className="flex items-center gap-1 text-[12px] font-semibold text-primary active:scale-95"
        >
          <span>View All</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {related.map((product) => (
          <div key={product.id} className="w-[160px] shrink-0 sm:w-[180px]">
            <MobileShopProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
