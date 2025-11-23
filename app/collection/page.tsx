"use client"

import { useState, useEffect } from "react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import ProductCard from "@/components/ui/product-card"
import type { Product } from "@/lib/types"

// --- Reusable Product Grid Component ---
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8">
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

type GenderFilter = 'all' | 'men' | 'women';

export default function AllProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('all')

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://athlekt.com/backendnew/api/public/products/public/all')
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && Array.isArray(data.data)) {
            setAllProducts(data.data);
            setFilteredProducts(data.data);
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

  // Filter products based on gender selection
  useEffect(() => {
    if (genderFilter === 'all') {
      setFilteredProducts(allProducts);
    } else {
      const filtered = allProducts.filter(product => {
        const category = product.category?.toLowerCase().trim();
        const subcategory = product.subcategory?.toLowerCase().trim();
        
        if (genderFilter === 'men') {
          return category === 'men' || subcategory === 'men';
        } else if (genderFilter === 'women') {
          return category === 'women' || subcategory === 'women';
        }
        return true;
      });
      setFilteredProducts(filtered);
    }
  }, [genderFilter, allProducts]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Increased width container for desktop */}
      <section id="all-products-collection" className="py-8 sm:py-12 lg:py-16 lg:max-w-[90rem] lg:mx-auto lg:px-8">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-wider text-black text-center mb-6 sm:mb-8 lg:mb-10">
            Our Entire Collection
          </h2>
          
          {/* Filter dropdown with normal width */}
          <div className="flex justify-center mb-8">
            <div className="relative w-64">
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value as GenderFilter)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent cursor-pointer"
              >
                <option value="all">All Products</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Showing {filteredProducts.length} of {allProducts.length} products
              {genderFilter !== 'all' && ` for ${genderFilter}`}
            </p>
          </div>

          <ProductGrid products={filteredProducts} loading={loading} />
        </div>
      </section>

      <Footer />
    </div>
  )
}