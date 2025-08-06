"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface Category {
  _id: string
  name: string
  description?: string
  image?: string
  carouselImage?: string
  showInCarousel?: boolean
  carouselOrder?: number
  discountPercentage?: number
  displaySection?: string
  sectionOrder?: number
  isActive: boolean
  createdAt: string
}

interface SubCategory {
  _id: string
  name: string
  category: string
  description?: string
  image?: string
  isActive: boolean
  createdAt: string
}

export default function ProductCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://34.18.0.53:5000/api/categories/public/carousel')
      if (response.ok) {
        const data = await response.json()
        console.log('🎠 Carousel categories response:', data)
        if (data.data && data.data.length > 0) {
          setCategories(data.data)
          console.log('✅ Set carousel categories:', data.data)
        } else {
          console.log('⚠️ No carousel categories found')
          setCategories([])
        }
      } else {
        console.error('❌ Carousel API response not ok:', response.status)
        setCategories([])
      }
    } catch (error) {
      console.error('Error fetching carousel categories:', error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = async (category: Category) => {
    try {
      // Determine gender based on category name if displaySection is missing or incorrect
      let gender = 'all';
      
      if (category.displaySection === 'men' || category.name.toLowerCase() === 'men') {
        gender = 'men';
      } else if (category.displaySection === 'women' || category.name.toLowerCase() === 'women') {
        gender = 'women';
      }
      
      const url = `/categories?gender=${gender}`;
      console.log(`🔄 Navigating to category: ${url} for category: ${category.name} (displaySection: ${category.displaySection})`);
      router.push(url);
      
    } catch (error) {
      console.error('Error handling category click:', error);
      // Fallback to main category page
      const gender = category.name.toLowerCase() === 'men' ? 'men' : category.name.toLowerCase() === 'women' ? 'women' : 'all';
      const url = `/categories?gender=${gender}`;
      console.log(`🔄 Fallback navigation to: ${url}`);
      router.push(url);
    }
  }

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = 280 // Width of one item plus gap
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      })
      setTimeout(checkScrollButtons, 300)
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = 280 // Width of one item plus gap
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      })
      setTimeout(checkScrollButtons, 300)
    }
  }

  if (loading) {
    return (
      <section className="py-20 bg-[#212121] relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-wide">
              FEATURED COLLECTIONS MEN & WOMEN
            </h2>
          </div>
          <div className="flex justify-center">
            <div className="text-white">Loading products...</div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-[#212121] relative">
      <div className="container mx-auto px-4">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-wide">
            FEATURED COLLECTIONS MEN & WOMEN
          </h2>
        </div>

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          className={`absolute left-8 top-1/2 -translate-y-1/2 z-10 w-16 h-16 rounded-full bg-transparent hover:bg-black/20 transition-all duration-300 ${
            !canScrollLeft ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={scrollLeft}
          disabled={!canScrollLeft}
        >
          <Image src="/icons/arrow-left.svg" alt="Previous" width={24} height={40} className="w-6 h-10" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={`absolute right-8 top-1/2 -translate-y-1/2 z-10 w-16 h-16 rounded-full bg-transparent hover:bg-black/20 transition-all duration-300 ${
            !canScrollRight ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={scrollRight}
          disabled={!canScrollRight}
        >
          <Image src="/icons/arrow-right.svg" alt="Next" width={24} height={40} className="w-6 h-10" />
        </Button>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-16"
          onScroll={checkScrollButtons}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {categories.map((category) => (
            <div 
              key={category._id} 
              className="flex-shrink-0 w-64 group cursor-pointer"
              onClick={() => handleCategoryClick(category)}
            >
              <div className="relative overflow-hidden bg-white p-1 shadow-lg hover:shadow-xl transition-all duration-300">
                <Image
                  src={category.carouselImage || category.image || "/placeholder.svg"}
                  alt={category.name}
                  width={256}
                  height={400}
                  className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                {category.discountPercentage && category.discountPercentage > 0 && (
                  <div className="absolute top-4 left-4 bg-[#cbf26c] text-[#212121] px-3 py-1 rounded-md font-bold text-sm">
                    {category.discountPercentage}% OFF
                  </div>
                )}
              </div>

              {/* Category Label */}
              <div className="mt-4 text-center">
                <p className="text-white text-sm font-medium uppercase tracking-wide">{category.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}
