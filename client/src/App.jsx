import { lazy, Suspense, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MainLayout from '@/components/layout/MainLayout'
import HomePage from '@/pages/HomePage'
import loaderGif from '@/assets/loader-logo.gif'

// Lazy loaded secondary pages for minimum initial bundle size & green LCP
const Shop = lazy(() => import('@/pages/Shop'))
const ProductDetails = lazy(() => import('@/pages/ProductDetails'))
const Checkout = lazy(() => import('@/pages/Checkout'))
const OrderSuccess = lazy(() => import('@/pages/OrderSuccess'))
const OrderFailure = lazy(() => import('@/pages/OrderFailure'))
const PaymentFailure = lazy(() => import('@/pages/PaymentFailure'))
const NewArrivals = lazy(() => import('@/pages/NewArrivals'))
const Sale = lazy(() => import('@/pages/Sale'))
const CategoryPage = lazy(() => import('@/pages/CategoryPage'))

const AboutPage = lazy(() => import('@/pages/AboutPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const PolicyPage = lazy(() => import('@/pages/PolicyPage'))

// Standalone Auth Pages (No Header / No Footer)
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))

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

function PageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#FFF6F9] flex flex-col items-center justify-center">
      <img src={loaderGif} alt="Loading Jalyn..." className="h-32 w-auto object-contain" />
    </div>
  )
}

function AppRoutes() {
  useSmoothScroll()

  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  if (initialLoading) {
    return <PageLoader />
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* STANDALONE AUTH ROUTES (NO HEADER & NO FOOTER) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="/create-account" element={<RegisterPage />} />

        {/* MAIN STORE ROUTES (WITH HEADER & FOOTER) */}
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="shop" element={<Shop />} />
          <Route path="new-arrivals" element={<NewArrivals />} />
          <Route path="collections/new-arrivals" element={<NewArrivals />} />
          <Route path="sale" element={<Sale />} />
          <Route path="sales" element={<Sale />} />
          <Route path="collections/sale" element={<Sale />} />

          {/* Dedicated Category Collection Pages */}
          <Route path="category/:slug" element={<CategoryPage />} />
          <Route path="categories/:slug" element={<CategoryPage />} />
          <Route path="collections/:slug" element={<CategoryPage />} />

          <Route path="products/:slug" element={<ProductDetails />} />
          <Route path="product/:slug" element={<ProductDetails />} />

          {/* About & Contact Routes */}
          <Route path="about" element={<AboutPage />} />
          <Route path="our-story" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="contact-us" element={<ContactPage />} />

          {/* Policy & Info Routes */}
          <Route path="shipping-delivery" element={<PolicyPage initialTab="shipping-delivery" />} />
          <Route path="shipping-policy" element={<PolicyPage initialTab="shipping-delivery" />} />
          <Route path="returns-exchanges" element={<PolicyPage initialTab="returns-exchanges" />} />
          <Route path="return-policy" element={<PolicyPage initialTab="returns-exchanges" />} />
          <Route path="track-order" element={<PolicyPage initialTab="track-order" />} />
          <Route path="size-guide" element={<PolicyPage initialTab="size-guide" />} />
          <Route path="craftsmanship" element={<PolicyPage initialTab="craftsmanship" />} />
          <Route path="sustainability" element={<PolicyPage initialTab="sustainability" />} />
          <Route path="press-media" element={<PolicyPage initialTab="press-media" />} />
          <Route path="press" element={<PolicyPage initialTab="press-media" />} />
          <Route path="careers" element={<PolicyPage initialTab="careers" />} />
          <Route path="privacy-policy" element={<PolicyPage initialTab="privacy-policy" />} />
          <Route path="terms-of-service" element={<PolicyPage initialTab="terms-of-service" />} />
          <Route path="terms-and-conditions" element={<PolicyPage initialTab="terms-of-service" />} />
          <Route path="refund-policy" element={<PolicyPage initialTab="refund-policy" />} />

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
          <Route path="order-success/:id" element={<OrderSuccess />} />
          <Route path="order-success/:orderId" element={<OrderSuccess />} />
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
