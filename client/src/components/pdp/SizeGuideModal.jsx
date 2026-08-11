import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const SIZE_DATA = [
  { size: 'XS', bust: '32', waist: '26', hips: '35', length: '44' },
  { size: 'S', bust: '34', waist: '28', hips: '37', length: '45' },
  { size: 'M', bust: '36', waist: '30', hips: '39', length: '45.5' },
  { size: 'L', bust: '38', waist: '32', hips: '41', length: '46' },
  { size: 'XL', bust: '40', waist: '34', hips: '43', length: '46.5' },
  { size: 'XXL', bust: '42', waist: '36', hips: '45', length: '47' },
]

export default function SizeGuideModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/35"
          />

          {/* Centered Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            aria-label="Size guide"
            className="fixed inset-0 z-[91] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-primary/10 px-6 py-4">
                <h3 className="text-[16px] font-bold text-[#222222]">Size Guide</h3>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close size guide"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FAF8F8] text-[#222222] transition hover:bg-primary/10 active:scale-95"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content */}
              <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
                <p className="mb-3 text-[12px] text-[#666666]">
                  All measurements are in inches. For the best fit, measure yourself and compare with the chart below.
                </p>

                <div className="overflow-hidden rounded-xl border border-primary/10">
                  <table className="w-full text-left text-[12px] text-[#222222]">
                    <thead className="bg-[#EFD7E3]/30 text-[11px] font-bold uppercase tracking-wider text-primary">
                      <tr>
                        <th className="px-3 py-2.5">Size</th>
                        <th className="px-3 py-2.5">Bust</th>
                        <th className="px-3 py-2.5">Waist</th>
                        <th className="px-3 py-2.5">Hips</th>
                        <th className="px-3 py-2.5">Length</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                      {SIZE_DATA.map((row) => (
                        <tr key={row.size}>
                          <td className="px-3 py-2.5 font-bold">{row.size}</td>
                          <td className="px-3 py-2.5">{row.bust}</td>
                          <td className="px-3 py-2.5">{row.waist}</td>
                          <td className="px-3 py-2.5">{row.hips}</td>
                          <td className="px-3 py-2.5">{row.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}