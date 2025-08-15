"use client"

import { useState, useEffect } from "react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import ProductCard from "@/components/ui/product-card"
import type { Product } from "@/lib/types"

// --- Reusable Banner Component ---
const Banner = ({ imageUrl, altText }: { imageUrl: string; altText: string }) => (
  <div className="relative w-full h-80">
    <img src={imageUrl} alt={altText} className="w-full h-full object-cover" />
    <div className="absolute inset-0 bg-black bg-opacity-50" />
  </div>
);

// --- Reusable Product Grid Component ---
const ProductGrid = ({ products, categoryName, loading }: { products: Product[]; categoryName: string; loading: boolean }) => {
  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-white text-lg">Loading {categoryName} products...</p>
      </div>
    );
  }

  // Updated message for when no SALE products are found
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-white text-xl font-semibold mb-2">No Sale Products Found</h3>
        <p className="text-gray-300">There are currently no {categoryName} products on sale.</p>
      </div>
    );
  }

  return (
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
          fit="REGULAR FIT"
        />
      ))}
    </div>
  );
};


// --- Main Page Component ---
export default function CombinedSalePage() {
  const [menProducts, setMenProducts] = useState<Product[]>([])
  const [womenProducts, setWomenProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://athlekt.com/backendnew/api/public/products/public/all')
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && Array.isArray(data.data)) {
            
            // MODIFIED: Filter for Men's products THAT ARE ON SALE
            const menData = data.data.filter((p: Product) => 
              p.category?.toLowerCase() === 'men' && p.isOnSale
            );
            setMenProducts(menData);
            
            // MODIFIED: Filter for Women's products THAT ARE ON SALE
            const womenData = data.data.filter((p: Product) => 
              p.category?.toLowerCase() === 'women' && p.isOnSale
            );
            setWomenProducts(womenData);

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
      
      {/* --- MEN'S SECTION --- */}
      <section id="men-collection" className="py-12">
        <Banner
          altText="Promotional banner for the Men's Sale Collection"
          imageUrl="https://images.unsplash.com/photo-1576678927484-cc907957088c?q=80&w=2574&auto-format&fit=crop"
        />
        <div className="mt-12">
          <h2 className="text-4xl font-extrabold uppercase tracking-wider text-white text-center mb-10">
            Men's Sale
          </h2>
          <ProductGrid products={menProducts} categoryName="men's" loading={loading} />
        </div>
      </section>

      {/* Divider */}
      <hr className="border-t border-gray-700 mx-8 my-16" />

      {/* --- WOMEN'S SECTION --- */}
      <section id="women-collection" className="py-12">
        <Banner
          altText="Promotional banner for the Women's Sale Collection"
          imageUrl="https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=2670&auto-format&fit=crop"
        />
        <div className="mt-12">
           <h2 className="text-4xl font-extrabold uppercase tracking-wider text-white text-center mb-10">
            Women's Sale
          </h2>
          <ProductGrid products={womenProducts} categoryName="women's" loading={loading} />
        </div>
      </section>

      <Footer />
    </div>
  )
}
