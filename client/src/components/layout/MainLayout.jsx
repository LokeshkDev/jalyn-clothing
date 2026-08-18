import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Header from '@/components/layout/Header'
import MobileAppHeader from '@/components/mobile/MobileAppHeader'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/layout/CartDrawer'
import SearchModal from '@/components/layout/SearchModal'
import MobileNav from '@/components/layout/MobileNav'
import MobileSideMenu from '@/components/mobile/MobileSideMenu'
import ScrollToTop from '@/components/layout/ScrollToTop'
import ScrollToTopButton from '@/components/layout/ScrollToTopButton'
import { Outlet } from 'react-router-dom'

export default function MainLayout() {
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
      <MobileSideMenu />

      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      <Footer />
      <CartDrawer />
      <SearchModal />
      <MobileNav />
      <ScrollToTopButton />
    </div>
  )
}
