import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MainLayout from '@/components/layout/MainLayout'
import HomePage from '@/pages/HomePage'
import Shop from '@/pages/Shop'
import ProductDetails from '@/pages/ProductDetails'
import Checkout from '@/pages/Checkout'
import OrderSuccess from '@/pages/OrderSuccess'
import OrderFailure from '@/pages/OrderFailure'
import PaymentFailure from '@/pages/PaymentFailure'

// Profile & Account Pages
import ProfileLayout from '@/pages/profile/ProfileLayout'
import Profile from '@/pages/profile/Profile'
import MyOrders from '@/pages/profile/MyOrders'
import OrderDetails from '@/pages/profile/OrderDetails'
import Addresses from '@/pages/profile/Addresses'
import WishlistPage from '@/pages/profile/WishlistPage'
import Coupons from '@/pages/profile/Coupons'
import Notifications from '@/pages/profile/Notifications'
import Returns from '@/pages/profile/Returns'
import HelpSupport from '@/pages/profile/HelpSupport'

import { useSmoothScroll } from '@/hooks/useSmoothScroll'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
  },
})

function AppRoutes() {
  useSmoothScroll()

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<Shop />} />
        <Route path="products/:slug" element={<ProductDetails />} />
        <Route path="product/:slug" element={<ProductDetails />} />

        {/* Checkout Page */}
        <Route path="checkout" element={<Checkout />} />

        {/* Wishlist Direct Route */}
        <Route path="wishlist" element={<WishlistPage />} />

        {/* Account & Profile Nested Routes */}
        <Route path="profile" element={<ProfileLayout />}>
          <Route index element={<Profile />} />
          <Route path="orders" element={<MyOrders />} />
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="addresses" element={<Addresses />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="returns" element={<Returns />} />
          <Route path="help" element={<HelpSupport />} />
        </Route>

        {/* Alias for /account */}
        <Route path="account" element={<ProfileLayout />}>
          <Route index element={<Profile />} />
          <Route path="orders" element={<MyOrders />} />
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="addresses" element={<Addresses />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="returns" element={<Returns />} />
          <Route path="help" element={<HelpSupport />} />
        </Route>

        {/* Status & Outcome Pages */}
        <Route path="order-success" element={<OrderSuccess />} />
        <Route path="order-failure" element={<OrderFailure />} />
        <Route path="payment-failure" element={<PaymentFailure />} />

        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
