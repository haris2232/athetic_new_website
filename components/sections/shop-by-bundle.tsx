import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function ShopByBundle() {
  return (
    <section className="py-20 bg-gray-50 text-[#212121]">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold">
                SHOP BY
                <br />
                <span className="text-[#ebff00]">BUNDLE</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-md">
                Save more when you shop our curated athletic wear bundles. Perfect combinations for your active
                lifestyle.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-[#ebff00] rounded-full" />
                <span className="text-gray-600">Complete workout sets</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-[#ebff00] rounded-full" />
                <span className="text-gray-600">Seasonal collections</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-[#ebff00] rounded-full" />
                <span className="text-gray-600">Mix & match essentials</span>
              </div>
            </div>

            <Button size="lg" className="bg-[#ebff00] text-black hover:bg-opacity-80 font-semibold">
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
