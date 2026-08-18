import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  FileText,
  CreditCard,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import { useCmsData } from '@/hooks/useCmsData'

const POLICY_TABS = [
  { id: 'shipping-delivery', label: 'Shipping & Delivery', icon: Truck },
  { id: 'returns-exchanges', label: 'Returns & Exchanges', icon: RotateCcw },
  { id: 'privacy-policy', label: 'Privacy Policy', icon: ShieldCheck },
  { id: 'terms-of-service', label: 'Terms of Service', icon: FileText },
  { id: 'refund-policy', label: 'Refund Policy', icon: CreditCard },
]

const DEFAULT_POLICY_CONTENT = {
  'shipping-delivery': {
    title: 'Shipping & Delivery Policy',
    content_html: `
      <p>At JALYN, every order is treated with utmost care. Our garments are inspected and dispatched directly from our Mumbai studio in sustainable luxury packaging.</p>
      <div class="grid sm:grid-cols-2 gap-4 my-6">
        <div class="p-5 rounded-2xl bg-[#FAF7F5] border border-[#EFE8E2]">
          <h4 class="font-semibold text-sm text-[#2C1C24]">Standard Domestic Shipping</h4>
          <p class="text-xs text-gray-500 mt-1">3 – 5 Business Days</p>
          <p class="text-xs text-[#C28E5C] font-semibold mt-2">FREE on orders above ₹1,999</p>
        </div>
        <div class="p-5 rounded-2xl bg-[#FAF7F5] border border-[#EFE8E2]">
          <h4 class="font-semibold text-sm text-[#2C1C24]">Express Shipping</h4>
          <p class="text-xs text-gray-500 mt-1">1 – 2 Business Days (Metro Cities)</p>
          <p class="text-xs text-gray-600 mt-2">Nominal fee of ₹150</p>
        </div>
      </div>
      <h3 class="text-lg font-serif text-[#2C1C24] pt-4 border-t border-gray-100">Tracking Your Package</h3>
      <p>Once dispatched, you will receive an SMS and email containing your AWB tracking number and live order link. For any tracking assistance, please email <a href="mailto:support@jalyn.in" class="text-[#C28E5C] font-medium underline">support@jalyn.in</a> with your Order ID.</p>
    `,
  },
  'returns-exchanges': {
    title: 'Returns & Exchanges Policy',
    content_html: `
      <p>We want you to love your JALYN purchase. If the fit or style isn’t perfect, we offer a hassle-free 7-day return &amp; exchange window.</p>
      <div class="p-6 rounded-2xl bg-[#FFF6F9] border border-rose-100 space-y-3">
        <h4 class="font-semibold text-sm text-[#4A2F3C] flex items-center gap-2">7-Day Easy Return Guarantee</h4>
        <ul class="text-xs text-gray-600 space-y-2 list-disc list-inside font-light">
          <li>Items must be unworn, unwashed, and in original condition with tags attached.</li>
          <li>Reverse doorstep pickup will be arranged by our logistics partners.</li>
          <li>Exchanges for a different size are complimentary with zero extra delivery fee.</li>
        </ul>
      </div>
      <div class="pt-4 border-t border-gray-100">
        <h3 class="text-lg font-serif text-[#2C1C24]">How to Request a Return</h3>
        <p class="text-sm text-gray-600 font-light mt-2">Go to <a href="/profile/orders" class="text-[#C28E5C] font-medium underline">My Orders</a> section in your profile or email <a href="mailto:support@jalyn.in" class="text-[#C28E5C] underline">support@jalyn.in</a> with your Order ID.</p>
      </div>
    `,
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    content_html: `
      <p>Your privacy is paramount to us. JALYN Apparels collects only necessary information required to process your orders, process payments securely, and deliver exceptional service. We never sell or share your personal data with third-party advertisers.</p>
    `,
  },
  'terms-of-service': {
    title: 'Terms of Service',
    content_html: `
      <p>By visiting our website and placing an order, you agree to be bound by our standard terms and conditions. All prices displayed are inclusive of GST. Product colors may slightly vary due to studio lighting and monitor settings.</p>
    `,
  },
  'refund-policy': {
    title: 'Refund Policy',
    content_html: `
      <p>Once your returned product passes quality inspection at our warehouse, your refund will be credited back to your original payment method (Credit Card, Debit Card, UPI, Netbanking) within 5 – 7 business days.</p>
    `,
  },
}

export default function PolicyPage({ initialTab }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { policyPages } = useCmsData()

  // Determine active tab from URL path or prop
  const currentPath = location.pathname.replace(/^\//, '')
  const matchedTab = POLICY_TABS.find((t) => t.id === currentPath || t.id === initialTab)
  const activeTabId = matchedTab ? matchedTab.id : 'shipping-delivery'

  const [openMobileTab, setOpenMobileTab] = useState(activeTabId)

  useEffect(() => {
    setOpenMobileTab(activeTabId)
  }, [activeTabId])

  const cmsPage = policyPages?.[activeTabId] || {}
  const fallbackPage = DEFAULT_POLICY_CONTENT[activeTabId] || {}
  const pageTitle =
    cmsPage.title ||
    fallbackPage.title ||
    POLICY_TABS.find((t) => t.id === activeTabId)?.label ||
    'Information'
  const contentHtml = cmsPage.content_html || fallbackPage.content_html || ''

  return (
    <div className="bg-[#FAF7F5] min-h-screen text-[#2D2424] font-sans py-8 md:py-10">
      <div className="container-luxury max-w-7xl px-4 sm:px-6">
        {/* Header Breadcrumb & Title */}
        <div className="mb-6 text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C28E5C]">
            Customer Support & Policies
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#2C1C24]">
            {POLICY_TABS.find((t) => t.id === activeTabId)?.label || 'Information'}
          </h1>
          <div className="w-12 h-0.5 bg-[#D4A373] mx-auto mt-2" />
        </div>

        {/* MOBILE VIEW (< lg): Accordion Collapse Redesign */}
        <div className="block lg:hidden space-y-3">
          {POLICY_TABS.map((tab) => {
            const Icon = tab.icon
            const isExpanded = openMobileTab === tab.id
            const tabCms = policyPages?.[tab.id] || {}
            const tabFallback = DEFAULT_POLICY_CONTENT[tab.id] || {}
            const tabTitle = tabCms.title || tabFallback.title || tab.label
            const tabHtml = tabCms.content_html || tabFallback.content_html || ''

            return (
              <div
                key={tab.id}
                className="rounded-[6px] bg-white border border-[#EFE8E2] overflow-hidden shadow-xs"
              >
                {/* Accordion Header Button */}
                <button
                  type="button"
                  onClick={() => {
                    setOpenMobileTab(isExpanded ? null : tab.id)
                    navigate(`/${tab.id}`, { replace: true })
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 text-left text-xs font-bold transition cursor-pointer ${
                    isExpanded
                      ? 'bg-[#2C1C24] text-white'
                      : 'bg-white text-[#2C1C24] hover:bg-[#FAF0E6]/60'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isExpanded ? 'text-[#E8C5A8]' : 'text-[#C28E5C]'}`} />
                    <span className="font-semibold text-sm">{tab.label}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isExpanded ? 'rotate-180 text-white' : 'text-gray-400'
                    }`}
                  />
                </button>

                {/* Accordion Content Body */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-white border-t border-[#EFE8E2] space-y-3.5">
                    <h3 className="text-base font-serif text-[#2C1C24] font-bold">{tabTitle}</h3>
                    <div
                      className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light space-y-3 [&_a]:text-[#C28E5C] [&_a]:underline [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-1.5"
                      dangerouslySetInnerHTML={{ __html: tabHtml }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* DESKTOP VIEW (>= lg): Col-3 Sticky Navigation + Col-9 Policy Content Card */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6 items-start">
          {/* Navigation Sidebar Tabs (Col-3 Sticky) */}
          <div className="lg:col-span-3 sticky top-24 bg-white rounded-[6px] border border-[#EFE8E2] p-2.5 shadow-sm space-y-1">
            {POLICY_TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTabId === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(`/${tab.id}`)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[6px] text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-[#2C1C24] text-white shadow'
                      : 'text-gray-700 hover:bg-[#FAF0E6] hover:text-[#C28E5C]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E8C5A8]' : 'text-gray-400'}`} />
                    {tab.label}
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-300'}`} />
                </button>
              )
            })}
          </div>

          {/* Policy Detail Panel (Col-9) — content editable from Admin CMS */}
          <div className="lg:col-span-9 bg-white rounded-[6px] border border-[#EFE8E2] p-6 md:p-8 shadow-sm min-h-[500px]">
            <div className="space-y-6">
              <h2 className="text-2xl font-serif text-[#2C1C24]">{pageTitle}</h2>
              <div
                className="text-sm text-gray-600 leading-relaxed font-light space-y-4 [&_a]:text-[#C28E5C] [&_a]:underline [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-2"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
