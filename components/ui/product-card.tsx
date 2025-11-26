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
  
  // Temporary fix for .00 issue
  const displayPrice = `AED ${Math.round(parseFloat(price.replace(/[^0-9.]/g, '')))}`
  const displayOriginalPrice = originalPrice ? 
    `₹${Math.round(parseFloat(originalPrice.replace(/[^0-9.]/g, '')))}` : null
  
  return (
    <Link href={href} className={cn("group block", className)}>
      <div className="relative overflow-hidden bg-white hover:shadow-xl transition-all duration-300 rounded-[20px] md:rounded-[30px] border border-gray-200">
        {/* Product Image */}
        <div className={cn(
          "relative overflow-hidden rounded-t-[20px] md:rounded-t-[30px]", 
          tall ? "aspect-[3/5]" : "aspect-[3/4]"
        )}>
          <Image
            src={image || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
            }}
          />

          {/* Fit Label */}
          {fit && (
            <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-black/80 text-white px-1.5 py-0.5 md:px-2 md:py-1 text-xs font-medium uppercase tracking-wider rounded-full">
              {fit}
            </div>
          )}

          {/* Discount Badges */}
          {discount && discount > 0 && (
            <>
              {/* SALE Tag - Top Left */}
              <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-red-600 text-white px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-full">
                SALE
              </div>
              
              {/* Discount Percentage - Top Right */}
              <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-white text-black px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs font-bold rounded-full">
                {discount}% OFF
              </div>
            </>
          )}
        </div>

        {/* Product Info */}
        <div className="rounded-b-[20px] md:rounded-b-[30px] bg-[#212121] text-white p-3 md:p-4">
          <div className="flex items-center justify-between">
            {/* Product Name - Left Side */}
            <h3 className="text-xs font-medium leading-tight line-clamp-2 flex-1 mr-2 md:mr-3">
              {name}
            </h3>

            {/* Pricing - Right Side */}
            <div className="flex flex-col items-end flex-shrink-0">
              {displayOriginalPrice && (
                <span className="text-xs text-gray-300 line-through">
                  {displayOriginalPrice}
                </span>
              )}
              <span className="text-sm font-bold text-white">
                {displayPrice}
              </span>
            </div>
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded-[20px] md:rounded-[30px]" />
      </div>
    </Link>
  )
}