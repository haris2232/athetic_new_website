import { notFound } from "next/navigation"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import ProductDetail from "@/components/sections/product-detail"
import RelatedProducts from "@/components/sections/related-products"
import { getProductById } from "@/lib/api"

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let product = null
  
  try {
    // Get product from API
    product = await getProductById(id)
  } catch (error) {
    console.error("Error fetching product:", error)
  }

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <ProductDetail product={product} />
        <RelatedProducts currentProductId={product.id} category={product.category} />
      </main>
      <Footer />
    </div>
  )
}
