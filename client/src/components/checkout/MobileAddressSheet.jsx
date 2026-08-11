import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Check, MapPin, Edit2 } from 'lucide-react'
import { useUserStore } from '@/store'
import { cn } from '@/lib/utils'

export default function MobileAddressSheet({
  isOpen,
  onClose,
  selectedAddrId,
  onSelectAddress,
  onAddNewAddress,
  onEditAddress,
}) {
  const addresses = useUserStore((s) => s.addresses)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/35 backdrop-blur-xs"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-[91] max-h-[85vh] overflow-y-auto rounded-t-[24px] bg-white shadow-xl pb-6"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-primary/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-primary/10">
              <div>
                <h3 className="text-base font-bold text-[#222222]">Select Delivery Address</h3>
                <p className="text-[11px] text-[#666666]">Choose where you want your order delivered</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close address sheet"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAF8F8] text-[#222222] active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Address Cards List */}
            <div className="p-5 space-y-3">
              {addresses.map((addr) => {
                const isSelected = selectedAddrId === addr.id
                return (
                  <div
                    key={addr.id}
                    onClick={() => {
                      onSelectAddress(addr.id)
                      onClose()
                    }}
                    className={cn(
                      'relative cursor-pointer rounded-2xl p-4 border transition-all text-xs space-y-1.5',
                      isSelected
                        ? 'border-primary bg-[#EFD7E3]/20 ring-1 ring-primary/20'
                        : 'border-[#E5D8DE] bg-white active:bg-[#FAF8F8]',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="mobileDeliveryAddress"
                          checked={isSelected}
                          onChange={() => {
                            onSelectAddress(addr.id)
                            onClose()
                          }}
                          className="h-4 w-4 text-primary"
                        />
                        <span className="font-bold text-[#222222] text-sm">{addr.type}</span>
                        {addr.isDefault && (
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                            Default
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditAddress(addr)
                        }}
                        className="p-1 text-[#666666] hover:text-primary"
                        aria-label="Edit address"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="pl-6 space-y-0.5 text-[#666666]">
                      <p className="font-semibold text-[#222222]">{addr.name}</p>
                      <p>{addr.addressLine1}</p>
                      {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                      <p>
                        {addr.city}, {addr.state} — <strong>{addr.pincode}</strong>
                      </p>
                      <p className="pt-1 text-[#222222]">Phone: {addr.phone}</p>
                    </div>
                  </div>
                )
              })}

              {/* Add New Address Button */}
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onAddNewAddress()
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 p-3.5 text-xs font-bold text-primary active:bg-primary/5 transition"
              >
                <Plus className="h-4 w-4" />
                <span>+ Add New Address</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
