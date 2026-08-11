import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MainLayout from '@/components/layout/MainLayout'
import HomePage from '@/pages/HomePage'

// Lazy loaded secondary pages for minimum initial bundle size & green LCP
const Shop = lazy(() => import('@/pages/Shop'))
const ProductDetails = lazy(() => import('@/pages/ProductDetails'))
const Checkout = lazy(() => import('@/pages/Checkout'))
const OrderSuccess = lazy(() => import('@/pages/OrderSuccess'))
const OrderFailure = lazy(() => import('@/pages/OrderFailure'))
const PaymentFailure = lazy(() => import('@/pages/PaymentFailure'))

// Profile & Account Pages Lazy Loaded
const ProfileLayout = lazy(() => import('@/pages/profile/ProfileLayout'))
const Profile = lazy(() => import('@/pages/profile/Profile'))
const MyOrders = lazy(() => import('@/pages/profile/MyOrders'))
const OrderDetails = lazy(() => import('@/pages/profile/OrderDetails'))
const Addresses = lazy(() => import('@/pages/profile/Addresses'))
const WishlistPage = lazy(() => import('@/pages/profile/WishlistPage'))
const Coupons = lazy(() => import('@/pages/profile/Coupons'))
const Notifications = lazy(() => import('@/pages/profile/Notifications'))
const Returns = lazy(() => import('@/pages/profile/Returns'))
const HelpSupport = lazy(() => import('@/pages/profile/HelpSupport'))

import { useSmoothScroll } from '@/hooks/useSmoothScroll'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
  },
})

function AppRoutes() {
  useSmoothScroll()

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFF6F9] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
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
    </Suspense>
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
