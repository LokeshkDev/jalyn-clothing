import { useState, ref } from 'react'
import { Star, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'description', label: 'DESCRIPTION' },
  { id: 'fabric', label: 'FABRIC & CARE' },
  { id: 'sizeguide', label: 'SIZE GUIDE' },
  { id: 'shipping', label: 'SHIPPING & DELIVERY' },
  { id: 'returns', label: 'RETURN & EXCHANGE' },
  { id: 'reviews', label: 'REVIEWS (128)' },
]

export default function ProductTabsSection({ product, reviewsRef }) {
  const [activeTab, setActiveTab] = useState('description')

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
        'Great quality georgette blend with inner lining so it’s completely non-see-through. Highly recommended!',
    },
  ]

  return (
    <div ref={reviewsRef} className="mt-12 border-t border-primary/10 pt-8">
      {/* Horizontal Tabs Header */}
      <div className="flex border-b border-primary/10 overflow-x-auto scrollbar-none gap-6 sm:gap-8">
        {TABS.map((tab) => {
          const isSelected = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'pb-3.5 font-label text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap',
                isSelected
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-ink-muted hover:text-ink',
              )}
            >
              {tab.id === 'reviews' ? `REVIEWS (${product.reviews || 128})` : tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Body */}
      <div className="py-8">
        {activeTab === 'description' && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
            {/* Left Description & Specifications */}
            <div className="lg:col-span-8 space-y-6 text-sm text-ink-muted leading-relaxed">
              <p className="text-ink font-medium">
                {product.description ||
                  'This floral midi dress is designed to bring elegance and comfort together. Crafted from premium breathable fabric, it features a flattering silhouette, soft lining and beautiful floral print that makes it perfect for everyday outings, brunches, and special occasions.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6 rounded-2xl bg-surface p-5 border border-primary/5">
                {specs.map((spec) => (
                  <div key={spec.label} className="flex items-center gap-2 text-xs sm:text-sm">
                    <span className="font-bold text-ink w-20 shrink-0">{spec.label}:</span>
                    <span className="text-ink-muted">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Model Info Card */}
            <div className="lg:col-span-4">
              <div className="flex items-center gap-4 rounded-2xl border border-primary/10 bg-white p-5 shadow-sm">
                <img
                  src={product.images.primary}
                  alt="Model wearing outfit"
                  className="h-24 w-20 rounded-xl object-cover object-top shrink-0 border border-primary/10"
                />
                <div className="text-xs space-y-1">
                  <p className="font-label text-xs font-bold text-ink">Model is wearing:</p>
                  <p className="font-bold text-primary text-sm">Size S</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-ink-muted pt-1">
                    <span>Height: <strong className="text-ink">5'7"</strong></span>
                    <span>Bust: <strong className="text-ink">32"</strong></span>
                    <span>Waist: <strong className="text-ink">26"</strong></span>
                    <span>Hips: <strong className="text-ink">34"</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fabric' && (
          <div className="max-w-2xl space-y-4 text-sm text-ink-muted leading-relaxed">
            <h4 className="font-label text-base font-bold text-ink">Fabric & Composition</h4>
            <p>
              Made with 100% premium breathable cotton georgette blend. Features a lightweight,
              fluid drape with soft skin-friendly inner lining.
            </p>
            <h4 className="font-label text-base font-bold text-ink pt-2">Care Instructions</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Machine wash cold with like colors inside out</li>
              <li>Gentle cycle / Line dry in shade</li>
              <li>Do not bleach or tumble dry</li>
              <li>Warm iron if needed</li>
            </ul>
          </div>
        )}

        {activeTab === 'sizeguide' && (
          <div className="max-w-3xl space-y-4 text-sm">
            <h4 className="font-label text-base font-bold text-ink">Body Measurement Guide (Inches)</h4>
            <div className="overflow-x-auto rounded-xl border border-primary/10">
              <table className="w-full text-left text-xs text-ink">
                <thead className="bg-rose-light/30 font-label font-bold uppercase text-primary">
                  <tr>
                    <th className="p-3">Size</th>
                    <th className="p-3">Bust (in)</th>
                    <th className="p-3">Waist (in)</th>
                    <th className="p-3">Hips (in)</th>
                    <th className="p-3">Length (in)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  <tr><td className="p-3 font-bold">XS</td><td className="p-3">32</td><td className="p-3">26</td><td className="p-3">35</td><td className="p-3">44</td></tr>
                  <tr><td className="p-3 font-bold">S</td><td className="p-3">34</td><td className="p-3">28</td><td className="p-3">37</td><td className="p-3">45</td></tr>
                  <tr><td className="p-3 font-bold">M</td><td className="p-3">36</td><td className="p-3">30</td><td className="p-3">39</td><td className="p-3">45.5</td></tr>
                  <tr><td className="p-3 font-bold">L</td><td className="p-3">38</td><td className="p-3">32</td><td className="p-3">41</td><td className="p-3">46</td></tr>
                  <tr><td className="p-3 font-bold">XL</td><td className="p-3">40</td><td className="p-3">34</td><td className="p-3">43</td><td className="p-3">46.5</td></tr>
                  <tr><td className="p-3 font-bold">XXL</td><td className="p-3">42</td><td className="p-3">36</td><td className="p-3">45</td><td className="p-3">47</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="max-w-2xl space-y-3 text-sm text-ink-muted leading-relaxed">
            <h4 className="font-label text-base font-bold text-ink">Standard Shipping</h4>
            <p>Dispatched within 24 hours. Delivered in 3 to 5 business days across India.</p>
            <h4 className="font-label text-base font-bold text-ink pt-2">Express Delivery</h4>
            <p>Available at checkout for metro cities with 24–48 hour delivery.</p>
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="max-w-2xl space-y-3 text-sm text-ink-muted leading-relaxed">
            <h4 className="font-label text-base font-bold text-ink">7-Day Easy Returns & Exchanges</h4>
            <p>
              We want you to love your JALYN piece! If the size isn't right or you'd like a different style,
              we offer hassle-free returns & instant store credits or exchange pickup within 7 days of delivery.
            </p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-surface p-6 border border-primary/10">
              <div>
                <span className="font-display text-4xl font-bold text-ink">{product.rating}</span>
                <span className="text-sm text-ink-muted font-medium ml-1">/ 5.0</span>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <p className="text-xs text-ink-muted mt-1">Based on {product.reviews || 128} verified ratings</p>
              </div>

              <button
                type="button"
                className="rounded-xl bg-primary px-6 py-3 font-label text-xs font-bold uppercase tracking-wider text-white shadow-soft hover:bg-primary-deep"
              >
                Write a Review
              </button>
            </div>

            <div className="space-y-4">
              {mockReviews.map((rev) => (
                <div key={rev.id} className="rounded-2xl border border-primary/10 bg-white p-5 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-label text-sm font-bold text-ink">{rev.name}</span>
                      {rev.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-ink-muted">{rev.date}</span>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
