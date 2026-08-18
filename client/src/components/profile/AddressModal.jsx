import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

import { useUserStore } from '@/store'

export default function AddressModal({ isOpen, onClose, onSave, addressToEdit }) {
  const user = useUserStore((s) => s.user)

  const [formData, setFormData] = useState({
    type: 'Home',
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (addressToEdit) {
      setFormData(addressToEdit)
    } else {
      setFormData({
        type: 'Home',
        name: user?.name || '',
        phone: user?.phone || '',
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false,
      })
    }
    setErrors({})
  }, [addressToEdit, isOpen, user])

  const validate = () => {
    const errs = {}
    if (!formData.name.trim()) errs.name = 'Full name is required'
    const cleanPhone = (formData.phone || '').replace(/\D/g, '')
    if (!cleanPhone) {
      errs.phone = 'Mobile number is required'
    } else if (cleanPhone.length < 10) {
      errs.phone = 'Please enter a valid 10-digit mobile number'
    }
    if (!formData.addressLine1.trim()) errs.addressLine1 = 'Address line 1 is required'
    if (!formData.city.trim()) errs.city = 'City is required'
    if (!formData.state.trim()) errs.state = 'State is required'
    if (!formData.pincode.trim()) errs.pincode = 'PIN code is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSave(formData)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-lift"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-primary/10 px-6 py-4">
              <h3 className="font-heading text-lg font-semibold text-ink">
                {addressToEdit ? 'Edit Delivery Address' : 'Add New Address'}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-ink-muted transition hover:bg-rose-light hover:text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto p-6 space-y-4">
              {/* Address Type Pill Radio */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Address Type
                </label>
                <div className="flex items-center gap-3">
                  {['Home', 'Office', 'Other'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type })}
                      className={`flex h-9 items-center justify-center rounded-xl px-4 text-xs font-bold transition ${
                        formData.type === type
                          ? 'bg-primary text-white shadow-soft'
                          : 'border border-primary/15 bg-white text-ink hover:border-primary/40'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-ink">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary/20 ${
                      errors.name ? 'border-red-400 bg-red-50/20' : 'border-primary/15 focus:border-primary'
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-[11px] text-red-500">{errors.name}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-ink">
                    Mobile Number *
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary/20 ${
                      errors.phone ? 'border-red-400 bg-red-50/20' : 'border-primary/15 focus:border-primary'
                    }`}
                  />
                  {errors.phone && <p className="mt-1 text-[11px] text-red-500">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-ink">
                  Address Line 1 (Flat, House no., Building) *
                </label>
                <input
                  type="text"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  placeholder="e.g. Flat 402, Rosewood Apartments"
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary/20 ${
                    errors.addressLine1 ? 'border-red-400 bg-red-50/20' : 'border-primary/15 focus:border-primary'
                  }`}
                />
                {errors.addressLine1 && <p className="mt-1 text-[11px] text-red-500">{errors.addressLine1}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-ink">
                    Address Line 2 (Street, Area)
                  </label>
                  <input
                    type="text"
                    value={formData.addressLine2}
                    onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                    placeholder="e.g. 12th Main Road, Indiranagar"
                    className="w-full rounded-xl border border-primary/15 px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-ink">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    placeholder="e.g. Near Metro Station"
                    className="w-full rounded-xl border border-primary/15 px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-ink">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary/20 ${
                      errors.city ? 'border-red-400 bg-red-50/20' : 'border-primary/15 focus:border-primary'
                    }`}
                  />
                  {errors.city && <p className="mt-1 text-[11px] text-red-500">{errors.city}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-ink">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary/20 ${
                      errors.state ? 'border-red-400 bg-red-50/20' : 'border-primary/15 focus:border-primary'
                    }`}
                  />
                  {errors.state && <p className="mt-1 text-[11px] text-red-500">{errors.state}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-ink">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="560038"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary/20 ${
                      errors.pincode ? 'border-red-400 bg-red-50/20' : 'border-primary/15 focus:border-primary'
                    }`}
                  />
                  {errors.pincode && <p className="mt-1 text-[11px] text-red-500">{errors.pincode}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="h-4 w-4 rounded border-primary/20 text-primary focus:ring-primary"
                />
                <label htmlFor="isDefault" className="text-xs font-medium text-ink cursor-pointer">
                  Make this my default delivery address
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-primary/10 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-primary/20 px-5 py-2.5 text-xs font-bold text-ink hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-soft hover:bg-primary-deep"
                >
                  Save Address
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
