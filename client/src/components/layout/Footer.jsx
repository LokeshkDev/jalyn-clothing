import { Link } from 'react-router-dom'
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
} from 'lucide-react'
import logo from '@/assets/jalyn-logo.png'
import { FOOTER_LINKS } from '@/constants/data'
import { useCmsData } from '@/hooks/useCmsData'
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcPaypal, FaGooglePay } from 'react-icons/fa'
import { SiPhonepe, SiRazorpay } from 'react-icons/si'

const defaultColumns = [
  { title: 'Shop', links: FOOTER_LINKS.shop },
  { title: 'Customer Care', links: FOOTER_LINKS.care },
  { title: 'About', links: FOOTER_LINKS.about },
  { title: 'Policies', links: FOOTER_LINKS.policies },
]

export default function Footer() {
  const { footerSettings } = useCmsData()

  const aboutText = footerSettings?.about_text || "Effortless style. Everyday comfort. Premium women's fashion designed to feel as good as it looks."
  const columns = footerSettings?.columns?.length ? footerSettings.columns : defaultColumns

  const socialLinks = [
    { Icon: Instagram, label: 'Instagram', href: footerSettings?.instagram_link || 'https://www.instagram.com/jalyn.apparels/' },
    { Icon: Facebook, label: 'Facebook', href: footerSettings?.facebook_link || '' },
    { Icon: Twitter, label: 'Twitter', href: footerSettings?.twitter_link || '' },
    { Icon: Youtube, label: 'YouTube', href: footerSettings?.youtube_link || '' },
  ].filter((s) => s.href)

  return (
    <footer className="bg-footer text-white">
      <div className="container-luxury grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-6 lg:gap-8">
        <div className="lg:col-span-2">
          <Link to="/" aria-label="JALYN home" className="inline-block rounded-2xl bg-white p-2.5 shadow-md border border-white/20">
            <img
              src={logo}
              alt="JALYN — Style meets comfort"
              className="h-9 w-auto object-contain sm:h-10"
              width={160}
              height={44}
            />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65">
            {aboutText}
          </p>
          {socialLinks.length > 0 && (
            <div className="mt-6 flex gap-3">
              {socialLinks.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-primary hover:bg-primary hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        {columns.map((col, colIdx) => (
          <div key={col.title || colIdx}>
            <h3 className="font-label text-xs font-bold uppercase tracking-[0.14em] text-white">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/65">
              {col.links?.map((link, lnkIdx) => (
                <li key={link.label || lnkIdx}>
                  <Link
                    to={link.href}
                    className="transition hover:text-primary-light hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 py-6">
        <div className="container-luxury flex flex-col items-center justify-between gap-4 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} JALYN Apparels. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-3 text-white/80 text-lg">
            <span className="text-[11px] font-semibold text-white/50 mr-1">100% SECURE PAYMENTS:</span>
            <SiRazorpay title="Razorpay" className="hover:text-primary transition" />
            <SiPhonepe title="PhonePe" className="hover:text-primary transition" />
            <FaGooglePay title="Google Pay" className="text-xl hover:text-primary transition" />
            <FaCcVisa title="Visa" className="hover:text-primary transition" />
            <FaCcMastercard title="Mastercard" className="hover:text-primary transition" />
            <FaCcAmex title="American Express" className="hover:text-primary transition" />
          </div>
        </div>
      </div>
    </footer>
  )
}
