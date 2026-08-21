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
