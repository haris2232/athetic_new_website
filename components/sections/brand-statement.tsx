import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function BrandStatement() {
  return (
    <section className="relative h-[70vh] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/brand-statement.jpg"
          alt="Empowered women in athletic wear"
          fill
          className="object-cover object-center"
          quality={100}
        />
        {/* Green overlay to match brand */}
        <div className="absolute inset-0 bg-[#cbf26c]/20" />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center text-white max-w-5xl px-4">
          {/* Main Message */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-12 uppercase tracking-wide">
            ACTIVEWEAR THAT CELEBRATES YOUR STRENGTH, SUPPORTS YOUR JOURNEY,
            <br />
            AND EMBRACES THE REAL, EMPOWERED MUM IN MOTION
          </h2>

          {/* CTA Button */}
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-white text-white hover:bg-white hover:text-[#212121] bg-transparent font-semibold text-lg px-12 py-6 h-auto rounded-md transition-all duration-300 hover:scale-105"
          >
            Find Out More
          </Button>
        </div>
      </div>
    </section>
  )
}
