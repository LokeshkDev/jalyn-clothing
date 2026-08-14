import React from 'react'
import MobileHero from '@/components/mobile/MobileHero'
import MobileCategories from '@/components/mobile/MobileCategories'
import MobileServices from '@/components/mobile/MobileServices'
import MobileNewArrivals from '@/components/mobile/MobileNewArrivals'
import MobilePromo from '@/components/mobile/MobilePromo'
import WhyJalyn from '@/components/home/WhyJalyn'
import InstagramFeed from '@/components/home/InstagramFeed'
import Newsletter from '@/components/home/Newsletter'
import MobileTrendingProducts from '@/components/mobile/MobileTrendingProducts'
import { SaleCarousel } from '@/components/home/HomeCarousels'
import { useCmsData } from '@/hooks/useCmsData'

/** App-style homepage for mobile & tablet (< lg) */
export default function MobileHome() {
  const { cmsData } = useCmsData()
  
  const layout = cmsData?.mobile_homepage_layout || cmsData?.homepage_layout
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
        return <MobileHero />
      case 'category_grid':
        return <MobileCategories />
      case 'new_arrivals':
        return <MobileNewArrivals />
      case 'exclusive_sale':
        return <SaleCarousel />
      case 'most_loved_styles':
        return <MobileTrendingProducts />
      case 'promo_banner':
        return <MobilePromo />
      case 'why_jalyn':
        return <WhyJalyn />
      case 'services_strip':
        return <MobileServices />
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
    <div className="bg-white pb-4">
      {activeSections.map((sec) => (
        <React.Fragment key={sec.key}>
          {sec.element}
        </React.Fragment>
      ))}
      <Newsletter />
    </div>
  )
}
