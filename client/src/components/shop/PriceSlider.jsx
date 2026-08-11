import { formatINR } from '@/lib/utils'

export default function PriceSlider({ min, max, value, onChange }) {
  const [lo, hi] = value
  const span = max - min || 1
  const left = ((lo - min) / span) * 100
  const right = ((hi - min) / span) * 100

  return (
    <div className="px-1 pt-2">
      <div className="relative h-6">
        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-rose-light" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary transition-all duration-200"
          style={{ left: `${left}%`, right: `${100 - right}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={lo}
          aria-label="Minimum price"
          onChange={(e) => {
            const next = Math.min(Number(e.target.value), hi - 50)
            onChange([next, hi])
          }}
          className="price-range absolute inset-0 z-20 w-full appearance-none bg-transparent"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={hi}
          aria-label="Maximum price"
          onChange={(e) => {
            const next = Math.max(Number(e.target.value), lo + 50)
            onChange([lo, next])
          }}
          className="price-range absolute inset-0 z-30 w-full appearance-none bg-transparent"
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs font-medium text-ink-muted">
        <span>{formatINR(lo)}</span>
        <span>{formatINR(hi)}</span>
      </div>
      <style>{`
        .price-range {
          pointer-events: none;
        }
        .price-range::-webkit-slider-thumb {
          pointer-events: auto;
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 999px;
          background: #ad4a85;
          border: 2px solid #fff;
          box-shadow: 0 2px 8px rgba(173, 74, 133, 0.35);
          cursor: pointer;
        }
        .price-range::-moz-range-thumb {
          pointer-events: auto;
          width: 16px;
          height: 16px;
          border-radius: 999px;
          background: #ad4a85;
          border: 2px solid #fff;
          box-shadow: 0 2px 8px rgba(173, 74, 133, 0.35);
          cursor: pointer;
        }
        .price-range::-webkit-slider-runnable-track {
          background: transparent;
        }
        .price-range::-moz-range-track {
          background: transparent;
        }
      `}</style>
    </div>
  )
}
