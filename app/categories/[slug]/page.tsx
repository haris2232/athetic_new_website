"use client"

import { useSearchParams } from "next/navigation"
import { useParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { notFound } from "next/navigation"
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

function CategoryContent() {
  const searchParams = useSearchParams()
  const params = useParams()
  const gender = searchParams.get("gender") || "men"
  const slug = params.slug as string
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  
  // Fetch products when component mounts
  useEffect(() => {
    fetchProducts()
  }, [slug, gender])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      
      // Convert slug back to readable name
      const subCategoryName = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      // Fetch products from backend API
      const response = await fetch('https://athlekt.com/api/api/public/products/public/all')
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.success && data.data) {
          // Filter products based on sub-category and gender
          const filteredProducts = data.data.filter((product: Product) => {
            const productSubCategory = product.subCategory || ""
            const productCategory = product.category || ""
            const subCategoryLower = subCategoryName.toLowerCase()
            
            // More flexible sub-category matching
            let subCategoryMatch = false
            
            // Convert both to lowercase for comparison
            const productSubCategoryLower = productSubCategory.toLowerCase()
            const subCategoryLowerForComparison = subCategoryName.toLowerCase()
            
            // Direct match
            if (productSubCategoryLower === subCategoryLowerForComparison) {
              subCategoryMatch = true
            }
            // Contains match
            else if (productSubCategoryLower.includes(subCategoryLowerForComparison) || subCategoryLowerForComparison.includes(productSubCategoryLower)) {
              subCategoryMatch = true
            }
            // Handle special cases
            else if (subCategoryLowerForComparison.includes('tank') && (productSubCategoryLower.includes('tank') || product.name.toLowerCase().includes('tank'))) {
              subCategoryMatch = true
            }
            else if (subCategoryLowerForComparison.includes('t-shirt') && (productSubCategoryLower.includes('shirt') || product.name.toLowerCase().includes('shirt') || product.name.toLowerCase().includes('tee'))) {
              subCategoryMatch = true
            }
            else if (subCategoryLowerForComparison.includes('short') && (productSubCategoryLower.includes('short') || product.name.toLowerCase().includes('short'))) {
              subCategoryMatch = true
            }
            else if (subCategoryLowerForComparison.includes('legging') && (productSubCategoryLower.includes('legging') || product.name.toLowerCase().includes('legging'))) {
              subCategoryMatch = true
            }
            else if (subCategoryLowerForComparison.includes('sports bra') && (productSubCategoryLower.includes('bra') || product.name.toLowerCase().includes('bra'))) {
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

  // Convert URL slug to readable name
  const getSubCategoryName = () => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <CollectionHero title={`${getSubCategoryName()} Collection`} />
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

export default function CategoryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CategoryContent />
    </Suspense>
  )
} 