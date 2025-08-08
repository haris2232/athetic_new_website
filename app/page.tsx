import Header from "@/components/layout/header"
import Hero from "@/components/sections/hero"
import ProductCarousel from "@/components/sections/product-carousel"
import BrandStatement from "@/components/sections/brand-statement"
import WomenCollection from "@/components/sections/women-collection"
import MenBrandStatement from "@/components/sections/men-brand-statement"
import MenCollection from "@/components/sections/men-collection"
import IceCoolSeries from "@/components/sections/ice-cool-series"
import HowDoYouTrain from "@/components/sections/how-do-you-train"
import Testimonials from "@/components/sections/testimonials"
import JoinFamily from "@/components/sections/join-family"
import Footer from "@/components/layout/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <ProductCarousel />
        <BrandStatement />
        <WomenCollection />
        <MenBrandStatement />
        <MenCollection />
        <IceCoolSeries />
        <HowDoYouTrain />
        <Testimonials />
        <JoinFamily />
      </main>
      <Footer />
    </div>
  )
}
