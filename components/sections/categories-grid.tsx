"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Grid3X3, SlidersHorizontal } from "lucide-react"
import ProductCard from "@/components/ui/product-card"

interface Product {
  id: string
  name: string
  price: string
  originalPrice?: string
  image: string
  images: string[]
  category: string
  subCategory?: string
  discountPercentage?: number
  isOnSale?: boolean
  isProductHighlight?: boolean
  rating?: number
  reviewRating?: number
  colors?: Array<{ name: string; hex?: string }>
  sizes?: string[]
}

const categoryTabs = [
  { id: "all", label: "ALL", active: true },
  { id: "t-shirts", label: "T-SHIRTS", active: false },
  { id: "shorts", label: "SHORTS", active: false },
  { id: "trousers", label: "TROUSERS", active: false },
  { id: "trainsets", label: "TRAINSETS", active: false },
  { id: "tanks", label: "TANKS", active: false },
]

interface CategoriesGridProps {
  selectedGender?: string | null
}

export default function CategoriesGrid({ selectedGender }: CategoriesGridProps) {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState("grid")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Normalize gender to lowercase for consistent comparison
  const normalizedGender = selectedGender?.toLowerCase().trim() || null

  const fetchProducts = async () => {
    try {
      setLoading(true)
      console.log("🔍 Fetching products for gender:", normalizedGender)
      
      const response = await fetch('https://athlekt.com/backendnew/api/public/products/public/all')
      if (response.ok) {
        const data = await response.json()
        console.log("📦 API Response:", data)
        
        if (data.success && data.data) {
          // Filter products based on gender (case-insensitive)
          let filteredProducts = data.data
          
          if (normalizedGender === 'men') {
            filteredProducts = data.data.filter((product: Product) => {
              const category = product.category?.toLowerCase().trim()
              return category === 'men' || category === 'man' || category === 'male'
            })
            console.log(`✅ Filtered ${filteredProducts.length} products for MEN out of ${data.data.length} total`)
          } else if (normalizedGender === 'women') {
            filteredProducts = data.data.filter((product: Product) => {
              const category = product.category?.toLowerCase().trim()
              return category === 'women' || category === 'woman' || category === 'female'
            })
            console.log(`✅ Filtered ${filteredProducts.length} products for WOMEN out of ${data.data.length} total`)
          } else {
            // If no gender selected, show all products
            console.log(`✅ Showing all ${data.data.length} products (no gender filter)`)
          }
          
          // Log first few product categories for debugging
          if (filteredProducts.length > 0) {
            console.log("📋 Sample categories:", filteredProducts.slice(0, 5).map((p: Product) => p.category))
          }
          
          setProducts(filteredProducts)
        } else {
          console.log("⚠️ No products found in API response")
          setProducts([])
        }
      } else {
        console.error("❌ API response not ok:", response.status)
        setProducts([])
      }
    } catch (error) {
      console.error("❌ Error fetching products:", error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
    // Reset category filter when gender changes
    setSelectedCategory("all")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedGender])

  // Get gender display name
  const getGenderDisplay = () => {
    if (normalizedGender === "women") return "WOMEN"
    return "MEN" // Default to MEN
  }

  // Filter products based on selected category
  const getFilteredProducts = () => {
    if (selectedCategory === "all") {
      return products
    }
    
    return products.filter(product => {
      const productSubCategory = product.subCategory?.toLowerCase().trim()
      const selectedCategoryLower = selectedCategory.toLowerCase().trim()
      
      if (selectedCategoryLower === "t-shirts" || selectedCategoryLower === "tees") {
        return productSubCategory === "t-shirts" || 
               productSubCategory === "t-shirt" || 
               productSubCategory === "tee" ||
               productSubCategory === "tees"
      } else if (selectedCategoryLower === "shorts") {
        return productSubCategory === "shorts" || productSubCategory === "short"
      } else if (selectedCategoryLower === "trousers") {
        return productSubCategory === "trousers" || productSubCategory === "trouser"
      } else if (selectedCategoryLower === "trainsets") {
        return productSubCategory === "trainsets" || productSubCategory === "twinsets"
      } else if (selectedCategoryLower === "tanks" || selectedCategoryLower === "tank top") {
        return productSubCategory === "tanks" || 
               productSubCategory === "tank" ||
               productSubCategory === "tank top" ||
               productSubCategory === "tank-top"
      } else if (selectedCategoryLower === "hoodie") {
        return productSubCategory === "hoodie" || 
               productSubCategory === "hoodies" ||
               productSubCategory === "hood"
      }
      
      return true
    })
  }

  // Get "You May Also Like" products - Smart recommendation logic
  const getRecommendedProducts = () => {
    if (products.length === 0) return []
    
    // Get IDs of currently displayed products to avoid duplicates
    const displayedProductIds = filteredProducts.map(p => p.id).filter(Boolean)
    
    // Priority-based recommendation logic:
    // 1. Same gender category products (already filtered in `products`)
    // 2. Exclude products already shown in main grid
    // 3. Prioritize: Featured/Highlighted > On Sale > High Rating > Others
    // 4. Prefer different subcategories than currently displayed
    // 5. Limit to 4 products
    
    const currentSubCategories = filteredProducts
      .filter(p => p.subCategory)
      .map(p => p.subCategory?.toLowerCase().trim())
      .filter(Boolean)
    
    // Filter out already displayed products
    let recommended = products.filter(product => 
      !displayedProductIds.includes(product.id)
    )
    
    // Sort by priority: Featured > On Sale > Rating > Random
    recommended.sort((a, b) => {
      // Priority 1: Featured/Highlighted products first
      const aFeatured = a.isProductHighlight ? 1 : 0
      const bFeatured = b.isProductHighlight ? 1 : 0
      if (aFeatured !== bFeatured) return bFeatured - aFeatured
      
      // Priority 2: Products on sale
      const aOnSale = a.isOnSale ? 1 : 0
      const bOnSale = b.isOnSale ? 1 : 0
      if (aOnSale !== bOnSale) return bOnSale - aOnSale
      
      // Priority 3: Higher ratings
      const aRating = a.rating || a.reviewRating || 0
      const bRating = b.rating || b.reviewRating || 0
      if (Math.abs(aRating - bRating) > 0.1) return bRating - aRating
      
      // Priority 4: Different subcategories (show variety)
      const aSubCat = a.subCategory?.toLowerCase().trim()
      const bSubCat = b.subCategory?.toLowerCase().trim()
      const aHasDifferentSubCat = aSubCat && !currentSubCategories.includes(aSubCat)
      const bHasDifferentSubCat = bSubCat && !currentSubCategories.includes(bSubCat)
      if (aHasDifferentSubCat !== bHasDifferentSubCat) {
        return bHasDifferentSubCat ? 1 : -1
      }
      
      return 0
    })
    
    // Take first 4 products
    return recommended.slice(0, 4)
  }

  const filteredProducts = getFilteredProducts()

  return (
    <div className="bg-white">
      {/* New Design Section - Below Banner */}
      <div className="bg-white text-[#212121] pt-0 pb-20">
        <div className="container mx-auto px-4 max-w-[1250px]">
          {/* Top Section - Gender heading and Lorem ipsum */}
          <div className="flex flex-col lg:flex-row lg:items-stretch lg:justify-between mb-8 gap-6">
            {/* Left - Gender Heading */}
            <div className="flex-1 flex flex-col">
              <h1 
                className="uppercase mb-6 text-black leading-none"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontWeight: 400,
                  fontSize: '90px',
                  letterSpacing: '-3.37px'
                }}
              >
                {normalizedGender === 'women' ? 'WOMEN' : 'MEN'}
              </h1>
              
              {/* Product Type Navigation */}
              <div className="flex flex-wrap gap-6 mb-4">
                <button 
                  onClick={() => setSelectedCategory('all')}
                  className={`uppercase text-left hover:text-gray-600 transition-colors ${
                    selectedCategory === 'all' ? 'text-black font-bold' : 'text-black'
                  }`}
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: '22.18px',
                    lineHeight: '31.1px',
                    letterSpacing: '-0.8px',
                    fontWeight: selectedCategory === 'all' ? 700 : 500
                  }}
                >
                  ALL
                </button>
                <button 
                  onClick={() => setSelectedCategory('t-shirts')}
                  className={`uppercase text-left hover:text-gray-600 transition-colors ${
                    selectedCategory === 't-shirts' ? 'text-black font-bold' : 'text-black'
                  }`}
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: '22.18px',
                    lineHeight: '31.1px',
                    letterSpacing: '-0.8px',
                    fontWeight: selectedCategory === 't-shirts' ? 700 : 500
                  }}
                >
                  TEES
                </button>
                <button 
                  onClick={() => setSelectedCategory('tanks')}
                  className={`uppercase text-left hover:text-gray-600 transition-colors ${
                    selectedCategory === 'tanks' ? 'text-black font-bold' : 'text-black'
                  }`}
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: '22.18px',
                    lineHeight: '31.1px',
                    letterSpacing: '-0.8px',
                    fontWeight: selectedCategory === 'tanks' ? 700 : 500
                  }}
                >
                  TANK TOP
                </button>
                <button 
                  onClick={() => setSelectedCategory('shorts')}
                  className={`uppercase text-left hover:text-gray-600 transition-colors ${
                    selectedCategory === 'shorts' ? 'text-black font-bold' : 'text-black'
                  }`}
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: '22.18px',
                    lineHeight: '31.1px',
                    letterSpacing: '-0.8px',
                    fontWeight: selectedCategory === 'shorts' ? 700 : 500
                  }}
                >
                  SHORTS
                </button>
                <button 
                  onClick={() => setSelectedCategory('hoodie')}
                  className={`uppercase text-left hover:text-gray-600 transition-colors ${
                    selectedCategory === 'hoodie' ? 'text-black font-bold' : 'text-black'
                  }`}
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: '22.18px',
                    lineHeight: '31.1px',
                    letterSpacing: '-0.8px',
                    fontWeight: selectedCategory === 'hoodie' ? 700 : 500
                  }}
                >
                  HOODIE
                </button>
              </div>
              
              {/* Filter Option */}
              <div className="flex items-center gap-2 mt-auto">
                <span className="uppercase text-black font-bold" style={{ fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif", fontSize: '14px', fontWeight: 600 }}>Filter</span>
                <span className="text-base text-black font-bold">→</span>
              </div>
            </div>
            
            {/* Right - Lorem ipsum text and Sort By */}
            <div className="flex-1 lg:max-w-[412px] flex flex-col">
              <p 
                className="text-black text-left leading-normal"
                style={{
                  fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                  fontSize: '14px',
                  letterSpacing: '0px',
                  fontWeight: 500
                }}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
              </p>
              
              {/* Sort By - Exactly opposite to Filter */}
              <div className="flex items-center gap-2 justify-end mt-auto">
                <span className="uppercase text-black font-bold" style={{ fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif", fontSize: '14px', fontWeight: 600 }}>Sort By:</span>
                <select className="uppercase text-black font-bold bg-transparent border-none outline-none cursor-pointer" style={{ fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif", fontSize: '14px', fontWeight: 600 }}>
                  <option>Featured</option>
                </select>
                <span className="text-base text-black font-bold">↓</span>
              </div>
            </div>
          </div>

          {/* Product Grid - Dynamic Products from API */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {/* Loading skeleton */}
              {Array.from({ length: 8 }).map((_, index) => (
                <div 
                  key={index}
                  className="bg-white relative overflow-hidden w-full animate-pulse"
                  style={{
                    aspectRatio: '307/450'
                  }}
                >
                  <div className="w-full h-full bg-gray-200 rounded-[32px]"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {filteredProducts.map((product) => {
                // Split product name into two lines if it contains spaces
                const nameParts = product.name.split(' ').filter(Boolean)
                const firstLine = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ')
                const secondLine = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ') || ''
                
                return (
                  <Link key={product.id} href={`/product/${product.id}`} className="block cursor-pointer">
            <div 
              className="bg-white relative overflow-hidden w-full"
              style={{
                aspectRatio: '307/450'
              }}
            >
              <img 
                        src={product.image || product.images?.[0] || "/3.png"} 
                        alt={product.name} 
                className="w-full h-full object-cover"
                style={{
                  borderRadius: '32px'
                }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/3.png"
                }}
              />
              <div 
                className="absolute bottom-0 left-0 right-0 bg-black text-white p-4 rounded-b-[32px] flex items-center justify-between"
                style={{
                  height: '60px'
                }}
              >
                        <div className="flex flex-col text-left flex-1 min-w-0">
                  <span 
                            className="uppercase text-white truncate"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                            title={firstLine}
                  >
                            {firstLine || product.name}
                  </span>
                          {secondLine && (
                  <span 
                              className="uppercase text-white truncate"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                              title={secondLine}
                  >
                              {secondLine}
                  </span>
                          )}
                </div>
                <p 
                          className="text-white font-bold text-right ml-2 flex-shrink-0"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: '22px',
                    lineHeight: '26px',
                    letterSpacing: '0px',
                    fontWeight: 600
                  }}
                >
                          {product.price || 'AED 0'}
                </p>
              </div>
            </div>
            </Link>
                )
              })}
                </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              <div className="col-span-full text-center py-12">
                <p className="text-black text-lg">
                  No products found for {getGenderDisplay()}
                </p>
              </div>
            </div>
          )}
                </div>
      </div>

      {/* YOU MAY ALSO LIKE Section */}
      <div className="bg-white text-[#212121] pt-0 pb-20">
        <div className="container mx-auto px-4 max-w-[1250px]">
          {/* Top Section - YOU MAY ALSO LIKE heading and Lorem ipsum */}
          <div className="flex flex-col lg:flex-row lg:items-stretch lg:justify-between mb-8 gap-6">
            {/* Left - YOU MAY ALSO LIKE Heading */}
            <div className="flex-1 flex flex-col">
              <h1 
                className="uppercase mb-6 text-black leading-none"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontWeight: 400,
                  fontSize: '90px',
                  letterSpacing: '-3.37px'
                }}
              >
                YOU MAY ALSO LIKE
              </h1>
            </div>
            
            {/* Right - Lorem ipsum text */}
            <div className="flex-1 lg:max-w-[412px] flex flex-col">
              <p 
                className="text-black text-left leading-normal"
                style={{
                  fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                  fontSize: '14px',
                  letterSpacing: '0px',
                  fontWeight: 500
                }}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
              </p>
            </div>
          </div>

          {/* Product Grid - Dynamic Recommended Products */}
          {getRecommendedProducts().length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {getRecommendedProducts().map((product) => {
                // Split product name into two lines if it contains spaces
                const nameParts = product.name.split(' ').filter(Boolean)
                const firstLine = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ')
                const secondLine = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ') || ''
                
                return (
                  <Link key={product.id} href={`/product/${product.id}`} className="block cursor-pointer">
            <div 
              className="bg-white relative overflow-hidden w-full"
              style={{
                aspectRatio: '307/450'
              }}
            >
              <img 
                        src={product.image || product.images?.[0] || "/3.png"} 
                        alt={product.name} 
                className="w-full h-full object-cover"
                style={{
                  borderRadius: '32px'
                }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/3.png"
                }}
              />
              <div 
                className="absolute bottom-0 left-0 right-0 bg-black text-white p-4 rounded-b-[32px] flex items-center justify-between"
                style={{
                  height: '60px'
                }}
              >
                        <div className="flex flex-col text-left flex-1 min-w-0">
                  <span 
                            className="uppercase text-white truncate"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                            title={firstLine}
                  >
                            {firstLine || product.name}
                  </span>
                          {secondLine && (
                  <span 
                              className="uppercase text-white truncate"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                              title={secondLine}
                  >
                              {secondLine}
                  </span>
                          )}
                </div>
                <p 
                          className="text-white font-bold text-right ml-2 flex-shrink-0"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: '22px',
                    lineHeight: '26px',
                    letterSpacing: '0px',
                    fontWeight: 600
                  }}
                >
                          {product.price || 'AED 0'}
                </p>
              </div>
            </div>
                  </Link>
                )
              })}
                </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              <div className="col-span-full text-center py-12">
                <p className="text-black text-lg">
                  No recommended products available
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
