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

const getFullImageUrl = (url?: string) => {
  if (!url) return ""
  if (url.startsWith("http")) return url
  const baseUrl = API_BASE_URL.replace("/api", "")
  if (url.startsWith("/")) return `${baseUrl}${url}`
  return `${baseUrl}/${url}`
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

  const [heroSettings, setHeroSettings] = useState<Record<"men" | "women", HeroImages>>(DEFAULT_HERO)

  useEffect(() => {
    let isMounted = true

    const fetchHeroImages = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/settings/public`)
        if (!response.ok) {
          if (isMounted) {
            setHeroSettings(DEFAULT_HERO)
          }
          return
        }

        const settings = await response.json()
        if (!settings || typeof settings !== "object") {
          if (isMounted) setHeroSettings(DEFAULT_HERO)
          return
        }

        const menBackground = getFullImageUrl(settings.categoriesMenBackground) || DEFAULT_HERO.men.background
        const menOverlay = getFullImageUrl(settings.categoriesMenForeground) || DEFAULT_HERO.men.overlay
        const womenBackground = getFullImageUrl(settings.categoriesWomenBackground) || DEFAULT_HERO.women.background
        const womenOverlay = getFullImageUrl(settings.categoriesWomenForeground) || DEFAULT_HERO.women.overlay

        if (isMounted) {
          setHeroSettings({
            men: { background: menBackground, overlay: menOverlay },
            women: { background: womenBackground, overlay: womenOverlay },
          })
        }
      } catch (error) {
        console.error("Failed to fetch category hero images:", error)
        if (isMounted) {
          setHeroSettings(DEFAULT_HERO)
        }
      }
    }

    fetchHeroImages()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    // Ensure fallback to defaults if current gender missing
    setHeroSettings((prev) => ({
      men: {
        background: prev.men?.background || DEFAULT_HERO.men.background,
        overlay: prev.men?.overlay || DEFAULT_HERO.men.overlay,
      },
      women: {
        background: prev.women?.background || DEFAULT_HERO.women.background,
        overlay: prev.women?.overlay || DEFAULT_HERO.women.overlay,
      },
    }))
  }, [normalizedGender])

  const heroImages = heroSettings[normalizedGender] || DEFAULT_HERO[normalizedGender]

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* Banner Image Section */}
      <div className="mt-32 mb-16 w-full px-4 sm:px-6 lg:px-10 flex justify-center pt-20">
        <div className="relative w-full max-w-[1400px]">
          <div className="relative w-full overflow-hidden rounded-[80px] bg-[#f2f2f2]">
            <div className="relative w-full" style={{ paddingTop: "18%" }}>
              <img 
                src={heroImages.background} 
                alt={`${normalizedGender === "women" ? "Women" : "Men"} banner`} 
                className="absolute inset-0 h-full w-full object-cover"
                onError={(event) => {
                  const target = event.target as HTMLImageElement
                  target.src = DEFAULT_HERO[normalizedGender].background
                }}
              />
            </div>
          </div>
          {/* Background Banner */}
          <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
            <img 
              src={heroImages.overlay} 
              alt={`${normalizedGender === "women" ? "Women" : "Men"} feature`} 
              className="w-[320px] md:w-[360px] lg:w-[400px] object-contain"
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
