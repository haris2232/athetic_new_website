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

interface CategoriesGridProps {
  selectedGender?: string | null
}

export default function CategoriesGrid({ selectedGender }: CategoriesGridProps) {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState("grid")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [availableSubCategories, setAvailableSubCategories] = useState<string[]>([])

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
          
          // Extract unique sub-categories from filtered products
          const subCategories = Array.from(
            new Set(
              filteredProducts
                .map(product => product.subCategory?.toLowerCase().trim())
                .filter(Boolean)
            )
          ) as string[]

          console.log("📋 Available sub-categories:", subCategories)
          setAvailableSubCategories(subCategories)
          setProducts(filteredProducts)
        } else {
          console.log("⚠️ No products found in API response")
          setProducts([])
          setAvailableSubCategories([])
        }
      } else {
        console.error("❌ API response not ok:", response.status)
        setProducts([])
        setAvailableSubCategories([])
      }
    } catch (error) {
      console.error("❌ Error fetching products:", error)
      setProducts([])
      setAvailableSubCategories([])
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

  // Gender-specific content
  const getGenderContent = () => {
    if (normalizedGender === "women") {
      return "Activewear made for every woman.\nBecause not all bodies look the same and they shouldn't have to. Athlekt is designed to move with you, flatter your form, and fit the real you - every curve, every size, every story."
    } else {
      return "Activewear made for every man.\nBecause fitness isn't one size fits all. Athlekt is built for real bodies, from lean to broad, from gym regulars to weekend movers. Engineered for comfort, confidence, and performance that fits you right."
    }
  }

  // Format sub-category name for display
  const formatSubCategoryName = (subCategory: string) => {
    if (!subCategory) return ""
    
    const formatted = subCategory
      .toLowerCase()
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    // Special cases
    if (formatted.toLowerCase().includes('t shirt') || formatted.toLowerCase().includes('tee')) {
      return 'TEES'
    }
    if (formatted.toLowerCase().includes('tank')) {
      return 'TANK TOP'
    }
    if (formatted.toLowerCase().includes('hoodie')) {
      return 'HOODIE'
    }
    
    return formatted.toUpperCase()
  }

  // Get display name for sub-category
  const getSubCategoryDisplayName = (subCategory: string) => {
    const lowerSubCat = subCategory.toLowerCase()
    
    if (lowerSubCat.includes('t-shirt') || lowerSubCat.includes('tee') || lowerSubCat.includes('t shirt')) {
      return 'TEES'
    } else if (lowerSubCat.includes('tank')) {
      return 'TANK TOP'
    } else if (lowerSubCat.includes('short')) {
      return 'SHORTS'
    } else if (lowerSubCat.includes('hoodie')) {
      return 'HOODIE'
    } else if (lowerSubCat.includes('trouser') || lowerSubCat.includes('pant')) {
      return 'TROUSERS'
    } else if (lowerSubCat.includes('train') || lowerSubCat.includes('twin')) {
      return 'TRAINSETS'
    }
    
    return formatSubCategoryName(subCategory)
  }

  // Filter products based on selected category
  const getFilteredProducts = () => {
    if (selectedCategory === "all") {
      return products
    }
    
    return products.filter(product => {
      const productSubCategory = product.subCategory?.toLowerCase().trim()
      const selectedCategoryLower = selectedCategory.toLowerCase().trim()
      
      if (selectedCategoryLower === "tees" || selectedCategoryLower === "t-shirts") {
        return productSubCategory?.includes('t-shirt') || 
               productSubCategory?.includes('tee') ||
               productSubCategory?.includes('t shirt')
      } else if (selectedCategoryLower === "shorts") {
        return productSubCategory?.includes('short')
      } else if (selectedCategoryLower === "trousers") {
        return productSubCategory?.includes('trouser') || 
               productSubCategory?.includes('pant')
      } else if (selectedCategoryLower === "trainsets") {
        return productSubCategory?.includes('train') || 
               productSubCategory?.includes('twin')
      } else if (selectedCategoryLower === "tank top" || selectedCategoryLower === "tanks") {
        return productSubCategory?.includes('tank')
      } else if (selectedCategoryLower === "hoodie") {
        return productSubCategory?.includes('hoodie')
      }
      
      return productSubCategory === selectedCategoryLower
    })
  }

  // FIXED: Improved getRecommendedProducts function
  const getRecommendedProducts = () => {
    if (products.length === 0) {
      console.log("❌ No products available for recommendations")
      return []
    }
    
    console.log("🔍 Generating recommendations from", products.length, "total products")
    
    // Get IDs of currently displayed products to avoid duplicates
    const displayedProductIds = filteredProducts.map(p => p.id).filter(Boolean)
    console.log("📋 Currently displayed product IDs:", displayedProductIds)
    
    // If we have very few products, just return some from the same gender
    if (products.length <= 4) {
      const result = products.filter(product => !displayedProductIds.includes(product.id))
      console.log("📦 Few products available, returning:", result.length)
      return result
    }
    
    // Get current subcategories from displayed products
    const currentSubCategories = filteredProducts
      .map(p => p.subCategory?.toLowerCase().trim())
      .filter(Boolean)
    
    console.log("📋 Current subcategories:", currentSubCategories)
    
    // Filter out already displayed products
    let recommended = products.filter(product => {
      const isNotDisplayed = !displayedProductIds.includes(product.id)
      return isNotDisplayed
    })
    
    console.log("📦 Filtered recommendations count:", recommended.length)
    
    // If no recommendations after filtering, return some random products
    if (recommended.length === 0) {
      console.log("⚠️ No unique products found, returning random products")
      // Return up to 4 random products from the main list
      return [...products]
        .sort(() => 0.5 - Math.random())
        .slice(0, 4)
    }
    
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
    const finalRecommendations = recommended.slice(0, 4)
    console.log("🎯 Final recommendations:", finalRecommendations.length)
    console.log("📝 Recommended products:", finalRecommendations.map(p => ({ id: p.id, name: p.name })))
    
    return finalRecommendations
  }

  // Helper function to check if product has discount
  const hasDiscount = (product: Product) => {
    return product.discountPercentage && product.discountPercentage > 0
  }

  // Helper function to get discount percentage
  const getDiscountPercentage = (product: Product) => {
    return product.discountPercentage || 0
  }

  // Format price - remove .00 from the end - FIXED: Remove extra AED
  const formatPrice = (price: string | number) => {
    if (!price) return '0'
    
    const priceStr = price.toString()
    
    // If price ends with .00, remove it
    if (priceStr.endsWith('.00')) {
      return priceStr.slice(0, -3)
    }
    
    // If price contains decimal, check if it's .00
    if (priceStr.includes('.')) {
      const [whole, decimal] = priceStr.split('.')
      if (decimal === '00') {
        return whole
      }
    }
    
    return priceStr
  }

  const filteredProducts = getFilteredProducts()
  const recommendedProducts = getRecommendedProducts()

  return (
    <div className="bg-white">
      {/* New Design Section - Below Banner */}
      <div className="bg-white text-[#212121] pt-10 pb-10">
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
                  letterSpacing: '0.5px'
                }}
              >
                {normalizedGender === 'women' ? 'WOMEN' : 'MEN'}
              </h1>
              
              {/* Product Type Navigation - Dynamic from API - Horizontal Scroll with Hidden Scrollbar */}
              <div className="flex overflow-x-auto gap-6 mb-4 pb-2 hide-scrollbar">
                {/* Hide scrollbar for webkit browsers */}
                <style jsx>{`
                  .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                  }
                  .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  }
                `}</style>
                
                {/* ALL Button */}
                <button 
                  onClick={() => setSelectedCategory('all')}
                  className={`uppercase text-left hover:text-gray-600 transition-colors whitespace-nowrap flex-shrink-0 ${
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

                {/* Dynamic Sub-categories from API */}
                {availableSubCategories.map((subCategory) => {
                  const displayName = getSubCategoryDisplayName(subCategory)
                  const isActive = selectedCategory === subCategory || 
                                 (displayName === 'TEES' && selectedCategory === 'tees') ||
                                 (displayName === 'TANK TOP' && selectedCategory === 'tank top') ||
                                 (displayName === 'SHORTS' && selectedCategory === 'shorts') ||
                                 (displayName === 'HOODIE' && selectedCategory === 'hoodie')
                  
                  return (
                    <button 
                      key={subCategory}
                      onClick={() => setSelectedCategory(subCategory)}
                      className={`uppercase text-left hover:text-gray-600 transition-colors whitespace-nowrap flex-shrink-0 ${
                        isActive ? 'text-black font-bold' : 'text-black'
                      }`}
                      style={{
                        fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                        fontSize: '22.18px',
                        lineHeight: '31.1px',
                        letterSpacing: '-0.8px',
                        fontWeight: isActive ? 700 : 500
                      }}
                    >
                      {displayName}
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* Right - Gender-specific content and Sort By */}
            <div className="flex-1 lg:max-w-[412px] flex flex-col">
              <p 
                className="text-black text-left leading-normal whitespace-pre-line"
                style={{
                  fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                  fontSize: '14px',
                  letterSpacing: '0px',
                  fontWeight: 500
                }}
              >
                {getGenderContent()}
              </p>
              
              {/* Sort By - Exactly opposite to Filter */}
              <div className="flex items-center gap-2 justify-end pt-4 mt-auto">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-12">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-12">
              {filteredProducts.map((product) => {
                // Split product name into two lines if it contains spaces
                const nameParts = product.name.split(' ').filter(Boolean)
                const firstLine = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ')
                const secondLine = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ') || ''
                const hasProductDiscount = hasDiscount(product)
                const discountPercentage = getDiscountPercentage(product)
                
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

                      {/* Discount Badges - Smaller on Mobile */}
                      {hasProductDiscount && (
                        <>
                          {/* SALE Tag - Top Left */}
                          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-red-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full">
                            SALE
                          </div>
                          
                          {/* Discount Percentage - Top Right */}
                          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white text-black px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-bold rounded-full">
                            {discountPercentage}% OFF
                          </div>
                        </>
                      )}
                      
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-black text-white p-3 sm:p-4 rounded-b-[32px] flex items-center justify-between"
                        style={{
                          height: '50px sm:60px'
                        }}
                      >
                        <div className="flex flex-col text-left flex-1 min-w-0">
                          <span 
                            className="uppercase text-white truncate text-xs sm:text-[13.41px]"
                            style={{
                              fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                              lineHeight: '12px sm:14.6px',
                              letterSpacing: '0px',
                              fontWeight: 500
                            }}
                            title={firstLine}
                          >
                            {firstLine || product.name}
                          </span>
                          {secondLine && (
                            <span 
                              className="uppercase text-white truncate text-xs sm:text-[13.41px]"
                              style={{
                                fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                                lineHeight: '12px sm:14.6px',
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
                          className="text-white font-bold text-right ml-2 flex-shrink-0 text-sm sm:text-[22px]"
                          style={{
                            fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                            lineHeight: '20px sm:26px',
                            letterSpacing: '0px',
                            fontWeight: 600
                          }}
                        >
                           {formatPrice(product.price)}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-12">
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
                  fontSize: '40px',
                  letterSpacing: '0.5px'
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
              </p>
            </div>
          </div>

          {/* Product Grid - Dynamic Recommended Products */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-12">
              {/* Loading skeleton */}
              {Array.from({ length: 4 }).map((_, index) => (
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
          ) : recommendedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-12">
              {recommendedProducts.map((product) => {
                // Split product name into two lines if it contains spaces
                const nameParts = product.name.split(' ').filter(Boolean)
                const firstLine = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ')
                const secondLine = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ') || ''
                const hasProductDiscount = hasDiscount(product)
                const discountPercentage = getDiscountPercentage(product)
                
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

                      {/* Discount Badges - Smaller on Mobile */}
                      {hasProductDiscount && (
                        <>
                          {/* SALE Tag - Top Left */}
                          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-red-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full">
                            SALE
                          </div>
                          
                          {/* Discount Percentage - Top Right */}
                          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white text-black px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-bold rounded-full">
                            {discountPercentage}% OFF
                          </div>
                        </>
                      )}
                      
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-black text-white p-3 sm:p-4 rounded-b-[32px] flex items-center justify-between"
                        style={{
                          height: '50px sm:60px'
                        }}
                      >
                        <div className="flex flex-col text-left flex-1 min-w-0">
                          <span 
                            className="uppercase text-white truncate text-xs sm:text-[13.41px]"
                            style={{
                              fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                              lineHeight: '12px sm:14.6px',
                              letterSpacing: '0px',
                              fontWeight: 500
                            }}
                            title={firstLine}
                          >
                            {firstLine || product.name}
                          </span>
                          {secondLine && (
                            <span 
                              className="uppercase text-white truncate text-xs sm:text-[13.41px]"
                              style={{
                                fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                                lineHeight: '12px sm:14.6px',
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
                          className="text-white font-bold text-right ml-2 flex-shrink-0 text-sm sm:text-[22px]"
                          style={{
                            fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                            lineHeight: '20px sm:26px',
                            letterSpacing: '0px',
                            fontWeight: 600
                          }}
                        >
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-12">
              <div className="col-span-full text-center py-12">
                <p className="text-black text-lg">
                  No recommended products available
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Check back later for more products
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}