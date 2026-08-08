import ShopProductCard from '@/components/shop/ShopProductCard'
import SkeletonCard from '@/components/shop/SkeletonCard'
import { cn } from '@/lib/utils'

const GRID = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
}

export default function ProductGrid({
  products,
  view,
  loading,
  onQuickView,
}) {
  if (loading) {
    return (
      <div className={cn('grid gap-6', GRID[4])}>
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (view === 'list') {
    return (
      <div className="flex flex-col gap-4">
        {products.map((product) => (
          <ShopProductCard
            key={product.id}
            product={product}
            listView
            onQuickView={onQuickView}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('grid gap-6', GRID[view] || GRID[4])}>
      {products.map((product) => (
        <ShopProductCard
          key={product.id}
          product={product}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  )
}
