"use client"

import { useState, useEffect } from "react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import ProductCard from "@/components/ui/product-card"
import type { Product } from "@/lib/types"

// --- Reusable Product Grid Component ---
const ProductGrid = ({ 
  products, 
  loading, 
  title 
}: { 
  products: Product[]; 
  loading: boolean;
  title: string;
}) => {
  if (loading) {
    return (
      <div className="text-center py-8 sm:py-12 md:py-16">
        <p className="text-black text-base sm:text-lg">Loading {title.toLowerCase()}...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 md:py-16">
        <h3 className="text-black text-lg sm:text-xl font-semibold mb-2">No {title} Found</h3>
        <p className="text-gray-600 text-sm sm:text-base">Check back later for new {title.toLowerCase()}!</p>
      </div>
    );
  }

  return (
    <div className="mb-8 sm:mb-10 md:mb-12">
      <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-black text-center mb-4 sm:mb-6">
        {title}
      </h3>
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
    </div>
  );
};

// --- Sets Page Component ---
export default function SetsPage() {
  const [allSets, setAllSets] = useState<Product[]>([])
  const [filteredSets, setFilteredSets] = useState<Product[]>([])
  const [activeFilter, setActiveFilter] = useState<'all' | 'men' | 'women'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSetsProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://athlekt.com/backendnew/api/public/products/public/all')
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && Array.isArray(data.data)) {
            // Filter all sets products (both men and women)
            const setsProducts = data.data.filter((product: Product) => 
              product.subCategory?.toLowerCase() === 'sets'
            );
            
            setAllSets(setsProducts);
            setFilteredSets(setsProducts); // Initially show all sets
          }
        } else {
          console.error("API response was not ok:", response.status)
        }
      } catch (error) {
        console.error("Error fetching sets products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSetsProducts()
  }, [])

  // Filter products based on active filter
  const handleFilter = (filter: 'all' | 'men' | 'women') => {
    setActiveFilter(filter)
    
    if (filter === 'all') {
      setFilteredSets(allSets)
    } else {
      const filtered = allSets.filter((product: Product) => 
        product.category?.toLowerCase() === filter
      )
      setFilteredSets(filtered)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* --- BANNER SECTION - Updated for mobile --- */}
      <div className="pt-0 sm:pt-8 px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="relative w-full h-[200px] sm:h-[300px] md:h-[350px] lg:h-[400px] overflow-hidden">
          <img 
            src="/images/sets.png" 
            alt="Sets Collection Banner"
            className="w-full h-full object-cover sm:object-contain"
          />
        </div>
      </div>
      
      {/* --- SETS COLLECTION SECTION --- */}
      <section id="sets-collection" className="py-8 sm:py-12 md:py-16">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-wider text-black text-center mb-6 sm:mb-8 md:mb-10">
            Sets Collection
          </h2>
          
          {/* Filter Buttons - Horizontal Scroll for Mobile */}
          <div className="mb-8 sm:mb-10 md:mb-12">
            {/* Mobile - Horizontal Scroll */}
            <div className="flex md:hidden gap-3 px-4 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => handleFilter('all')}
                className={`flex-shrink-0 px-6 py-3 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeFilter === 'all' 
                    ? 'bg-black text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Sets
              </button>
              <button
                onClick={() => handleFilter('men')}
                className={`flex-shrink-0 px-6 py-3 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeFilter === 'men' 
                    ? 'bg-black text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Men's Sets
              </button>
              <button
                onClick={() => handleFilter('women')}
                className={`flex-shrink-0 px-6 py-3 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeFilter === 'women' 
                    ? 'bg-black text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Women's Sets
              </button>
            </div>

            {/* Desktop - Normal Layout */}
            <div className="hidden md:flex justify-center gap-4">
              <button
                onClick={() => handleFilter('all')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeFilter === 'all' 
                    ? 'bg-black text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Sets
              </button>
              <button
                onClick={() => handleFilter('men')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeFilter === 'men' 
                    ? 'bg-black text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Men's Sets
              </button>
              <button
                onClick={() => handleFilter('women')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeFilter === 'women' 
                    ? 'bg-black text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Women's Sets
              </button>
            </div>
          </div>
          
          {/* Results Count */}
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Showing {filteredSets.length} {activeFilter === 'all' ? 'sets' : activeFilter + ' sets'}
            </p>
          </div>
          
          {/* Filtered Products Grid */}
          {loading ? (
            <div className="text-center py-8 sm:py-12 md:py-16">
              <p className="text-black text-base sm:text-lg">Loading sets...</p>
            </div>
          ) : filteredSets.length === 0 ? (
            <div className="text-center py-8 sm:py-12 md:py-16">
              <h3 className="text-black text-lg sm:text-xl font-semibold mb-2">
                No {activeFilter === 'all' ? 'sets' : activeFilter + ' sets'} found
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                {activeFilter === 'all' 
                  ? 'Check back later for new sets!' 
                  : `No ${activeFilter}'s sets available at the moment.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-6 lg:px-8">
              {filteredSets.map((product) => (
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
      </section>

      <Footer />

      {/* Hide scrollbar for mobile */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}