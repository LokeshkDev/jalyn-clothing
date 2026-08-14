import { useCmsData } from '@/hooks/useCmsData'

export default function AnnouncementBar() {
  const { cmsData, announcementBar } = useCmsData()
  const isVisible = cmsData?.homepage_layout?.visibility?.announcement_bar !== false

  if (!isVisible || (announcementBar && announcementBar.enabled === false)) {
    return null
  }

  const text = announcementBar?.text || 'Free Shipping on Orders Above ₹1999 | Easy Returns & Exchanges'
  const bgColor = announcementBar?.bg_color || '#2A1A22'
  const textColor = announcementBar?.text_color || '#FFFFFF'

  return (
    <div
      style={{ backgroundColor: bgColor, color: textColor }}
      className="relative z-[60] flex h-11 items-center justify-center px-4 text-center text-[11px] font-medium tracking-wide sm:text-xs whitespace-nowrap overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="region"
      aria-label="Store announcements"
    >
      <p className="flex items-center gap-2">
        <span>{text}</span>
      </p>
    </div>
  )
}
