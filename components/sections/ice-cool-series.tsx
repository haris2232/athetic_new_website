import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function IceCoolSeries() {
  return (

    <section className="relative h-[70vh] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/young-woman.png"
          alt="Confident men in athletic wear"
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
      <div className="relative z-10 flex items-center justify-left h-full px-44">

        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
              LIMITED
              <br />
              ICE COOL SERIES
            </h2>
          </div>

          <Button
            size="lg"
            variant="outline"
            className="border-2 border-white text-white hover:bg-white hover:text-[#cbf26c] bg-transparent font-semibold text-lg px-12 py-6 h-auto rounded-none transition-all duration-300 hover:scale-105"
          >
            Shop Now
          </Button>
        </div>
      </div>

    </section>
  )
}
