"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface SubCategory {
  _id: string
  name: string
  category: string
  description?: string
  image?: string
  carouselImage?: string
  showInCarousel?: boolean
  carouselOrder?: number
  discountPercentage?: number
  isActive: boolean
  createdAt: string
}

export default function ProductCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchSubCategories()
  }, [])

  const fetchSubCategories = async () => {
    try {
      const response = await fetch('https://athlekt.com/backendnew/api/subcategories/public')
      if (response.ok) {
        const data = await response.json()
        console.log('🎠 Carousel sub-categories response:', data)
        if (data.data && data.data.length > 0) {
          // Filter sub-categories that should be shown in carousel
          const carouselSubCategories = data.data.filter((subCat: SubCategory) => 
            subCat.showInCarousel !== false && subCat.isActive
          )
          setSubCategories(carouselSubCategories)
          console.log('✅ Set carousel sub-categories:', carouselSubCategories)
        } else {
          console.log('⚠️ No carousel sub-categories found')
          setSubCategories([])
        }
      } else {
        console.error('❌ Carousel API response not ok:', response.status)
        setSubCategories([])
      }
    } catch (error) {
      console.error('Error fetching carousel sub-categories:', error)
      setSubCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubCategoryClick = async (subCategory: SubCategory) => {
    try {
      // Determine gender based on category
      let gender = 'all';
      
      if (subCategory.category.toLowerCase() === 'men') {
        gender = 'men';
      } else if (subCategory.category.toLowerCase() === 'women') {
        gender = 'women';
      }
      
      const url = `/categories/${subCategory.name.toLowerCase().replace(/\s+/g, '-')}?gender=${gender}`;
      console.log(`🔄 Navigating to sub-category: ${url} for sub-category: ${subCategory.name} (category: ${subCategory.category})`);
      router.push(url);
      
    } catch (error) {
      console.error('Error handling sub-category click:', error);
      // Fallback to main category page
      const gender = subCategory.category.toLowerCase() === 'men' ? 'men' : subCategory.category.toLowerCase() === 'women' ? 'women' : 'all';
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
          {subCategories.map((subCategory) => (
            <div 
              key={subCategory._id} 
              className="flex-shrink-0 w-64 group cursor-pointer"
              onClick={() => handleSubCategoryClick(subCategory)}
            >
              <div className="relative overflow-hidden bg-white p-1 shadow-lg hover:shadow-xl transition-all duration-300">
                <Image
                  src={subCategory.carouselImage || subCategory.image || "/placeholder.svg"}
                  alt={subCategory.name}
                  width={256}
                  height={400}
                  className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                {subCategory.discountPercentage && subCategory.discountPercentage > 0 && (
                  <div className="absolute top-4 left-4 bg-[#cbf26c] text-[#212121] px-3 py-1 rounded-md font-bold text-sm">
                    {subCategory.discountPercentage}% OFF
                  </div>
                )}
              </div>

              {/* Sub-Category Label */}
              <div className="mt-4 text-center">
                <p className="text-white text-sm font-medium uppercase tracking-wide">{subCategory.name}</p>
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
