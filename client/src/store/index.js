import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/services/api'

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
      user: null,
      token: null,
      addresses: [],
      coupons: [],
      notifications: [],

      login: (userObj, token) =>
        set({
          user: {
            ...userObj,
            firstName: userObj.name ? userObj.name.split(' ')[0] : 'Customer',
            lastName: userObj.name && userObj.name.split(' ').length > 1 ? userObj.name.split(' ').slice(1).join(' ') : '',
            isAuthenticated: true,
          },
          token: token || userObj.token || null,
        }),

      register: (userObj, token) =>
        set({
          user: {
            ...userObj,
            firstName: userObj.name ? userObj.name.split(' ')[0] : 'Customer',
            lastName: userObj.name && userObj.name.split(' ').length > 1 ? userObj.name.split(' ').slice(1).join(' ') : '',
            isAuthenticated: true,
          },
          token: token || userObj.token || null,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          addresses: [],
          notifications: [],
        }),

      updateProfile: (updatedData) =>
        set({ user: { ...get().user, ...updatedData } }),

      fetchAddresses: async () => {
        try {
          const response = await api.get('/auth/addresses')
          if (response.data?.success) {
            set({ addresses: response.data.data })
          }
        } catch (error) {
          console.warn('Failed to fetch addresses from backend:', error.message)
        }
      },

      addAddress: async (newAddr) => {
        try {
          const response = await api.post('/auth/addresses', newAddr)
          if (response.data?.success) {
            await get().fetchAddresses()
          }
        } catch (error) {
          console.error('Failed to create address in DB:', error.message)
          const id = `addr-${Date.now()}`
          const addresses = newAddr.isDefault
            ? get().addresses.map((a) => ({ ...a, isDefault: false }))
            : [...get().addresses]
          set({ addresses: [{ ...newAddr, id }, ...addresses] })
        }
      },

      updateAddress: async (id, updated) => {
        try {
          if (String(id).startsWith('addr-')) {
            await api.post('/auth/addresses', updated)
          } else {
            await api.put(`/auth/addresses/${id}`, updated)
          }
          await get().fetchAddresses()
        } catch (error) {
          console.error('Failed to update address in DB:', error.message)
          const addresses = get().addresses.map((a) => {
            if (a.id === id) return { ...a, ...updated }
            if (updated.isDefault) return { ...a, isDefault: false }
            return a
          })
          set({ addresses })
        }
      },

      deleteAddress: async (id) => {
        try {
          if (!String(id).startsWith('addr-')) {
            await api.delete(`/auth/addresses/${id}`)
          }
          await get().fetchAddresses()
        } catch (error) {
          console.error('Failed to delete address in DB:', error.message)
          set({ addresses: get().addresses.filter((a) => a.id !== id) })
        }
      },

      setDefaultAddress: async (id) => {
        try {
          const current = get().addresses.find((a) => a.id === id)
          if (current) {
            await api.put(`/auth/addresses/${id}`, { ...current, isDefault: true })
            await get().fetchAddresses()
          }
        } catch (error) {
          console.error('Failed to set default address in DB:', error.message)
          set({
            addresses: get().addresses.map((a) => ({
              ...a,
              isDefault: a.id === id,
            })),
          })
        }
      },
    }),
    { name: 'jalyn-user' },
  ),
)

export const useOrderStore = create(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (orderData) => {
        const id = `JALYN${Math.floor(10000 + Math.random() * 90000)}`
        const dateStr = new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        const newOrder = {
          id,
          date: dateStr,
          status: 'Confirmed',
          paymentStatus: orderData.paymentStatus || 'pending',
          paymentMethod: orderData.paymentMethod || 'Online Payment',
          shippingMethod: orderData.shippingMethod || 'Standard Delivery',
          shippingCost: orderData.shippingCost || 0,
          courier: 'BlueDart Express',
          trackingId: `BD${Math.floor(100000000 + Math.random() * 900000000)}IN`,
          expectedDelivery: '3 to 5 business days',
          customer_email: orderData.customer_email || orderData.customerEmail,
          address: orderData.address,
          items: orderData.items,
          subtotal: orderData.subtotal,
          discount: orderData.discount || 0,
          tax: orderData.tax || 0,
          total: orderData.total,
          timeline: [
            { title: 'Order Placed', time: `${dateStr}, Just Now`, completed: true },
            { title: 'Confirmed', time: `${dateStr}, Just Now`, completed: true },
            { title: 'Quality Inspection', time: 'In Progress', completed: false },
            { title: 'Shipped', time: 'Pending', completed: false },
            { title: 'Delivered', time: '3-5 Business Days', completed: false },
          ],
        }
        const orders = [newOrder, ...get().orders]
        set({ orders, activeOrder: newOrder })
        return newOrder
      },
      getOrderById: (id) => get().orders.find((o) => o.id === id),
      clearOrders: () => set({ orders: [] }),
      fetchOrders: async (email) => {
        try {
          const response = await api.get(`/orders?email=${email}`)
          if (response.data?.success) {
            const mappedOrders = response.data.orders.map((o) => {
              const dateObj = new Date(o.created_at || Date.now());
              const dateStr = dateObj.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });

              const items = Array.isArray(o.items) ? o.items.map((it) => ({
                name: it.product_name,
                price: Number(it.price) || 0,
                qty: Number(it.quantity) || 1,
                size: it.size || 'M',
                color: it.color || 'Default',
                image: it.image_url || 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
              })) : [];

              return {
                id: o.order_number || String(o.id),
                date: dateStr,
                status: o.order_status || 'Confirmed',
                paymentStatus: o.payment_status || 'pending',
                paymentMethod: o.payment_method || 'Online Payment',
                shippingMethod: o.shipping_method || 'Standard Delivery',
                shippingCost: Number(o.shipping_cost) || 0,
                courier: o.courier || 'BlueDart Express',
                trackingId: o.tracking_id || 'BD987654321IN',
                expectedDelivery: o.expected_delivery || '3 to 5 business days',
                customer_email: o.customer_email,
                address: {
                  name: o.customer_name,
                  email: o.customer_email,
                  phone: o.customer_phone,
                  addressLine1: o.shipping_address,
                },
                items,
                subtotal: Number(o.subtotal) || Number(o.total_amount) || 0,
                discount: Number(o.discount) || 0,
                tax: Number(o.tax) || 0,
                total: Number(o.total_amount) || 0,
                timeline: [
                  { title: 'Order Placed', time: dateStr, completed: true },
                  { title: 'Confirmed', time: dateStr, completed: true },
                  { title: 'Quality Inspection', time: o.order_status !== 'pending' ? 'Completed' : 'In Progress', completed: o.order_status !== 'pending' },
                  { title: 'Shipped', time: ['shipped', 'delivered'].includes(o.order_status?.toLowerCase()) ? 'Shipped' : 'Pending', completed: ['shipped', 'delivered'].includes(o.order_status?.toLowerCase()) },
                  { title: 'Delivered', time: o.order_status?.toLowerCase() === 'delivered' ? 'Delivered' : '3-5 Business Days', completed: o.order_status?.toLowerCase() === 'delivered' },
                ],
              };
            });
            set({ orders: mappedOrders });
          }
        } catch (error) {
          console.warn('Failed to fetch orders from backend:', error.message);
        }
      },
    }),
    { name: 'jalyn-orders' },
  ),
)

