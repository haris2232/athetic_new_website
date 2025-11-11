import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useCurrency } from "@/lib/currency-context"

interface ProductCardProps {
  id: string
  name: string
  price: string
  originalPrice?: string
  discount?: number
  image: string
  fit?: string
  href?: string
  className?: string
  tall?: boolean
}

export default function ProductCard({
  id,
  name,
  price,
  originalPrice,
  discount,
  image,
  fit,
  href = `/product/${id}`,
  className,
  tall = false,
}: ProductCardProps) {
  const { formatPrice } = useCurrency()
  return (
    <Link href={href} className={cn("group block", className)}>
      <div className="relative overflow-hidden bg-white hover:shadow-xl transition-all duration-300 rounded-[40px] border border-gray-200">
        {/* Product Image */}
        <div className={cn("relative overflow-hidden rounded-t-[40px]", tall ? "aspect-[3/5]" : "aspect-[3/4]")}>
          <Image
            src={image || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // If image fails to load, replace with placeholder
              const target = e.target as HTMLImageElement
              target.src = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
            }}
          />

          {/* Fit Label */}
          {fit && (
            <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-1.5 text-xs font-medium uppercase tracking-wider rounded-full">
              {fit}
            </div>
          )}

          {/* Discount Badge */}
          {discount && (
            <div className="absolute top-4 right-4 bg-white text-black px-3 py-1.5 text-xs font-bold rounded-full">
              {discount}% OFF
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="rounded-b-[40px] bg-[#212121] text-white p-6">
          <div className="flex items-center justify-between">
            {/* Product Name - Left Side */}
            <h3 className="text-sm font-medium leading-tight line-clamp-2 flex-1 mr-4">
              {name}
            </h3>

            {/* Pricing - Right Side */}
            <div className="flex flex-col items-end flex-shrink-0">
              {originalPrice && (
                <span className="text-sm text-gray-300 line-through">
                  {formatPrice(parseFloat(originalPrice.replace(/[^0-9.]/g, '')))}
                </span>
              )}
              <span className="text-lg font-bold text-white">
                {formatPrice(parseFloat(price.replace(/[^0-9.]/g, '')))}
              </span>
            </div>
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded-[40px]" />
      </div>
    </Link>
  )
}