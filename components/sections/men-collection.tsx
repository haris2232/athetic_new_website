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

export default function MenCollection() {
  const [categoriesWithSubs, setCategoriesWithSubs] = useState<CategoryWithSubCategories[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchCategoriesWithSubCategories()
  }, [])

  const fetchCategoriesWithSubCategories = async () => {
    try {
      // Fetch categories
      const categoriesResponse = await fetch('https://athlekt.com/backendnew/api/categories/public/men')
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
      }
    } catch (error) {
      console.error("Failed to fetch men collection categories with sub-categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = async (categoryWithSubs: CategoryWithSubCategories) => {
    try {
      // Navigate to the specific category page
      const url = `/categories/${categoryWithSubs.name.toLowerCase().replace(/\s+/g, '-')}?gender=men`
      console.log(`🔄 Navigating to category: ${url} for men's category: ${categoryWithSubs.name}`)
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
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#212121] uppercase tracking-wide">MEN COLLECTION</h2>
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
                  <div className="text-[#212121]">
                    <div className="h-6 bg-gray-600 rounded mb-2 animate-pulse" />
                    <div className="h-4 bg-gray-600 rounded animate-pulse" />
                  </div>
                </div>
              ))
            ) : categoriesWithSubs.length > 0 ? (
              // Display actual categories with sub-category names
              categoriesWithSubs.slice(0, 4).map((categoryWithSubs) => (
                <div 
                  key={categoryWithSubs._id} 
                  className="group cursor-pointer"
                  onClick={() => handleCategoryClick(categoryWithSubs)}
                >
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <Image
                      src={categoryWithSubs.carouselImage || categoryWithSubs.image || "/placeholder.svg?height=380&width=300"}
                      alt={categoryWithSubs.name}
                      width={300}
                      height={380}
                      className="w-full h-[380px] object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                    {categoryWithSubs.discountPercentage && categoryWithSubs.discountPercentage > 0 && (
                      <div className="absolute top-4 left-4 bg-[#ebff00] text-black px-3 py-1 rounded-md font-bold text-sm">
                        {categoryWithSubs.discountPercentage}% OFF
                      </div>
                    )}
                  </div>
                  <div className="text-[#212121]">
                    <h3 className="text-lg font-bold mb-2 text-black">
                      {categoryWithSubs.subCategories.length > 0 
                        ? categoryWithSubs.subCategories[0].name 
                        : categoryWithSubs.name
                      }
                    </h3>
                    <p className="text-lg font-semibold text-gray-800">
                      {categoryWithSubs.description || "Premium athletic wear for men."}
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
                  <div className="text-black">
                    <h3 className="text-lg font-bold mb-2 text-black">Golden Era Fresh Legacy - Marvelous</h3>
                    <p className="text-lg font-semibold text-gray-800">$50.00</p>
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
                  <div className="text-black">
                    <h3 className="text-lg font-bold mb-2 text-black">3" Jogger Shorts - Navy</h3>
                    <p className="text-lg font-semibold text-gray-800">$50.00</p>
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
                  <div className="text-black">
                    <h3 className="text-lg font-bold mb-2 text-black">Sweat Tee - Paloma Grey Marl</h3>
                    <p className="text-lg font-semibold text-gray-800">$40.00</p>
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
                  <div className="text-black">
                    <h3 className="text-lg font-bold mb-2 text-black">Golden Era Fresh Legacy - Paloma</h3>
                    <p className="text-lg font-semibold text-gray-800">$50.00</p>
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