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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg-grid-cols-3 xl:grid-cols-4 gap-6 px-8">
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


// --- Main Page Component (NO BANNER) ---
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
    <div className="min-h-screen bg-[#212121]">
      <Header />
      
      {/* --- UNIFIED COLLECTION SECTION --- */}
      <section id="all-products-collection" className="py-16"> {/* Increased top padding slightly for balance */}
        <div> {/* Removed the "mt-12" class */}
          <h2 className="text-4xl font-extrabold uppercase tracking-wider text-white text-center mb-10">
            Our Entire Collection
          </h2>
          <ProductGrid products={allProducts} loading={loading} />
        </div>
      </section>

      <Footer />
    </div>
  )
}