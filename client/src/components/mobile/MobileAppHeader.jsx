import { Link } from 'react-router-dom'
import { Menu, Search, Heart } from 'lucide-react'
import logo from '@/assets/jalyn-logo.png'
import { useUIStore, useWishlistStore } from '@/store'

export default function MobileAppHeader() {
  const wishCount = useWishlistStore((s) => s.ids.length)
  const { setMobileMenuOpen, setSearchOpen, mobileMenuOpen } = useUIStore()

  return (
    <header className="sticky top-0 z-50 h-[68px] border-b border-[#EFD7E3] bg-[#FFF6F9] shadow-sm lg:hidden">
      <div className="flex h-full items-center justify-between px-3 sm:px-4">
        {/* Left: Hamburger menu icon */}
        <button
          type="button"
          aria-label="Open navigation menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-10 w-10 shrink-0 items-center justify-center text-ink hover:text-primary transition-colors cursor-pointer"
        >
          <Menu className="h-6 w-6" strokeWidth={1.8} />
        </button>

        {/* Center: JALYN Brand Logo */}
        <Link to="/" className="flex items-center justify-center shrink-0" aria-label="JALYN home">
          <img
            src={logo}
            alt="JALYN — Style meets comfort"
            className="h-9 sm:h-10 w-auto object-contain"
            width={130}
            height={36}
          />
        </Link>

        {/* Right: Search & Favourite (Wishlist) icons ONLY */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="flex h-9 w-9 items-center justify-center text-ink hover:text-primary transition-colors cursor-pointer"
          >
            <Search className="h-5 w-5" strokeWidth={1.8} />
          </button>

          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative flex h-9 w-9 items-center justify-center text-ink hover:text-primary transition-colors cursor-pointer"
          >
            <Heart className="h-5 w-5 text-primary" strokeWidth={1.8} />
            {wishCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white shadow-sm">
                {wishCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
