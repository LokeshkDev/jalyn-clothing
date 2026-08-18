import { useEffect, useRef, useState } from 'react'
import { useCartStore } from '@/store'

export function useAddToBag() {
  const addItem = useCartStore((s) => s.addItem)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const addToBag = (product, openDrawer = false) => {
    if (adding) return
    setAdding(true)
    addItem(product, 1, openDrawer)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setAdding(false)
      setAdded(true)
      timerRef.current = setTimeout(() => setAdded(false), 1500)
    }, 650)
  }

  return { adding, added, addToBag }
}
