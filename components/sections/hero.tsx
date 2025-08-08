import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-gym.jpg"
          alt="Female athlete training in gym"
          fill
          className="object-cover object-center"
          priority
          quality={100}
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center text-white max-w-4xl px-4">
          {/* Performance Text */}
          <div className="mb-4">
            <p className="text-lg md:text-xl font-medium tracking-[0.2em] uppercase text-white/90 font-redwing">
              PERFORMANCE
            </p>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-8 font-redwing">MEETS STYLE</h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl font-light mb-12 text-white/90 max-w-2xl mx-auto">
            Premium Fitness Apparel Designed For The Dedicated.
          </p>

          {/* CTA Button */}
          <Button
            size="lg"
            className="bg-[#cbf26c] text-[#212121] hover:bg-[#9fcc3b] font-semibold text-lg px-12 py-6 h-auto rounded-md transition-all duration-300 hover:scale-105"
          >
            Shop Now
          </Button>
        </div>
      </div>
    </section>
  )
}
