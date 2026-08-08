import { cn } from '@/lib/utils'

const CATEGORY_CHIPS = [
  { id: 'all', label: 'All' },
  { id: 'dresses', label: 'Dresses' },
  { id: 'tops', label: 'Tops' },
  { id: 'coords', label: 'Co-ord Sets' },
  { id: 'ethnic', label: 'Kurtas' },
  { id: 'lounge', label: 'Lounge' },
  { id: 'nightwear', label: 'Nightwear' },
]

export default function MobileCategoryChips({ activeCategory, onSelectCategory }) {
  return (
    <div className="mb-5 overflow-hidden">
      <div className="flex gap-2.5 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CATEGORY_CHIPS.map((chip) => {
          const isSelected =
            activeCategory === chip.id ||
            (chip.id === 'all' && (!activeCategory || activeCategory.length === 0))

          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => onSelectCategory(chip.id)}
              className={cn(
                'inline-flex shrink-0 items-center justify-center rounded-full px-5 py-2.5 font-label text-xs font-semibold tracking-wide transition-all active:scale-95',
                isSelected
                  ? 'bg-primary text-white shadow-soft'
                  : 'border border-[#EFD7E3] bg-white text-ink hover:border-primary/40',
              )}
            >
              {chip.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
