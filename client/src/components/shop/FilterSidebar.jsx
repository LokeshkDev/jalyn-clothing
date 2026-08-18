import { useEffect, useMemo, useState } from 'react'
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
import api from '@/services/api'
import { cn } from '@/lib/utils'

const DEFAULT_OPEN = {
  categories: false,
  price: false,
  sizes: false,
  colors: false,
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
  const [customOptions, setCustomOptions] = useState({})

  useEffect(() => {
    api
      .get('/filter-options')
      .then((res) => setCustomOptions(res.data?.options || {}))
      .catch(() => setCustomOptions({}))
  }, [])

  const mergedOptions = useMemo(() => {
    const merged = {}
    for (const [key, options] of Object.entries(SHOP_FILTER_OPTIONS)) {
      merged[key] = [...new Set([...options, ...(customOptions[key] || [])])]
    }
    return merged
  }, [customOptions])

  const toggleOpen = (key) =>
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }))

  const toggleArray = (key, value) => {
    const list = filters[key] || []
    const next = list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value]
    onChange({ ...filters, [key]: next })
  }

  return (
    <div
      data-lenis-prevent
      className={cn(
        'rounded-[6px] bg-white p-4 shadow-sm border border-primary/10 overflow-y-auto max-h-[calc(100vh-6.5rem)] pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
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

      {Object.entries(mergedOptions).map(([key, options]) => (
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
