import { Link, useLocation } from 'react-router-dom'
import { Home, LayoutGrid, Search, Heart, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore, useWishlistStore } from '@/store'

const tabs = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Shop', href: '/shop', icon: LayoutGrid },
  { label: 'Search', href: '#search', icon: Search, action: 'search' },
  { label: 'Wishlist', href: '/wishlist', icon: Heart, badge: true },
  { label: 'Account', href: '/account', icon: User },
]

export default function MobileNav() {
  const location = useLocation()
  const setSearchOpen = useUIStore((s) => s.setSearchOpen)
  const wishCount = useWishlistStore((s) => s.ids.length)

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-primary/10 bg-white/98 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(173,74,133,0.08)] backdrop-blur-md lg:hidden"
      aria-label="Mobile bottom navigation"
    >
      <ul className="grid grid-cols-5">
        {tabs.map((tab) => {
          const active =
            tab.href !== '#search' &&
            (tab.href === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.href))
          const Icon = tab.icon
          const content = (
            <>
              <span className="relative">
                <Icon
                  className={cn(
                    'h-5 w-5',
                    active ? 'text-primary' : 'text-[#9A7A88]',
                  )}
                  strokeWidth={active ? 2.15 : 1.7}
                  fill={active && tab.label === 'Home' ? 'currentColor' : 'none'}
                />
                {tab.badge && wishCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 text-[9px] font-bold text-white">
                    {wishCount}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  'font-label text-[10px]',
                  active ? 'font-semibold text-primary' : 'text-[#9A7A88]',
                )}
              >
                {tab.label}
              </span>
            </>
          )

          if (tab.action === 'search') {
            return (
              <li key={tab.label}>
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="flex w-full flex-col items-center gap-0.5 py-2.5"
                >
                  {content}
                </button>
              </li>
            )
          }

          return (
            <li key={tab.label}>
              <Link
                to={tab.href}
                className="flex flex-col items-center gap-0.5 py-2.5"
              >
                {content}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
