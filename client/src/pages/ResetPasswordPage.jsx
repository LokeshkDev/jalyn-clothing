import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, Loader2, KeyRound } from 'lucide-react'
import { authAPI } from '@/services/api'
import loginLogo from '@/assets/jalyn-logo-login.webp'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!token) {
      setErrorMessage('Reset token is missing from the link. Please request a new password reset.')
      return
    }

    if (!password || !confirmPassword) {
      setErrorMessage('Please fill in both password fields.')
      return
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await authAPI.resetPassword(token, password)
      if (response.data?.success) {
        setSuccessMessage('Password reset successfully! Redirecting you to login...')
        setTimeout(() => {
          navigate('/login', { replace: true })
        }, 2000)
      } else {
        throw new Error(response.data?.message || 'Password reset failed.')
      }
    } catch (err) {
      console.warn('Reset password error:', err.message)
      setErrorMessage(
        err.response?.data?.message || 'Invalid or expired reset token. Please request a new password reset link.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF6F9] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block">
          <img
            src={loginLogo}
            alt="JALYN — Luxury Fashion"
            className="mx-auto h-16 w-auto object-contain"
          />
        </Link>
        <h2 className="mt-6 font-display text-2xl font-bold tracking-tight text-[#2C1C24] sm:text-3xl">
          Reset Your Password
        </h2>
        <p className="mt-2 text-xs text-[#666666]">
          Create a new secure password for your JALYN account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white py-8 px-6 shadow-lift rounded-3xl sm:px-10 border border-primary/10"
        >
          {successMessage ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#2C1C24]">Password Updated</h3>
              <p className="text-xs text-[#666666] leading-relaxed">{successMessage}</p>
              <Link
                to="/login"
                className="mt-4 inline-flex items-center justify-center w-full rounded-xl bg-primary py-3 text-xs font-bold uppercase tracking-wider text-white shadow-soft hover:bg-primary-deep transition"
              >
                Go to Sign In
              </Link>
            </div>
          ) : !token ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                <AlertCircle className="h-7 w-7 text-amber-600" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#2C1C24]">Invalid Reset Link</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                This password reset link is missing its security token or has expired.
              </p>
              <Link
                to="/login"
                className="mt-4 inline-flex items-center justify-center w-full rounded-xl bg-primary py-3 text-xs font-bold uppercase tracking-wider text-white shadow-soft hover:bg-primary-deep transition"
              >
                Request New Link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-700 border border-red-200 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2C1C24] mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888888]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full rounded-xl border border-[#E0D8D0] bg-white pl-10 pr-10 py-3 text-xs font-medium text-[#2C1C24] placeholder:text-[#AAAAAA] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#888888] hover:text-[#2C1C24]"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2C1C24] mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888888]" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full rounded-xl border border-[#E0D8D0] bg-white pl-10 pr-10 py-3 text-xs font-medium text-[#2C1C24] placeholder:text-[#AAAAAA] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#888888] hover:text-[#2C1C24]"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-primary hover:bg-primary-deep text-white py-3.5 text-xs font-bold uppercase tracking-wider shadow-soft transition cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  )
}
