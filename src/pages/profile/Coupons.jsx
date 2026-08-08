import { useState } from 'react'
import { Tag, Copy, Check } from 'lucide-react'
import { useUserStore } from '@/store'
import { formatINR } from '@/lib/utils'

export default function Coupons() {
  const coupons = useUserStore((s) => s.coupons)
  const [copiedCode, setCopiedCode] = useState(null)

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-ink">Coupons & Offers</h2>
        <p className="text-xs text-ink-muted">Available promo codes for your next purchase</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {coupons.map((c) => (
          <div
            key={c.code}
            className="relative rounded-2xl border border-primary/10 bg-white p-5 shadow-soft space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-light/50 text-primary">
                  <Tag className="h-4 w-4" />
                </div>
                <span className="font-heading text-base font-bold text-primary tracking-wider">
                  {c.code}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(c.code)}
                className="flex items-center gap-1 rounded-lg border border-primary/20 bg-rose-light/20 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-white transition"
              >
                {copiedCode === c.code ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs font-semibold text-ink">{c.description}</p>

            <div className="flex items-center justify-between border-t border-primary/5 pt-2.5 text-[11px] text-ink-muted">
              <span>Min order: {formatINR(c.minAmount)}</span>
              <span>Expires: {c.expiry}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
