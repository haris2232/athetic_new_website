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
      <main>
        <Suspense fallback={<div>Loading...</div>}>
          <CategoriesContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
