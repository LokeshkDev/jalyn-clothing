import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, User, Heart, ShoppingBag, ChevronDown } from 'lucide-react'
import logo from '@/assets/jalyn-logo.png'
import { NAV_LINKS } from '@/constants/data'
import { cn } from '@/lib/utils'
import { useCartStore, useUIStore, useWishlistStore } from '@/store'
import { useCmsData } from '@/hooks/useCmsData'

function IconBtn({ children, label, onClick, as = 'button', to, badge }) {
  const Comp = as
  return (
    <Comp
      to={to}
      onClick={onClick}
      aria-label={label}
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:text-primary hover:bg-primary/5 active:scale-95 cursor-pointer"
    >
      {children}
      {badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-[#FFF6F9] pointer-events-none">
          {badge}
        </span>
      )}
    </Comp>
  )
}

export default function Header() {
  const location = useLocation()
  const currentFullUrl = location.pathname + location.search
  const isPdpPage = location.pathname.startsWith('/products/') || location.pathname.startsWith('/product/')
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)

  const cartCount = useCartStore((s) => s.getCount())
  const openCart = useCartStore((s) => s.openCart)
  const wishCount = useWishlistStore((s) => s.ids.length)
  const setSearchOpen = useUIStore((s) => s.setSearchOpen)

  // Use CMS menu links if available, else fall back to static NAV_LINKS
  const { menuLinks } = useCmsData()
  const navLinks = menuLinks?.length ? menuLinks : NAV_LINKS

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const checkIsActive = (link) => {
    if (link.href === '/shop') {
      return location.pathname === '/shop' && !location.search
    }
    return currentFullUrl === link.href
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300 bg-[#FFF6F9] border-b border-[#EFD7E3] shadow-sm',
        isPdpPage && 'hidden lg:block',
      )}
    >
      <div className="container-luxury max-w-7xl flex h-16 items-center justify-between gap-6 lg:h-20">
        {/* Left: Brand Logo */}
        <Link
          to="/"
          className="relative z-10 flex shrink-0 items-center"
          aria-label="JALYN home"
        >
          <img
            src={logo}
            alt="JALYN — Style meets comfort"
            className="h-8 w-auto object-contain sm:h-10 lg:h-11"
            width={180}
            height={44}
          />
        </Link>

        {/* Center: Desktop Navigation Links with Catchy Hover Dropdowns */}
        <nav
          className="hidden lg:flex items-center gap-6 xl:gap-8"
          aria-label="Primary"
        >
          {navLinks.map((link) => {
            const isActive = checkIsActive(link)
            const hasChildren = link.children && link.children.length > 0

            if (hasChildren) {
              return (
                <div
                  key={link.label}
                  className="relative group py-5"
                  onMouseEnter={() => setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    to={link.href}
                    className={cn(
                      'flex items-center gap-1 text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors cursor-pointer',
                      isActive ? 'text-primary font-bold' : 'text-ink group-hover:text-primary',
                    )}
                  >
                    <span>{link.label}</span>
                    <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180 text-primary/70" />
                  </Link>

                  {/* Catchy Dropdown Card */}
                  <div
                    className={cn(
                      'absolute left-0 top-full z-50 w-64 rounded-2xl border border-[#EFD7E3] bg-white p-3 shadow-xl transition-all duration-200 pointer-events-none opacity-0 translate-y-2',
                      activeDropdown === link.label && 'opacity-100 translate-y-0 pointer-events-auto',
                    )}
                  >
                    <div className="space-y-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          to={child.href}
                          onClick={() => setActiveDropdown(null)}
                          className="flex flex-col rounded-xl px-3.5 py-2.5 transition hover:bg-[#FFF6F9] group/item"
                        >
                          <span className="text-xs font-bold text-ink group-hover/item:text-primary transition">
                            {child.label}
                          </span>
                          {child.subtitle && (
                            <span className="text-[10px] text-ink-muted">
                              {child.subtitle}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <Link
                key={link.label}
                to={link.href}
                className={cn(
                  'text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors py-1',
                  link.accent
                    ? 'text-red-600 font-bold hover:text-red-700'
                    : isActive
                      ? 'text-primary font-bold'
                      : 'text-ink hover:text-primary',
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right: Utility Icons */}
        <div className="relative z-10 flex items-center gap-1 sm:gap-1.5">
          <IconBtn label="Search" onClick={() => setSearchOpen(true)}>
            <Search className="h-[19px] w-[19px]" />
          </IconBtn>

          <span className="hidden sm:inline-flex">
            <IconBtn label="Account" as={Link} to="/account">
              <User className="h-[19px] w-[19px]" />
            </IconBtn>
          </span>

          <IconBtn label="Wishlist" as={Link} to="/wishlist" badge={wishCount}>
            <Heart className="h-[19px] w-[19px]" />
          </IconBtn>

          <IconBtn label="Cart" onClick={openCart} badge={cartCount}>
            <ShoppingBag className="h-[19px] w-[19px]" />
          </IconBtn>
        </div>
      </div>
    </header>
  )
}
