"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface Category {
  _id: string
  name: string
  description?: string
  image?: string
  carouselImage?: string
  discountPercentage?: number
  displaySection?: string
  sectionOrder?: number
  isActive: boolean
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

export default function MenCollection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://athlekt.com/api/api/categories/public/men')
      if (response.ok) {
        const data = await response.json()
        if (data.data && data.data.length > 0) {
          setCategories(data.data)
        }
      }
    } catch (error) {
      console.error("Failed to fetch men collection categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = async (category: Category) => {
    try {
      // Navigate directly to the main category page for men
      const url = `/categories?gender=men`
      console.log(`🔄 Navigating to category: ${url} for men's category: ${category.name}`)
      router.push(url)
      
    } catch (error) {
      console.error('Error handling category click:', error)
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
            ) : categories.length > 0 ? (
              // Display actual categories
              categories.slice(0, 4).map((category) => (
                <div 
                  key={category._id} 
                  className="group cursor-pointer"
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <Image
                      src={category.carouselImage || category.image || "/placeholder.svg?height=380&width=300"}
                      alt={category.name}
                      width={300}
                      height={380}
                      className="w-full h-[380px] object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                    {category.discountPercentage && category.discountPercentage > 0 && (
                      <div className="absolute top-4 left-4 bg-[#cbf26c] text-[#212121] px-3 py-1 rounded-md font-bold text-sm">
                        {category.discountPercentage}% OFF
                      </div>
                    )}
                  </div>
                  <div className="text-white">
                    <h3 className="text-lg font-bold mb-2 text-[#cbf26c]">{category.name}</h3>
                    <p className="text-lg font-semibold">
                      {category.description || "Premium athletic wear for men."}
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