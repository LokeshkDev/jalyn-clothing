import { Link } from 'react-router-dom'
import { Menu, Search, User, Heart, ShoppingBag } from 'lucide-react'
import logo from '@/assets/jalyn-logo.png'
import { useCartStore, useUIStore, useWishlistStore } from '@/store'

export default function MobileAppHeader() {
  const openCart = useCartStore((s) => s.openCart)
  const cartCount = useCartStore((s) => s.getCount())
  const wishCount = useWishlistStore((s) => s.ids.length)
  const { setMobileMenuOpen, setSearchOpen, mobileMenuOpen } = useUIStore()

  return (
    <header className="sticky top-0 z-50 h-[72px] border-b border-primary/5 bg-white shadow-sm lg:hidden">
      <div className="flex h-full items-center justify-between px-3 sm:px-4">
        {/* Left: Hamburger menu */}
        <button
          type="button"
          aria-label="Open navigation menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-10 w-10 shrink-0 items-center justify-center text-ink hover:text-primary transition-colors"
        >
          <Menu className="h-6 w-6" strokeWidth={1.75} />
        </button>

        {/* Center: JALYN Logo */}
        <Link to="/" className="flex items-center justify-center shrink-0" aria-label="JALYN home">
          <img
            src={logo}
            alt="JALYN — Style meets comfort"
            className="h-9 sm:h-10 w-auto object-contain"
            width={130}
            height={36}
          />
        </Link>

        {/* Right: Actions (Search, Account, Wishlist, Cart) */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="flex h-9 w-9 items-center justify-center text-ink hover:text-primary transition-colors"
          >
            <Search className="h-5 w-5" strokeWidth={1.75} />
          </button>

          <Link
            to="/account"
            aria-label="Account"
            className="flex h-9 w-9 items-center justify-center text-ink hover:text-primary transition-colors"
          >
            <User className="h-5 w-5" strokeWidth={1.75} />
          </Link>

          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative flex h-9 w-9 items-center justify-center text-ink hover:text-primary transition-colors"
          >
            <Heart className="h-5 w-5 text-primary" strokeWidth={1.75} />
            {wishCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white shadow-sm">
                {wishCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            aria-label="Cart"
            onClick={openCart}
            className="relative flex h-9 w-9 items-center justify-center text-ink hover:text-primary transition-colors"
          >
            <ShoppingBag className="h-5 w-5 text-primary" strokeWidth={1.75} />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
