import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import CollectionHero from "@/components/sections/collection-hero"
import ProductCollection from "@/components/sections/product-collection"
import { getAllProducts as getApiProducts } from "@/lib/api"

export default async function CollectionPage() {
  let products = []
  
  try {
    // Try to get products from API first
    products = await getApiProducts()
    console.log("✅ Using API products:", products.length)
    
    // Log the first product to verify image URLs
    if (products.length > 0) {
      console.log("📸 First product image URL:", products[0].image)
    }
  } catch (error) {
    console.log("❌ API not available, using fallback data:", error)
    // If API fails, use fallback data
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <CollectionHero title="All Collections" />
        <ProductCollection products={products} />
      </main>
      <Footer />
    </div>
  )
}
