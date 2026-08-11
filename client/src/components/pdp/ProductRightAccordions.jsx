import { useState } from 'react'
import { ChevronDown, Star, CheckCircle2, ShieldCheck, Sparkles, Truck, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ProductRightAccordions({ product, reviewsRef }) {
  const [openSections, setOpenSections] = useState({
    description: true,
    fabric: false,
    shipping: false,
    reviews: false,
  })

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const specs = [
    { label: 'Fabric', value: product?.fabric || 'Premium Breathable Cotton-Crepe' },
    { label: 'Sleeve Length', value: product?.sleeve || 'Short Puff Sleeves' },
    { label: 'Fit Type', value: product?.fit || 'Regular Flattering Fit' },
    { label: 'Pattern', value: product?.pattern || 'Floral Print' },
    { label: 'Lining', value: '100% Breathable Inner Lining Included' },
  ]

  const mockReviews = [
    {
      id: 1,
      name: 'Priya Sharma',
      rating: 5,
      date: '2 weeks ago',
      verified: true,
      comment:
        'Absolutely in love with this dress! The fabric is ultra soft and breathable. Fits true to size and looks even better in person.',
    },
    {
      id: 2,
      name: 'Ananya Verma',
      rating: 5,
      date: '1 month ago',
      verified: true,
      comment:
        'The color and floral pattern are gorgeous! Received so many compliments when I wore it to brunch last weekend.',
    },
    {
      id: 3,
      name: 'Rhea Kapoor',
      rating: 4,
      date: '1 month ago',
      verified: true,
      comment:
        'Great quality with inner lining so it’s completely non-see-through. Highly recommended!',
    },
  ]

  return (
    <div ref={reviewsRef} className="rounded-2xl border border-primary/15 bg-white p-4 shadow-sm space-y-1">
      {/* 1. DESCRIPTION ACCORDION */}
      <div className="border-b border-primary/10 last:border-b-0">
        <button
          type="button"
          onClick={() => toggleSection('description')}
          className="flex w-full items-center justify-between py-3.5 text-left font-label text-xs font-bold uppercase tracking-wider text-ink transition hover:text-primary"
        >
          <span>Description & Specifications</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-primary transition-transform duration-300',
              openSections.description && 'rotate-180',
            )}
          />
        </button>

        {openSections.description && (
          <div className="pb-4 text-xs text-ink-muted leading-relaxed space-y-3">
            <p>{product?.description || 'Thoughtfully designed for women who value both style and comfort.'}</p>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-primary/5">
              {specs.map((s, idx) => (
                <div key={idx} className="bg-rose-light/10 p-2 rounded-lg border border-primary/5">
                  <span className="font-semibold text-ink block text-[11px]">{s.label}</span>
                  <span className="text-[11px] text-ink-muted">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. FABRIC & CARE ACCORDION */}
      <div className="border-b border-primary/10 last:border-b-0">
        <button
          type="button"
          onClick={() => toggleSection('fabric')}
          className="flex w-full items-center justify-between py-3.5 text-left font-label text-xs font-bold uppercase tracking-wider text-ink transition hover:text-primary"
        >
          <span>Fabric & Wash Care</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-primary transition-transform duration-300',
              openSections.fabric && 'rotate-180',
            )}
          />
        </button>

        {openSections.fabric && (
          <div className="pb-4 text-xs text-ink-muted leading-relaxed space-y-2">
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li>Machine wash cold with like colors on gentle cycle</li>
              <li>Use mild detergent only, do not bleach</li>
              <li>Line dry in shade to preserve vibrant colors</li>
              <li>Cool iron on reverse side if needed</li>
            </ul>
          </div>
        )}
      </div>

      {/* 3. SHIPPING & RETURNS ACCORDION */}
      <div className="border-b border-primary/10 last:border-b-0">
        <button
          type="button"
          onClick={() => toggleSection('shipping')}
          className="flex w-full items-center justify-between py-3.5 text-left font-label text-xs font-bold uppercase tracking-wider text-ink transition hover:text-primary"
        >
          <span>Shipping & Easy 7-Day Returns</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-primary transition-transform duration-300',
              openSections.shipping && 'rotate-180',
            )}
          />
        </button>

        {openSections.shipping && (
          <div className="pb-4 text-xs text-ink-muted leading-relaxed space-y-2">
            <p>
              🚚 <strong className="text-ink">Free Express Shipping</strong> on all orders over ₹1999 across India.
            </p>
            <p>
              🔄 <strong className="text-ink">7-Day Easy Returns</strong>: Not satisfied with fit? Request exchange or full refund within 7 days.
            </p>
          </div>
        )}
      </div>

      {/* 4. CUSTOMER REVIEWS ACCORDION */}
      <div>
        <button
          type="button"
          onClick={() => toggleSection('reviews')}
          className="flex w-full items-center justify-between py-3.5 text-left font-label text-xs font-bold uppercase tracking-wider text-ink transition hover:text-primary"
        >
          <div className="flex items-center gap-2">
            <span>Customer Reviews</span>
            <span className="flex items-center text-primary font-bold text-[11px] bg-rose-light/50 px-2 py-0.5 rounded-full">
              <Star className="h-3 w-3 fill-primary mr-1" />
              {product?.rating || 4.8} ({product?.reviews || 124})
            </span>
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-primary transition-transform duration-300',
              openSections.reviews && 'rotate-180',
            )}
          />
        </button>

        {openSections.reviews && (
          <div className="pb-4 space-y-3">
            {mockReviews.map((r) => (
              <div key={r.id} className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-ink">
                    <span>{r.name}</span>
                    {r.verified && (
                      <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-normal bg-emerald-50 px-1.5 py-0.5 rounded">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Verified
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-ink-muted">{r.date}</span>
                </div>
                <div className="flex items-center text-primary">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-primary" />
                  ))}
                </div>
                <p className="text-[11px] text-ink-muted leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
