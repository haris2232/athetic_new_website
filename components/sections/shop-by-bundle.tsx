import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function ShopByBundle() {
  return (
    <section className="py-20 bg-[#0f1013] text-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold">
                SHOP BY
                <br />
                <span className="text-[#cbf26c]">BUNDLE</span>
              </h2>
              <p className="text-xl text-[#d9d9d9] max-w-md">
                Save more when you shop our curated athletic wear bundles. Perfect combinations for your active
                lifestyle.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-[#cbf26c] rounded-full" />
                <span className="text-[#d9d9d9]">Complete workout sets</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-[#cbf26c] rounded-full" />
                <span className="text-[#d9d9d9]">Seasonal collections</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-[#cbf26c] rounded-full" />
                <span className="text-[#d9d9d9]">Mix & match essentials</span>
              </div>
            </div>

            <Button size="lg" className="bg-[#cbf26c] text-[#212121] hover:bg-[#9fcc3b] font-semibold">
              Explore Bundles
            </Button>
          </div>

          <div className="relative">
            <Image
              src="/placeholder.svg?height=600&width=500"
              alt="Athletic wear bundle collection"
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
