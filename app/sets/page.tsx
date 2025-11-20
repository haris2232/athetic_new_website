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
      <div className="text-center py-16">
        <p className="text-black text-lg">Loading {title.toLowerCase()}...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-black text-xl font-semibold mb-2">No {title} Found</h3>
        <p className="text-gray-600">Check back later for new {title.toLowerCase()}!</p>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <h3 className="text-2xl font-bold uppercase tracking-wide text-black text-center mb-6">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-8">
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
  const [menSets, setMenSets] = useState<Product[]>([])
  const [womenSets, setWomenSets] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSetsProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://athlekt.com/backendnew/api/public/products/public/all')
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && Array.isArray(data.data)) {
            // Filter men's sets - category "Men" and subcategory "Sets"
            const menProducts = data.data.filter((product: Product) => 
              product.category?.toLowerCase() === 'men' && 
              product.subCategory?.toLowerCase() === 'sets'
            );
            
            // Filter women's sets - category "Women" and subcategory "Sets"  
            const womenProducts = data.data.filter((product: Product) => 
              product.category?.toLowerCase() === 'women' && 
              product.subCategory?.toLowerCase() === 'sets'
            );

            setMenSets(menProducts);
            setWomenSets(womenProducts);
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

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* --- BANNER SECTION --- */}
      <div style={{ paddingTop: '30px', paddingLeft: '8px', paddingRight: '8px' }}>
        <div className="relative w-full h-[400px] overflow-hidden">
          <img 
            src="/images/sets.png" 
            alt="Sets Collection Banner"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      
      {/* --- SETS COLLECTION SECTION --- */}
      <section id="sets-collection" className="py-16">
        <div>
          <h2 className="text-4xl font-extrabold uppercase tracking-wider text-black text-center mb-10">
            Sets Collection
          </h2>
          
          {/* Men's Sets */}
          <ProductGrid 
            products={menSets} 
            loading={loading} 
            title="Men's Sets" 
          />
          
          {/* Women's Sets */}
          <ProductGrid 
            products={womenSets} 
            loading={loading} 
            title="Women's Sets" 
          />
        </div>
      </section>

      <Footer />
    </div>
  )
}