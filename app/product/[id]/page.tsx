import { notFound } from "next/navigation"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import ProductDetail from "@/components/sections/product-detail"
import RelatedProducts from "@/components/sections/related-products"
import { getProductById } from "@/lib/api"

// Create mock product for static MEN section products
function createMockProduct(id: string) {
  const productNumber = parseInt(id.replace('men-', '')) || 1
  // Map products to images: 1→3, 2→4, 3→5, 4→6, then repeat
  const imageMap = [3, 4, 5, 6]
  const imageIndex = (productNumber - 1) % 4
  const imageNumber = imageMap[imageIndex]
  
  // Main product image
  const mainImage = `/${imageNumber}.png`
  
  return {
    id: id,
    name: "MEN'S HYBRID CLASSIC",
    price: "59",
    originalPrice: "80",
    image: mainImage,
    images: [mainImage, mainImage, mainImage], // Use same image for all thumbnails (as shown on MEN page)
    category: "men",
    subCategory: "tees",
    description: "Designed for a boxy, oversized look—size down if you prefer a closer fit.",
    discountPercentage: 26,
    isOnSale: true,
    colors: [
      { name: "Gray", hex: "#808080", image: mainImage },
      { name: "Black", hex: "#000000", image: mainImage },
      { name: "Yellow", hex: "#FFFF00", image: mainImage },
      { name: "Blue", hex: "#0066FF", image: mainImage }
    ],
    sizes: ["S", "M", "L", "XL"],
    variants: [],
    rating: 4,
    reviewCount: 15,
    fit: "Oversized",
    materials: "65% Cotton, 35% Polyester",
    care: "Machine wash cold"
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let product = null
  
  // Check if it's a static MEN product ID
  if (id.startsWith('men-')) {
    product = createMockProduct(id)
  } else {
    try {
      // Get product from API
      product = await getProductById(id)
    } catch (error) {
      console.error("Error fetching product:", error)
    }
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
