import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  ChevronDown,
} from 'lucide-react'
import logo from '@/assets/jalyn-logo.png'
import { FOOTER_LINKS } from '@/constants/data'
import { useCmsData } from '@/hooks/useCmsData'
import {
  WhatsAppIcon,
  VisaIcon,
  MastercardIcon,
  AmexIcon,
  GooglePayIcon,
  PhonePeIcon,
  RazorpayIcon,
} from '@/components/ui/BrandIcons'

const defaultColumns = [
  { title: 'Customer Care', links: FOOTER_LINKS.column1 },
  { title: 'About Jalyn', links: FOOTER_LINKS.column2 },
  { title: 'Policies & Legal', links: FOOTER_LINKS.column3 },
  {
    title: 'My Account',
    links: [
      { label: 'My Orders', href: '/profile/orders' },
      { label: 'My Wishlist', href: '/profile/wishlist' },
      { label: 'Addresses', href: '/profile/addresses' },
      { label: 'Returns', href: '/profile/returns' },
      { label: 'Help & Support', href: '/profile/help' },
    ],
  },
]

export default function Footer() {
  const { footerSettings } = useCmsData()
  const [openSections, setOpenSections] = useState([0])

  const aboutText = footerSettings?.about_text || "Effortless style. Everyday comfort. Premium women's fashion designed to feel as good as it looks."
  const phone = footerSettings?.phone || '+91 98765 43210'
  const email = footerSettings?.email || 'care@jalyn.in'
  const whatsapp = footerSettings?.whatsapp || '+91 98765 43210'
  const cleanWhatsappNumber = whatsapp.replace(/\D/g, '')

  const columns = (footerSettings?.columns?.length ? footerSettings.columns : defaultColumns)
    .filter((col) => col.links?.length > 0)
  if (!columns.some((c) => (c.title || '').toLowerCase() === 'my account')) {
    columns.push(defaultColumns[3])
  }

  const socialLinks = [
    { Icon: Instagram, label: 'Instagram', href: footerSettings?.instagram_link || 'https://www.instagram.com/jalyn.apparels/' },
    { Icon: Facebook, label: 'Facebook', href: footerSettings?.facebook_link || 'https://facebook.com/jalyn.apparels' },
    { Icon: WhatsAppIcon, label: 'WhatsApp', href: `https://wa.me/${cleanWhatsappNumber}` },
    { Icon: Twitter, label: 'Twitter', href: footerSettings?.twitter_link || '' },
    { Icon: Youtube, label: 'YouTube', href: footerSettings?.youtube_link || '' },
  ].filter((s) => s.href)

  const toggleSection = (idx) => {
    setOpenSections((prev) => prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx])
  }

  const brandBlock = (
    <div className="space-y-4">
      <Link to="/" aria-label="JALYN home" className="inline-block rounded-2xl bg-white p-2.5 shadow-md border border-white/20">
        <img
          src={footerSettings?.logo_url || logo}
          alt="JALYN — Style meets comfort"
          className="h-9 w-auto object-contain sm:h-10"
          width={160}
          height={44}
        />
      </Link>

      {aboutText && (
        <p className="text-xs sm:text-sm leading-relaxed text-white/70">
          {aboutText}
        </p>
      )}

      {(phone || email || whatsapp) && (
      <div className="space-y-2 pt-1 text-xs sm:text-sm text-white/80">
        {phone && (
          <a
            href={`tel:${phone.replace(/\s+/g, '')}`}
            className="flex items-center gap-2.5 hover:text-[#E8C5A8] transition group"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 group-hover:bg-[#D4A373] text-white transition">
              <Phone className="h-3 w-3" />
            </div>
            <span>{phone}</span>
          </a>
        )}

        {email && (
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-2.5 hover:text-[#E8C5A8] transition group"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 group-hover:bg-[#D4A373] text-white transition">
              <Mail className="h-3 w-3" />
            </div>
            <span>{email}</span>
          </a>
        )}

        {whatsapp && (
          <a
            href={`https://wa.me/${cleanWhatsappNumber}?text=Hi%20JALYN%2C%20I%20have%20an%20inquiry.`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 hover:text-[#E8C5A8] transition group"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#25D366]/20 text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition">
              <MessageCircle className="h-3 w-3" />
            </div>
            <span>WhatsApp: {whatsapp}</span>
          </a>
        )}
      </div>
      )}

      {socialLinks.length > 0 && (
        <div className="pt-2 flex flex-wrap gap-2.5">
          {socialLinks.map(({ Icon, label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/75 transition hover:border-[#D4A373] hover:bg-[#D4A373] hover:text-white"
            >
              <Icon className="h-3.5 w-3.5" />
            </a>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <footer className="bg-[#1C1418] text-white border-t border-white/10">
      <div className="container-luxury max-w-7xl px-4 sm:px-6 py-10 lg:py-16">
        {/* Mobile: link columns as accordions (Brand contact block hidden on mobile, visible on desktop) */}
        <div className="lg:hidden space-y-4">
          {columns.length > 0 && (
            <div>
              {columns.map((col, colIdx) => {
                const isOpen = openSections.includes(colIdx)
                return (
                  <div key={col.title || colIdx} className="border-b border-white/10">
                    <button
                      type="button"
                      onClick={() => toggleSection(colIdx)}
                      className="flex w-full items-center justify-between gap-3 py-4 text-left"
                      aria-expanded={isOpen}
                    >
                      <h3 className="font-label text-xs font-bold uppercase tracking-[0.14em] text-white/90">
                        {col.title}
                      </h3>
                      <ChevronDown className={`h-4 w-4 shrink-0 text-white/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <ul className="pb-5 space-y-2.5 text-xs sm:text-sm text-white/75 font-normal tracking-wide">
                          {col.links
                            ?.filter((link) => link.href)
                            .map((link, lnkIdx) => (
                              <li key={link.label || lnkIdx}>
                                <Link
                                  to={link.href}
                                  className="transition-colors hover:text-[#E8C5A8] hover:underline underline-offset-4"
                                >
                                  {link.label}
                                </Link>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Desktop: 5-column grid */}
        <div className="hidden lg:grid grid-cols-5 gap-10">
          {brandBlock}

          {columns.map((col, colIdx) => (
            <div key={col.title || colIdx} className="space-y-3">
              {col.title ? (
                <h3 className="font-label text-xs font-bold uppercase tracking-[0.14em] text-white/90">
                  {col.title}
                </h3>
              ) : null}
              <ul className="space-y-2.5 text-xs sm:text-sm text-white/75 font-normal tracking-wide">
                {col.links
                  ?.filter((link) => link.href)
                  .map((link, lnkIdx) => (
                    <li key={link.label || lnkIdx}>
                      <Link
                        to={link.href}
                        className="transition-colors hover:text-[#E8C5A8] hover:underline underline-offset-4"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="border-t border-white/10 py-6 bg-[#160E12]">
        <div className="container-luxury max-w-7xl px-4 sm:px-6 flex flex-col items-center justify-between gap-4 text-xs text-white/50 sm:flex-row">
          <p>{footerSettings?.copyright_text || `© ${new Date().getFullYear()} JALYN Apparels. All rights reserved.`}</p>
          <div className="flex flex-wrap items-center gap-3 text-white/80 text-lg">
            <span className="text-[11px] font-semibold text-white/50 mr-1">100% SECURE PAYMENTS:</span>
            <RazorpayIcon className="w-6 h-6 hover:text-[#D4A373] transition cursor-pointer" title="Razorpay" />
            <PhonePeIcon className="w-5 h-5 hover:text-[#D4A373] transition cursor-pointer" title="PhonePe" />
            <GooglePayIcon className="w-6 h-6 hover:text-[#D4A373] transition cursor-pointer" title="Google Pay" />
            <VisaIcon className="w-6 h-6 hover:text-[#D4A373] transition cursor-pointer" title="Visa" />
            <MastercardIcon className="w-6 h-6 hover:text-[#D4A373] transition cursor-pointer" title="Mastercard" />
            <AmexIcon className="w-6 h-6 hover:text-[#D4A373] transition cursor-pointer" title="American Express" />
          </div>
        </div>
      </div>
    </footer>
  )
}
