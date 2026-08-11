import { Link, useLocation } from 'react-router-dom'
import { Home, LayoutGrid, ShoppingBag, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/store'

export default function MobileNav() {
  const location = useLocation()
  const openCart = useCartStore((s) => s.openCart)
  const cartCount = useCartStore((s) => s.getCount())

  const tabs = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Shop', href: '/shop', icon: LayoutGrid },
    { label: 'Bag', href: '#cart', icon: ShoppingBag, action: 'cart', badge: cartCount },
    { label: 'Profile', href: '/account', icon: User },
  ]

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#EFD7E3] bg-[#FFF6F9] pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(173,74,133,0.1)] lg:hidden"
      aria-label="Mobile bottom navigation"
    >
      <ul className="grid grid-cols-4">
        {tabs.map((tab) => {
          const active =
            tab.href !== '#cart' &&
            (tab.href === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.href))
          const Icon = tab.icon

          const content = (
            <div className="relative flex flex-col items-center gap-1 py-2">
              <div className="relative">
                <Icon
                  className={cn(
                    'h-5 w-5 transition-colors',
                    active ? 'text-primary' : 'text-[#8A6878]',
                  )}
                  strokeWidth={active ? 2.15 : 1.7}
                  fill={active && tab.label === 'Home' ? 'currentColor' : 'none'}
                />
                {tab.badge > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'font-label text-[11px]',
                  active ? 'font-bold text-primary' : 'text-[#8A6878]',
                )}
              >
                {tab.label}
              </span>
            </div>
          )

          if (tab.action === 'cart') {
            return (
              <li key={tab.label}>
                <button
                  type="button"
                  onClick={openCart}
                  className="w-full active:opacity-70 transition cursor-pointer"
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
                className="block w-full active:opacity-70 transition cursor-pointer"
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
