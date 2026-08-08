import { SHOP_SIZES } from '@/constants/shopProducts'
import { cn } from '@/lib/utils'

export default function SizeFilter({ selected, onToggle }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {SHOP_SIZES.map((size) => {
        const active = selected.includes(size)
        return (
          <button
            key={size}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(size)}
            className={cn(
              'rounded-lg border py-2 text-center font-label text-xs font-semibold transition duration-300',
              active
                ? 'border-primary bg-primary text-white'
                : 'border-primary/15 bg-white text-ink hover:border-primary/40',
            )}
          >
            {size}
          </button>
        )
      })}
    </div>
  )
}
