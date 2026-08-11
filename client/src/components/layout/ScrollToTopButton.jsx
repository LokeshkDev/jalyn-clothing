import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getLenis } from '@/hooks/useSmoothScroll'

const SCROLL_THRESHOLD = 300

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SCROLL_THRESHOLD)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    const lenis = getLenis()
    if (lenis) {
      lenis.scrollTo(0)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className={cn(
        'fixed bottom-8 right-8 z-40 hidden h-12 w-12 items-center justify-center rounded-full',
        'bg-gradient-to-br from-primary to-primary-soft text-white shadow-lift',
        'ring-1 ring-white/30 backdrop-blur transition-all duration-500 ease-luxury',
        'hover:-translate-y-1 hover:shadow-soft hover:brightness-105 active:translate-y-0',
        'lg:flex',
        visible
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-4 opacity-0',
      )}
    >
      <ArrowUp className="h-5 w-5" strokeWidth={2.25} />
    </button>
  )
}