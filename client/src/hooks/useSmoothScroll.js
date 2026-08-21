import { useEffect } from 'react'
import Lenis from 'lenis'

let lenisInstance = null

export function getLenis() {
  return lenisInstance
}

export function useSmoothScroll() {
  useEffect(() => {
    let cleanupRef = null

    const init = () => {
      const lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      })
      lenisInstance = lenis

      let frame
      const raf = (time) => {
        lenis.raf(time)
        frame = requestAnimationFrame(raf)
      }
      frame = requestAnimationFrame(raf)

      document.documentElement.classList.add('lenis')

      cleanupRef = () => {
        cancelAnimationFrame(frame)
        lenis.destroy()
        lenisInstance = null
        document.documentElement.classList.remove('lenis')
      }
    }

    // Defer Lenis initialization to after first paint to avoid forced reflow
    const idle = 'requestIdleCallback' in window
      ? requestIdleCallback(init, { timeout: 2000 })
      : setTimeout(init, 100)

    return () => {
      if ('requestIdleCallback' in window) cancelIdleCallback(idle)
      else clearTimeout(idle)
      cleanupRef?.()
    }
  }, [])
}
