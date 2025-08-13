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

export default function WomenCollection() {
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
          // Filter only women's sub-categories
          const womenSubCategories = data.data.filter((subCat: SubCategory) => 
            subCat.category.toLowerCase() === 'women' && subCat.isActive
          )
          setSubCategories(womenSubCategories)
        }
      }
    } catch (error) {
      console.error("Failed to fetch women collection sub-categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubCategoryClick = async (subCategory: SubCategory) => {
    try {
      // Navigate to the specific sub-category page
      const url = `/categories/${subCategory.name.toLowerCase().replace(/\s+/g, '-')}?gender=women`
      console.log(`🔄 Navigating to sub-category: ${url} for women's sub-category: ${subCategory.name}`)
      router.push(url)
      
    } catch (error) {
      console.error('Error handling sub-category click:', error)
      // Fallback to main category page
      const url = `/categories?gender=women`
      console.log(`🔄 Fallback navigation to: ${url}`)
      router.push(url)
    }
  }

  const handleMainImageClick = () => {
    // Navigate to categories page with women gender parameter
    const url = `/categories?gender=women`
    console.log(`🔄 Navigating to: ${url} for women's collection`)
    router.push(url)
  }

  return (
    <section className="py-20 bg-[#212121]">
      <div className="container mx-auto px-4">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-wide">WOMEN COLLECTION</h2>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Side - Main Image */}
          <div 
            className="relative group cursor-pointer"
            onClick={handleMainImageClick}
          >
            <div className="relative overflow-hidden rounded-lg">
              <Image
                src="/images/women-collection-main.jpg"
                alt="Woman in pink sports bra working out with dumbbells"
                width={600}
                height={800}
                className="w-full h-[900px] object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
            </div>
          </div>

          {/* Right Side - Products Grid */}
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
                    <h3 className="text-lg font-bold mb-2 uppercase text-[#cbf26c]">{subCategory.name}</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {subCategory.description || "Get ready for the ultimate style and performance combo."}
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
                      alt="T-Shirts & Tops"
                      width={300}
                      height={380}
                      className="w-full h-[380px] object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                  </div>
                  <div className="text-white">
                    <h3 className="text-lg font-bold mb-2 uppercase text-[#cbf26c]">T-Shirts & Tops</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Get ready for the ultimate style and performance combo with our women's gym t-shirts.
                    </p>
                  </div>
                </div>

                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <Image
                      src="/placeholder.svg?height=380&width=300"
                      alt="Running"
                      width={300}
                      height={380}
                      className="w-full h-[380px] object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                  </div>
                  <div className="text-white">
                    <h3 className="text-lg font-bold mb-2 uppercase text-[#cbf26c]">Running</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Running stuff so good it'll (almost) make you want to do cardio.
                    </p>
                  </div>
                </div>

                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <Image
                      src="/placeholder.svg?height=380&width=300"
                      alt="Ready for Lift(ing) Off"
                      width={300}
                      height={380}
                      className="w-full h-[380px] object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                  </div>
                  <div className="text-white">
                    <h3 className="text-lg font-bold mb-2 uppercase text-[#cbf26c]">Ready for Lift(ing) Off</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      These new rest day essentials make for perfect travel fits.
                    </p>
                  </div>
                </div>

                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <Image
                      src="/placeholder.svg?height=380&width=300"
                      alt="Extra 30% Off Last Chance Looks"
                      width={300}
                      height={380}
                      className="w-full h-[380px] object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                    <div className="absolute top-4 left-4 bg-[#cbf26c] text-[#212121] px-3 py-1 rounded-md font-bold text-sm">
                      30% OFF
                    </div>
                  </div>
                  <div className="text-white">
                    <h3 className="text-lg font-bold mb-2 uppercase text-[#cbf26c]">Extra 30% Off Last Chance Looks</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      This bank holiday grab your new season staples and make it the kit you wear when you hit a PB.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
