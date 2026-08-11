import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      addItem: (product, qty = 1) => {
        const title = product.name || product.title || 'Jalyn Essential Item'
        const image =
          product.image ||
          product.primary_image ||
          product.images?.primary ||
          'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'
        const normalizedItem = {
          ...product,
          name: title,
          title: title,
          image: image,
          primary_image: image,
          price: Number(product.price) || 0,
        }
        const items = [...get().items]
        const existing = items.find(
          (i) =>
            i.id === product.id &&
            i.size === product.size &&
            i.color === product.color,
        )
        if (existing) {
          existing.qty += qty
        } else {
          items.push({ ...normalizedItem, qty })
        }
        set({ items, isOpen: true })
      },
      removeItem: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),
      updateQty: (id, qty) =>
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, qty: Math.max(1, qty) } : i,
          ),
        }),
      clearCart: () => set({ items: [] }),
      getCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),
      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
    }),
    { name: 'jalyn-cart' },
  ),
)

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const ids = get().ids.includes(id)
          ? get().ids.filter((x) => x !== id)
          : [...get().ids, id]
        set({ ids })
      },
      has: (id) => get().ids.includes(id),
      count: () => get().ids.length,
    }),
    { name: 'jalyn-wishlist' },
  ),
)

export const useDeliveryStore = create(
  persist(
    (set, get) => ({
      pincode: '',
      isVerified: false,
      deliveryInfo: null,
      verifyPincode: (code) => {
        const clean = code?.trim()
        if (clean && clean.length === 6 && /^\d{6}$/.test(clean)) {
          const info = {
            pincode: clean,
            estimatedDays: '3 - 5 Business Days',
            codAvailable: true,
            freeShipping: true,
          }
          set({ pincode: clean, isVerified: true, deliveryInfo: info })
          return { success: true, info }
        }
        return { success: false, message: 'Please enter a valid 6-digit Pincode' }
      },
      clearPincode: () => set({ pincode: '', isVerified: false, deliveryInfo: null }),
    }),
    { name: 'jalyn-delivery-pincode' },
  ),
)

export const useUIStore = create((set) => ({
  searchOpen: false,
  mobileMenuOpen: false,
  setSearchOpen: (v) => set({ searchOpen: v }),
  setMobileMenuOpen: (v) => set({ mobileMenuOpen: v }),
}))

export const useUserStore = create(
  persist(
    (set, get) => ({
      user: {
        firstName: 'Ananya',
        lastName: 'Sharma',
        email: 'ananya.sharma@example.com',
        phone: '+91 98765 43210',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      },
      addresses: [
        {
          id: 'addr-1',
          type: 'Home',
          name: 'Ananya Sharma',
          phone: '+91 98765 43210',
          addressLine1: 'Flat 402, Rosewood Apartments',
          addressLine2: '12th Main Road, Indiranagar',
          landmark: 'Near Metro Station',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560038',
          isDefault: true,
        },
        {
          id: 'addr-2',
          type: 'Work',
          name: 'Ananya Sharma',
          phone: '+91 98765 43210',
          addressLine1: 'Tech Park Tower B, 6th Floor',
          addressLine2: 'Outer Ring Road, Marathahalli',
          landmark: 'Opposite Barclays',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560103',
          isDefault: false,
        },
      ],
      coupons: [],
      notifications: [
        {
          id: 'n1',
          title: 'Order Dispatched!',
          message: 'Your order #JALYN10245 has been shipped via BlueDart.',
          time: '2 hours ago',
          read: false,
        },
        {
          id: 'n2',
          title: 'Exclusive Offer',
          message: 'Use code LUXE15 to get 15% off on your next purchase.',
          time: '1 day ago',
          read: true,
        },
      ],
      updateProfile: (updatedData) =>
        set({ user: { ...get().user, ...updatedData } }),
      addAddress: (newAddr) => {
        const id = `addr-${Date.now()}`
        const addresses = newAddr.isDefault
          ? get().addresses.map((a) => ({ ...a, isDefault: false }))
          : [...get().addresses]
        set({ addresses: [{ ...newAddr, id }, ...addresses] })
      },
      updateAddress: (id, updated) => {
        const addresses = get().addresses.map((a) => {
          if (a.id === id) return { ...a, ...updated }
          if (updated.isDefault) return { ...a, isDefault: false }
          return a
        })
        set({ addresses })
      },
      deleteAddress: (id) =>
        set({ addresses: get().addresses.filter((a) => a.id !== id) }),
      setDefaultAddress: (id) =>
        set({
          addresses: get().addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
        }),
    }),
    { name: 'jalyn-user' },
  ),
)

export const useOrderStore = create(
  persist(
    (set, get) => ({
      orders: [
        {
          id: 'JALYN10245',
          date: '08 Aug 2026',
          status: 'Shipped',
          paymentStatus: 'Paid',
          paymentMethod: 'Online Payment (UPI)',
          shippingMethod: 'Standard Delivery',
          shippingCost: 0,
          courier: 'BlueDart Express',
          trackingId: 'BD987654321IN',
          expectedDelivery: '11 Aug 2026',
          address: {
            name: 'Ananya Sharma',
            phone: '+91 98765 43210',
            addressLine1: 'Flat 402, Rosewood Apartments',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560038',
          },
          items: [
            {
              id: 'sp1',
              name: 'Floral Midi Dress',
              price: 1899,
              image:
                'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
              size: 'M',
              color: 'rose',
              qty: 1,
              href: '/products/floral-midi-dress',
            },
            {
              id: 'sp3',
              name: 'Linen Wrap Top',
              price: 1299,
              image:
                'https://images.unsplash.com/photo-1551163943-3f6fa0d40dc1?auto=format&fit=crop&w=800&q=80',
              size: 'S',
              color: 'cream',
              qty: 1,
              href: '/products/linen-wrap-top',
            },
          ],
          subtotal: 3198,
          discount: 320,
          tax: 144,
          total: 3022,
          timeline: [
            { title: 'Order Placed', time: '08 Aug 2026, 09:30 AM', completed: true },
            { title: 'Confirmed', time: '08 Aug 2026, 10:15 AM', completed: true },
            { title: 'Packed', time: '08 Aug 2026, 02:00 PM', completed: true },
            { title: 'Shipped', time: '08 Aug 2026, 06:30 PM', completed: true },
            { title: 'Out for Delivery', time: 'Expected 11 Aug', completed: false },
            { title: 'Delivered', time: 'Expected 11 Aug', completed: false },
          ],
        },
        {
          id: 'JALYN10212',
          date: '28 Jul 2026',
          status: 'Delivered',
          paymentStatus: 'Paid',
          paymentMethod: 'Cash on Delivery',
          shippingMethod: 'Standard Delivery',
          shippingCost: 0,
          courier: 'Delhivery',
          trackingId: 'DEL99887766',
          expectedDelivery: '01 Aug 2026',
          address: {
            name: 'Ananya Sharma',
            phone: '+91 98765 43210',
            addressLine1: 'Flat 402, Rosewood Apartments',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560038',
          },
          items: [
            {
              id: 'sp4',
              name: 'Pleated Mauve Dress',
              price: 2499,
              image:
                'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=800&q=80',
              size: 'M',
              color: 'mauve',
              qty: 1,
              href: '/products/pleated-mauve-dress',
            },
          ],
          subtotal: 2499,
          discount: 250,
          tax: 112,
          total: 2361,
          timeline: [
            { title: 'Order Placed', time: '28 Jul 2026, 03:20 PM', completed: true },
            { title: 'Confirmed', time: '28 Jul 2026, 04:00 PM', completed: true },
            { title: 'Packed', time: '29 Jul 2026, 11:00 AM', completed: true },
            { title: 'Shipped', time: '29 Jul 2026, 04:30 PM', completed: true },
            { title: 'Out for Delivery', time: '01 Aug 2026, 09:00 AM', completed: true },
            { title: 'Delivered', time: '01 Aug 2026, 02:15 PM', completed: true },
          ],
        },
      ],
      activeOrder: null,
      setActiveOrder: (order) => set({ activeOrder: order }),
      addOrder: (orderData) => {
        const orderId = `JALYN${Math.floor(10000 + Math.random() * 90000)}`
        const newOrder = {
          id: orderId,
          date: new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          status: 'Processing',
          paymentStatus: orderData.paymentMethod === 'cod' ? 'Pending (COD)' : 'Paid',
          paymentMethod:
            orderData.paymentMethod === 'cod'
              ? 'Cash on Delivery'
              : 'Online Payment (UPI/Card)',
          shippingMethod:
            orderData.shippingMethod === 'express'
              ? 'Express Delivery'
              : 'Standard Delivery',
          shippingCost: orderData.shippingCost || 0,
          courier: 'BlueDart Express',
          trackingId: `BD${Math.floor(100000000 + Math.random() * 900000000)}IN`,
          expectedDelivery: new Date(
            Date.now() + (orderData.shippingMethod === 'express' ? 2 : 4) * 86400000,
          ).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          address: orderData.address,
          items: orderData.items,
          subtotal: orderData.subtotal,
          discount: orderData.discount,
          tax: orderData.tax,
          total: orderData.total,
          timeline: [
            {
              title: 'Order Placed',
              time: `${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}, Just Now`,
              completed: true,
            },
            { title: 'Confirmed', time: 'In Progress', completed: true },
            { title: 'Packed', time: 'Expected Tomorrow', completed: false },
            { title: 'Shipped', time: 'Pending', completed: false },
            { title: 'Out for Delivery', time: 'Pending', completed: false },
            { title: 'Delivered', time: 'Pending', completed: false },
          ],
        }
        set({
          orders: [newOrder, ...get().orders],
          activeOrder: newOrder,
        })
        return newOrder
      },
    }),
    { name: 'jalyn-orders' },
  ),
)
