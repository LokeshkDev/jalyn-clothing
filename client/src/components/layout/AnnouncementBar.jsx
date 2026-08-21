import { useEffect, useState } from 'react'
import { useCmsData } from '@/hooks/useCmsData'

export default function AnnouncementBar() {
  const { cmsData, announcementBar } = useCmsData()
  const isVisible = cmsData?.homepage_layout?.visibility?.announcement_bar !== false
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const onScroll = () => setHidden(window.scrollY > 60)
    requestAnimationFrame(onScroll)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!isVisible || (announcementBar && announcementBar.enabled === false)) {
    return null
  }

  const text = announcementBar?.text || 'Free Shipping on Orders Above ₹1999 | Easy Returns & Exchanges'
  const bgColor = announcementBar?.bg_color || '#2A1A22'
  const textColor = announcementBar?.text_color || '#FFFFFF'

  return (
    <div
      style={{ backgroundColor: bgColor, color: textColor }}
      className={`relative z-[60] grid transition-all duration-300 ease-luxury ${
        hidden ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'
      }`}
      role="region"
      aria-label="Store announcements"
    >
      <div className="overflow-hidden">
        <div className="flex items-center justify-center px-4 py-1.5 text-center">
          <div className="max-w-7xl mx-auto px-2 text-center text-[10px] sm:text-xs font-semibold tracking-wider uppercase leading-snug flex items-center justify-center gap-2">
            <span>{text}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
