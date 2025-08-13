"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

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

export default function SalePage() {
  const [menSubCategories, setMenSubCategories] = useState<SubCategory[]>([])
  const [womenSubCategories, setWomenSubCategories] = useState<SubCategory[]>([])
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
          // Filter men's sub-categories
          const menSubs = data.data.filter((subCat: SubCategory) => 
            subCat.category.toLowerCase() === 'men' && subCat.isActive
          )
          setMenSubCategories(menSubs)

          // Filter women's sub-categories
          const womenSubs = data.data.filter((subCat: SubCategory) => 
            subCat.category.toLowerCase() === 'women' && subCat.isActive
          )
          setWomenSubCategories(womenSubs)
        }
      }
    } catch (error) {
      console.error("Failed to fetch sub-categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubCategoryClick = (subCategory: SubCategory) => {
    const gender = subCategory.category.toLowerCase()
    const url = `/categories/${subCategory.name.toLowerCase().replace(/\s+/g, '-')}?gender=${gender}`
    console.log(`🔄 Navigating to sub-category: ${url} for ${subCategory.name}`)
    router.push(url)
  }

  return (
    <div className="min-h-screen bg-[#212121]">
      <Header />
      
      <main className="pt-20">
        {/* Page Header */}
        <section className="py-16 bg-[#212121]">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-white uppercase tracking-wide mb-4">
                SALE
              </h1>
              <p className="text-xl text-gray-300">
                Discover amazing deals on premium athletic wear
              </p>
            </div>
          </div>
        </section>

        {/* Men's Categories Section */}
        <section className="py-16 bg-[#1a1a1a]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-wide mb-4">
                MEN'S COLLECTION
              </h2>
              <p className="text-gray-300">Premium athletic wear for men</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="group cursor-pointer">
                    <div className="relative overflow-hidden rounded-lg mb-4">
                      <div className="w-full h-[380px] bg-gray-600 animate-pulse" />
                    </div>
                    <div className="text-white">
                      <div className="h-6 bg-gray-600 rounded mb-2 animate-pulse" />
                      <div className="h-4 bg-gray-600 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {menSubCategories.slice(0, 4).map((subCategory) => (
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
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Middle Banners Section */}
        <section className="py-16 bg-[#212121]">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* First Banner */}
              <div className="relative overflow-hidden rounded-lg group cursor-pointer">
                <Image
                  src="/images/sale-banner-1.jpg"
                  alt="Special Offer Banner"
                  width={600}
                  height={400}
                  className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white">
                  <h3 className="text-3xl font-bold mb-4">SUMMER SALE</h3>
                  <p className="text-xl mb-6">Up to 50% off on selected items</p>
                  <button className="bg-[#cbf26c] text-[#212121] px-8 py-3 font-bold hover:bg-white transition-colors">
                    SHOP NOW
                  </button>
                </div>
              </div>

              {/* Second Banner */}
              <div className="relative overflow-hidden rounded-lg group cursor-pointer">
                <Image
                  src="/images/sale-banner-2.jpg"
                  alt="New Collection Banner"
                  width={600}
                  height={400}
                  className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white">
                  <h3 className="text-3xl font-bold mb-4">NEW ARRIVALS</h3>
                  <p className="text-xl mb-6">Fresh styles for your workout</p>
                  <button className="bg-[#cbf26c] text-[#212121] px-8 py-3 font-bold hover:bg-white transition-colors">
                    EXPLORE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Women's Categories Section */}
        <section className="py-16 bg-[#1a1a1a]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-wide mb-4">
                WOMEN'S COLLECTION
              </h2>
              <p className="text-gray-300">Stylish and comfortable athletic wear for women</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="group cursor-pointer">
                    <div className="relative overflow-hidden rounded-lg mb-4">
                      <div className="w-full h-[380px] bg-gray-600 animate-pulse" />
                    </div>
                    <div className="text-white">
                      <div className="h-6 bg-gray-600 rounded mb-2 animate-pulse" />
                      <div className="h-4 bg-gray-600 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {womenSubCategories.slice(0, 4).map((subCategory) => (
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
                        {subCategory.description || "Stylish and comfortable athletic wear for women."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
