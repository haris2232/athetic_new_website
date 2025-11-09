"use client"

import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'

interface ProductCardProps {
  id: string
  name: string
  price: number | string
  originalPrice?: number | string
  image: string
  images?: string[]
  discount?: number
  slug?: string
}

const getFullImageUrl = (url: string | undefined): string => {
  if (!url) {
    return "/placeholder.svg"
  }
  if (url.startsWith('http')) {
    return url
  }
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://athlekt.com/backendnew'
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`
}

export default function ProductCard({ id, name, price, image, images, slug }: ProductCardProps) {
  const nameParts = name.split(' ').filter(Boolean)
  const firstLine = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ')
  const secondLine = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ') || ''

  const productSlug = slug || id

  const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.]/g, '')) : price

  return (
    <Link href={`/product/${productSlug}`} className="block cursor-pointer group">
      <div 
        className="bg-white relative overflow-hidden w-full"
        style={{
          aspectRatio: '307/450'
        }}
      >
        <Image 
          src={getFullImageUrl(image || images?.[0])} 
          alt={name} 
          fill
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          style={{
            borderRadius: '32px'
          }}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = "/3.png" // Fallback image
          }}
        />
        <div 
          className="absolute bottom-0 left-0 right-0 bg-black text-white p-4 rounded-b-[32px] flex items-center justify-between"
          style={{
            height: '60px'
          }}
        >
          <div className="flex flex-col text-left flex-1 min-w-0">
            <span className="uppercase text-white truncate" style={{ fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif", fontSize: '13.41px', lineHeight: '14.6px', letterSpacing: '0px', fontWeight: 500 }} title={firstLine}>
              {firstLine || name}
            </span>
            {secondLine && (
            <span className="uppercase text-white truncate" style={{ fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif", fontSize: '13.41px', lineHeight: '14.6px', letterSpacing: '0px', fontWeight: 500 }} title={secondLine}>
              {secondLine}
            </span>
            )}
          </div>
          <p className="text-white font-bold text-right ml-2 flex-shrink-0" style={{ fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif", fontSize: '22px', lineHeight: '26px', letterSpacing: '0px', fontWeight: 600 }}>
            {formatCurrency(numericPrice)}
          </p>
        </div>
      </div>
    </Link>
  )
}