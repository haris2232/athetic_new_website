"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import CategoriesGrid from "@/components/sections/categories-grid"

function CategoriesContent() {
  const searchParams = useSearchParams()
  const gender = searchParams.get("gender")

  return <CategoriesGrid selectedGender={gender} />
}

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* Banner Image Section */}
      <div className="mt-32 mb-20 container mx-auto px-4 flex justify-center overflow-visible">
        <div className="relative w-full max-w-[1250px] h-[235px] overflow-visible">
          {/* Background Banner */}
          <img 
            src="/2.png" 
            alt="Banner" 
            className="w-full h-full object-cover rounded-[74px]"
          />
          {/* Center Image Overlay - Upper body above banner, lower body inside banner only */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 overflow-visible flex items-end justify-center">
            <img 
              src="/1.png" 
              alt="Runner" 
              className="w-[321px] h-[347px] object-contain z-10"
              style={{ maxHeight: 'none' }}
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
