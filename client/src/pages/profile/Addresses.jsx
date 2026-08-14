import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, MapPin, Check } from 'lucide-react'
import { useUserStore } from '@/store'
import { cn } from '@/lib/utils'
import AddressModal from '@/components/profile/AddressModal'

export default function Addresses() {
  const addresses = useUserStore((s) => s.addresses)
  const fetchAddresses = useUserStore((s) => s.fetchAddresses)
  const addAddress = useUserStore((s) => s.addAddress)
  const updateAddress = useUserStore((s) => s.updateAddress)
  const deleteAddress = useUserStore((s) => s.deleteAddress)
  const setDefaultAddress = useUserStore((s) => s.setDefaultAddress)

  useEffect(() => {
    fetchAddresses()
  }, [fetchAddresses])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [addressToEdit, setAddressToEdit] = useState(null)

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-ink">Saved Addresses</h2>
          <p className="text-xs text-ink-muted">Manage your delivery addresses for faster checkout</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setAddressToEdit(null)
            setIsModalOpen(true)
          }}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-soft hover:bg-primary-deep transition"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Address Cards Grid or Empty State */}
      {addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-primary/20 p-12 text-center space-y-4 bg-white shadow-soft">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-light text-primary">
            <MapPin className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-ink text-base">No Saved Addresses Yet</h3>
            <p className="text-xs text-ink-muted">Add your delivery address for fast 1-click checkout</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setAddressToEdit(null)
              setIsModalOpen(true)
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-soft hover:bg-primary-deep transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Delivery Address</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={cn(
                'relative rounded-2xl border p-5 transition-all text-xs space-y-3 bg-white shadow-soft',
                addr.isDefault ? 'border-primary ring-1 ring-primary/20' : 'border-primary/10 hover:border-primary/30',
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-ink text-sm">{addr.type}</span>
                  {addr.isDefault && (
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      Default
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAddressToEdit(addr)
                      setIsModalOpen(true)
                    }}
                    className="p-1.5 text-ink-muted hover:text-primary transition"
                    aria-label="Edit address"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  {addresses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteAddress(addr.id)}
                      className="p-1.5 text-ink-muted hover:text-red-500 transition"
                      aria-label="Delete address"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1 text-ink-muted leading-relaxed">
                <p className="font-bold text-ink text-sm">{addr.name}</p>
                <p>{addr.addressLine1}</p>
                {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                <p>
                  {addr.city}, {addr.state} — <strong>{addr.pincode}</strong>
                </p>
                <p className="pt-1 text-ink font-medium">Phone: {addr.phone}</p>
              </div>

              {!addr.isDefault && (
                <div className="pt-2 border-t border-primary/5">
                  <button
                    type="button"
                    onClick={() => setDefaultAddress(addr.id)}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Set as Default Address
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Address Modal */}
      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        addressToEdit={addressToEdit}
        onSave={(data) => {
          if (addressToEdit) {
            updateAddress(addressToEdit.id, data)
          } else {
            addAddress(data)
          }
        }}
      />
    </div>
  )
}
