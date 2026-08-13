import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import {
  Truck,
  RotateCcw,
  Ruler,
  PackageCheck,
  ShieldCheck,
  FileText,
  CreditCard,
  Award,
  Leaf,
  Newspaper,
  Briefcase,
  Search,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react'

const POLICY_TABS = [
  { id: 'shipping-delivery', label: 'Shipping & Delivery', icon: Truck },
  { id: 'returns-exchanges', label: 'Returns & Exchanges', icon: RotateCcw },
  { id: 'track-order', label: 'Track Order', icon: PackageCheck },
  { id: 'size-guide', label: 'Size Guide', icon: Ruler },
  { id: 'craftsmanship', label: 'Craftsmanship', icon: Award },
  { id: 'sustainability', label: 'Sustainability', icon: Leaf },
  { id: 'press-media', label: 'Press & Media', icon: Newspaper },
  { id: 'careers', label: 'Careers', icon: Briefcase },
  { id: 'privacy-policy', label: 'Privacy Policy', icon: ShieldCheck },
  { id: 'terms-of-service', label: 'Terms of Service', icon: FileText },
  { id: 'refund-policy', label: 'Refund Policy', icon: CreditCard },
]

export default function PolicyPage({ initialTab }) {
  const location = useLocation()
  const navigate = useNavigate()

  // Determine active tab from URL path or prop
  const currentPath = location.pathname.replace(/^\//, '')
  const matchedTab = POLICY_TABS.find((t) => t.id === currentPath || t.id === initialTab)
  const activeTabId = matchedTab ? matchedTab.id : 'shipping-delivery'

  // Track Order State
  const [orderNumber, setOrderNumber] = useState('')
  const [trackResult, setTrackResult] = useState(null)
  const [trackingLoading, setTrackingLoading] = useState(false)

  const handleTrack = (e) => {
    e.preventDefault()
    if (!orderNumber.trim()) return
    setTrackingLoading(true)
    setTimeout(() => {
      setTrackingLoading(false)
      setTrackResult({
        id: orderNumber,
        status: 'In Transit',
        carrier: 'BlueDart Express',
        awb: 'BD982736152IN',
        estDelivery: 'Tomorrow by 6:00 PM',
        timeline: [
          { status: 'Order Confirmed', date: 'Yesterday, 10:30 AM', done: true },
          { status: 'Quality Inspection & Packed', date: 'Yesterday, 4:15 PM', done: true },
          { status: 'Dispatched from Mumbai Studio', date: 'Today, 8:00 AM', done: true },
          { status: 'Out for Local Delivery', date: 'Expected Tomorrow', done: false },
        ],
      })
    }, 800)
  }

  return (
    <div className="bg-[#FAF7F5] min-h-screen text-[#2D2424] font-sans py-12 md:py-20">
      <div className="container-luxury">
        {/* Header Breadcrumb & Title */}
        <div className="mb-10 text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C28E5C]">
            Customer Support & Policies
          </span>
          <h1 className="text-3xl md:text-4xl font-serif text-[#2C1C24]">
            {POLICY_TABS.find((t) => t.id === activeTabId)?.label || 'Information'}
          </h1>
          <div className="w-12 h-0.5 bg-[#D4A373] mx-auto mt-2" />
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Navigation Sidebar Tabs */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#EFE8E2] p-3 shadow-sm space-y-1">
            {POLICY_TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTabId === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(`/${tab.id}`)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#2C1C24] text-white shadow'
                      : 'text-gray-700 hover:bg-[#FAF0E6] hover:text-[#C28E5C]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#E8C5A8]' : 'text-gray-400'}`} />
                    {tab.label}
                  </span>
                  <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-300'}`} />
                </button>
              )
            })}
          </div>

          {/* Policy Detail Panel */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-[#EFE8E2] p-8 md:p-12 shadow-sm min-h-[500px]">
            {/* 1. SHIPPING & DELIVERY */}
            {activeTabId === 'shipping-delivery' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif text-[#2C1C24]">Shipping & Delivery Policy</h2>
                <p className="text-sm text-gray-600 leading-relaxed font-light">
                  At JALYN, every order is treated with utmost care. Our garments are inspected and dispatched directly from our Mumbai studio in sustainable luxury packaging.
                </p>

                <div className="grid sm:grid-cols-2 gap-4 my-6">
                  <div className="p-5 rounded-2xl bg-[#FAF7F5] border border-[#EFE8E2]">
                    <h4 className="font-semibold text-sm text-[#2C1C24]">Standard Domestic Shipping</h4>
                    <p className="text-xs text-gray-500 mt-1">3 – 5 Business Days</p>
                    <p className="text-xs text-[#C28E5C] font-semibold mt-2">FREE on orders above ₹1,999</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#FAF7F5] border border-[#EFE8E2]">
                    <h4 className="font-semibold text-sm text-[#2C1C24]">Express Shipping</h4>
                    <p className="text-xs text-gray-500 mt-1">1 – 2 Business Days (Metro Cities)</p>
                    <p className="text-xs text-gray-600 mt-2">Nominal fee of ₹150</p>
                  </div>
                </div>

                <h3 className="text-lg font-serif text-[#2C1C24] pt-4 border-t border-gray-100">Tracking Your Package</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-light">
                  Once dispatched, you will receive an SMS and email containing your AWB tracking number and live order link. You can also track directly via our website using the <Link to="/track-order" className="text-[#C28E5C] font-medium underline">Track Order</Link> section.
                </p>
              </div>
            )}

            {/* 2. RETURNS & EXCHANGES */}
            {activeTabId === 'returns-exchanges' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif text-[#2C1C24]">Returns & Exchanges Policy</h2>
                <p className="text-sm text-gray-600 leading-relaxed font-light">
                  We want you to love your JALYN purchase. If the fit or style isn’t perfect, we offer a hassle-free 7-day return & exchange window.
                </p>

                <div className="p-6 rounded-2xl bg-[#FFF6F9] border border-rose-100 space-y-3">
                  <h4 className="font-semibold text-sm text-[#4A2F3C] flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-[#C28E5C]" /> 7-Day Easy Return Guarantee
                  </h4>
                  <ul className="text-xs text-gray-600 space-y-2 list-disc list-inside font-light">
                    <li>Items must be unworn, unwashed, and in original condition with tags attached.</li>
                    <li>Reverse doorstep pickup will be arranged by our logistics partners.</li>
                    <li>Exchanges for a different size are complimentary with zero extra delivery fee.</li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-serif text-[#2C1C24]">How to Request a Return</h3>
                  <p className="text-sm text-gray-600 font-light mt-2">
                    Go to <Link to="/profile/orders" className="text-[#C28E5C] font-medium underline">My Orders</Link> section in your profile or email <a href="mailto:support@jalyn.in" className="text-[#C28E5C] underline">support@jalyn.in</a> with your Order ID.
                  </p>
                </div>
              </div>
            )}

            {/* 3. TRACK ORDER */}
            {activeTabId === 'track-order' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif text-[#2C1C24]">Track Your Order Status</h2>
                <p className="text-sm text-gray-600 font-light">
                  Enter your Order Number (e.g. #JALYN-1001 or JALYN-8492) below to view live dispatch status.
                </p>

                <form onSubmit={handleTrack} className="flex gap-3 max-w-md">
                  <input
                    type="text"
                    required
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="Enter Order ID (e.g. JALYN-1001)"
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C28E5C] outline-none text-sm"
                  />
                  <button
                    type="submit"
                    disabled={trackingLoading}
                    className="bg-[#2C1C24] hover:bg-[#4A2F3C] text-white px-6 py-3 rounded-xl text-sm font-medium transition shrink-0"
                  >
                    {trackingLoading ? 'Searching...' : 'Track'}
                  </button>
                </form>

                {trackResult && (
                  <div className="mt-8 p-6 rounded-2xl bg-[#FAF7F5] border border-[#EFE8E2] space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200">
                      <div>
                        <span className="text-xs text-gray-500 font-semibold uppercase">Order Reference</span>
                        <h4 className="font-serif text-lg text-[#2C1C24]">{trackResult.id}</h4>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 font-semibold uppercase">Carrier</span>
                        <p className="text-sm font-medium text-gray-800">{trackResult.carrier} ({trackResult.awb})</p>
                      </div>
                      <div className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                        {trackResult.status}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-4">
                      {trackResult.timeline.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 ${step.done ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                            ✓
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${step.done ? 'text-[#2C1C24]' : 'text-gray-400'}`}>{step.status}</p>
                            <p className="text-xs text-gray-500">{step.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. SIZE GUIDE */}
            {activeTabId === 'size-guide' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif text-[#2C1C24]">Women's Size Measurement Guide</h2>
                <p className="text-sm text-gray-600 font-light leading-relaxed">
                  All measurements are listed in inches. Compare your body measurements with our chart below to determine your ideal size.
                </p>

                <div className="overflow-x-auto rounded-2xl border border-[#EFE8E2]">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-[#2C1C24] text-white">
                      <tr>
                        <th className="p-3.5 font-semibold">Size</th>
                        <th className="p-3.5 font-semibold">Bust (in)</th>
                        <th className="p-3.5 font-semibold">Waist (in)</th>
                        <th className="p-3.5 font-semibold">Hip (in)</th>
                        <th className="p-3.5 font-semibold">Shoulder (in)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      <tr className="hover:bg-[#FAF7F5]">
                        <td className="p-3.5 font-bold text-[#C28E5C]">XS (32)</td>
                        <td className="p-3.5">32 - 33</td>
                        <td className="p-3.5">26 - 27</td>
                        <td className="p-3.5">35 - 36</td>
                        <td className="p-3.5">13.5</td>
                      </tr>
                      <tr className="hover:bg-[#FAF7F5]">
                        <td className="p-3.5 font-bold text-[#C28E5C]">S (34)</td>
                        <td className="p-3.5">34 - 35</td>
                        <td className="p-3.5">28 - 29</td>
                        <td className="p-3.5">37 - 38</td>
                        <td className="p-3.5">14.0</td>
                      </tr>
                      <tr className="hover:bg-[#FAF7F5]">
                        <td className="p-3.5 font-bold text-[#C28E5C]">M (36)</td>
                        <td className="p-3.5">36 - 37</td>
                        <td className="p-3.5">30 - 31</td>
                        <td className="p-3.5">39 - 40</td>
                        <td className="p-3.5">14.5</td>
                      </tr>
                      <tr className="hover:bg-[#FAF7F5]">
                        <td className="p-3.5 font-bold text-[#C28E5C]">L (38)</td>
                        <td className="p-3.5">38 - 39</td>
                        <td className="p-3.5">32 - 33</td>
                        <td className="p-3.5">41 - 42</td>
                        <td className="p-3.5">15.0</td>
                      </tr>
                      <tr className="hover:bg-[#FAF7F5]">
                        <td className="p-3.5 font-bold text-[#C28E5C]">XL (40)</td>
                        <td className="p-3.5">40 - 42</td>
                        <td className="p-3.5">34 - 36</td>
                        <td className="p-3.5">43 - 45</td>
                        <td className="p-3.5">15.5</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-5 rounded-2xl bg-[#FAF0E6] text-xs text-gray-700 space-y-1">
                  <p className="font-semibold text-[#2C1C24]">Fit Tip:</p>
                  <p>If your measurements fall between two sizes, we recommend selecting the larger size for a comfortable, relaxed fit.</p>
                </div>
              </div>
            )}

            {/* 5. CRAFTSMANSHIP */}
            {activeTabId === 'craftsmanship' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif text-[#2C1C24]">The Art of JALYN Craftsmanship</h2>
                <p className="text-sm text-gray-600 leading-relaxed font-light">
                  Every JALYN creation celebrates Indian textile heritage combined with contemporary precision tailoring. Our master embroiderers work with intricate Zardozi, Threadwork, and Gota Patti to turn fabrics into wearable heirlooms.
                </p>
                <div className="aspect-video rounded-2xl overflow-hidden shadow">
                  <img
                    src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80"
                    alt="Craftsmanship"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* 6. SUSTAINABILITY */}
            {activeTabId === 'sustainability' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif text-[#2C1C24]">Our Commitment to Sustainability</h2>
                <p className="text-sm text-gray-600 leading-relaxed font-light">
                  We believe true luxury must respect the planet. JALYN operates on a small-batch model, reducing overproduction and minimizing textile waste. All our packaging is 100% plastic-free and biodegradable.
                </p>
                <div className="aspect-video rounded-2xl overflow-hidden shadow">
                  <img
                    src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80"
                    alt="Sustainability"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* 7. PRESS & MEDIA */}
            {activeTabId === 'press-media' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif text-[#2C1C24]">Press & Media Features</h2>
                <p className="text-sm text-gray-600 leading-relaxed font-light">
                  For press inquiries, editorial sample requests, or brand collaborations, please write to us at <a href="mailto:press@jalyn.in" className="text-[#C28E5C] font-semibold underline">press@jalyn.in</a>.
                </p>
              </div>
            )}

            {/* 8. CAREERS */}
            {activeTabId === 'careers' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif text-[#2C1C24]">Join the JALYN Team</h2>
                <p className="text-sm text-gray-600 leading-relaxed font-light">
                  We are always seeking passionate designers, merchandisers, and digital creators to join our growing team in Mumbai. Send your portfolio and resume to <a href="mailto:careers@jalyn.in" className="text-[#C28E5C] font-semibold underline">careers@jalyn.in</a>.
                </p>
              </div>
            )}

            {/* 9. PRIVACY POLICY */}
            {activeTabId === 'privacy-policy' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif text-[#2C1C24]">Privacy Policy</h2>
                <p className="text-sm text-gray-600 leading-relaxed font-light">
                  Your privacy is paramount to us. JALYN Apparels collects only necessary information required to process your orders, process payments securely, and deliver exceptional service. We never sell or share your personal data with third-party advertisers.
                </p>
              </div>
            )}

            {/* 10. TERMS OF SERVICE */}
            {activeTabId === 'terms-of-service' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif text-[#2C1C24]">Terms of Service</h2>
                <p className="text-sm text-gray-600 leading-relaxed font-light">
                  By visiting our website and placing an order, you agree to be bound by our standard terms and conditions. All prices displayed are inclusive of GST. Product colors may slightly vary due to studio lighting and monitor settings.
                </p>
              </div>
            )}

            {/* 11. REFUND POLICY */}
            {activeTabId === 'refund-policy' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif text-[#2C1C24]">Refund Policy</h2>
                <p className="text-sm text-gray-600 leading-relaxed font-light">
                  Once your returned product passes quality inspection at our warehouse, your refund will be credited back to your original payment method (Credit Card, Debit Card, UPI, Netbanking) within 5 – 7 business days.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
