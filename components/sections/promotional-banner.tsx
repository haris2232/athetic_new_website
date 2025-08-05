import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function PromotionalBanner() {
  return (
    <section className="py-20 bg-[#212121] text-white relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="text-6xl lg:text-8xl font-bold text-[#cbf26c]">
                50%
                <span className="text-2xl lg:text-3xl ml-2">OFF</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold">LIMITED TIME OFFER</h2>
              <p className="text-xl text-[#d9d9d9] max-w-md">
                Don't miss out on our biggest sale of the year. Premium athletic wear at unbeatable prices.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-[#cbf26c] font-semibold">Offer ends in:</p>
              <div className="flex space-x-4 text-center">
                <div className="bg-[#cbf26c] text-[#212121] px-4 py-2 rounded-lg">
                  <div className="text-2xl font-bold">02</div>
                  <div className="text-xs">DAYS</div>
                </div>
                <div className="bg-[#cbf26c] text-[#212121] px-4 py-2 rounded-lg">
                  <div className="text-2xl font-bold">14</div>
                  <div className="text-xs">HOURS</div>
                </div>
                <div className="bg-[#cbf26c] text-[#212121] px-4 py-2 rounded-lg">
                  <div className="text-2xl font-bold">32</div>
                  <div className="text-xs">MINS</div>
                </div>
              </div>
            </div>

            <Button size="lg" className="bg-[#cbf26c] text-[#212121] hover:bg-[#9fcc3b] font-semibold">
              Shop Sale Now
            </Button>
          </div>

          <div className="relative">
            <Image
              src="/placeholder.svg?height=600&width=500"
              alt="Sale collection showcase"
              width={500}
              height={600}
              className="rounded-lg object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
