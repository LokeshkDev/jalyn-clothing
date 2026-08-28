import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { PRODUCTS } from '@/constants/data'
import { useProductsApi } from '@/hooks/useProductsApi'
import MobileShopProductCard from '@/components/shop/MobileShopProductCard'

export default function MobileNewArrivals() {
  const { products } = useProductsApi()
  const items = products && products.length > 0 ? products : PRODUCTS

  return (
    <motion.section
      className="mt-6 mb-[15px] lg:mb-5"
      aria-labelledby="mobile-arrivals-heading"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-3 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h2
            id="mobile-arrivals-heading"
            className="font-heading text-xl font-bold text-[#2A1A22]"
          >
            New Arrivals
          </h2>
          <span className="font-label rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
            Fresh Collection
          </span>
        </div>
        <Link
          to="/new-arrivals"
          className="flex items-center gap-0.5 font-label text-[13px] font-bold text-primary hover:underline"
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex gap-3.5 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.slice(0, 8).map((product) => (
          <div key={product.id || product.slug} className="w-[164px] shrink-0 sm:w-[184px]">
            <MobileShopProductCard product={product} />
          </div>
        ))}
      </div>
    </motion.section>
  )
}

