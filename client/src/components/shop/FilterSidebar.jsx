import { useState } from 'react'
import { Check } from 'lucide-react'
import FilterSection from '@/components/shop/FilterSection'
import PriceSlider from '@/components/shop/PriceSlider'
import ColorFilter from '@/components/shop/ColorFilter'
import SizeFilter from '@/components/shop/SizeFilter'
import {
  SHOP_CATEGORIES,
  SHOP_FILTER_OPTIONS,
  PRICE_BOUNDS,
} from '@/constants/shopProducts'
import { cn } from '@/lib/utils'

const DEFAULT_OPEN = {
  categories: true,
  price: true,
  sizes: true,
  colors: true,
  availability: false,
  discount: false,
  sleeve: false,
  fabric: false,
  occasion: false,
  fit: false,
  pattern: false,
  season: false,
  ratings: false,
  brand: false,
}

export default function FilterSidebar({ filters, onChange, onClear, className }) {
  const [open, setOpen] = useState(DEFAULT_OPEN)

  const toggleOpen = (key) =>
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }))

  const toggleArray = (key, value) => {
    const list = filters[key]
    const next = list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value]
    onChange({ ...filters, [key]: next })
  }

  return (
    <div
      className={cn(
        'rounded-2xl bg-white p-5 shadow-card ring-1 ring-primary/8',
        className,
      )}
      aria-label="Product filters"
    >
      <div className="mb-1 flex items-center justify-between">
        <h2 className="font-label text-base font-bold text-ink">Filters</h2>
        <button
          type="button"
          onClick={onClear}
          className="font-label text-xs font-semibold text-primary hover:underline"
        >
          Clear All
        </button>
      </div>

      <FilterSection
        title="Categories"
        open={open.categories}
        onToggle={() => toggleOpen('categories')}
      >
        <ul className="space-y-2.5">
          {SHOP_CATEGORIES.map((cat) => {
            const active =
              cat.id === 'all'
                ? filters.categories.length === 0
                : filters.categories.includes(cat.id)
            return (
              <li key={cat.id}>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
                  <span
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded border transition',
                      active
                        ? 'border-primary bg-primary text-white'
                        : 'border-primary/30 bg-white',
                    )}
                  >
                    {active && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={active}
                    onChange={() => {
                      if (cat.id === 'all') {
                        onChange({ ...filters, categories: [] })
                      } else {
                        toggleArray('categories', cat.id)
                      }
                    }}
                  />
                  <span className="flex-1">{cat.label}</span>
                  <span className="text-xs text-ink-muted">({cat.count})</span>
                </label>
              </li>
            )
          })}
        </ul>
      </FilterSection>

      <FilterSection
        title="Price Range"
        open={open.price}
        onToggle={() => toggleOpen('price')}
      >
        <PriceSlider
          min={PRICE_BOUNDS.min}
          max={PRICE_BOUNDS.max}
          value={filters.price}
          onChange={(price) => onChange({ ...filters, price })}
        />
      </FilterSection>

      <FilterSection
        title="Size"
        open={open.sizes}
        onToggle={() => toggleOpen('sizes')}
      >
        <SizeFilter
          selected={filters.sizes}
          onToggle={(size) => toggleArray('sizes', size)}
        />
      </FilterSection>

      <FilterSection
        title="Color"
        open={open.colors}
        onToggle={() => toggleOpen('colors')}
      >
        <ColorFilter
          selected={filters.colors}
          onToggle={(id) => toggleArray('colors', id)}
        />
      </FilterSection>

      {Object.entries(SHOP_FILTER_OPTIONS).map(([key, options]) => (
        <FilterSection
          key={key}
          title={
            {
              availability: 'Availability',
              discount: 'Discount',
              sleeve: 'Sleeve Type',
              fabric: 'Fabric',
              occasion: 'Occasion',
              fit: 'Fit',
              pattern: 'Pattern',
              season: 'Season',
              ratings: 'Ratings',
              brand: 'Brand',
            }[key] || key
          }
          open={open[key]}
          onToggle={() => toggleOpen(key)}
        >
          <ul className="space-y-2">
            {options.map((opt) => {
              const active = filters[key].includes(opt)
              return (
                <li key={opt}>
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
                    <span
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded border transition',
                        active
                          ? 'border-primary bg-primary text-white'
                          : 'border-primary/30 bg-white',
                      )}
                    >
                      {active && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={active}
                      onChange={() => toggleArray(key, opt)}
                    />
                    <span>{opt}</span>
                  </label>
                </li>
              )
            })}
          </ul>
        </FilterSection>
      ))}
    </div>
  )
}
