import { useState } from 'react'
import { MessageCircle, Mail, PhoneCall, ChevronDown, HelpCircle, Instagram, Facebook, Twitter, Youtube } from 'lucide-react'
import { WhatsAppIcon } from '@/components/ui/BrandIcons'
import { cn } from '@/lib/utils'
import { useCmsData } from '@/hooks/useCmsData'

export default function HelpSupport() {
  const [openFaqIndex, setOpenFaqIndex] = useState(0)
  const { helpSupportPage, footerSettings, contactPage } = useCmsData()

  const phone = footerSettings?.phone || contactPage?.phone || '+91 98765 43210'
  const email = footerSettings?.email || contactPage?.email || 'care@jalyn.in'
  const whatsapp = footerSettings?.whatsapp || contactPage?.whatsapp || '+91 98765 43210'
  const cleanWhatsapp = whatsapp.replace(/\D/g, '')

  const socialLinks = [
    { Icon: Instagram, label: 'Instagram', href: footerSettings?.instagram_link || 'https://www.instagram.com/jalyn.apparels/' },
    { Icon: Facebook, label: 'Facebook', href: footerSettings?.facebook_link || 'https://facebook.com/jalyn.apparels' },
    { Icon: WhatsAppIcon, label: 'WhatsApp', href: `https://wa.me/${cleanWhatsapp}` },
    { Icon: Twitter, label: 'Twitter', href: footerSettings?.twitter_link || '' },
    { Icon: Youtube, label: 'YouTube', href: footerSettings?.youtube_link || '' },
  ].filter((s) => s.href)

  const faqs = helpSupportPage?.faqs?.length
    ? helpSupportPage.faqs
    : [
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

      {/* Support Cards (CMS Data Driven) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <a
          href={`https://wa.me/${cleanWhatsapp}?text=Hi%20JALYN%2C%20I%20have%20an%20inquiry.`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[6px] border border-emerald-200 bg-emerald-50/40 p-5 shadow-xs hover:shadow-soft transition text-center block space-y-2 group"
        >
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366]/20 text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition">
            <FaWhatsapp className="h-5 w-5" />
          </div>
          <h4 className="font-bold text-ink text-sm">WhatsApp Support</h4>
          <p className="text-[11px] text-ink-muted">{whatsapp} (10 AM – 7 PM IST)</p>
          <span className="inline-block text-xs font-bold text-emerald-600 underline">Chat Now →</span>
        </a>

        <a
          href={`mailto:${email}`}
          className="rounded-[6px] border border-primary/10 bg-white p-5 shadow-xs hover:shadow-soft transition text-center block space-y-2 group"
        >
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-rose-light/50 text-primary group-hover:bg-primary group-hover:text-white transition">
            <Mail className="h-5 w-5" />
          </div>
          <h4 className="font-bold text-ink text-sm">Email Us</h4>
          <p className="text-[11px] text-ink-muted">{email} (Response within 24 hrs)</p>
          <span className="inline-block text-xs font-bold text-primary underline">Send Email →</span>
        </a>

        <a
          href={`tel:${phone.replace(/\s+/g, '')}`}
          className="rounded-[6px] border border-primary/10 bg-white p-5 shadow-xs hover:shadow-soft transition text-center block space-y-2 group"
        >
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
            <PhoneCall className="h-5 w-5" />
          </div>
          <h4 className="font-bold text-ink text-sm">Phone Support</h4>
          <p className="text-[11px] text-ink-muted">{phone} (Mon–Sat, 10 AM – 7 PM)</p>
          <span className="inline-block text-xs font-bold text-blue-600 underline">Call Now →</span>
        </a>
      </div>

      {/* Social Icons Bar (CMS Configured) */}
      {socialLinks.length > 0 && (
        <div className="rounded-[6px] border border-primary/10 bg-white p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            Connect With Us On Social Media
          </span>
          <div className="flex items-center gap-2.5">
            {socialLinks.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/15 bg-[#FFF6F9] text-primary transition hover:bg-primary hover:text-white shadow-xs"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* FAQs Section */}
      <div className="rounded-[6px] border border-primary/10 bg-white p-6 shadow-xs space-y-4">
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
                className="rounded-[6px] border border-primary/10 overflow-hidden bg-surface/50"
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
