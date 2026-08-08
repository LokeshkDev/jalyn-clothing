import { Link } from 'react-router-dom'
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
} from 'lucide-react'
import logo from '@/assets/jalyn-logo.png'
import { FOOTER_LINKS } from '@/constants/data'
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcPaypal, FaGooglePay } from 'react-icons/fa'
import { SiPhonepe, SiRazorpay } from 'react-icons/si'

const columns = [
  { title: 'Shop', links: FOOTER_LINKS.shop },
  { title: 'Customer Care', links: FOOTER_LINKS.care },
  { title: 'About', links: FOOTER_LINKS.about },
  { title: 'Policies', links: FOOTER_LINKS.policies },
]

export default function Footer() {
  return (
    <footer className="bg-footer text-white">
      <div className="container-luxury grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-6 lg:gap-8">
        <div className="lg:col-span-2">
          <Link to="/" aria-label="JALYN home">
            <img
              src={logo}
              alt="JALYN"
              className="h-11 w-auto brightness-0 invert"
              width={160}
              height={44}
            />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65">
            Effortless style. Everyday comfort. Premium women&apos;s fashion
            designed to feel as good as it looks.
          </p>
          <div className="mt-6 flex gap-3">
            {[
              { Icon: Instagram, label: 'Instagram', href: 'https://instagram.com/jalyn.official' },
              { Icon: Facebook, label: 'Facebook', href: 'https://facebook.com/jalyn' },
              { Icon: Twitter, label: 'Twitter', href: 'https://twitter.com/jalyn' },
              { Icon: Youtube, label: 'YouTube', href: 'https://youtube.com/@jalyn' },
            ].map(({ Icon, label, href }) => (
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
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.18em] text-white">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/60 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-luxury flex flex-col items-center justify-between gap-4 py-5 sm:flex-row">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Jalyn. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-white/55" aria-label="Accepted payment methods">
            <FaCcVisa className="h-6 w-6" />
            <FaCcMastercard className="h-6 w-6" />
            <FaCcAmex className="h-6 w-6" />
            <FaCcPaypal className="h-6 w-6" />
            <FaGooglePay className="h-6 w-6" />
            <SiPhonepe className="h-5 w-5" />
            <SiRazorpay className="h-5 w-5" />
          </div>
        </div>
      </div>
    </footer>
  )
}
