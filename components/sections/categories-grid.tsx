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
  subCategory: string
  discountPercentage: number
  isOnSale: boolean
  colors: Array<{ name: string; hex?: string }>
  sizes: string[]
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

  useEffect(() => {
    fetchProducts()
  }, [selectedGender])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      console.log("🔍 Fetching products for gender:", selectedGender)
      
      const response = await fetch('https://athlekt.com/backendnew/api/public/products/public/all')
      if (response.ok) {
        const data = await response.json()
        console.log("📦 API Response:", data)
        
        if (data.success && data.data) {
          // Filter products based on gender
          let filteredProducts = data.data
          
          if (selectedGender === 'men') {
            filteredProducts = data.data.filter((product: Product) => 
              product.category && product.category.toLowerCase() === 'men'
            )
          } else if (selectedGender === 'women') {
            filteredProducts = data.data.filter((product: Product) => 
              product.category && product.category.toLowerCase() === 'women'
            )
          }
          
          console.log(`✅ Filtered ${filteredProducts.length} products for ${selectedGender}`)
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

  // Update the heading based on selected gender
  const getHeading = () => {
    if (selectedGender === "men") return "MEN | ALL PRODUCTS"
    if (selectedGender === "women") return "WOMEN | ALL PRODUCTS"
    return "MEN | ALL PRODUCTS" // Default
  }

  // Filter products based on selected category
  const getFilteredProducts = () => {
    if (selectedCategory === "all") {
      return products
    }
    
    return products.filter(product => {
      const productSubCategory = product.subCategory?.toLowerCase()
      const selectedCategoryLower = selectedCategory.toLowerCase()
      
      if (selectedCategoryLower === "t-shirts") {
        return productSubCategory === "t-shirts" || productSubCategory === "t-shirt"
      } else if (selectedCategoryLower === "shorts") {
        return productSubCategory === "shorts"
      } else if (selectedCategoryLower === "trousers") {
        return productSubCategory === "trousers"
      } else if (selectedCategoryLower === "trainsets") {
        return productSubCategory === "trainsets" || productSubCategory === "twinsets"
      } else if (selectedCategoryLower === "tanks") {
        return productSubCategory === "tanks" || productSubCategory === "tank"
      }
      
      return true
    })
  }

  const filteredProducts = getFilteredProducts()

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="text-[#212121] text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-wide mb-8">
              {getHeading()}
            </h1>
            <div className="text-xl">Loading products...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* New Design Section - Below Banner */}
      <div className="bg-white text-[#212121] pt-0 pb-20">
        <div className="container mx-auto px-4 max-w-[1250px]">
          {/* Top Section - MEN heading and Lorem ipsum */}
          <div className="flex flex-col lg:flex-row lg:items-stretch lg:justify-between mb-8 gap-6">
            {/* Left - MEN Heading */}
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
                MEN
              </h1>
              
              {/* Product Type Navigation */}
              <div className="flex flex-wrap gap-6 mb-4">
                <button 
                  className="uppercase text-black text-left hover:text-gray-600 transition-colors"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: '22.18px',
                    lineHeight: '31.1px',
                    letterSpacing: '-0.8px',
                    fontWeight: 500
                  }}
                >
                  TEES
                </button>
                <button 
                  className="uppercase text-black text-left hover:text-gray-600 transition-colors"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: '22.18px',
                    lineHeight: '31.1px',
                    letterSpacing: '-0.8px',
                    fontWeight: 500
                  }}
                >
                  TANK TOP
                </button>
                <button 
                  className="uppercase text-black text-left hover:text-gray-600 transition-colors"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: '22.18px',
                    lineHeight: '31.1px',
                    letterSpacing: '-0.8px',
                    fontWeight: 500
                  }}
                >
                  SHORTS
                </button>
                <button 
                  className="uppercase text-black text-left hover:text-gray-600 transition-colors"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: '22.18px',
                    lineHeight: '31.1px',
                    letterSpacing: '-0.8px',
                    fontWeight: 500
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

          {/* Product Grid - 3 Rows × 4 Columns = 12 Products */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {/* Product 1 */}
            <Link href="/product/men-1" className="block cursor-pointer">
            <div 
              className="bg-white relative overflow-hidden w-full"
              style={{
                aspectRatio: '307/450'
              }}
            >
              <img 
                src="/3.png" 
                alt="Product" 
                className="w-full h-full object-cover"
                style={{
                  borderRadius: '32px'
                }}
              />
              <div 
                className="absolute bottom-0 left-0 right-0 bg-black text-white p-4 rounded-b-[32px] flex items-center justify-between"
                style={{
                  height: '60px'
                }}
              >
                <div className="flex flex-col text-left">
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    LORIUM IPSUM DOLOR
                  </span>
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    SIT DE VENUM
                  </span>
                </div>
                <p 
                  className="text-white font-bold text-right"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: '22px',
                    lineHeight: '26px',
                    letterSpacing: '0px',
                    fontWeight: 600
                  }}
                >
                  AED 59
                </p>
              </div>
            </div>
            </Link>

            {/* Product 2 */}
            <Link href="/product/men-2" className="block cursor-pointer">
            <div 
              className="bg-white relative overflow-hidden w-full"
              style={{
                aspectRatio: '307/450'
              }}
            >
              <img 
                src="/4.png" 
                alt="Product" 
                className="w-full h-full object-cover"
                style={{
                  borderRadius: '32px'
                }}
              />
              <div 
                className="absolute bottom-0 left-0 right-0 bg-black text-white p-4 rounded-b-[32px] flex items-center justify-between"
                style={{
                  height: '60px'
                }}
              >
                <div className="flex flex-col text-left">
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    LORIUM IPSUM DOLOR
                  </span>
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    SIT DE VENUM
                  </span>
                </div>
                <p 
                  className="text-white font-bold text-right"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: '22px',
                    lineHeight: '26px',
                    letterSpacing: '0px',
                    fontWeight: 600
                  }}
                >
                  AED 59
                </p>
              </div>
            </div>
            </Link>

            {/* Product 3 */}
            <Link href="/product/men-3" className="block cursor-pointer">
            <div 
              className="bg-white relative overflow-hidden w-full"
              style={{
                aspectRatio: '307/450'
              }}
            >
              <img 
                src="/5.png" 
                alt="Product" 
                className="w-full h-full object-cover"
                style={{
                  borderRadius: '32px'
                }}
              />
              <div 
                className="absolute bottom-0 left-0 right-0 bg-black text-white p-4 rounded-b-[32px] flex items-center justify-between"
                style={{
                  height: '60px'
                }}
              >
                <div className="flex flex-col text-left">
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    LORIUM IPSUM DOLOR
                  </span>
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    SIT DE VENUM
                  </span>
                </div>
                <p 
                  className="text-white font-bold text-right"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: '22px',
                    lineHeight: '26px',
                    letterSpacing: '0px',
                    fontWeight: 600
                  }}
                >
                  AED 59
                </p>
              </div>
            </div>
            </Link>

            {/* Product 4 */}
            <Link href="/product/men-4" className="block cursor-pointer">
            <div 
              className="bg-white relative overflow-hidden w-full"
              style={{
                aspectRatio: '307/450'
              }}
            >
              <img 
                src="/6.png" 
                alt="Product" 
                className="w-full h-full object-cover"
                style={{
                  borderRadius: '32px'
                }}
              />
              <div 
                className="absolute bottom-0 left-0 right-0 bg-black text-white p-4 rounded-b-[32px] flex items-center justify-between"
                style={{
                  height: '60px'
                }}
              >
                <div className="flex flex-col text-left">
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    LORIUM IPSUM DOLOR
                  </span>
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    SIT DE VENUM
                  </span>
                </div>
                <p 
                  className="text-white font-bold text-right"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: '22px',
                    lineHeight: '26px',
                    letterSpacing: '0px',
                    fontWeight: 600
                  }}
                >
                  AED 59
                </p>
              </div>
            </div>
            </Link>

            {/* Row 2 - Same 4 Products */}
            {/* Product 5 (Repeat Product 1) */}
            <Link href="/product/men-5" className="block cursor-pointer">
            <div 
              className="bg-white relative overflow-hidden w-full"
              style={{
                aspectRatio: '307/450'
              }}
            >
              <img 
                src="/3.png" 
                alt="Product" 
                className="w-full h-full object-cover"
                style={{
                  borderRadius: '32px'
                }}
              />
              <div 
                className="absolute bottom-0 left-0 right-0 bg-black text-white p-4 rounded-b-[32px] flex items-center justify-between"
                style={{
                  height: '60px'
                }}
              >
                <div className="flex flex-col text-left">
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    LORIUM IPSUM DOLOR
                  </span>
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    SIT DE VENUM
                  </span>
                </div>
                <p 
                  className="text-white font-bold text-right"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: '22px',
                    lineHeight: '26px',
                    letterSpacing: '0px',
                    fontWeight: 600
                  }}
                >
                  AED 59
                </p>
              </div>
            </div>
            </Link>

            {/* Product 6 (Repeat Product 2) */}
            <Link href="/product/men-6" className="block cursor-pointer">
            <div 
              className="bg-white relative overflow-hidden w-full"
              style={{
                aspectRatio: '307/450'
              }}
            >
              <img 
                src="/4.png" 
                alt="Product" 
                className="w-full h-full object-cover"
                style={{
                  borderRadius: '32px'
                }}
              />
              <div 
                className="absolute bottom-0 left-0 right-0 bg-black text-white p-4 rounded-b-[32px] flex items-center justify-between"
                style={{
                  height: '60px'
                }}
              >
                <div className="flex flex-col text-left">
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    LORIUM IPSUM DOLOR
                  </span>
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    SIT DE VENUM
                  </span>
                </div>
                <p 
                  className="text-white font-bold text-right"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: '22px',
                    lineHeight: '26px',
                    letterSpacing: '0px',
                    fontWeight: 600
                  }}
                >
                  AED 59
                </p>
              </div>
            </div>
            </Link>

            {/* Product 7 (Repeat Product 3) */}
            <Link href="/product/men-7" className="block cursor-pointer">
            <div 
              className="bg-white relative overflow-hidden w-full"
              style={{
                aspectRatio: '307/450'
              }}
            >
              <img 
                src="/5.png" 
                alt="Product" 
                className="w-full h-full object-cover"
                style={{
                  borderRadius: '32px'
                }}
              />
              <div 
                className="absolute bottom-0 left-0 right-0 bg-black text-white p-4 rounded-b-[32px] flex items-center justify-between"
                style={{
                  height: '60px'
                }}
              >
                <div className="flex flex-col text-left">
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    LORIUM IPSUM DOLOR
                  </span>
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    SIT DE VENUM
                  </span>
                </div>
                <p 
                  className="text-white font-bold text-right"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: '22px',
                    lineHeight: '26px',
                    letterSpacing: '0px',
                    fontWeight: 600
                  }}
                >
                  AED 59
                </p>
              </div>
            </div>
            </Link>

            {/* Product 8 (Repeat Product 4) */}
            <Link href="/product/men-8" className="block cursor-pointer">
            <div 
              className="bg-white relative overflow-hidden w-full"
              style={{
                aspectRatio: '307/450'
              }}
            >
              <img 
                src="/6.png" 
                alt="Product" 
                className="w-full h-full object-cover"
                style={{
                  borderRadius: '32px'
                }}
              />
              <div 
                className="absolute bottom-0 left-0 right-0 bg-black text-white p-4 rounded-b-[32px] flex items-center justify-between"
                style={{
                  height: '60px'
                }}
              >
                <div className="flex flex-col text-left">
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    LORIUM IPSUM DOLOR
                  </span>
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    SIT DE VENUM
                  </span>
                </div>
                <p 
                  className="text-white font-bold text-right"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: '22px',
                    lineHeight: '26px',
                    letterSpacing: '0px',
                    fontWeight: 600
                  }}
                >
                  AED 59
                </p>
              </div>
            </div>
            </Link>

            {/* Row 3 - Same 4 Products */}
            {/* Product 9 (Repeat Product 1) */}
            <Link href="/product/men-9" className="block cursor-pointer">
            <div 
              className="bg-white relative overflow-hidden w-full"
              style={{
                aspectRatio: '307/450'
              }}
            >
              <img 
                src="/3.png" 
                alt="Product" 
                className="w-full h-full object-cover"
                style={{
                  borderRadius: '32px'
                }}
              />
              <div 
                className="absolute bottom-0 left-0 right-0 bg-black text-white p-4 rounded-b-[32px] flex items-center justify-between"
                style={{
                  height: '60px'
                }}
              >
                <div className="flex flex-col text-left">
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    LORIUM IPSUM DOLOR
                  </span>
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    SIT DE VENUM
                  </span>
                </div>
                <p 
                  className="text-white font-bold text-right"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: '22px',
                    lineHeight: '26px',
                    letterSpacing: '0px',
                    fontWeight: 600
                  }}
                >
                  AED 59
                </p>
              </div>
            </div>
            </Link>

            {/* Product 10 (Repeat Product 2) */}
            <Link href="/product/men-10" className="block cursor-pointer">
            <div 
              className="bg-white relative overflow-hidden w-full"
              style={{
                aspectRatio: '307/450'
              }}
            >
              <img 
                src="/4.png" 
                alt="Product" 
                className="w-full h-full object-cover"
                style={{
                  borderRadius: '32px'
                }}
              />
              <div 
                className="absolute bottom-0 left-0 right-0 bg-black text-white p-4 rounded-b-[32px] flex items-center justify-between"
                style={{
                  height: '60px'
                }}
              >
                <div className="flex flex-col text-left">
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    LORIUM IPSUM DOLOR
                  </span>
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    SIT DE VENUM
                  </span>
                </div>
                <p 
                  className="text-white font-bold text-right"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: '22px',
                    lineHeight: '26px',
                    letterSpacing: '0px',
                    fontWeight: 600
                  }}
                >
                  AED 59
                </p>
              </div>
            </div>
            </Link>

            {/* Product 11 (Repeat Product 3) */}
            <Link href="/product/men-11" className="block cursor-pointer">
            <div 
              className="bg-white relative overflow-hidden w-full"
              style={{
                aspectRatio: '307/450'
              }}
            >
              <img 
                src="/5.png" 
                alt="Product" 
                className="w-full h-full object-cover"
                style={{
                  borderRadius: '32px'
                }}
              />
              <div 
                className="absolute bottom-0 left-0 right-0 bg-black text-white p-4 rounded-b-[32px] flex items-center justify-between"
                style={{
                  height: '60px'
                }}
              >
                <div className="flex flex-col text-left">
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    LORIUM IPSUM DOLOR
                  </span>
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    SIT DE VENUM
                  </span>
                </div>
                <p 
                  className="text-white font-bold text-right"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: '22px',
                    lineHeight: '26px',
                    letterSpacing: '0px',
                    fontWeight: 600
                  }}
                >
                  AED 59
                </p>
              </div>
            </div>
            </Link>

            {/* Product 12 (Repeat Product 4) */}
            <Link href="/product/men-12" className="block cursor-pointer">
            <div 
              className="bg-white relative overflow-hidden w-full"
              style={{
                aspectRatio: '307/450'
              }}
            >
              <img 
                src="/6.png" 
                alt="Product" 
                className="w-full h-full object-cover"
                style={{
                  borderRadius: '32px'
                }}
              />
              <div 
                className="absolute bottom-0 left-0 right-0 bg-black text-white p-4 rounded-b-[32px] flex items-center justify-between"
                style={{
                  height: '60px'
                }}
              >
                <div className="flex flex-col text-left">
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    LORIUM IPSUM DOLOR
                  </span>
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    SIT DE VENUM
                  </span>
                </div>
                <p 
                  className="text-white font-bold text-right"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: '22px',
                    lineHeight: '26px',
                    letterSpacing: '0px',
                    fontWeight: 600
                  }}
                >
                  AED 59
                </p>
              </div>
            </div>
            </Link>
          </div>
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

          {/* Product Grid - 4 Products */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {/* Product 1 */}
            <div 
              className="bg-white relative overflow-hidden w-full"
              style={{
                aspectRatio: '307/450'
              }}
            >
              <img 
                src="/3.png" 
                alt="Product" 
                className="w-full h-full object-cover"
                style={{
                  borderRadius: '32px'
                }}
              />
              <div 
                className="absolute bottom-0 left-0 right-0 bg-black text-white p-4 rounded-b-[32px] flex items-center justify-between"
                style={{
                  height: '60px'
                }}
              >
                <div className="flex flex-col text-left">
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    LORIUM IPSUM DOLOR
                  </span>
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    SIT DE VENUM
                  </span>
                </div>
                <p 
                  className="text-white font-bold text-right"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: '22px',
                    lineHeight: '26px',
                    letterSpacing: '0px',
                    fontWeight: 600
                  }}
                >
                  AED 59
                </p>
              </div>
            </div>

            {/* Product 2 */}
            <div 
              className="bg-white relative overflow-hidden w-full"
              style={{
                aspectRatio: '307/450'
              }}
            >
              <img 
                src="/4.png" 
                alt="Product" 
                className="w-full h-full object-cover"
                style={{
                  borderRadius: '32px'
                }}
              />
              <div 
                className="absolute bottom-0 left-0 right-0 bg-black text-white p-4 rounded-b-[32px] flex items-center justify-between"
                style={{
                  height: '60px'
                }}
              >
                <div className="flex flex-col text-left">
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    LORIUM IPSUM DOLOR
                  </span>
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    SIT DE VENUM
                  </span>
                </div>
                <p 
                  className="text-white font-bold text-right"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: '22px',
                    lineHeight: '26px',
                    letterSpacing: '0px',
                    fontWeight: 600
                  }}
                >
                  AED 59
                </p>
              </div>
            </div>

            {/* Product 3 */}
            <div 
              className="bg-white relative overflow-hidden w-full"
              style={{
                aspectRatio: '307/450'
              }}
            >
              <img 
                src="/5.png" 
                alt="Product" 
                className="w-full h-full object-cover"
                style={{
                  borderRadius: '32px'
                }}
              />
              <div 
                className="absolute bottom-0 left-0 right-0 bg-black text-white p-4 rounded-b-[32px] flex items-center justify-between"
                style={{
                  height: '60px'
                }}
              >
                <div className="flex flex-col text-left">
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    LORIUM IPSUM DOLOR
                  </span>
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    SIT DE VENUM
                  </span>
                </div>
                <p 
                  className="text-white font-bold text-right"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: '22px',
                    lineHeight: '26px',
                    letterSpacing: '0px',
                    fontWeight: 600
                  }}
                >
                  AED 59
                </p>
              </div>
            </div>

            {/* Product 4 */}
            <div 
              className="bg-white relative overflow-hidden w-full"
              style={{
                aspectRatio: '307/450'
              }}
            >
              <img 
                src="/6.png" 
                alt="Product" 
                className="w-full h-full object-cover"
                style={{
                  borderRadius: '32px'
                }}
              />
              <div 
                className="absolute bottom-0 left-0 right-0 bg-black text-white p-4 rounded-b-[32px] flex items-center justify-between"
                style={{
                  height: '60px'
                }}
              >
                <div className="flex flex-col text-left">
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    LORIUM IPSUM DOLOR
                  </span>
                  <span 
                    className="uppercase text-white"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                  >
                    SIT DE VENUM
                  </span>
                </div>
                <p 
                  className="text-white font-bold text-right"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: '22px',
                    lineHeight: '26px',
                    letterSpacing: '0px',
                    fontWeight: 600
                  }}
                >
                  AED 59
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header Section - Dark Background */}
      <div className="bg-white text-[#212121] py-12">
        <div className="container mx-auto px-4">
          {/* Main Heading */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-wide">{getHeading()}</h1>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-between mb-8">
            <div className="flex flex-wrap items-center gap-1">
              {categoryTabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant="ghost"
                  className={`px-4 py-2 text-sm font-medium uppercase tracking-wide rounded-md border-b-2 transition-colors ${selectedCategory === tab.id
                      ? "bg-[#ebff00] text-black border-[#ebff00] hover:bg-opacity-80"
                      : "bg-transparent text-[#212121] border-transparent hover:bg-gray-100 hover:text-black"
                    }`}
                  onClick={() => setSelectedCategory(tab.id)}
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center gap-4 mt-4 lg:mt-0">
              <div className="flex items-center gap-2">
                <span className="text-sm uppercase tracking-wide">GRID</span>
                <Button variant="ghost" size="icon" className="text-[#212121] hover:bg-gray-100">
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm uppercase tracking-wide">FILTER & SORT</span>
                <Button variant="ghost" size="icon" className="text-[#212121] hover:bg-gray-100">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Load Previous Button */}
          <div className="text-center mb-8">
            <Button className="bg-[#ebff00] text-black hover:bg-opacity-80 font-medium px-8 py-3 text-sm uppercase tracking-wide rounded-md">
              LOAD PREVIOUS
            </Button>
          </div>
        </div>
      </div>

      {/* Products Grid Section */}
      <div className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center text-[#212121] py-12">
              <h2 className="text-2xl font-bold mb-4">No products found</h2>
              <p className="text-gray-400">No products available for the selected category.</p>
            </div>
          ) : (
            <>
              {/* First Grid - 2x2 with tall right card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                {/* Top Left */}
                {filteredProducts[0] && (
                  <div className="lg:col-span-1">
                    <ProductCard
                      key={filteredProducts[0].id}
                      id={filteredProducts[0].id}
                      name={filteredProducts[0].name}
                      price={filteredProducts[0].price}
                      originalPrice={filteredProducts[0].originalPrice}
                      discount={filteredProducts[0].discountPercentage}
                      image={filteredProducts[0].image}
                      
                      className="h-full"
                    />
                  </div>
                )}

                {/* Top Center */}
                {filteredProducts[1] && (
                  <div className="lg:col-span-1">
                    <ProductCard
                      key={filteredProducts[1].id}
                      id={filteredProducts[1].id}
                      name={filteredProducts[1].name}
                      price={filteredProducts[1].price}
                      originalPrice={filteredProducts[1].originalPrice}
                      discount={filteredProducts[1].discountPercentage}
                      image={filteredProducts[1].image}
                      
                      className="h-full"
                    />
                  </div>
                )}

                {/* Top Right - Tall Card */}
                {filteredProducts[2] && (
                  <div className="lg:col-span-1 lg:row-span-2">
                    <ProductCard
                      key={filteredProducts[2].id}
                      id={filteredProducts[2].id}
                      name={filteredProducts[2].name}
                      price={filteredProducts[2].price}
                      originalPrice={filteredProducts[2].originalPrice}
                      discount={filteredProducts[2].discountPercentage}
                      image={filteredProducts[2].image}
                      className="h-full"
                      tall={true}
                    />
                  </div>
                )}
              </div>

              {/* All Remaining Products - Dynamic Grid Rows */}
              {(() => {
                const remainingProducts = filteredProducts.slice(3);
                const rows = [];
                
                for (let i = 0; i < remainingProducts.length; i += 4) {
                  const rowProducts = remainingProducts.slice(i, i + 4);
                  rows.push(
                    <div key={i} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                      {rowProducts.map((product, index) => (
                        <ProductCard
                          key={product.id}
                          id={product.id}
                          name={product.name}
                          price={product.price}
                          originalPrice={product.originalPrice}
                          discount={product.discountPercentage}
                          image={product.image}
                          
                          className="h-full"
                        />
                      ))}
                    </div>
                  );
                }
                
                return rows;
              })()}

              {/* Load More Section - Only show if there are more products */}
              {filteredProducts.length > 15 && (
                <div className="text-center mt-8">
                  <Button className="bg-[#ebff00] text-black hover:bg-opacity-80 font-semibold px-8 py-3 text-sm uppercase tracking-wide rounded-md">
                    LOAD MORE PRODUCTS
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
