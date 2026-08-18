import { useForm } from 'react-hook-form'
import { Mail, CheckCircle2, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { motion } from 'framer-motion'
import api from '@/services/api'

export default function Newsletter() {
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm()

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/newsletter/subscribe', { email: data.email, source: 'homepage' })
      setStatus('success')
      setMessage(res.data?.message || 'You are in! Welcome to the JALYN inner circle.')
      reset()
    } catch (err) {
      setStatus('error')
      setMessage(err.response?.data?.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <motion.section
      className="relative overflow-hidden bg-gradient-to-r from-rose-light via-[#F3D5E3] to-rose py-10 md:py-12"
      aria-labelledby="newsletter-heading"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="container-luxury max-w-7xl px-4 sm:px-6 relative z-[1] flex flex-col items-center justify-between gap-6 md:flex-row"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.65 }}
      >
        <div className="flex items-start gap-4">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-soft">
            <Mail className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div>
            <h2
              id="newsletter-heading"
              className="font-display text-2xl font-medium text-ink"
            >
              Be the first to know
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Get updates on new arrivals, exclusive offers &amp; more.
            </p>
          </div>
        </div>

        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex max-w-md items-center gap-3 rounded-2xl bg-white/90 px-5 py-4 shadow-soft"
            role="status"
          >
            <CheckCircle2 className="h-8 w-8 shrink-0 text-primary" strokeWidth={1.75} />
            <div>
              <p className="font-display text-base font-medium text-ink">
                {message}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-muted">
                <PartyPopper className="h-3.5 w-3.5 text-primary" />
                Fresh drops &amp; secret offers land in your inbox first.
              </p>
            </div>
          </motion.div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex w-full max-w-md flex-col gap-2 sm:flex-row sm:items-start"
            noValidate
          >
            <div className="flex-1">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="Enter your email address"
                className="w-full rounded-md border border-primary/10 bg-white px-4 py-3.5 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email',
                  },
                })}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-primary" role="alert">
                  {errors.email.message}
                </p>
              )}
              {status === 'error' && (
                <p className="mt-1 text-xs font-semibold text-primary" role="alert">
                  {message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting} className="shrink-0">
              {isSubmitting ? '…' : 'Subscribe'}
            </Button>
          </form>
        )}
      </motion.div>
    </motion.section>
  )
}
