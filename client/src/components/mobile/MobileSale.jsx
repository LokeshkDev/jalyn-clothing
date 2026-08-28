import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { normalizeProduct } from '@/hooks/useProductsApi'
import MobileShopProductCard from '@/components/shop/MobileShopProductCard'

async function fetchSaleProducts() {
  try {
    const res = await api.get('/products', { params: { on_sale: '1' } })
    if (res.data?.success && Array.isArray(res.data.products)) {
      return res.data.products.map(normalizeProduct)
    }
  } catch (err) {
    console.warn('Failed to load sale products:', err)
  }
  return []
}

export default function MobileSale() {
  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: ['products', 'on_sale'],
    queryFn: fetchSaleProducts,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  if (loading || products.length === 0) return null

  return (
    <motion.section
      className="mt-6 mb-[15px] lg:mb-5"
      aria-labelledby="mobile-sale-heading"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-3 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h2
            id="mobile-sale-heading"
            className="font-heading text-xl font-bold text-[#2A1A22]"
          >
            Exclusive Sale
          </h2>
          <span className="font-label rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
            Limited Time
          </span>
        </div>
        <Link
          to="/sale"
          className="flex items-center gap-0.5 font-label text-[13px] font-bold text-primary hover:underline"
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex gap-3.5 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.slice(0, 8).map((product) => (
          <div key={product.id || product.slug} className="w-[164px] shrink-0 sm:w-[184px]">
            <MobileShopProductCard product={product} />
          </div>
        ))}
      </div>
    </motion.section>
  )
}
