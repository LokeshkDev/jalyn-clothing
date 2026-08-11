import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import logo from '@/assets/jalyn-logo.png'
import { NAV_LINKS } from '@/constants/data'
import { useUIStore } from '@/store'
import { useCmsData } from '@/hooks/useCmsData'
import { cn } from '@/lib/utils'

export default function MobileSideMenu() {
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore()
  const { menuLinks } = useCmsData()
  const navLinks = menuLinks?.length ? menuLinks : NAV_LINKS

  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close menu overlay"
            className="fixed inset-0 z-[60] bg-[#2A1A22]/35 backdrop-blur-[2px] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          />
          <motion.aside
            className="fixed inset-y-0 left-0 z-[70] flex w-[82%] max-w-xs flex-col bg-white shadow-lift lg:hidden"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            aria-label="Navigation menu"
          >
            <div className="flex items-center justify-between border-b border-primary/10 px-4 py-4">
              <img src={logo} alt="JALYN" className="h-9 w-auto" />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-primary hover:bg-rose-light/60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              {navLinks.map((link) => (
                <div key={link.label} className="mb-1">
                  <Link
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'block rounded-xl px-3 py-3 font-label text-sm font-semibold uppercase tracking-wider',
                      link.accent ? 'text-primary' : 'text-[#4A2F3C]',
                    )}
                  >
                    {link.label}
                  </Link>
                  {link.children?.map((child) => (
                    <Link
                      key={child.label}
                      to={child.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-lg px-5 py-2 text-[13px] text-[#7A5A6A] hover:bg-rose-light/40 hover:text-primary"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ))}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
