"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface SubCategory {
  _id: string
  name: string
  category: string
  description?: string
  image?: string
  carouselImage?: string
  discountPercentage?: number
  isActive: boolean
  createdAt: string
}

export default function MenCollection() {
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
        if (data.data && data.data.length > 0) {
          // Filter only men's sub-categories
          const menSubCategories = data.data.filter((subCat: SubCategory) => 
            subCat.category.toLowerCase() === 'men' && subCat.isActive
          )
          setSubCategories(menSubCategories)
        }
      }
    } catch (error) {
      console.error("Failed to fetch men collection sub-categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubCategoryClick = async (subCategory: SubCategory) => {
    try {
      // Navigate to the specific sub-category page
      const url = `/categories/${subCategory.name.toLowerCase().replace(/\s+/g, '-')}?gender=men`
      console.log(`🔄 Navigating to sub-category: ${url} for men's sub-category: ${subCategory.name}`)
      router.push(url)
      
    } catch (error) {
      console.error('Error handling sub-category click:', error)
      // Fallback to main category page
      const url = `/categories?gender=men`
      console.log(`🔄 Fallback navigation to: ${url}`)
      router.push(url)
    }
  }

  const handleMainImageClick = () => {
    // Navigate to categories page with men gender parameter
    const url = `/categories?gender=men`
    console.log(`🔄 Navigating to: ${url} for men's collection`)
    router.push(url)
  }

  return (
    <section className="py-20 bg-[#212121]">
      <div className="container mx-auto px-4">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-wide">MEN COLLECTION</h2>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Side - Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              // Loading placeholders
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <div className="w-full h-[380px] bg-gray-600 animate-pulse" />
                  </div>
                  <div className="text-white">
                    <div className="h-6 bg-gray-600 rounded mb-2 animate-pulse" />
                    <div className="h-4 bg-gray-600 rounded animate-pulse" />
                  </div>
                </div>
              ))
            ) : subCategories.length > 0 ? (
              // Display actual sub-categories
              subCategories.slice(0, 4).map((subCategory) => (
                <div 
                  key={subCategory._id} 
                  className="group cursor-pointer"
                  onClick={() => handleSubCategoryClick(subCategory)}
                >
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <Image
                      src={subCategory.carouselImage || subCategory.image || "/placeholder.svg?height=380&width=300"}
                      alt={subCategory.name}
                      width={300}
                      height={380}
                      className="w-full h-[380px] object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                    {subCategory.discountPercentage && subCategory.discountPercentage > 0 && (
                      <div className="absolute top-4 left-4 bg-[#cbf26c] text-[#212121] px-3 py-1 rounded-md font-bold text-sm">
                        {subCategory.discountPercentage}% OFF
                      </div>
                    )}
                  </div>
                  <div className="text-white">
                    <h3 className="text-lg font-bold mb-2 text-[#cbf26c]">{subCategory.name}</h3>
                    <p className="text-lg font-semibold">
                      {subCategory.description || "Premium athletic wear for men."}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              // Fallback content when no products
              <>
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <Image
                      src="/placeholder.svg?height=380&width=300"
                      alt="Golden Era Fresh Legacy - Marvelous"
                      width={300}
                      height={380}
                      className="w-full h-[380px] object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                  </div>
                  <div className="text-white">
                    <h3 className="text-lg font-bold mb-2 text-[#cbf26c]">Golden Era Fresh Legacy - Marvelous</h3>
                    <p className="text-lg font-semibold">$50.00</p>
                  </div>
                </div>

                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <Image
                      src="/placeholder.svg?height=380&width=300"
                      alt="3Jogger Shorts - Navy"
                      width={300}
                      height={380}
                      className="w-full h-[380px] object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                  </div>
                  <div className="text-white">
                    <h3 className="text-lg font-bold mb-2 text-[#cbf26c]">3" Jogger Shorts - Navy</h3>
                    <p className="text-lg font-semibold">$50.00</p>
                  </div>
                </div>

                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <Image
                      src="/placeholder.svg?height=380&width=300"
                      alt="Sweat Tee - Paloma Grey Marl"
                      width={300}
                      height={380}
                      className="w-full h-[380px] object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                  </div>
                  <div className="text-white">
                    <h3 className="text-lg font-bold mb-2 text-[#cbf26c]">Sweat Tee - Paloma Grey Marl</h3>
                    <p className="text-lg font-semibold">$40.00</p>
                  </div>
                </div>

                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <Image
                      src="/placeholder.svg?height=380&width=300"
                      alt="Golden Era Fresh Legacy - Paloma"
                      width={300}
                      height={380}
                      className="w-full h-[380px] object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                  </div>
                  <div className="text-white">
                    <h3 className="text-lg font-bold mb-2 text-[#cbf26c]">Golden Era Fresh Legacy - Paloma</h3>
                    <p className="text-lg font-semibold">$50.00</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Side - Main Image */}
          <div 
            className="relative group cursor-pointer"
            onClick={handleMainImageClick}
          >
            <div className="relative overflow-hidden rounded-lg">
              <Image
                src="/images/men-collection.png"
                alt="Man in white long-sleeve shirt and black shorts in gym"
                width={600}
                height={800}
                className="w-full h-[900px] object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}