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
  displaySection?: string
  sectionOrder?: number
  discountPercentage?: number
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

interface CategoryWithSubCategories extends Category {
  subCategories: SubCategory[]
}

export default function ProductCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [categoriesWithSubs, setCategoriesWithSubs] = useState<CategoryWithSubCategories[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchCategoriesWithSubCategories()
  }, [])

  const fetchCategoriesWithSubCategories = async () => {
    try {
      // Fetch categories
      const categoriesResponse = await fetch('https://athlekt.com/backendnew/api/categories/public/carousel')
      const categoriesData = await categoriesResponse.json()
      
      // Fetch all sub-categories
      const subCategoriesResponse = await fetch('https://athlekt.com/backendnew/api/subcategories/public')
      const subCategoriesData = await subCategoriesResponse.json()
      
      if (categoriesData.data && categoriesData.data.length > 0) {
        // Combine categories with their sub-categories
        const categoriesWithSubs = categoriesData.data.map((category: Category) => {
          const subCategories = subCategoriesData.data?.filter((subCat: SubCategory) => 
            subCat.category.toLowerCase() === category.name.toLowerCase() && subCat.isActive
          ) || []
          
          return {
            ...category,
            subCategories
          }
        })
        
        setCategoriesWithSubs(categoriesWithSubs)
        console.log('✅ Set carousel categories with sub-categories:', categoriesWithSubs)
      } else {
        console.log('⚠️ No carousel categories found')
        setCategoriesWithSubs([])
      }
    } catch (error) {
      console.error('Error fetching carousel categories with sub-categories:', error)
      setCategoriesWithSubs([])
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = async (categoryWithSubs: CategoryWithSubCategories) => {
    try {
      // Determine gender based on displaySection
      let gender = 'all';
      
      if (categoryWithSubs.displaySection?.toLowerCase() === 'men') {
        gender = 'men';
      } else if (categoryWithSubs.displaySection?.toLowerCase() === 'women') {
        gender = 'women';
      }
      
      const url = `/categories/${categoryWithSubs.name.toLowerCase().replace(/\s+/g, '-')}?gender=${gender}`;
      console.log(`🔄 Navigating to category: ${url} for category: ${categoryWithSubs.name} (section: ${categoryWithSubs.displaySection})`);
      router.push(url);
      
    } catch (error) {
      console.error('Error handling category click:', error);
      // Fallback to main category page
      const gender = categoryWithSubs.displaySection?.toLowerCase() === 'men' ? 'men' : categoryWithSubs.displaySection?.toLowerCase() === 'women' ? 'women' : 'all';
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
          {categoriesWithSubs.map((categoryWithSubs) => (
            <div 
              key={categoryWithSubs._id} 
              className="flex-shrink-0 w-64 group cursor-pointer"
              onClick={() => handleCategoryClick(categoryWithSubs)}
            >
              <div className="relative overflow-hidden bg-white p-1 shadow-lg hover:shadow-xl transition-all duration-300">
                <Image
                  src={categoryWithSubs.carouselImage || categoryWithSubs.image || "/placeholder.svg"}
                  alt={categoryWithSubs.name}
                  width={256}
                  height={400}
                  className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                {categoryWithSubs.discountPercentage && categoryWithSubs.discountPercentage > 0 && (
                  <div className="absolute top-4 left-4 bg-[#cbf26c] text-[#212121] px-3 py-1 rounded-md font-bold text-sm">
                    {categoryWithSubs.discountPercentage}% OFF
                  </div>
                )}
              </div>

              {/* Display sub-category name if available, otherwise category name */}
              <div className="mt-4 text-center">
                <p className="text-white text-sm font-medium uppercase tracking-wide">
                  {categoryWithSubs.subCategories.length > 0 
                    ? categoryWithSubs.subCategories[0].name 
                    : categoryWithSubs.name
                  }
                </p>
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
