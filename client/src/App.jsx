import { lazy, Suspense, useState, useEffect } from 'react'
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
import loginLogo from '@/assets/jalyn-logo-login.png'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function PageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#FFF6F9] flex flex-col items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center gap-7">
        <img
          src={loginLogo}
          alt="JALYN — Style meets comfort"
          className="w-52 object-contain animate-floatBloom sm:w-72"
          width={288}
          height={288}
        />
        <div className="w-52 sm:w-72">
          <div className="h-1 overflow-hidden rounded-full bg-rose-light">
            <div className="h-full rounded-full bg-gradient-to-r from-primary-soft via-primary to-primary-deep animate-[loader-progress_2.2s_ease-in-out_infinite]" />
          </div>
          <p className="mt-3 text-center font-label text-[10px] font-semibold uppercase tracking-[0.35em] text-primary/70">
            Loading...
          </p>
        </div>
      </div>
    </div>
  )
}

function AppRoutes() {
  useSmoothScroll()

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
