import React, { useState } from 'react'
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Navigation,
} from 'lucide-react'
import { WhatsAppIcon } from '@/components/ui/BrandIcons'
import { useCmsData } from '@/hooks/useCmsData'

export default function ContactPage() {
  const { contactPage, footerSettings } = useCmsData()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Order Query',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const heroTitle = contactPage?.hero_title || 'We’d Love to Hear From You'
  const heroSubtitle =
    contactPage?.hero_subtitle ||
    'Have a question about your order, sizing, or styling advice? Our customer care team is here to assist you.'
  const heroImage =
    contactPage?.hero_image ||
    '/images/branding/auth-portrait.webp'

  const email = contactPage?.email || footerSettings?.email || 'support@jalyn.in'
  const phone = contactPage?.phone || footerSettings?.phone || '+91 98765 43210'
  const whatsapp = contactPage?.whatsapp || footerSettings?.whatsapp || '+91 98765 43210'
  const cleanWhatsapp = whatsapp.replace(/\D/g, '')

  const address =
    contactPage?.address ||
    'Jalyn Fashion Studio, 42 Luxury Boulevard, Fashion District, Mumbai, MH 400001, India'
  const workingHours = contactPage?.working_hours || 'Monday - Saturday: 10:00 AM - 7:00 PM IST'
  const mapUrl =
    contactPage?.google_maps_url ||
    'https://maps.google.com/maps?q=Mumbai,Maharashtra&t=&z=13&ie=UTF8&iwloc=&output=embed'

  const socialLinks = [
    { Icon: Instagram, label: 'Instagram', href: footerSettings?.instagram_link || 'https://www.instagram.com/jalyn.apparels/' },
    { Icon: Facebook, label: 'Facebook', href: footerSettings?.facebook_link || 'https://facebook.com/jalyn.apparels' },
    { Icon: WhatsAppIcon, label: 'WhatsApp', href: `https://wa.me/${cleanWhatsapp}` },
    { Icon: Twitter, label: 'Twitter', href: footerSettings?.twitter_link || '' },
    { Icon: Youtube, label: 'YouTube', href: footerSettings?.youtube_link || '' },
  ].filter((s) => s.href)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) return

    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      setFormData({ name: '', email: '', phone: '', subject: 'Order Query', message: '' })
      setTimeout(() => setSubmitted(false), 6000)
    }, 1000)
  }

  const faqs =
    contactPage?.faqs?.length
      ? contactPage.faqs
      : [
          {
            q: 'How long will delivery take for my order?',
            a: 'Standard shipping takes 3 to 5 business days across major metro cities in India, and 5 to 7 business days for other tier-2 & tier-3 locations.',
          },
          {
            q: 'What is your returns and exchange policy?',
            a: 'We offer a hassle-free 7-day return and exchange policy from the date of delivery. Items must be unworn, unwashed, and have original tags intact.',
          },
          {
            q: 'How do I choose the correct size?',
            a: 'Please refer to our Size Guide on product pages or footer for exact body measurements. If you are between sizes, we recommend opting for the larger size for a relaxed fit.',
          },
          {
            q: 'Can I request custom alterations?',
            a: 'Yes! For select ethnic collections and evening gowns, custom sizing & length adjustments can be requested by reaching out to our WhatsApp support team.',
          },
        ]

  return (
    <div className="bg-[#FAF7F5] min-h-screen text-[#2D2424] font-sans">
      {/* Hero Header */}
      <section className="relative bg-[#2C1C24] text-white py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-25">
          <img src={heroImage} alt="Contact JALYN Support" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C1C24] via-[#2C1C24]/80 to-transparent z-10" />

        <div className="relative z-20 container-luxury text-center max-w-3xl">
          <span className="inline-block px-3.5 py-1 rounded-full bg-white/10 text-[#E8C5A8] text-xs font-semibold uppercase tracking-widest mb-4 border border-white/15">
            Customer Care & Support
          </span>
          <h1 className="text-4xl md:text-5xl font-serif text-white font-light tracking-tight leading-tight mb-4">
            {heroTitle}
          </h1>
          <p className="text-base md:text-lg text-white/80 font-light leading-relaxed">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-16 md:py-24 container-luxury">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Contact Cards & Info */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C28E5C]">
                Get In Touch
              </span>
              <h2 className="text-2xl md:text-3xl font-serif text-[#2C1C24] mt-1">
                Reach Out Directly
              </h2>
              <p className="text-gray-600 text-sm font-light mt-2">
                Our support team responds within 24 hours on business days.
              </p>
            </div>

            <div className="space-y-4">
              {/* Phone Card */}
              <div className="p-6 rounded-2xl bg-white border border-[#EFE8E2] shadow-sm flex items-start gap-4">
                <div className="p-3.5 rounded-xl bg-[#FAF0E6] text-[#C28E5C] shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Phone Support</h4>
                  <a href={`tel:${phone.replace(/\s+/g, '')}`} className="text-base font-semibold text-[#2C1C24] hover:text-[#C28E5C] transition mt-0.5 block">
                    {phone}
                  </a>
                  <p className="text-xs text-gray-500 mt-1">{workingHours}</p>
                </div>
              </div>

              {/* Email Card */}
              <div className="p-6 rounded-2xl bg-white border border-[#EFE8E2] shadow-sm flex items-start gap-4">
                <div className="p-3.5 rounded-xl bg-[#FAF0E6] text-[#C28E5C] shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Email Enquiries</h4>
                  <a href={`mailto:${email}`} className="text-base font-semibold text-[#2C1C24] hover:text-[#C28E5C] transition mt-0.5 block">
                    {email}
                  </a>
                  <p className="text-xs text-gray-500 mt-1">Order status, press & collaborations</p>
                </div>
              </div>

              {/* WhatsApp Card */}
              <div className="p-6 rounded-[6px] bg-emerald-50/50 border border-emerald-200 shadow-xs flex items-start gap-4">
                <div className="p-3.5 rounded-[6px] bg-[#25D366]/20 text-[#25D366] shrink-0">
                  <SiWhatsapp className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">WhatsApp Support</h4>
                  <a
                    href={`https://wa.me/${cleanWhatsapp}?text=Hi%20JALYN%2C%20I%20have%20an%20inquiry.`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-base font-semibold text-[#2C1C24] hover:text-[#25D366] transition mt-0.5 block"
                  >
                    {whatsapp}
                  </a>
                  <p className="text-xs text-emerald-700 mt-1">Instant stylist chat (10:00 AM - 7:00 PM IST)</p>
                </div>
              </div>

              {/* Address Card */}
              <div className="p-6 rounded-[6px] bg-white border border-[#EFE8E2] shadow-xs flex items-start gap-4">
                <div className="p-3.5 rounded-[6px] bg-[#FAF0E6] text-[#C28E5C] shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Fashion Studio</h4>
                  <p className="text-sm text-[#2C1C24] font-medium leading-relaxed mt-0.5">
                    {address}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media Icons Bar */}
            {socialLinks.length > 0 && (
              <div className="p-5 rounded-[6px] bg-white border border-[#EFE8E2] shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Follow Us On Social Media
                </h4>
                <div className="flex items-center gap-3">
                  {socialLinks.map(({ Icon, label, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FAF0E6] text-[#C28E5C] hover:bg-[#2C1C24] hover:text-white transition shadow-xs"
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Google Maps Location Preview */}
            <div className="rounded-[6px] overflow-hidden border border-[#EFE8E2] shadow-xs bg-white space-y-2 p-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2C1C24] flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-[#C28E5C]" /> Store Location Map
                </span>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-[#C28E5C] hover:underline"
                >
                  Get Directions →
                </a>
              </div>
              <div className="h-56 rounded-[4px] overflow-hidden border border-[#EFE8E2]">
                <iframe
                  title="JALYN Location Map"
                  src={mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 md:p-12 rounded-3xl border border-[#EFE8E2] shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-[#FAF0E6] text-[#C28E5C]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-2xl font-serif text-[#2C1C24]">Send Us a Message</h3>
                  <p className="text-xs text-gray-500">Fill out the form below and we'll be in touch.</p>
                </div>
              </div>

              {submitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2 text-center my-8">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-semibold text-lg">Thank You!</h4>
                  <p className="text-sm font-light text-emerald-700">
                    Your message has been received. Our team will get back to you shortly at {email}.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Ananya Sharma"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C28E5C] focus:ring-1 focus:ring-[#C28E5C] outline-none text-sm transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="ananya@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C28E5C] focus:ring-1 focus:ring-[#C28E5C] outline-none text-sm transition"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 00000"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C28E5C] focus:ring-1 focus:ring-[#C28E5C] outline-none text-sm transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                        Inquiry Topic
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C28E5C] focus:ring-1 focus:ring-[#C28E5C] outline-none text-sm transition bg-white"
                      >
                        <option value="Order Query">Order Status & Tracking</option>
                        <option value="Returns">Returns & Refund Request</option>
                        <option value="Size Advice">Size & Styling Advice</option>
                        <option value="Custom Alteration">Custom Alteration Request</option>
                        <option value="Press / Wholesale">Press & Collaboration</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                      Your Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please share details about your inquiry..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C28E5C] focus:ring-1 focus:ring-[#C28E5C] outline-none text-sm transition resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#2C1C24] hover:bg-[#4A2F3C] text-white py-4 rounded-xl font-medium text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {submitting ? (
                      <span>Sending Message...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Inquiry
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16 bg-[#FFF6F9] border-t border-[#EFE8E2]">
        <div className="container-luxury max-w-3xl">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C28E5C]">
              Quick Answers
            </span>
            <h2 className="text-3xl font-serif text-[#2C1C24]">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-[#EFE8E2] overflow-hidden transition"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left font-serif text-base text-[#2C1C24] font-medium"
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className="w-4 h-4 text-[#C28E5C] shrink-0" />
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-sm text-gray-600 font-light leading-relaxed border-t border-gray-50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
