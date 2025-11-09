"use client"

import { useState, useEffect } from "react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import ProductCard from "@/components/ui/product-card"
import type { Product } from "@/lib/types"
import Link from "next/link"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://athlekt.com/backendnew/api"

const getFullImageUrl = (url?: string) => {
  if (!url) return ""
  let normalized = url
  if (normalized.startsWith("http") || normalized.startsWith("/")) {
    if (normalized.includes("//athlekt.com/uploads/")) {
      normalized = normalized.replace("//athlekt.com/uploads/", "//athlekt.com/backendnew/uploads/")
    }
    if (normalized.startsWith("/uploads")) {
      return `${API_BASE_URL}${normalized}`
    }
    return normalized
  }
  if (normalized.startsWith("uploads")) {
    normalized = `/backendnew/${normalized}`
  }
  return `${API_BASE_URL}/${normalized}`
}

const Banner = ({ imageUrl, altText }: { imageUrl: string; altText: string }) => (
  <div className="relative w-full h-80">
    <img src={imageUrl} alt={altText} className="w-full h-full object-cover" />
    <div className="absolute inset-0 bg-black bg-opacity-50" />
  </div>
)

const ProductGrid = ({ products, categoryName, loading }: { products: Product[]; categoryName: string; loading: boolean }) => {
  if (loading) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg">Loading {categoryName} products...</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-gray-800">
        <h3 className="text-xl font-semibold mb-2">No Sale Products Found</h3>
        <p className="text-gray-500">There are currently no {categoryName} products on sale.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-8">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          price={product.price}
          originalPrice={product.originalPrice}
          discount={product.isOnSale ? product.discountPercentage : undefined}
          image={product.image}
          slug={product.slug}
        />
      ))}
    </div>
  )
}

export default function CombinedSalePage() {
  const [menProducts, setMenProducts] = useState<Product[]>([])
  const [womenProducts, setWomenProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [salesImages, setSalesImages] = useState({
    image1: "",
    image2: "",
  })
  const [loadingSalesImages, setLoadingSalesImages] = useState(true)

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_BASE_URL}/products/public/all`)

        if (response.ok) {
          const data = await response.json()
          const productsArray: Product[] = Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data)
            ? data
            : []

          if (productsArray.length > 0) {
            const menData = productsArray.filter((p: Product) =>
              p.category?.toLowerCase() === "men" && p.isOnSale
            )
            setMenProducts(menData)

            const womenData = productsArray.filter((p: Product) =>
              p.category?.toLowerCase() === "women" && p.isOnSale
            )
            setWomenProducts(womenData)
          }
        } else {
          console.error("API response was not ok:", response.status)
        }
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllProducts()
  }, [])

  useEffect(() => {
    const fetchSalesImages = async () => {
      try {
        setLoadingSalesImages(true)
        const response = await fetch(`${API_BASE_URL}/settings/public`)
        if (response.ok) {
          const data = await response.json()
          const settingsData = data?.data && typeof data.data === "object" ? data.data : data
          console.log("🔍 Sales settings received:", settingsData)
          setSalesImages({
            image1: getFullImageUrl(settingsData?.salesImage1),
            image2: getFullImageUrl(settingsData?.salesImage2),
          })
        } else {
          console.error("Failed to fetch sales images:", response.status)
        }
      } catch (error) {
        console.error("Error fetching sales images:", error)
      } finally {
        setLoadingSalesImages(false)
      }
    }

    fetchSalesImages()
  }, [])

  const menBannerImage = salesImages.image1 || "/images/men.png"
  const womenBannerImage = salesImages.image2 || "/images/woman.png"

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section id="men-collection" className="py-12">
        <Banner
          altText="Promotional banner for the Men's Sale Collection"
          imageUrl={menBannerImage}
        />
        <div className="mt-12">
          <h2 className="text-4xl font-extrabold uppercase tracking-wider text-black text-center mb-10">
            Men's Sale
          </h2>
          <ProductGrid products={menProducts} categoryName="men's" loading={loading} />
        </div>
      </section>

      <hr className="border-t border-gray-700 mx-8 my-16" />

      <section id="women-collection" className="py-12">
        <Banner
          altText="Promotional banner for the Women's Sale Collection"
          imageUrl={womenBannerImage}
        />
        <div className="mt-12">
          <h2 className="text-4xl font-extrabold uppercase tracking-wider text-black text-center mb-10">
            Women's Sale
          </h2>
          <ProductGrid products={womenProducts} categoryName="women's" loading={loading} />
        </div>
      </section>

      <Footer />
    </div>
  )
}
