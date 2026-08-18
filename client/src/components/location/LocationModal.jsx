import React, { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { MapPin, Navigation, X, Truck, Loader2 } from 'lucide-react'

export const PINCODE_DATABASE = {
  '400001': { city: 'Mumbai', state: 'Maharashtra', deliveryDays: '1-2 Business Days', freeDelivery: true },
  '400050': { city: 'Mumbai (Bandra)', state: 'Maharashtra', deliveryDays: '1-2 Business Days', freeDelivery: true },
  '110001': { city: 'New Delhi', state: 'Delhi', deliveryDays: '2-3 Business Days', freeDelivery: true },
  '560001': { city: 'Bengaluru', state: 'Karnataka', deliveryDays: '2-3 Business Days', freeDelivery: true },
  '600001': { city: 'Chennai', state: 'Tamil Nadu', deliveryDays: '2-3 Business Days', freeDelivery: true },
  '500001': { city: 'Hyderabad', state: 'Telangana', deliveryDays: '2-3 Business Days', freeDelivery: true },
  '700001': { city: 'Kolkata', state: 'West Bengal', deliveryDays: '3-4 Business Days', freeDelivery: true },
  '411001': { city: 'Pune', state: 'Maharashtra', deliveryDays: '1-2 Business Days', freeDelivery: true },
  '380001': { city: 'Ahmedabad', state: 'Gujarat', deliveryDays: '2-3 Business Days', freeDelivery: true },
  '302001': { city: 'Jaipur', state: 'Rajasthan', deliveryDays: '3-4 Business Days', freeDelivery: true },
}

export function getLocationInfo(pincode) {
  if (!pincode || pincode.length !== 6) return null
  if (PINCODE_DATABASE[pincode]) {
    return PINCODE_DATABASE[pincode]
  }
  // Generic Indian pincode serviceability fallback
  const firstDigit = pincode[0]
  const zoneMap = {
    '1': { city: 'North Zone', state: 'Delhi/Punjab/Haryana' },
    '2': { city: 'North Zone', state: 'UP/Uttarakhand' },
    '3': { city: 'West Zone', state: 'Rajasthan/Gujarat' },
    '4': { city: 'West Zone', state: 'Maharashtra/Goa' },
    '5': { city: 'South Zone', state: 'AP/Telangana/Karnataka' },
    '6': { city: 'South Zone', state: 'TN/Kerala' },
    '7': { city: 'East Zone', state: 'WB/Odisha/NE' },
    '8': { city: 'East Zone', state: 'Bihar/Jharkhand' },
  }
  const zone = zoneMap[firstDigit] || { city: 'India', state: 'Standard Delivery' }
  return {
    city: zone.city,
    state: zone.state,
    deliveryDays: '3-5 Business Days',
    freeDelivery: true,
  }
}

export function getSavedLocation() {
  try {
    const savedPin = localStorage.getItem('jalyn_user_pincode')
    const savedCity = localStorage.getItem('jalyn_user_city')
    if (savedPin) {
      return { pincode: savedPin, city: savedCity || 'India' }
    }
  } catch (e) {}
  return null
}

export function saveLocation(pincode, city) {
  try {
    localStorage.setItem('jalyn_user_pincode', pincode)
    if (city) localStorage.setItem('jalyn_user_city', city)
    window.dispatchEvent(new CustomEvent('jalyn_location_updated', { detail: { pincode, city } }))
  } catch (e) {}
}

export default function LocationModal({ isOpen, onClose, onLocationSelect }) {
  const [pincode, setPincode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [detecting, setDetecting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setError('')
      const current = getSavedLocation()
      if (current?.pincode) {
        setPincode(current.pincode)
      }
    }
  }, [isOpen])

  const handleApplyPincode = (pin) => {
    const cleaned = String(pin || pincode).trim().replace(/\D/g, '')
    if (cleaned.length !== 6) {
      setError('Please enter a valid 6-digit Indian pincode')
      return
    }

    const info = getLocationInfo(cleaned)
    saveLocation(cleaned, info?.city || 'India')
    onLocationSelect?.({ pincode: cleaned, ...info })
    onClose()
  }

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }

    setDetecting(true)
    setError('')

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          // Reverse geocode via free OpenStreetMap Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          )
          const data = await res.json()
          const detectedPostcode = data.address?.postcode?.replace(/\D/g, '')?.slice(0, 6)
          const detectedCity = data.address?.city || data.address?.town || data.address?.state_district || 'India'

          if (detectedPostcode && detectedPostcode.length === 6) {
            setPincode(detectedPostcode)
            handleApplyPincode(detectedPostcode)
          } else {
            // Default metro fallback if reverse geocoding postal was vague
            setPincode('400001')
            handleApplyPincode('400001')
          }
        } catch (err) {
          // Fallback to default serviceable city
          setPincode('400001')
          handleApplyPincode('400001')
        } finally {
          setDetecting(false)
        }
      },
      (err) => {
        setDetecting(false)
        setError('Location permission denied. Please enter your 6-digit pincode manually.')
      },
      { timeout: 8000, enableHighAccuracy: false }
    )
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden focus:outline-none p-6 sm:p-7 border border-[#EFD7E3] animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-primary/10">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-2xl bg-rose-light flex items-center justify-center text-primary shadow-xs">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <Dialog.Title className="font-display text-lg font-bold text-ink">
                  Select Delivery Location
                </Dialog.Title>
                <Dialog.Description className="text-xs text-ink-muted mt-0.5">
                  Check product availability & fast delivery times
                </Dialog.Description>
              </div>
            </div>

            <Dialog.Close
              aria-label="Close"
              className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <div className="mt-5 space-y-5">
            {/* Auto Detect Location Button */}
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={detecting}
              className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-rose-light to-[#F7E5EE] border border-primary/15 py-3 px-4 text-xs font-bold text-primary transition hover:bg-primary hover:text-white shadow-xs group cursor-pointer"
            >
              {detecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-primary group-hover:text-white" />
                  <span>Detecting your location...</span>
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4 text-primary group-hover:text-white transition" />
                  <span>Detect Current Location via GPS</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-gray-200" />
              <span className="bg-white px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Or Enter Pincode
              </span>
            </div>

            {/* Pincode Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleApplyPincode(pincode)
              }}
              className="space-y-2"
            >
              <div className="relative flex items-center">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => {
                    setError('')
                    setPincode(e.target.value.replace(/\D/g, ''))
                  }}
                  placeholder="Enter 6-digit Pincode (e.g. 400001)"
                  className="w-full rounded-2xl border border-primary/20 bg-gray-50/50 py-3.5 pl-4 pr-24 text-sm font-semibold tracking-wider text-ink outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="submit"
                  disabled={pincode.length !== 6}
                  className="absolute right-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary-hover disabled:opacity-50 cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {error && (
                <p className="text-xs font-medium text-red-600 pl-1">
                  {error}
                </p>
              )}
            </form>

            {/* Delivery Promise Badge */}
            <div className="flex items-center gap-3 rounded-2xl bg-[#FFF9FA] border border-primary/10 p-3 text-xs text-ink-muted">
              <Truck className="h-4 w-4 text-primary shrink-0" />
              <span>Free express shipping on all orders over ₹1,999 with 100% genuine guarantees.</span>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
