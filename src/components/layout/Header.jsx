import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, User, Heart, ShoppingBag, ChevronDown } from 'lucide-react'
import logo from '@/assets/jalyn-logo.png'
import { NAV_LINKS } from '@/constants/data'
import { cn } from '@/lib/utils'
import { useCartStore, useUIStore, useWishlistStore } from '@/store'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)
  const cartCount = useCartStore((s) => s.getCount())
  const openCart = useCartStore((s) => s.openCart)
  const wishCount = useWishlistStore((s) => s.ids.length)
  const setSearchOpen = useUIStore((s) => s.setSearchOpen)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-500 ease-luxury',
        scrolled
          ? 'border-b border-primary/10 bg-white/95 shadow-[0_4px_24px_rgba(173,74,133,0.1)] backdrop-blur-md'
          : 'bg-white/90 backdrop-blur-sm',
      )}
    >
      <div className="container-luxury flex h-16 items-center justify-between gap-4 lg:h-20">
        <Link
          to="/"
          className="relative z-10 flex shrink-0 items-center"
          aria-label="JALYN home"
        >
          <img
            src={logo}
            alt="JALYN — Style meets comfort"
            className="h-9 w-auto object-contain sm:h-11 lg:h-12"
            width={180}
            height={48}
          />
        </Link>

        <nav
          className="flex items-center gap-1"
          aria-label="Primary"
          onMouseLeave={() => setOpenMenu(null)}
        >
          {NAV_LINKS.map((link) => (
            <div
              key={link.label}
              className="relative"
              onMouseEnter={() =>
                setOpenMenu(link.children ? link.label : null)
              }
            >
              <NavLink
                to={link.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-1 px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors',
                    link.accent
                      ? 'text-primary'
                      : isActive
                        ? 'text-primary'
                        : 'text-ink hover:text-primary',
                  )
                }
              >
                {link.label}
                {link.children && (
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                )}
              </NavLink>

              <AnimatePresence>
                {link.children && openMenu === link.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute left-0 top-full z-50 min-w-[220px] rounded-xl border border-primary/10 bg-white p-3 shadow-lift"
                  >
                    {link.children.map((child) => (
                      <Link
                        key={child.label}
                        to={child.href}
                        className="block rounded-lg px-3 py-2.5 text-sm text-ink-muted transition hover:bg-rose-light/50 hover:text-primary"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        <div className="relative z-10 flex items-center gap-1 sm:gap-2">
          <IconBtn label="Search" onClick={() => setSearchOpen(true)}>
            <Search className="h-[18px] w-[18px]" />
          </IconBtn>
          <IconBtn label="Account" as={Link} to="/account">
            <User className="h-[18px] w-[18px]" />
          </IconBtn>
          <IconBtn label="Wishlist" as={Link} to="/wishlist" badge={wishCount}>
            <Heart className="h-[18px] w-[18px]" />
          </IconBtn>
          <IconBtn label="Cart" onClick={openCart} badge={cartCount}>
            <ShoppingBag className="h-[18px] w-[18px]" />
          </IconBtn>
        </div>
      </div>
    </header>
  )
}

function IconBtn({
  children,
  label,
  badge,
  as: Comp = 'button',
  className,
  ...props
}) {
  return (
    <Comp
      aria-label={label}
      className={cn(
        'relative flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-rose-light/70 hover:text-primary-deep',
        className,
      )}
      {...props}
    >
      {children}
      {badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
          {badge}
        </span>
      )}
    </Comp>
  )
}
