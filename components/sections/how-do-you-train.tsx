"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
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

const trainingCategories = [
  {
    id: 1,
    title: "LIFTING",
    image: "/placeholder.svg?height=600&width=400",
    description: "Power through your strength training sessions",
  },
  {
    id: 2,
    title: "HIIT",
    image: "/placeholder.svg?height=600&width=400",
    description: "High-intensity interval training gear",
  },
  {
    id: 3,
    title: "RUNNING",
    image: "/placeholder.svg?height=600&width=400",
    description: "Built for speed and endurance",
  },
  {
    id: 4,
    title: "PILATES",
    image: "/placeholder.svg?height=600&width=400",
    description: "Flexible and comfortable for low-impact workouts",
  },
]

export default function HowDoYouTrain() {
  const [categoriesWithSubs, setCategoriesWithSubs] = useState<CategoryWithSubCategories[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchCategoriesWithSubCategories()
  }, [])

  const fetchCategoriesWithSubCategories = async () => {
    try {
      // Fetch categories
      const categoriesResponse = await fetch('https://athlekt.com/backendnew/api/categories/public/training')
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
      console.error("Failed to fetch training categories with sub-categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (categoryWithSubs: CategoryWithSubCategories) => {
    // Navigate to the specific category page
    const gender = categoryWithSubs.displaySection?.toLowerCase() === 'men' ? 'men' : 
                   categoryWithSubs.displaySection?.toLowerCase() === 'women' ? 'women' : 'all'
    const url = `/categories/${categoryWithSubs.name.toLowerCase().replace(/\s+/g, '-')}?gender=${gender}`
    console.log(`🔄 Navigating to category: ${url} for training: ${categoryWithSubs.name}`)
    router.push(url)
  }

  return (
    <section className="py-20 bg-[#212121]">
      <div className="container mx-auto px-4">
        {/* Section Heading */}
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-wide">HOW DO YOU TRAIN?</h2>
        </div>

        {/* Training Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            // Loading placeholders
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-lg mb-6">
                  <div className="w-full h-[500px] bg-gray-600 animate-pulse" />
                </div>
                <div className="mb-4">
                  <div className="h-8 bg-gray-600 rounded mb-2 animate-pulse" />
                </div>
                <div className="flex justify-center">
                  <div className="w-32 h-10 bg-gray-600 rounded animate-pulse" />
                </div>
              </div>
            ))
          ) : categoriesWithSubs.length > 0 ? (
            // Display actual categories with sub-category names
            categoriesWithSubs.slice(0, 4).map((categoryWithSubs, index) => (
              <div key={categoryWithSubs._id} className="group cursor-pointer" onClick={() => handleCategoryClick(categoryWithSubs)}>
                <div className="relative overflow-hidden rounded-lg mb-6">
                  <Image
                    src={categoryWithSubs.carouselImage || categoryWithSubs.image || "/placeholder.svg?height=600&width=400"}
                    alt={categoryWithSubs.name}
                    width={400}
                    height={600}
                    className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                  {categoryWithSubs.discountPercentage && categoryWithSubs.discountPercentage > 0 && (
                    <div className="absolute top-4 left-4 bg-[#cbf26c] text-[#212121] px-3 py-1 rounded-md font-bold text-sm">
                      {categoryWithSubs.discountPercentage}% OFF
                    </div>
                  )}
                </div>
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-white uppercase tracking-wide text-center">
                    {categoryWithSubs.subCategories.length > 0 
                      ? categoryWithSubs.subCategories[0].name 
                      : categoryWithSubs.name
                    }
                  </h3>
                  <p className="text-sm text-gray-300 text-center mt-2">
                    {categoryWithSubs.description || "Premium training gear for your workout."}
                  </p>
                </div>
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    className="border-2 border-[#cbf26c] text-[#cbf26c] hover:bg-[#cbf26c] hover:text-[#212121] bg-transparent font-semibold px-8 py-3 rounded-none transition-all duration-300 hover:scale-105"
                  >
                    Shop Now
                  </Button>
                </div>
              </div>
            ))
          ) : (
            // Fallback to original categories
            trainingCategories.map((category) => (
              <div key={category.id} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-lg mb-6">
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={`${category.title} workout gear`}
                    width={400}
                    height={600}
                    className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                </div>

                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-white uppercase tracking-wide text-center">{category.title}</h3>
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    className="border-2 border-[#cbf26c] text-[#cbf26c] hover:bg-[#cbf26c] hover:text-[#212121] bg-transparent font-semibold px-8 py-3 rounded-none transition-all duration-300 hover:scale-105"
                  >
                    Shop Now
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
