"use client"

import { useState, useEffect } from "react"
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
      
      const response = await fetch('https://athlekt.com/api/api/public/products/public/all')
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
      <div className="bg-[#212121] min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="text-white text-center">
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
    <div className="bg-[#212121]">
      {/* Header Section - Dark Background */}
      <div className="bg-[#212121] text-white py-12">
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
                  className={`px-4 py-2 text-sm font-medium uppercase tracking-wide rounded-none border-b-2 transition-colors ${selectedCategory === tab.id
                      ? "bg-[#cbf26c] text-[#212121] border-[#cbf26c] hover:bg-[#9fcc3b]"
                      : "bg-transparent text-white border-transparent hover:bg-gray-800 hover:text-[#cbf26c]"
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
                <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm uppercase tracking-wide">FILTER & SORT</span>
                <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Load Previous Button */}
          <div className="text-center">
            <Button className="bg-[#cbf26c] text-[#212121] hover:bg-[#9fcc3b] font-medium px-8 py-3 text-sm uppercase tracking-wide rounded-md">
              LOAD PREVIOUS
            </Button>
          </div>
        </div>
      </div>

      {/* Products Grid Section */}
      <div className="py-8">
        <div className="container mx-auto px-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center text-white py-12">
              <h2 className="text-2xl font-bold mb-4">No products found</h2>
              <p className="text-gray-400">No products available for the selected category.</p>
            </div>
          ) : (
            <>
              {/* First Grid - 2x2 with tall right card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 mb-8">
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
                      fit="REGULAR FIT"
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
                      fit="ATHLETIC FIT"
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
                      fit="ATHLETIC FIT"
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
                    <div key={i} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 mb-12">
                      {rowProducts.map((product, index) => (
                        <ProductCard
                          key={product.id}
                          id={product.id}
                          name={product.name}
                          price={product.price}
                          originalPrice={product.originalPrice}
                          discount={product.discountPercentage}
                          image={product.image}
                          fit="REGULAR FIT"
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
                <div className="text-center">
                  <Button className="bg-[#cbf26c] text-[#212121] hover:bg-[#9fcc3b] font-semibold px-8 py-3 text-sm uppercase tracking-wide rounded-md">
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
