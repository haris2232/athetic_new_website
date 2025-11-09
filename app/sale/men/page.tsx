"use client"

import { useState, useEffect } from "react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { BundleSection } from "@/components/sections/bundle-section"
import { useCurrency } from "@/lib/currency-context"
import ProductCard from "@/components/ui/product-card"
import type { Product } from "@/lib/types"

// Custom CSS for radio buttons
const radioButtonStyles = `
  .custom-radio {
    appearance: none;
    width: 16px;
    height: 16px;
    border: 2px solid #9ca3af;
    border-radius: 50%;
    margin-right: 12px;
    position: relative;
    cursor: pointer;
  }
  
  .custom-radio:checked {
    background-color: white;
    border-color: white;
  }
  
  .custom-radio:checked::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 6px;
    height: 6px;
    background-color: #1f2937;
    border-radius: 50%;
  }
`

export default function MenSalePage() {
  const { formatPrice } = useCurrency()
  const [sortBy, setSortBy] = useState("Relevancy")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState({
    sortBy: false,
    productType: false,
    size: false,
    features: false,
    fit: false,
    activity: false,
    collection: false,
    color: false,
    pattern: false,
    discount: false,
    price: false
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      console.log("🔍 Fetching men's products for sale page...")
      
      const response = await fetch('https://athlekt.com/backendnew/api/public/products/public/all')
      if (response.ok) {
        const data = await response.json()
        console.log("📦 API Response:", data)
        
        if (data.success && data.data) {
          // Filter products for men's category
          const menProducts = data.data.filter((product: Product) => 
            product.category && product.category.toLowerCase() === 'men'
          )
          
          console.log(`✅ Found ${menProducts.length} men's products`)
          setProducts(menProducts)
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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }))
  }

  return (
    <div className="min-h-screen bg-[#212121]">
      <style dangerouslySetInnerHTML={{ __html: radioButtonStyles }} />
      <Header />
      
      {/* Header Section */}
      <div className="flex flex-col items-start w-470px h-36px top-334px left-64px px-8 py-6 ml-8">
        <h1 className="text-white text-4xl font-bold">Mens Best Sellers</h1>
        <p className="text-white">Comfortable, reliable, and loved by gym lovers.</p>
      </div>

      {/* Main Content with Sidebar and Products */}
      <div className="flex flex-row gap-px px-8 pb-12">
        {/* Sidebar */}
        <div className="w-64 bg-[#212121] p-6 rounded-lg h-fit sticky top-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white text-xl font-bold">BEST SELLERS</h2>
            <span className="text-white text-sm">MEN</span>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold">FILTER & SORT</h3>
              <button className="text-blue-400 text-sm hover:underline">Clear All</button>
            </div>
          </div>

          {/* Filter Categories */}
          <div className="space-y-4">
            {/* SORT BY Section */}
            <div className="border-b border-gray-700 pb-3">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('sortBy')}
              >
                <span className="text-white font-medium">SORT BY</span>
                <span className="text-white text-lg font-bold">
                  {expandedSections.sortBy ? '⌃' : '⌵'}
                </span>
              </div>
              {expandedSections.sortBy && (
                <div className="mt-3 space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="sortBy"
                      value="Price: Low to High"
                      checked={sortBy === "Price: Low to High"}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="custom-radio"
                    />
                    <span className={`text-sm ${sortBy === "Price: Low to High" ? "text-white" : "text-gray-300"}`}>
                      Price: Low to High
                    </span>
                  </label>
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="sortBy"
                      value="Price: High to Low"
                      checked={sortBy === "Price: High to Low"}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="custom-radio"
                    />
                    <span className={`text-sm ${sortBy === "Price: High to Low" ? "text-white" : "text-gray-300"}`}>
                      Price: High to Low
                    </span>
                  </label>
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="sortBy"
                      value="Relevancy"
                      checked={sortBy === "Relevancy"}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="custom-radio"
                    />
                    <span className={`text-sm ${sortBy === "Relevancy" ? "text-white" : "text-gray-300"}`}>
                      Relevancy
                    </span>
                  </label>
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="sortBy"
                      value="Newest"
                      checked={sortBy === "Newest"}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="custom-radio"
                    />
                    <span className={`text-sm ${sortBy === "Newest" ? "text-white" : "text-gray-300"}`}>
                      Newest
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Other filter sections remain the same */}
            {/* PRODUCT TYPE Section */}
            <div className="border-b border-gray-700 pb-3">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('productType')}
              >
                <span className="text-white font-medium">PRODUCT TYPE</span>
                <span className="text-white text-lg font-bold">
                  {expandedSections.productType ? '⌄' : '⌵'}
                </span>
              </div>
            </div>

            {/* SIZE Section */}
            <div className="border-b border-gray-700 pb-3">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('size')}
              >
                <span className="text-white font-medium">SIZE</span>
                <span className="text-white text-lg font-bold">
                  {expandedSections.size ? '⌄' : '⌵'}
                </span>
              </div>
            </div>

            {/* FEATURES Section */}
            <div className="border-b border-gray-700 pb-3">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('features')}
              >
                <span className="text-white font-medium">FEATURES</span>
                <span className="text-white text-lg font-bold">
                  {expandedSections.features ? '^' : '⌵'}
                </span>
              </div>
            </div>

            {/* FIT Section */}
            <div className="border-b border-gray-700 pb-3">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('fit')}
              >
                <span className="text-white font-medium">FIT</span>
                <span className="text-white text-lg font-bold">
                  {expandedSections.fit ? '^' : '⌵'}
                </span>
              </div>
            </div>

            {/* ACTIVITY Section */}
            <div className="border-b border-gray-700 pb-3">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('activity')}
              >
                <span className="text-white font-medium">ACTIVITY</span>
                <span className="text-white text-lg font-bold">
                  {expandedSections.activity ? '^' : '⌵'}
                </span>
              </div>
            </div>

            {/* COLLECTION Section */}
            <div className="border-b border-gray-700 pb-3">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('collection')}
              >
                <span className="text-white font-medium">COLLECTION</span>
                <span className="text-white text-lg font-bold">
                  {expandedSections.collection ? '^' : '⌵'}
                </span>
              </div>
            </div>

            {/* COLOR Section */}
            <div className="border-b border-gray-700 pb-3">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('color')}
              >
                <span className="text-white font-medium">COLOR</span>
                <span className="text-white text-lg font-bold">
                  {expandedSections.color ? '^' : '⌵'}
                </span>
              </div>
            </div>

            {/* PATTERN Section */}
            <div className="border-b border-gray-700 pb-3">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('pattern')}
              >
                <span className="text-white font-medium">PATTERN</span>
                <span className="text-white text-lg font-bold">
                  {expandedSections.pattern ? '^' : '⌵'}
                </span>
              </div>
            </div>

            {/* DISCOUNT Section */}
            <div className="border-b border-gray-700 pb-3">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('discount')}
              >
                <span className="text-white font-medium">DISCOUNT</span>
                <span className="text-white text-lg font-bold">
                  {expandedSections.discount ? '^' : '⌵'}
                </span>
              </div>
            </div>

            {/* PRICE Section */}
            <div className="border-b border-gray-700 pb-3">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('price')}
              >
                <span className="text-white font-medium">PRICE</span>
                <span className="text-white text-lg font-bold">
                  {expandedSections.price ? '^' : '⌵'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="text-center py-16">
              <p className="text-white">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-white text-xl font-semibold mb-2">No products found</h3>
              <p className="text-gray-300">No men's products available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  discount={product.isOnSale ? product.discountPercentage : undefined}
                  image={product.image}
                  
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bundle Section */}
      <BundleSection category="mixed" />

      <Footer />
    </div>
  )
} 