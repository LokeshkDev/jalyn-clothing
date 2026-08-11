import MobileHero from '@/components/mobile/MobileHero'
import MobileCategories from '@/components/mobile/MobileCategories'
import MobileServices from '@/components/mobile/MobileServices'
import MobileNewArrivals from '@/components/mobile/MobileNewArrivals'
import MobilePromo from '@/components/mobile/MobilePromo'
import WhyJalyn from '@/components/home/WhyJalyn'
import InstagramFeed from '@/components/home/InstagramFeed'
import Newsletter from '@/components/home/Newsletter'

/** App-style homepage for mobile & tablet (< lg) */
export default function MobileHome() {
  return (
    <div className="bg-white pb-4">
      <MobileHero />
      <MobileCategories />
      <MobileNewArrivals />
      <MobilePromo />
      <div className="mt-4">
        <WhyJalyn />
        <MobileServices />
      </div>
      <InstagramFeed />
      <Newsletter />
    </div>
  )
}
