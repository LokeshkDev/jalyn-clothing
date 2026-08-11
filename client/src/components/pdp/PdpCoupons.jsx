import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import { Tag, Copy, Check } from 'lucide-react'
import { useCoupons } from '@/hooks/useCoupons'

export default function PdpCoupons() {
  const { coupons, loading } = useCoupons()
  const [copiedCode, setCopiedCode] = useState(null)

  // Show on PDP only when 2 or more coupons are live
  if (loading || coupons.length < 2) return null

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink">
          <Tag className="h-3.5 w-3.5 text-red-500" />
          Offers &amp; Coupons ({coupons.length})
        </h3>
        <Link to="/checkout" className="text-[11px] font-bold text-primary transition hover:underline">
          Apply at Checkout
        </Link>
      </div>

      <Swiper
        grabCursor={true}
        simulateTouch={true}
        spaceBetween={8}
        slidesPerView={1.5}
        slidesPerGroup={1}
        breakpoints={{
          // Compact width cards — minimal info only
          768: { slidesPerView: 2.1, spaceBetween: 8 },
        }}
        className="py-1"
      >
        {coupons.map((cp) => (
          <SwiperSlide key={cp.code}>
            <button
              type="button"
              onClick={() => handleCopy(cp.code)}
              title="Click to copy code"
              className="relative flex h-[96px] w-full flex-col justify-between overflow-hidden rounded-xl border border-red-200 bg-red-50/40 p-2.5 text-left shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-red-300 hover:shadow-soft"
            >
              {/* Perforated Side Notches */}
              <div className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-surface border-r border-red-200" />
              <div className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-surface border-l border-red-200" />

              <div className="min-w-0">
                <div className="flex items-center gap-1 text-red-600 font-bold text-[10px]">
                  <Tag className="h-3 w-3 fill-red-500 text-red-500 shrink-0" />
                  <span className="truncate">
                    <span className="text-red-700 font-extrabold">{cp.discountLabel}</span> OFF
                  </span>
                </div>
                <p className="mt-0.5 text-[9px] text-gray-600 truncate">{cp.description}</p>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-dashed border-red-200 pt-1.5">
                <span className="flex min-w-0 items-center gap-1 rounded bg-red-100 px-2 py-0.5 font-mono text-[10px] font-bold text-red-700">
                  <span className="truncate">{cp.code}</span>
                  {copiedCode === cp.code ? (
                    <Check className="h-2.5 w-2.5 shrink-0 text-emerald-600" />
                  ) : (
                    <Copy className="h-2.5 w-2.5 shrink-0" />
                  )}
                </span>
                <span className="shrink-0 text-[10px] text-gray-500">
                  Min <strong className="text-gray-700">{cp.minAmountLabel}</strong>
                </span>
              </div>
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}