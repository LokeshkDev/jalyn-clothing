import { useForm } from 'react-hook-form'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Newsletter() {
  const [done, setDone] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm()

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 600))
    setDone(true)
    reset()
  }

  return (
    <motion.section
      className="relative overflow-hidden bg-gradient-to-r from-rose-light via-[#F3D5E3] to-rose pt-12 md:pt-14 mb-[15px] lg:mb-5"
      aria-labelledby="newsletter-heading"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="container-luxury relative z-[1] flex flex-col items-start justify-between gap-6 md:flex-row md:items-center"
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

        {done ? (
          <p className="flex items-center gap-2 font-display text-base font-medium text-primary" role="status">
            You&apos;re subscribed — welcome to JALYN.
          </p>
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
