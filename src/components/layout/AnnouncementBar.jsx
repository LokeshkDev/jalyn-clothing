export default function AnnouncementBar() {
  return (
    <div
      className="relative z-[60] flex h-11 items-center justify-center bg-primary px-4 text-center text-[11px] font-medium tracking-wide text-white sm:text-xs whitespace-nowrap overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="region"
      aria-label="Store announcements"
    >
      <p className="flex items-center gap-2">
        <span>Free Shipping on Orders Above ₹1999</span>
        <span className="opacity-60" aria-hidden>
          |
        </span>
        <span>Easy Returns &amp; Exchanges</span>
      </p>
    </div>
  )
}
