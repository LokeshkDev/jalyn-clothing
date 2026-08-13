import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  FileText,
  Shirt,
  Ruler,
  Truck,
  RotateCcw,
  Star,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ACCORDION_ICONS = {
  description: FileText,
  fabric: Shirt,
  sizeguide: Ruler,
  shipping: Truck,
  returns: RotateCcw,
  reviews: Star,
}

export default function MobileProductAccordions({ product, reviewsRef }) {
  const [openId, setOpenId] = useState(null)

  const toggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id))
  }

  const specs = [
    { label: 'Fabric', value: product.fabric || 'Premium Cotton Blend' },
    { label: 'Length', value: 'Midi Length' },
    { label: 'Neckline', value: 'V-Neck' },
    { label: 'Sleeve', value: product.sleeve || 'Short Puff Sleeves' },
    { label: 'Fit', value: product.fit || 'Regular Fit' },
    { label: 'Lining', value: 'Soft Inner Lining' },
    { label: 'Pattern', value: product.pattern || 'Floral Print' },
  ]

  const mockReviews = [
    {
      id: 1,
      name: 'Ananya Sharma',
      rating: 5,
      date: '2 weeks ago',
      verified: true,
      comment:
        'Absolutely in love with this dress! The fabric is ultra soft and breathable. Fits true to size and looks even better in person.',
    },
    {
      id: 2,
      name: 'Rhea Kapoor',
      rating: 5,
      date: '1 month ago',
      verified: true,
      comment:
        'The color and floral pattern are gorgeous! Received so many compliments when I wore it to brunch last weekend.',
    },
    {
      id: 3,
      name: 'Pooja Verma',
      rating: 4,
      date: '1 month ago',
      verified: true,
      comment:
        'Great quality georgette blend with inner lining so it\'s completely non-see-through. Highly recommended!',
    },
  ]

  const sections = [
    {
      id: 'description',
      label: 'Description',
      content: (
        <div className="space-y-3 text-[13px] leading-relaxed text-[#666666]">
          <p className="text-[#222222] font-medium">
            {product.description ||
              'This floral midi dress is designed to bring elegance and comfort together. Crafted from premium breathable fabric, it features a flattering silhouette, soft lining and beautiful floral print that makes it perfect for everyday outings, brunches, and special occasions.'}
          </p>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 rounded-xl bg-[#FAF8F8] p-3 border border-primary/5">
            {specs.map((spec) => (
              <div key={spec.label} className="flex items-start gap-1.5 text-[12px]">
                <span className="font-bold text-[#222222] shrink-0">{spec.label}:</span>
                <span className="text-[#666666]">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'fabric',
      label: 'Fabric & Care',
      content: (
        <div className="space-y-3 text-[13px] leading-relaxed text-[#666666]">
          <div>
            <h5 className="font-bold text-[#222222] mb-1">Fabric & Composition</h5>
            <p>
              Made with 100% premium breathable cotton georgette blend. Features a lightweight,
              fluid drape with soft skin-friendly inner lining.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-[#222222] mb-1">Care Instructions</h5>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Machine wash cold with like colors inside out</li>
              <li>Gentle cycle / Line dry in shade</li>
              <li>Do not bleach or tumble dry</li>
              <li>Warm iron if needed</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'shipping',
      label: 'Shipping & Delivery',
      content: (
        <div className="space-y-2 text-[13px] leading-relaxed text-[#666666]">
          <div>
            <h5 className="font-bold text-[#222222] mb-0.5">Standard Shipping</h5>
            <p>Dispatched within 24 hours. Delivered in 3 to 5 business days across India.</p>
          </div>
          <div>
            <h5 className="font-bold text-[#222222] mb-0.5">Express Delivery</h5>
            <p>Available at checkout for metro cities with 24–48 hour delivery.</p>
          </div>
        </div>
      ),
    },
    {
      id: 'returns',
      label: 'Return & Exchange',
      content: (
        <div className="space-y-2 text-[13px] leading-relaxed text-[#666666]">
          <h5 className="font-bold text-[#222222]">7-Day Easy Returns & Exchanges</h5>
          <p>
            We want you to love your JALYN piece! If the size isn't right or you'd like a different
            style, we offer hassle-free returns & instant store credits or exchange pickup within 7
            days of delivery.
          </p>
        </div>
      ),
    },
    {
      id: 'reviews',
      label: `Reviews (${product.reviews || 128})`,
      content: (
        <div className="space-y-4" ref={reviewsRef}>
          {/* Rating Summary */}
          <div className="flex items-center gap-4 rounded-xl bg-[#FAF8F8] p-4 border border-primary/10">
            <div>
              <span className="font-display text-3xl font-bold text-[#222222]">
                {product.rating}
              </span>
              <span className="text-[12px] text-[#666666] ml-1">/ 5.0</span>
              <div className="mt-1 flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                ))}
              </div>
              <p className="mt-1 text-[11px] text-[#666666]">
                Based on {product.reviews || 128} verified ratings
              </p>
            </div>
          </div>

          {/* Reviews List */}
          {mockReviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-xl border border-primary/10 bg-white p-3.5 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-bold text-[#222222]">{rev.name}</span>
                  {rev.verified && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#666666]">{rev.date}</span>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: rev.rating }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-[12px] text-[#666666] leading-relaxed">{rev.comment}</p>
            </div>
          ))}
        </div>
      ),
    },
  ]

  return (
    <div className="mx-4 overflow-hidden rounded-2xl border border-primary/10 bg-white">
      {sections.map((section, idx) => {
        const isOpen = openId === section.id
        const Icon = ACCORDION_ICONS[section.id] || FileText
        return (
          <div
            key={section.id}
            className={idx > 0 ? 'border-t border-primary/5' : ''}
          >
            <button
              type="button"
              onClick={() => toggle(section.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-[#FAF8F8]/50 transition-colors"
              style={{ minHeight: '54px' }}
            >
              <Icon className="h-4 w-4 shrink-0 text-primary" />
              <span className="flex-1 text-[14px] font-semibold text-[#222222]">
                {section.label}
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 shrink-0 text-[#666666] transition-transform duration-300',
                  isOpen && 'rotate-180',
                )}
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-0.5">{section.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
