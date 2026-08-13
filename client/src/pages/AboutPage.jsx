import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Heart, ShieldCheck, Leaf, ArrowRight, Award, Scissors, Users } from 'lucide-react'
import { useCmsData } from '@/hooks/useCmsData'

export default function AboutPage() {
  const { aboutPage } = useCmsData()

  // Dynamic values or editorial defaults matching brand theme
  const heroTitle = aboutPage?.hero_title || 'Crafting Elegance, Celebrating You'
  const heroSubtitle =
    aboutPage?.hero_subtitle ||
    'Discover the story behind JALYN Apparels — where traditional craftsmanship meets contemporary silhouette design.'
  const heroImage =
    aboutPage?.hero_image ||
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80'

  const storyHeading = aboutPage?.story_heading || 'Our Story & Heritage'
  const storyContent =
    aboutPage?.story_content ||
    "Founded with a passion for effortless style and everyday comfort, JALYN creates premium women's fashion that celebrates individuality and grace. Each collection is meticulously designed with breathable luxury fabrics, hand-embroidered details, and tailored fits that feel like a second skin."

  const craftsmanshipTitle = aboutPage?.craftsmanship_title || 'Artisanal Craftsmanship'
  const craftsmanshipContent =
    aboutPage?.craftsmanship_content ||
    'Every dress, kurti, and co-ord set is brought to life by master artisans who preserve centuries-old embroidery techniques. We take pride in small-batch production that prioritizes quality over quantity.'
  const craftsmanshipImage =
    aboutPage?.craftsmanship_image ||
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=1000'

  const sustainabilityTitle = aboutPage?.sustainability_title || 'Conscious & Sustainable'
  const sustainabilityContent =
    aboutPage?.sustainability_content ||
    'We use eco-friendly dyes, organic cotton blends, and zero-waste fabric cutting practices to minimize environmental impact while keeping fashion luxurious and long-lasting.'
  const sustainabilityImage =
    aboutPage?.sustainability_image ||
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=1000'

  const stats = aboutPage?.stats || [
    { number: '50,000+', label: 'Happy Women Worldwide' },
    { number: '100%', label: 'Ethical & Artisanal' },
    { number: '15+', label: 'Master Craftsmen Guilds' },
    { number: '4.9★', label: 'Average Review Rating' },
  ]

  return (
    <div className="bg-[#FAF7F5] min-h-screen text-[#2D2424] font-sans">
      {/* Editorial Hero Banner */}
      <section className="relative overflow-hidden bg-[#2C1C24] text-white py-24 md:py-32">
        <div className="absolute inset-0 z-0 opacity-30">
          <img
            src={heroImage}
            alt="JALYN About Us Banner"
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#2C1C24] via-[#2C1C24]/85 to-transparent z-10" />

        <div className="relative z-20 container-luxury">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#E8C5A8] text-xs font-medium tracking-widest uppercase mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              The JALYN Legacy
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light tracking-tight leading-[1.15] text-white mb-6">
              {heroTitle}
            </h1>
            <p className="text-base md:text-lg text-white/80 leading-relaxed font-light mb-8">
              {heroSubtitle}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-[#D4A373] hover:bg-[#C28E5C] text-white px-7 py-3.5 rounded-full font-medium text-sm transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Explore Collections
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-7 py-3.5 rounded-full font-medium text-sm transition-all backdrop-blur-sm"
              >
                Contact Customer Care
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story & Heritage Section */}
      <section className="py-20 md:py-28 container-luxury">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C28E5C]">
              Est. 2021 — Crafted With Love
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-[#2C1C24] font-normal leading-tight">
              {storyHeading}
            </h2>
            <div className="w-12 h-0.5 bg-[#D4A373]" />
            <p className="text-gray-700 leading-relaxed text-base md:text-lg font-light">
              {storyContent}
            </p>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base font-light">
              We believe fashion shouldn't force a compromise between looking breathtaking and feeling entirely at ease. That’s why every drape, seam, and pattern is tailored to flow seamlessly with your movements.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 pt-4">
              <div className="p-5 rounded-2xl bg-white border border-[#EFE8E2] shadow-sm flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[#FAF0E6] text-[#C28E5C]">
                  <Scissors className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#2C1C24]">Tailored Fits</h4>
                  <p className="text-xs text-gray-500 mt-1">Designed specifically for diverse, real silhouettes.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#EFE8E2] shadow-sm flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[#FAF0E6] text-[#C28E5C]">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#2C1C24]">Skin-Friendly Fabrics</h4>
                  <p className="text-xs text-gray-500 mt-1">Ultra-breathable premium cottons & silks.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80"
                  alt="JALYN Brand Heritage Showcase"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-[#EFE8E2] max-w-xs hidden sm:block">
                <p className="font-serif italic text-sm text-[#2C1C24] leading-relaxed">
                  "Fashion is not just what you wear, but how gracefully it lets you move."
                </p>
                <span className="block mt-2 text-xs font-semibold text-[#C28E5C] uppercase tracking-wider">
                  — JALYN Creative Studio
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Brand Stats Strip */}
      <section className="bg-[#2C1C24] text-white py-16">
        <div className="container-luxury grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, idx) => (
            <div key={idx} className="space-y-2">
              <div className="text-3xl md:text-4xl lg:text-5xl font-serif font-light text-[#E8C5A8]">
                {stat.number}
              </div>
              <p className="text-xs md:text-sm text-white/70 font-medium tracking-wide uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Craftsmanship & Sustainability Dual Grid */}
      <section className="py-20 md:py-28 container-luxury">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C28E5C]">
            Our Uncompromising Values
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-[#2C1C24]">
            Artistry & Conscious Ethics
          </h2>
          <p className="text-gray-600 text-sm md:text-base font-light">
            Every garment carries a story of tradition, meticulous handwork, and respect for our environment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Craftsmanship Card */}
          <div className="bg-white rounded-3xl overflow-hidden border border-[#EFE8E2] shadow-sm hover:shadow-md transition-shadow group flex flex-col">
            <div className="aspect-[16/10] overflow-hidden">
              <img
                src={craftsmanshipImage}
                alt="Artisanal Craftsmanship"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="p-8 md:p-10 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C28E5C]">
                  <Award className="w-4 h-4" /> Master Guild Craft
                </div>
                <h3 className="text-2xl font-serif text-[#2C1C24]">{craftsmanshipTitle}</h3>
                <p className="text-gray-600 text-sm leading-relaxed font-light">
                  {craftsmanshipContent}
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                <Users className="w-4 h-4 text-[#C28E5C]" /> Supporting local artisan families across India.
              </div>
            </div>
          </div>

          {/* Sustainability Card */}
          <div className="bg-white rounded-3xl overflow-hidden border border-[#EFE8E2] shadow-sm hover:shadow-md transition-shadow group flex flex-col">
            <div className="aspect-[16/10] overflow-hidden">
              <img
                src={sustainabilityImage}
                alt="Conscious & Sustainable"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="p-8 md:p-10 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  <Leaf className="w-4 h-4" /> Earth First Fashion
                </div>
                <h3 className="text-2xl font-serif text-[#2C1C24]">{sustainabilityTitle}</h3>
                <p className="text-gray-600 text-sm leading-relaxed font-light">
                  {sustainabilityContent}
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Recyclable luxury packaging & zero plastic waste.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-[#FFF6F9] border-t border-[#EFE8E2] py-20">
        <div className="container-luxury text-center max-w-3xl space-y-6">
          <h2 className="text-3xl md:text-4xl font-serif text-[#2C1C24] font-normal">
            Ready to Experience JALYN?
          </h2>
          <p className="text-gray-600 text-base font-light max-w-xl mx-auto">
            Discover dresses, co-ord sets, and ethnicwear designed to inspire confidence every day.
          </p>
          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-[#2C1C24] hover:bg-[#4A2F3C] text-white px-9 py-4 rounded-full font-medium text-sm transition-all shadow-md hover:shadow-xl"
            >
              Shop New Arrivals
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
