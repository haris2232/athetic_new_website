"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
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
          // Filter active sub-categories for training section
          const trainingSubCategories = data.data.filter((subCat: SubCategory) => 
            subCat.isActive
          )
          setSubCategories(trainingSubCategories)
        }
      }
    } catch (error) {
      console.error("Failed to fetch training sub-categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubCategoryClick = (subCategory: SubCategory) => {
    // Navigate to the specific sub-category page
    const gender = subCategory.category.toLowerCase() === 'men' ? 'men' : 
                   subCategory.category.toLowerCase() === 'women' ? 'women' : 'all'
    const url = `/categories/${subCategory.name.toLowerCase().replace(/\s+/g, '-')}?gender=${gender}`
    console.log(`🔄 Navigating to sub-category: ${url} for training: ${subCategory.name}`)
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
          ) : subCategories.length > 0 ? (
            // Display actual sub-categories
            subCategories.slice(0, 4).map((subCategory, index) => (
              <div key={subCategory._id} className="group cursor-pointer" onClick={() => handleSubCategoryClick(subCategory)}>
                <div className="relative overflow-hidden rounded-lg mb-6">
                  <Image
                    src={subCategory.carouselImage || subCategory.image || "/placeholder.svg?height=600&width=400"}
                    alt={subCategory.name}
                    width={400}
                    height={600}
                    className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                  {subCategory.discountPercentage && subCategory.discountPercentage > 0 && (
                    <div className="absolute top-4 left-4 bg-[#cbf26c] text-[#212121] px-3 py-1 rounded-md font-bold text-sm">
                      {subCategory.discountPercentage}% OFF
                    </div>
                  )}
                </div>
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-white uppercase tracking-wide text-center">{subCategory.name}</h3>
                  <p className="text-sm text-gray-300 text-center mt-2">
                    {subCategory.description || "Premium training gear for your workout."}
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
