"use client"

import { useState, useEffect } from "react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import ProductCard from "@/components/ui/product-card"
import type { Product } from "@/lib/types"

// --- Reusable Product Grid Component (No changes needed) ---
const ProductGrid = ({ products, loading }: { products: Product[]; loading: boolean }) => {
  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-white text-lg">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-white text-xl font-semibold mb-2">No Products Found</h3>
        <p className="text-gray-300">It looks like there are no products to display right now. Please check back later!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-6 lg:px-8">
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
  );
};

// --- Main Page Component (WITH BANNER) ---
export default function AllProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://athlekt.com/backendnew/api/public/products/public/all')
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && Array.isArray(data.data)) {
            setAllProducts(data.data);
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

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* --- BANNER SECTION - Updated for mobile --- */}
      <div className="pt-0 sm:pt-8 px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="relative w-full h-[200px] sm:h-[300px] md:h-[350px] lg:h-[400px] overflow-hidden">
          <img 
            src="/images/new-arrival.png" 
            alt="New Arrivals Banner"
            className="w-full h-full object-cover sm:object-contain"
          />
        </div>
      </div>
      
      {/* --- UNIFIED COLLECTION SECTION --- */}
      <section id="all-products-collection" className="py-8 sm:py-12 md:py-16">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-wider text-black text-center mb-6 sm:mb-8 md:mb-10">
            New Arrivals
          </h2>
          <ProductGrid products={allProducts} loading={loading} />
        </div>
      </section>

      <Footer />
    </div>
  )
}