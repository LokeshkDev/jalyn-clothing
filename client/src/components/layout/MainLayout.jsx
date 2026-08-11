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
      <div className="hidden lg:block">
        <Header />
      </div>

      {/* Mobile / tablet app chrome */}
      <MobileAppHeader />
      <MobileSideMenu />

      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      <div className="hidden lg:block">
        <Footer />
      </div>
      {/* Compact mobile footer strip */}
      <footer className="border-t border-primary/10 bg-white px-4 py-5 text-center lg:hidden">
        <p className="font-label text-xs text-[#9A7A88]">
          © {new Date().getFullYear()} Jalyn. Style meets comfort.
        </p>
      </footer>

      <CartDrawer />
      <SearchModal />
      <MobileNav />
      <ScrollToTopButton />
    </div>
  )
}
