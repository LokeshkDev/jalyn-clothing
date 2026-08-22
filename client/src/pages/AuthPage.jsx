import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  MailCheck,
} from 'lucide-react'
import { useUserStore } from '@/store'
import { useCmsData } from '@/hooks/useCmsData'
import { authAPI } from '@/services/api'
import jalynLogoLogin from '@/assets/jalyn-logo-login.png'

export default function AuthPage({ initialMode = 'login' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const loginStore = useUserStore((s) => s.login)
  const registerStore = useUserStore((s) => s.register)
  const { authPage } = useCmsData()

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState(initialMode)
  const fromPath = location.state?.from || '/profile'

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [agreeTerms, setAgreeTerms] = useState(true)

  // Forgot Password Modal states
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotStep, setForgotStep] = useState('email') // 'email' | 'success'
  const [forgotSubmitting, setForgotSubmitting] = useState(false)
  const [forgotError, setForgotError] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // 3-Slide Review Carousel State
  const defaultReviews = [
    {
      id: 1,
      rating: 5,
      text: '“The fit and fabric quality from Jalyn are unmatched. Shopping here feels like stepping into a personal luxury studio.”',
      name: 'Ananya Kapoor',
      role: 'Verified Jalyn Collector',
      initials: 'AK',
    },
    {
      id: 2,
      rating: 5,
      text: '“Exquisite hand craftsmanship and incredible attention to detail. Delivery was prompt and packaging felt truly regal.”',
      name: 'Riddhi Sen',
      role: 'Luxury Fashion Enthusiast',
      initials: 'RS',
    },
    {
      id: 3,
      rating: 5,
      text: '“The custom fit assistance helped me get the perfect size co-ord set. I receive compliments every time I wear it!”',
      name: 'Meera Rajput',
      role: 'Loyal Jalyn Client',
      initials: 'MR',
    },
  ]

  const reviewsList = authPage?.reviews?.length ? authPage.reviews : defaultReviews
  const [activeReviewIdx, setActiveReviewIdx] = useState(0)

  // Auto rotate carousel every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveReviewIdx((prev) => (prev + 1) % reviewsList.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [reviewsList.length])

  // Clear messages on mode switch
  const handleSwitchMode = (newMode) => {
    setMode(newMode)
    setErrorMessage('')
    setSuccessMessage('')
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await api.post('/auth/login', { email, password })

      if (response.data?.success) {
        const { user, token } = response.data
        loginStore(user, token)
        setSuccessMessage('Welcome back! Logging you in...')
        setTimeout(() => {
          navigate(fromPath, { replace: true })
        }, 1000)
      } else {
        throw new Error(response.data?.message || 'Login failed')
      }
    } catch (err) {
      console.warn('API login error:', err.message)
      setErrorMessage(err.response?.data?.message || 'Invalid email or password. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!name || !email || !phone || !password) {
      setErrorMessage('Please fill in all required fields including your 10-digit phone number.')
      return
    }

    if (phone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit phone number.')
      return
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }

    if (!agreeTerms) {
      setErrorMessage('Please accept the Terms of Service and Privacy Policy.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        phone,
        password,
      })

      if (response.data?.success) {
        const { user, token } = response.data
        registerStore(user, token)
        setSuccessMessage('Account created successfully! Redirecting...')
        setTimeout(() => {
          navigate(fromPath, { replace: true })
        }, 1000)
      } else {
        throw new Error(response.data?.message || 'Registration failed')
      }
    } catch (err) {
      console.warn('API register error:', err.message)
      setErrorMessage(err.response?.data?.message || 'Registration failed. Please check your inputs and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      const response = await api.post('/auth/google', {
        email: 'user.google@example.com',
        name: 'Google Customer',
        picture: '/images/branding/auth-portrait.webp',
        sub: `google_${Date.now()}`,
      })

      if (response.data?.success) {
        const { user, token } = response.data
        loginStore(user, token)
        setSuccessMessage('Google Sign-In successful! Redirecting...')
        setTimeout(() => {
          navigate(fromPath, { replace: true })
        }, 1000)
      } else {
        throw new Error(response.data?.message || 'Google authentication failed')
      }
    } catch (err) {
      console.warn('Google sign in error:', err.message)
      setErrorMessage(err.response?.data?.message || 'Google Sign-In failed. Please try again or use email login.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setForgotError('')
    setForgotSuccess('')

    if (!forgotEmail) {
      setForgotError('Please enter your registered email address.')
      return
    }

    setForgotSubmitting(true)

    try {
      const response = await authAPI.forgotPassword(forgotEmail)

      if (response.data?.success) {
        setForgotStep('success')
        setForgotSuccess(response.data.message || 'If the email exists in our system, a password reset link has been sent.')
      } else {
        throw new Error(response.data?.message || 'Failed to send reset link')
      }
    } catch (err) {
      console.warn('Forgot password error:', err.message)
      setForgotError(err.response?.data?.message || 'Failed to send reset link. Please try again.')
    } finally {
      setForgotSubmitting(false)
    }
  }

  const handleCloseForgotModal = () => {
    setShowForgotModal(false)
    setForgotEmail('')
    setForgotStep('email')
    setForgotError('')
    setForgotSuccess('')
  }

  const handleForgotModalOpen = (e) => {
    e.preventDefault()
    setShowForgotModal(true)
    setErrorMessage('')
    setSuccessMessage('')
  }

  const currentReview = reviewsList[activeReviewIdx] || reviewsList[0]

  return (
    <>
      <div className="min-h-screen w-full bg-[#FAF7F5] flex flex-col lg:flex-row overflow-hidden font-body">
      {/* Floating Back to Store Link */}
      <Link
        to="/"
        className="fixed top-5 left-5 z-50 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-[#2C1C24] shadow-md backdrop-blur-md transition hover:bg-[#2C1C24] hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Store</span>
      </Link>

      {/* LEFT EDITORIAL FIXED PANEL (Desktop 50%) */}
      <div className="relative hidden lg:flex lg:w-1/2 bg-[#1C1217] overflow-hidden items-center justify-center p-12 text-white">
        {/* Ambient Editorial Image */}
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src={authPage?.image || "/images/home/hero/hero-slide-2.webp"}
            alt="Jalyn Luxury Editorial"
            loading="lazy"
            decoding="async"
            width="700"
            height="900"
            className="h-full w-full object-cover object-center scale-105 transition-transform duration-10000 ease-out hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1217] via-[#1C1217]/50 to-transparent" />
        </div>

        {/* Content Box */}
        <div className="relative z-10 max-w-lg space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#D4A373]/20 border border-[#D4A373]/30 px-4 py-1.5 text-xs font-semibold text-[#E8C5A8] backdrop-blur-md">
            <span>{authPage?.badge || 'JALYN EXCLUSIVE CLUB'}</span>
          </div>

          <div className="space-y-4">
            <h1 className="font-display text-4xl xl:text-5xl font-bold tracking-tight text-white leading-tight">
              {authPage?.title || 'Timeless Grace,'} <br />
              <span className="italic font-light text-[#E8C5A8]">{authPage?.title_highlight || 'Crafted for You.'}</span>
            </h1>
            <p className="text-sm text-gray-300 leading-relaxed font-light">
              {authPage?.subtitle || 'Sign in to manage your orders, access member-only private sales, save favorite couture pieces, and enjoy personalized tailoring assistance.'}
            </p>
          </div>

          {/* EDITABLE 3-SLIDE REVIEW CAROUSEL */}
          <div className="relative rounded-2xl bg-white/10 p-6 border border-white/10 backdrop-blur-md space-y-4 shadow-xl overflow-hidden min-h-[160px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeReviewIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#E8C5A8] text-sm">
                    {'★'.repeat(currentReview.rating || 5)}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-gray-400">
                    {activeReviewIdx + 1} / {reviewsList.length}
                  </span>
                </div>

                <p className="text-xs italic text-gray-200 leading-relaxed font-light">
                  {currentReview.text}
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <div className="h-8 w-8 rounded-full bg-[#D4A373] text-[#1C1217] flex items-center justify-center font-bold text-xs">
                    {currentReview.initials || 'JK'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{currentReview.name}</p>
                    <p className="text-[10px] text-gray-400">{currentReview.role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel Dot Indicators */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {reviewsList.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveReviewIdx(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    activeReviewIdx === idx ? 'w-6 bg-[#E8C5A8]' : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-400 border-t border-white/10 pt-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#E8C5A8]" />
              <span>100% Encrypted Login</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Instant Order Sync</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT DYNAMIC AUTH FORM PANEL */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          {/* Brand Logo Image Header */}
          <div className="text-center space-y-3">
            <Link to="/" className="inline-block hover:opacity-90 transition">
              <img
                src={jalynLogoLogin}
                alt="Jalyn Couture & Fashion"
                className="h-16 sm:h-20 w-auto mx-auto object-contain"
              />
            </Link>
            <h3 className="font-heading text-xl font-bold text-[#2C1C24] pt-1">
              {mode === 'login' ? 'Sign In to Your Account' : 'Create Your Account'}
            </h3>
            <p className="text-xs text-[#666666]">
              {mode === 'login'
                ? 'Enter your credentials below to access your wardrobe'
                : 'Enter your details below to create your fashion account'}
            </p>
          </div>

          {/* HIGH CONTRAST TAB SWITCHER */}
          <div className="grid grid-cols-2 rounded-2xl bg-[#EFE9E4] p-1.5 text-xs font-bold border border-[#E0D8D0]">
            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              className={`rounded-xl py-3 text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'text-white shadow-md border border-[#3D2832]'
                  : 'bg-transparent text-[#666666] hover:text-[#2C1C24]'
              }`}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => handleSwitchMode('register')}
              className={`rounded-xl py-3 text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'text-white shadow-md border border-[#3D2832]'
                  : 'bg-transparent text-[#666666] hover:text-[#2C1C24]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200"
            >
              {errorMessage}
            </motion.div>
          )}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 border border-emerald-200 flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </motion.div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2C1C24]">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888888]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-[#E0D8D0] bg-white pl-10 pr-4 py-3 text-xs font-medium text-[#2C1C24] placeholder:text-[#AAAAAA] focus:border-[#2C1C24] focus:outline-none focus:ring-1 focus:ring-[#2C1C24] transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2C1C24]">
                    Password
                  </label>
                  <a
                    href="#forgot-password"
                    onClick={handleForgotModalOpen}
                    className="text-[11px] font-semibold text-[#D4A373] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888888]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-[#E0D8D0] bg-white pl-10 pr-10 py-3 text-xs font-medium text-[#2C1C24] placeholder:text-[#AAAAAA] focus:border-[#2C1C24] focus:outline-none focus:ring-1 focus:ring-[#2C1C24] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#2C1C24]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#666666]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#2C1C24] focus:ring-[#2C1C24]"
                  />
                  <span>Remember me on this device</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-primary hover:bg-primary-deep text-white py-3.5 text-xs font-bold uppercase tracking-wider shadow-soft transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* CREATE ACCOUNT FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2C1C24]">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888888]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full rounded-xl border border-[#E0D8D0] bg-white pl-10 pr-4 py-2.5 text-xs font-medium text-[#2C1C24] placeholder:text-[#AAAAAA] focus:border-[#2C1C24] focus:outline-none focus:ring-1 focus:ring-[#2C1C24] transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2C1C24]">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888888]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-[#E0D8D0] bg-white pl-10 pr-4 py-2.5 text-xs font-medium text-[#2C1C24] placeholder:text-[#AAAAAA] focus:border-[#2C1C24] focus:outline-none focus:ring-1 focus:ring-[#2C1C24] transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2C1C24]">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888888]" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-[#E0D8D0] bg-white pl-10 pr-4 py-2.5 text-xs font-medium text-[#2C1C24] placeholder:text-[#AAAAAA] focus:border-[#2C1C24] focus:outline-none focus:ring-1 focus:ring-[#2C1C24] transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2C1C24]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888888]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full rounded-xl border border-[#E0D8D0] bg-white pl-10 pr-10 py-2.5 text-xs font-medium text-[#2C1C24] placeholder:text-[#AAAAAA] focus:border-[#2C1C24] focus:outline-none focus:ring-1 focus:ring-[#2C1C24] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#2C1C24]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer text-xs text-[#666666] leading-snug">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#2C1C24] focus:ring-[#2C1C24]"
                  />
                  <span>
                    I agree to Jalyn's{' '}
                    <Link to="/terms-of-service" className="font-semibold text-[#2C1C24] underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy-policy" className="font-semibold text-[#2C1C24] underline">
                      Privacy Policy
                    </Link>.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-primary hover:bg-primary-deep text-white py-3.5 text-xs font-bold uppercase tracking-wider shadow-soft transition cursor-pointer flex items-center justify-center gap-2 active:scale-98 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Social Quick Login (Google Only) */}
          <div className="space-y-4 pt-2">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E0D8D0]" />
              </div>
              <span className="relative bg-[#FAF7F5] px-3 text-[11px] font-semibold text-[#888888] uppercase tracking-wider">
                Or Continue With
              </span>
            </div>

            <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-[#E0D8D0] bg-white py-3 text-xs font-bold text-[#2C1C24] hover:bg-gray-50 shadow-xs transition cursor-pointer active:scale-98"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Forgot Password Modal */}
    {showForgotModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E0D8D0] overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-[#E0D8D0]">
            <h3 className="font-heading text-lg font-bold text-[#2C1C24]">
              {forgotStep === 'email' ? 'Forgot Password' : 'Check Your Email'}
            </h3>
            <button
              type="button"
              onClick={handleCloseForgotModal}
              className="p-1 rounded-lg text-[#888888] hover:text-[#2C1C24] hover:bg-[#F5F0EB] transition"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {forgotStep === 'email' ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2C1C24]">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888888]" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-xl border border-[#E0D8D0] bg-white pl-10 pr-4 py-3 text-xs font-medium text-[#2C1C24] placeholder:text-[#AAAAAA] focus:border-[#2C1C24] focus:outline-none focus:ring-1 focus:ring-[#2C1C24] transition"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {forgotError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200 flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{forgotError}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={forgotSubmitting}
                  className="w-full rounded-xl bg-primary hover:bg-primary-deep text-white py-3.5 text-xs font-bold uppercase tracking-wider shadow-soft transition cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  {forgotSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending Link...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <MailCheck className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="space-y-2">
                  <p className="font-heading text-lg font-bold text-[#2C1C24]">Reset Link Sent</p>
                  <p className="text-sm text-[#666666] leading-relaxed">
                    {forgotSuccess || 'If the email exists in our system, a password reset link has been sent to your registered email address.'}
                  </p>
                  <p className="text-xs text-[#888888]">
                    The link expires in <strong>10 minutes</strong>. Please check your inbox and spam folder.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseForgotModal}
                  className="w-full rounded-xl bg-[#2C1C24] hover:bg-[#3D2832] text-white py-3 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    )}
    </>
  )
}
