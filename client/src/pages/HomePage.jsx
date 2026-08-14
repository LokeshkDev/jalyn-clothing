import React from 'react'
import Hero from '@/components/home/Hero'
import Services from '@/components/home/Services'
import Collections from '@/components/home/Collections'
import TrendingProducts from '@/components/home/TrendingProducts'
import Lookbook from '@/components/home/Lookbook'
import WhyJalyn from '@/components/home/WhyJalyn'
import InstagramFeed from '@/components/home/InstagramFeed'
import Newsletter from '@/components/home/Newsletter'
import MobileHome from '@/components/mobile/MobileHome'
import MobileRecentlyViewed from '@/components/shop/MobileRecentlyViewed'
import { NewArrivalsCarousel, SaleCarousel } from '@/components/home/HomeCarousels'
import { useCmsData } from '@/hooks/useCmsData'

export default function HomePage() {
  const { cmsData } = useCmsData()
  
  const layout = cmsData?.desktop_homepage_layout || cmsData?.homepage_layout
  const order = layout?.order || [
    'hero_banner',
    'category_grid',
    'new_arrivals',
    'exclusive_sale',
    'most_loved_styles',
    'promo_banner',
    'why_jalyn',
    'services_strip',
    'instagram_feed',
  ]
  const visibility = layout?.visibility || {}

  const renderSection = (key) => {
    if (visibility[key] === false) return null

    switch (key) {
      case 'hero_banner':
        return <Hero />
      case 'category_grid':
        return <Collections />
      case 'new_arrivals':
        return <NewArrivalsCarousel />
      case 'exclusive_sale':
        return <SaleCarousel />
      case 'most_loved_styles':
        return <TrendingProducts />
      case 'promo_banner':
        return <Lookbook />
      case 'why_jalyn':
        return <WhyJalyn />
      case 'services_strip':
        return <Services />
      case 'instagram_feed':
        return <InstagramFeed />
      default:
        return null
    }
  }

  const activeSections = order
    .filter(key => key !== 'announcement_bar' && key !== 'featured_edits')
    .map(key => ({ key, element: renderSection(key) }))
    .filter(sec => sec.element !== null)

  return (
    <>
      {/* App-style layout — mobile & tablet */}
      <div className="lg:hidden">
        <MobileHome />
      </div>

      {/* Desktop editorial layout */}
      <div className="hidden lg:block bg-white">
        {activeSections.map((sec) => (
          <React.Fragment key={sec.key}>
            {sec.element}
          </React.Fragment>
        ))}
        <Newsletter />
      </div>
    </>
  )
}
