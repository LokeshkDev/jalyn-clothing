import Hero from '@/components/home/Hero'
import Services from '@/components/home/Services'
import Collections from '@/components/home/Collections'
import TrendingProducts from '@/components/home/TrendingProducts'
import Lookbook from '@/components/home/Lookbook'
import WhyJalyn from '@/components/home/WhyJalyn'
import InstagramFeed from '@/components/home/InstagramFeed'
import Newsletter from '@/components/home/Newsletter'
import MobileHome from '@/components/mobile/MobileHome'

export default function HomePage() {
  return (
    <>
      {/* App-style layout — mobile & tablet */}
      <div className="lg:hidden">
        <MobileHome />
      </div>

      {/* Desktop editorial layout */}
      <div className="hidden lg:block">
        <Hero />
        <Services />
        <Collections />
        <TrendingProducts />
        <Lookbook />
        <WhyJalyn />
        <InstagramFeed />
        <Newsletter />
      </div>
    </>
  )
}
