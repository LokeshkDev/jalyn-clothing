import { useForm } from 'react-hook-form'
import { CheckCircle2, Sparkles, MessageCircle } from 'lucide-react'
import { WhatsAppIcon } from '@/components/ui/BrandIcons'
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
      const cleanNumber = data.phone.replace(/[^0-9]/g, '')
      const res = await api.post('/newsletter/subscribe', {
        phone: cleanNumber,
        source: 'homepage_whatsapp',
      })
      setStatus('success')
      setMessage(res.data?.message || 'Welcome to the JALYN WhatsApp VIP Club!')
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
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366]/15 text-[#25D366] ring-2 ring-[#25D366]/20 shadow-soft">
            <WhatsAppIcon className="h-6 w-6 text-[#25D366]" />
          </div>
          <div>
            <h2
              id="newsletter-heading"
              className="font-display text-2xl font-medium text-ink flex items-center gap-2"
            >
              Join our WhatsApp VIP Club
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Get instant updates on new arrivals, exclusive discounts &amp; flash drops.
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
            <CheckCircle2 className="h-8 w-8 shrink-0 text-[#25D366]" strokeWidth={1.75} />
            <div>
              <p className="font-display text-base font-medium text-ink">
                {message}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-muted">
                <Sparkles className="h-3.5 w-3.5 text-[#25D366]" />
                Secret coupon drops &amp; new collections will reach you on WhatsApp first.
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
              <label htmlFor="newsletter-whatsapp" className="sr-only">
                WhatsApp Number
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center gap-1.5 text-xs font-semibold text-gray-500 pointer-events-none border-r border-gray-200 pr-2">
                  <WhatsAppIcon className="h-3.5 w-3.5 text-[#25D366]" />
                  <span>+91</span>
                </div>
                <input
                  id="newsletter-whatsapp"
                  type="tel"
                  placeholder="Enter 10-digit WhatsApp number"
                  className="w-full rounded-xl border border-primary/15 bg-white pl-16 pr-4 py-3.5 text-sm text-ink font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
                  {...register('phone', {
                    required: 'WhatsApp number is required',
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: 'Enter a valid 10-digit mobile number',
                    },
                  })}
                  aria-invalid={!!errors.phone}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-xs text-primary font-medium" role="alert">
                  {errors.phone.message}
                </p>
              )}
              {status === 'error' && (
                <p className="mt-1 text-xs font-semibold text-primary" role="alert">
                  {message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting} className="shrink-0 rounded-xl px-5 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold shadow-md">
              {isSubmitting ? 'Subscribing…' : 'Join on WhatsApp'}
            </Button>
          </form>
        )}
      </motion.div>
    </motion.section>
  )
}
