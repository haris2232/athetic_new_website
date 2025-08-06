"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import CollectionHero from "@/components/sections/collection-hero"
import ProductCollection from "@/components/sections/product-collection"
import { Button } from "@/components/ui/button"

interface Product {
  id: string
  name: string
  price: string
  originalPrice?: string
  image: string
  images: string[]
  category: string
  subCategory: string
  collectionType: string
  description: string
  discountPercentage: number
  isOnSale: boolean
  colors: any[]
  sizes: any[]
  variants: any[]
  defaultVariant?: string
}

function SportsBrasContent() {
  const searchParams = useSearchParams()
  const gender = searchParams.get("gender") || "women"
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  
  // Fetch products when component mounts
  useEffect(() => {
    fetchProducts()
  }, [gender])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      
      // Fetch products from backend API
      const response = await fetch('http://34.18.0.53:5000/api/public/products/public/all')
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.success && data.data) {
          // Filter products based on sub-category and gender
          const filteredProducts = data.data.filter((product: Product) => {
            const productSubCategory = product.subCategory || ""
            const productCategory = product.category || ""
            
            // Check for sports bras
            let subCategoryMatch = false
            const productSubCategoryLower = productSubCategory.toLowerCase()
            const productNameLower = product.name.toLowerCase()
            
            // Direct match for sports bras
            if (productSubCategoryLower.includes('bra') || productNameLower.includes('bra') ||
                productSubCategoryLower.includes('sports') || productNameLower.includes('sports')) {
              subCategoryMatch = true
            }
            
            // Check if gender matches
            const genderMatch = gender === 'all' || 
                              product.category?.toLowerCase() === gender.toLowerCase()
            
            return subCategoryMatch && genderMatch
          })
          
          setProducts(filteredProducts)
        } else {
          setProducts([])
        }
      } else {
        setProducts([])
      }
    } catch (error) {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <CollectionHero title="Sports Bras Collection" />
        {loading ? (
          <div className="py-12 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center py-16">
                <p className="text-[#6e6e6e]">Loading products...</p>
              </div>
            </div>
          </div>
        ) : products.length > 0 ? (
          <ProductCollection products={products} loading={loading} />
        ) : (
          <div className="py-12 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-[#212121] mb-2">No products found</h3>
                <p className="text-[#6e6e6e] mb-6">Try adjusting your filters or browse our full collection.</p>
                <Button className="bg-[#212121] text-white hover:bg-black">
                  Reset Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default function SportsBrasPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SportsBrasContent />
    </Suspense>
  )
}
