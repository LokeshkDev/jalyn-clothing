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

export default function MobileSizeGuideSheet({ isOpen, onClose }) {
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

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-[91] max-h-[80vh] overflow-y-auto rounded-t-[24px] bg-white shadow-xl"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-primary/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3">
              <h3 className="text-[16px] font-bold text-[#222222]">Size Guide</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close size guide"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FAF8F8] text-[#222222] active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Table */}
            <div className="px-5 pb-6">
              <p className="mb-3 text-[12px] text-[#666666]">
                All measurements are in inches. For the best fit, measure yourself and compare with the chart below.
              </p>

              <div className="overflow-x-auto rounded-xl border border-primary/10">
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

              <div className="mt-4 rounded-xl bg-[#FAF8F8] p-3 text-[12px] text-[#666666]">
                <p className="font-semibold text-[#222222]">Fit Tip</p>
                <p className="mt-1">
                  This style runs true to size. If you prefer a relaxed fit, we recommend sizing up.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
