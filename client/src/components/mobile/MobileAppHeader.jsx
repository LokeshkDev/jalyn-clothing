import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, Search, Heart, MapPin } from 'lucide-react'
import logo from '@/assets/jalyn-logo.png'
import { useUIStore, useWishlistStore } from '@/store'
import LocationModal, { getSavedLocation } from '@/components/location/LocationModal'

export default function MobileAppHeader() {
  const wishCount = useWishlistStore((s) => s.ids.length)
  const { setMobileMenuOpen, setSearchOpen, mobileMenuOpen } = useUIStore()
  const [locationModalOpen, setLocationModalOpen] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(getSavedLocation)

  return (
    <>
      <header className="relative z-40 h-[68px] border-b border-[#EFD7E3] bg-[#FFF6F9] shadow-sm lg:hidden">
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

          {/* Right: Locator & Search icons */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              aria-label="Change delivery location"
              title={currentLocation?.pincode ? `Deliver to ${currentLocation.pincode}` : 'Select Pincode'}
              onClick={() => setLocationModalOpen(true)}
              className="relative flex h-9 w-9 items-center justify-center text-ink hover:text-primary transition-colors cursor-pointer"
            >
              <MapPin className="h-5 w-5 text-primary" strokeWidth={1.8} />
              {currentLocation?.pincode && (
                <span className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </button>

            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center text-ink hover:text-primary transition-colors cursor-pointer"
            >
              <Search className="h-5 w-5" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </header>

      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onLocationSelect={(loc) => setCurrentLocation(loc)}
      />
    </>
  )
}