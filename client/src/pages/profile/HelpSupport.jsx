import { useState } from 'react'
import { MessageCircle, Mail, PhoneCall, ChevronDown, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function HelpSupport() {
  const [openFaqIndex, setOpenFaqIndex] = useState(0)

  const faqs = [
    {
      q: 'How do I track my order?',
      a: 'You can track your order by navigating to My Orders -> View Details. We also send live WhatsApp and email updates once your order is dispatched.',
    },
    {
      q: 'What is the return policy for JALYN items?',
      a: 'We offer a 7-day hassle-free return and exchange policy from the date of delivery. Items must be unworn with original tags attached.',
    },
    {
      q: 'Are custom size alterations available?',
      a: 'Yes! Please check our Size Guide or reach out to our WhatsApp support team with your custom measurements before placing your order.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept Online Payments (UPI, Credit/Debit Cards, Net Banking, Wallets) as well as Cash on Delivery (COD) across India.',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-ink">Help & Support</h2>
        <p className="text-xs text-ink-muted">We are here to assist you with any questions or order concerns</p>
      </div>

      {/* Support Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <a
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border border-primary/10 bg-white p-5 shadow-soft hover:shadow-lift transition text-center block space-y-2"
        >
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <MessageCircle className="h-5 w-5" />
          </div>
          <h4 className="font-bold text-ink text-sm">WhatsApp Support</h4>
          <p className="text-[11px] text-ink-muted">Chat with our stylist team (9 AM – 9 PM)</p>
          <span className="inline-block text-xs font-bold text-emerald-600 underline">Chat Now →</span>
        </a>

        <a
          href="mailto:support@jalyn.in"
          className="rounded-2xl border border-primary/10 bg-white p-5 shadow-soft hover:shadow-lift transition text-center block space-y-2"
        >
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-rose-light/50 text-primary">
            <Mail className="h-5 w-5" />
          </div>
          <h4 className="font-bold text-ink text-sm">Email Us</h4>
          <p className="text-[11px] text-ink-muted">support@jalyn.in (Response within 24 hrs)</p>
          <span className="inline-block text-xs font-bold text-primary underline">Send Email →</span>
        </a>

        <a
          href="tel:1800123456"
          className="rounded-2xl border border-primary/10 bg-white p-5 shadow-soft hover:shadow-lift transition text-center block space-y-2"
        >
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <PhoneCall className="h-5 w-5" />
          </div>
          <h4 className="font-bold text-ink text-sm">Toll-Free Support</h4>
          <p className="text-[11px] text-ink-muted">1800-123-456 (Mon–Sat, 10 AM – 7 PM)</p>
          <span className="inline-block text-xs font-bold text-blue-600 underline">Call Now →</span>
        </a>
      </div>

      {/* FAQs Section */}
      <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-soft space-y-4">
        <h3 className="font-heading text-base font-bold text-ink flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="space-y-3 pt-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx
            return (
              <div
                key={idx}
                className="rounded-xl border border-primary/10 overflow-hidden bg-surface/50"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                  className="flex w-full items-center justify-between p-4 text-left font-bold text-ink text-xs sm:text-sm hover:text-primary transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-ink-muted transition-transform duration-300',
                      isOpen && 'rotate-180 text-primary',
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-ink-muted leading-relaxed border-t border-primary/5 pt-2">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
