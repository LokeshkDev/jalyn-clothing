import { useEffect, useState, useMemo, lazy, Suspense } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, User, ShoppingBag, ChevronDown, Menu, X, ChevronRight, MapPin } from 'lucide-react'
import logo from '@/assets/jalyn-logo.png'
import { NAV_LINKS } from '@/constants/data'
import { cn } from '@/lib/utils'
import { useCartStore, useUIStore } from '@/store'
import { useCmsData } from '@/hooks/useCmsData'
import { getSavedLocation } from '@/lib/locationUtils'

const LocationModal = lazy(() => import('@/components/location/LocationModal'))

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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [expandedMobileMenu, setExpandedMobileMenu] = useState(null)
  const [locationModalOpen, setLocationModalOpen] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(getSavedLocation)

  const cartCount = useCartStore((s) => s.getCount())
  const openCart = useCartStore((s) => s.openCart)
  const setSearchOpen = useUIStore((s) => s.setSearchOpen)

  const { menuLinks, cmsData, loading } = useCmsData()

  // Location Auto-Detection on initial site access
  useEffect(() => {
    const saved = getSavedLocation()
    if (saved?.pincode) {
      setCurrentLocation(saved)
    } else {
      // Try browser geolocation or trigger modal
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=18&addressdetails=1`
              )
              const data = await res.json()
              const pin = data.address?.postcode?.replace(/\D/g, '')?.slice(0, 6)
              const city = data.address?.city || data.address?.town || data.address?.state_district || 'India'
              if (pin && pin.length === 6) {
                saveLocation(pin, city)
                setCurrentLocation({ pincode: pin, city })
                return
              }
            } catch (e) {}
            setLocationModalOpen(true)
          },
          () => {
            setLocationModalOpen(true)
          },
          { timeout: 5000 }
        )
      } else {
        setLocationModalOpen(true)
      }
    }

    const handleLocationUpdate = (e) => {
      if (e.detail) setCurrentLocation(e.detail)
    }
    window.addEventListener('jalyn_location_updated', handleLocationUpdate)
    return () => window.removeEventListener('jalyn_location_updated', handleLocationUpdate)
  }, [])
  
  const navLinks = useMemo(() => {
    const baseLinks = menuLinks?.length ? [...menuLinks] : [...NAV_LINKS]
    
    // Check if new arrivals or sale are toggled on in CMS (new arrivals defaults to true, sale defaults to false/true)
    const showNewArrivals = cmsData?.page_new_arrivals?.show_in_menu !== false
    const showSale = cmsData?.page_sale?.show_in_menu === true

    // Filter the links based on show/hide toggles
    return baseLinks.filter((l) => {
      const path = l.href?.toLowerCase() || ''
      const isNewArrivalsLink = path === '/new-arrivals' || path === '/collections/new-arrivals' || path === '/shop?category=new-arrivals'
      const isSaleLink = path === '/sale' || path === '/sales' || path === '/collections/sale'
      
      if (isNewArrivalsLink && !showNewArrivals) return false
      if (isSaleLink && !showSale) return false
      
      return true
    })
  }, [menuLinks, cmsData])

  const featuredEdits = cmsData?.featured_edits || {
    women: {
      heading: 'Featured Edit',
      title: 'Aesthetic Co-ord Sets',
      image: '/images/home/mega-menu/women-edit.webp',
      cta_text: 'Shop Collection',
      cta_link: '/shop',
    },
    kids: {
      heading: 'Featured Edit',
      title: 'Playful Toddler Wear',
      image: '/images/home/mega-menu/kids-edit.webp',
      cta_text: 'Shop Collection',
      cta_link: '/shop',
    }
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileDrawerOpen(false)
  }, [location])

  const checkIsActive = (link) => {
    if (link.href === '/shop') {
      return location.pathname === '/shop' && !location.search
    }
    return currentFullUrl === link.href
  }

  return (
    <>
      <header
        className={cn(
          'transition-all duration-300 bg-[#FFF6F9] border-b border-[#EFD7E3]',
          scrolled ? 'shadow-md' : 'shadow-sm',
          isPdpPage && 'hidden lg:block',
        )}
      >
        <div className={cn('container-luxury max-w-7xl flex items-center justify-between gap-4 px-4 sm:px-6 transition-all duration-300', scrolled ? 'h-14 lg:h-14' : 'h-16 lg:h-20')}>
          {/* Left: Mobile Hamburger + Logo */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:text-primary hover:bg-primary/5 lg:hidden cursor-pointer"
              aria-label="Open mobile menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            <Link
              to="/"
              className="relative z-10 flex shrink-0 items-center"
              aria-label="JALYN home"
            >
              <img
                src={logo}
                alt="JALYN — Style meets comfort"
                className={cn('object-contain transition-all duration-300', scrolled ? 'h-7 sm:h-8 lg:h-10' : 'h-8 sm:h-10 lg:h-20')}
                width={160}
                height={80}
                style={{ aspectRatio: '2 / 1' }}
              />
            </Link>
          </div>

          {/* Center: Desktop Mega Navigation Links */}
          <nav
            className="hidden lg:flex items-center gap-6 xl:gap-8"
            aria-label="Primary"
          >
            {loading ? (
              <div className="flex items-center gap-6 xl:gap-8" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-3 w-16 rounded bg-rose-light/80 animate-pulse"
                  />
                ))}
              </div>
            ) : (
            navLinks.map((link) => {
              const isActive = checkIsActive(link)
              const hasGroups = Boolean(link.groups && link.groups.length > 0)
              const hasChildren = Boolean(link.children && link.children.length > 0)

              if (hasGroups) {
                return (
                  <div
                    key={link.label}
                    className="group py-5" // Removed relative so absolute dropdown centers on the Header
                    onMouseEnter={() => setActiveDropdown(link.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Link
                      to={link.href}
                      className={cn(
                        'flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors cursor-pointer',
                        isActive ? 'text-primary font-bold' : 'text-ink group-hover:text-primary',
                      )}
                    >
                      <span>{link.label}</span>
                      <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180 text-primary/70" />
                    </Link>

                    {/* Multi-Column Mega Dropdown Panel */}
                    <div
                      className={cn(
                        'absolute left-1/2 -translate-x-1/2 top-full z-50 rounded-[28px] border border-[#EFD7E3] bg-white/95 backdrop-blur-md p-8 shadow-[0_20px_50px_rgba(42,26,34,0.12)] transition-all duration-300 pointer-events-none opacity-0 translate-y-4 scale-98 origin-top',
                        activeDropdown === link.label && 'opacity-100 translate-y-0 scale-100 pointer-events-auto',
                        link.groups?.length === 1 ? 'w-[480px]' :
                        link.groups?.length === 2 ? 'w-[680px]' :
                        link.groups?.length === 3 ? 'w-[840px]' :
                        'w-[96vw] max-w-6xl'
                      )}
                    >
                      <div className={cn(
                        'grid gap-8',
                        link.groups?.length === 1 ? 'grid-cols-1 md:grid-cols-[1.2fr_1fr]' :
                        link.groups?.length === 2 ? 'grid-cols-1 md:grid-cols-[1.2fr_1.2fr_1fr]' :
                        link.groups?.length === 3 ? 'grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1.2fr]' :
                        'grid-cols-1 md:grid-cols-4 lg:grid-cols-5'
                      )}>
                        {link.groups.map((group) => (
                          <div key={group.title} className="space-y-4">
                            <h4 className="font-heading text-base font-semibold tracking-wide text-ink pb-2 border-b border-rose-light/50">
                              {group.title}
                            </h4>
                            <ul className="space-y-1.5 text-xs">
                              {group.items?.map((item) => {
                                const isItemActive = currentFullUrl === item.href
                                return (
                                  <li key={item.label}>
                                    <Link
                                      to={item.href}
                                      onClick={() => setActiveDropdown(null)}
                                      className={cn(
                                        "flex flex-col rounded-xl px-3.5 py-1.5 transition duration-200 group/item border-l-0 hover:border-l-4 hover:border-primary hover:pl-3",
                                        isItemActive
                                          ? "bg-[#FFF6F9] border-l-4 border-primary pl-3"
                                          : "hover:bg-[#FFF6F9]"
                                      )}
                                    >
                                      <span className={cn(
                                        "text-xs font-bold transition",
                                        isItemActive ? "text-primary" : "text-ink group-hover/item:text-primary"
                                      )}>
                                        {item.label}
                                      </span>
                                    </Link>
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        ))}

                        {/* Column: Luxury Promo Card */}
                        <div className="hidden md:block space-y-4 col-span-1 border-l border-rose-light/40 pl-8">
                          <h4 className="font-heading text-base font-semibold tracking-wide text-ink pb-2">
                            {featuredEdits[link.label.toLowerCase()]?.heading || 'Featured Edit'}
                          </h4>
                          <div className="relative group/promo overflow-hidden rounded-2xl aspect-[3/4] bg-surface-muted shadow-soft">
                            <img
                              src={
                                featuredEdits[link.label.toLowerCase()]?.image ||
                                (link.label.toLowerCase() === 'women'
                                  ? '/images/home/mega-menu/women-edit.webp'
                                  : '/images/home/mega-menu/kids-edit.webp')
                              }
                              alt="Featured collection"
                              loading="lazy"
                              decoding="async"
                              width="320"
                              height="426"
                              className="h-full w-full object-cover transition-transform duration-700 group-hover/promo:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#2A1A22]/80 via-[#2A1A22]/20 to-transparent flex flex-col justify-end p-4">
                              <span className="text-[9px] font-bold tracking-[0.15em] text-rose-blush uppercase mb-1">
                                New Arrival
                              </span>
                              <h5 className="font-heading text-sm font-semibold text-white leading-tight mb-2">
                                {featuredEdits[link.label.toLowerCase()]?.title ||
                                  (link.label.toLowerCase() === 'women' ? 'Aesthetic Co-ord Sets' : 'Playful Toddler Wear')}
                              </h5>
                              <Link
                                to={featuredEdits[link.label.toLowerCase()]?.cta_link || link.href}
                                onClick={() => setActiveDropdown(null)}
                                className="inline-flex items-center text-[10px] font-bold text-white hover:text-rose-blush transition gap-1"
                              >
                                <span>{featuredEdits[link.label.toLowerCase()]?.cta_text || 'Shop Collection'}</span>
                                <ChevronRight className="h-3 w-3" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }

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
                        'flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors cursor-pointer',
                        isActive ? 'text-primary font-bold' : 'text-ink group-hover:text-primary',
                      )}
                    >
                      <span>{link.label}</span>
                      <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180 text-primary/70" />
                    </Link>

                    {/* Standard Dropdown */}
                    <div
                      className={cn(
                        'absolute left-0 top-full z-50 w-64 rounded-2xl border border-[#EFD7E3] bg-white/95 backdrop-blur-md p-3 shadow-[0_15px_40px_rgba(42,26,34,0.1)] transition-all duration-300 pointer-events-none opacity-0 translate-y-3 scale-95 origin-top-left',
                        activeDropdown === link.label && 'opacity-100 translate-y-0 scale-100 pointer-events-auto',
                      )}
                    >
                      <div className="space-y-1">
                        {link.children.map((child) => {
                          const isChildActive = currentFullUrl === child.href
                          return (
                            <Link
                              key={child.label}
                              to={child.href}
                              onClick={() => setActiveDropdown(null)}
                              className={cn(
                                "flex flex-col rounded-xl px-3.5 py-2 transition duration-200 group/item border-l-0 hover:border-l-4 hover:border-primary hover:pl-3",
                                isChildActive
                                  ? "bg-[#FFF6F9] border-l-4 border-primary pl-3"
                                  : "hover:bg-[#FFF6F9]"
                              )}
                            >
                              <span className={cn(
                                "text-xs font-bold transition",
                                isChildActive ? "text-primary" : "text-ink group-hover/item:text-primary"
                              )}>
                                {child.label}
                              </span>
                            </Link>
                          )
                        })}
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
                    'text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors py-1',
                    isActive ? 'text-primary font-bold' : 'text-ink hover:text-primary',
                  )}
                >
                  {link.label}
                </Link>
              )
            }))}
          </nav>

          {/* Right: Utility Icons & Location */}
          <div className="relative z-10 flex items-center gap-1 sm:gap-2">
            {/* Locator Button */}
            <button
              type="button"
              onClick={() => setLocationModalOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#FFF0F5] border border-primary/15 text-[11px] sm:text-xs font-semibold text-[#4A2F3C] hover:bg-rose-light hover:text-primary transition active:scale-95 cursor-pointer max-w-[130px] sm:max-w-[180px]"
              title="Click to change delivery location / pincode"
            >
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0 animate-pulse" />
              <span className="truncate">
                {currentLocation?.pincode ? `Deliver to ${currentLocation.pincode}` : 'Select Pincode'}
              </span>
            </button>

            <IconBtn label="Search" onClick={() => setSearchOpen(true)}>
              <Search className="h-[19px] w-[19px]" />
            </IconBtn>

            <span className="hidden sm:inline-flex">
              <IconBtn label="Account" as={Link} to="/account">
                <User className="h-[19px] w-[19px]" />
              </IconBtn>
            </span>

            <IconBtn label="Cart" onClick={openCart} badge={cartCount}>
              <ShoppingBag className="h-[19px] w-[19px]" />
            </IconBtn>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Navigation Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          <div className="relative flex w-full max-w-xs flex-col bg-[#FFF6F9] p-5 shadow-2xl h-full overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EFD7E3] pb-4 mb-4">
              <img src={logo} alt="JALYN" className="h-8 object-contain" />
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 text-ink hover:text-primary rounded-full hover:bg-white cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-3 font-sans text-xs">
              {navLinks.map((link) => {
                const hasGroups = Boolean(link.groups?.length)
                const hasChildren = Boolean(link.children?.length)
                const isExpanded = expandedMobileMenu === link.label

                if (hasGroups || hasChildren) {
                  return (
                    <div key={link.label} className="border-b border-primary/10 pb-2">
                      <button
                        type="button"
                        onClick={() => setExpandedMobileMenu(isExpanded ? null : link.label)}
                        className="flex w-full items-center justify-between py-2 text-sm font-bold uppercase tracking-wider text-ink hover:text-primary"
                      >
                        <span>{link.label}</span>
                        <ChevronRight
                          className={cn('h-4 w-4 transition-transform text-primary', isExpanded && 'rotate-90')}
                        />
                      </button>

                      {isExpanded && (
                        <div className="mt-2 space-y-3 pl-2">
                          {hasGroups &&
                            link.groups.map((group) => (
                              <div key={group.title} className="space-y-1.5">
                                <span className="block text-[11px] font-bold uppercase text-primary tracking-wider">
                                  {group.title}
                                </span>
                                <div className="space-y-1 pl-2 border-l border-primary/20">
                                  {group.items.map((item) => (
                                    <Link
                                      key={item.label}
                                      to={item.href}
                                      onClick={() => setMobileDrawerOpen(false)}
                                      className="block py-1 text-ink-muted hover:text-primary"
                                    >
                                      {item.label}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ))}

                          {hasChildren &&
                            link.children.map((child) => (
                              <Link
                                key={child.label}
                                to={child.href}
                                onClick={() => setMobileDrawerOpen(false)}
                                className="block py-1.5 text-ink hover:text-primary font-medium"
                              >
                                {child.label}
                              </Link>
                            ))}
                        </div>
                      )}
                    </div>
                  )
                }

                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setMobileDrawerOpen(false)}
                    className="block py-2.5 text-sm font-bold uppercase tracking-wider text-ink hover:text-primary border-b border-primary/10"
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Delivery Location & Pincode Modal (Lazy loaded on demand) */}
      {locationModalOpen && (
        <Suspense fallback={null}>
          <LocationModal
            isOpen={locationModalOpen}
            onClose={() => setLocationModalOpen(false)}
            onLocationSelect={(loc) => setCurrentLocation(loc)}
          />
        </Suspense>
      )}
    </>
  )
}
