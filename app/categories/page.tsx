"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useState } from "react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import CategoriesGrid from "@/components/sections/categories-grid"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://athlekt.com/backendnew/api"

type HeroImages = {
  background: string
  overlay: string
}

const DEFAULT_HERO: Record<"men" | "women", HeroImages> = {
  men: {
    background: "/2.png",
    overlay: "/1.png",
  },
  women: {
    background: "/2.png",
    overlay: "/1.png",
  },
}

function CategoriesContent() {
  const searchParams = useSearchParams()
  const gender = searchParams.get("gender")

  return <CategoriesGrid selectedGender={gender} />
}

export default function CategoriesPage() {
  const searchParams = useSearchParams()
  const genderParam = searchParams.get("gender")
  const normalizedGender = useMemo<"men" | "women">(() => {
    return genderParam?.toLowerCase() === "women" ? "women" : "men"
  }, [genderParam])

  const [heroImages, setHeroImages] = useState<HeroImages>(DEFAULT_HERO[normalizedGender])

  useEffect(() => {
    let isMounted = true

    const fetchHeroImages = async () => {
      try {
        if (isMounted) {
          setHeroImages(DEFAULT_HERO[normalizedGender])
        }
        const response = await fetch(`${API_BASE_URL}/categories/public/dashboard`)
        if (!response.ok) {
          if (isMounted) setHeroImages(DEFAULT_HERO[normalizedGender])
          return
        }

        const payload = await response.json()
        const data = payload?.data ?? payload
        const genderCategories = Array.isArray(data?.[normalizedGender]) ? data[normalizedGender] : []

        if (isMounted) {
          if (genderCategories.length > 0) {
            const category = genderCategories[0] || {}
            const background = category.carouselImage || category.image || DEFAULT_HERO[normalizedGender].background
            const overlay = category.image || category.carouselImage || DEFAULT_HERO[normalizedGender].overlay
            setHeroImages({ background, overlay })
          } else {
            setHeroImages(DEFAULT_HERO[normalizedGender])
          }
        }
      } catch (error) {
        console.error("Failed to fetch category hero images:", error)
        if (isMounted) {
          setHeroImages(DEFAULT_HERO[normalizedGender])
        }
      }
    }

    fetchHeroImages()

    return () => {
      isMounted = false
    }
  }, [normalizedGender])

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* Banner Image Section */}
      <div className="mt-32 mb-20 container mx-auto px-4 flex justify-center overflow-visible">
        <div className="relative w-full max-w-[1250px] h-[235px] overflow-visible">
          {/* Background Banner */}
          <img 
            src={heroImages.background} 
            alt={`${normalizedGender === "women" ? "Women" : "Men"} banner`} 
            className="w-full h-full object-cover rounded-[74px]"
            onError={(event) => {
              const target = event.target as HTMLImageElement
              target.src = DEFAULT_HERO[normalizedGender].background
            }}
          />
          {/* Center Image Overlay - Upper body above banner, lower body inside banner only */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 overflow-visible flex items-end justify-center">
            <img 
              src={heroImages.overlay} 
              alt={`${normalizedGender === "women" ? "Women" : "Men"} feature`} 
              className="w-[321px] h-[347px] object-contain z-10"
              style={{ maxHeight: 'none' }}
              onError={(event) => {
                const target = event.target as HTMLImageElement
                target.src = DEFAULT_HERO[normalizedGender].overlay
              }}
            />
          </div>
        </div>
      </div>
      <main>
        <Suspense fallback={<div>Loading...</div>}>
          <CategoriesContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
