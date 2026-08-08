import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PRODUCTS } from '@/constants/data'
import ProductCard from '@/components/ui/ProductCard'
import { Button } from '@/components/ui/Button'
import SectionHeader from '@/components/ui/SectionHeader'

export default function TrendingProducts() {
  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-20" aria-labelledby="trending-heading">
      <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-rose-light/60 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-10 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />

      <div className="container-luxury relative">
        <SectionHeader
          label="Trending Now"
          title="Most Loved Styles"
          id="trending-heading"
        />

        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <motion.div
          className="mt-12 flex justify-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <Link to="/collections/new-arrivals">
            <Button>View All Products</Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
