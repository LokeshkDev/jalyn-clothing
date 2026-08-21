import { lazy, Suspense } from 'react'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Header from '@/components/layout/Header'
import MobileAppHeader from '@/components/mobile/MobileAppHeader'
import Footer from '@/components/layout/Footer'
import MobileNav from '@/components/layout/MobileNav'
import ScrollToTop from '@/components/layout/ScrollToTop'
import ScrollToTopButton from '@/components/layout/ScrollToTopButton'
import { Outlet } from 'react-router-dom'
import { useCartStore, useUIStore } from '@/store'

const CartDrawer = lazy(() => import('@/components/layout/CartDrawer'))
const SearchModal = lazy(() => import('@/components/layout/SearchModal'))
const MobileSideMenu = lazy(() => import('@/components/mobile/MobileSideMenu'))

export default function MainLayout() {
  const isCartOpen = useCartStore((state) => state.isOpen)
  const isSearchOpen = useUIStore((state) => state.searchOpen)
  const isMobileMenuOpen = useUIStore((state) => state.mobileMenuOpen)

  return (
    <div className="flex min-h-screen flex-col pb-[4.25rem] lg:pb-0">
      <ScrollToTop />
      <AnnouncementBar />
      
      {/* Desktop chrome */}
      <div className="hidden lg:block sticky top-0 z-50">
        <Header />
      </div>

      {/* Mobile / tablet app chrome */}
      <MobileAppHeader />
      <Suspense fallback={null}>
        {isMobileMenuOpen && <MobileSideMenu />}
      </Suspense>

      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      <Footer />
      
      {/* Lazy Loaded Drawers and Modals (Zero impact on initial paint) */}
      <Suspense fallback={null}>
        {isCartOpen && <CartDrawer />}
        {isSearchOpen && <SearchModal />}
      </Suspense>

      <MobileNav />
      <ScrollToTopButton />
    </div>
  )
}
