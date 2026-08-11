import { SHOP_COLORS } from '@/constants/shopProducts'
import { cn } from '@/lib/utils'

export default function ColorFilter({ selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {SHOP_COLORS.map((color) => {
        const active = selected.includes(color.id)
        return (
          <button
            key={color.id}
            type="button"
            title={color.label}
            aria-label={color.label}
            aria-pressed={active}
            onClick={() => onToggle(color.id)}
            className={cn(
              'h-7 w-7 rounded-full border-2 transition duration-300',
              active
                ? 'scale-110 border-primary ring-2 ring-primary/25'
                : 'border-white shadow-[0_0_0_1px_rgba(173,74,133,0.2)] hover:scale-105',
            )}
            style={{ backgroundColor: color.hex }}
          />
        )
      })}
    </div>
  )
}
