import type { Product } from "./types"

// Mock products data for fallback
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Performance Tank Top",
    price: "$45",
    originalPrice: "$60",
    image: "/placeholder.svg?height=400&width=300",
    images: ["/placeholder.svg?height=400&width=300"],
    category: "Women",
    subCategory: "Tops",
    description: "High-performance tank top for active women",
    isOnSale: true,
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Navy", hex: "#000080" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    variants: [],
    defaultVariant: "variant-1"
  },
  {
    id: "2",
    name: "Training Shorts",
    price: "$35",
    originalPrice: "$50",
    image: "/placeholder.svg?height=400&width=300",
    images: ["/placeholder.svg?height=400&width=300"],
    category: "Men",
    subCategory: "Shorts",
    description: "Comfortable training shorts for men",
    isOnSale: true,
    colors: [
      { name: "Gray", hex: "#808080" },
      { name: "Black", hex: "#000000" }
    ],
    sizes: ["S", "M", "L", "XL"],
    variants: [],
    defaultVariant: "variant-2"
  },
  {
    id: "3",
    name: "Compression Leggings",
    price: "$55",
    image: "/placeholder.svg?height=400&width=300",
    images: ["/placeholder.svg?height=400&width=300"],
    category: "Women",
    subCategory: "Bottoms",
    description: "High-performance compression leggings",
    isOnSale: false,
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Navy", hex: "#000080" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    variants: [],
    defaultVariant: "variant-3"
  },
  {
    id: "4",
    name: "Athletic Hoodie",
    price: "$75",
    image: "/placeholder.svg?height=400&width=300",
    images: ["/placeholder.svg?height=400&width=300"],
    category: "Unisex",
    subCategory: "Outerwear",
    description: "Comfortable athletic hoodie for all",
    isOnSale: false,
    colors: [
      { name: "Gray", hex: "#808080" },
      { name: "Black", hex: "#000000" }
    ],
    sizes: ["S", "M", "L", "XL"],
    variants: [],
    defaultVariant: "variant-4"
  }
]

// Get all products (fallback function)
export function getAllProducts(): Product[] {
  return mockProducts
}

// Get products by category
export function getProductsByCategory(category: string): Product[] {
  return mockProducts.filter(product => 
    product.category.toLowerCase() === category.toLowerCase() ||
    product.subCategory?.toLowerCase() === category.toLowerCase()
  )
}

// Get featured products
export function getFeaturedProducts(): Product[] {
  return mockProducts.slice(0, 4)
}

// Get sale products
export function getSaleProducts(): Product[] {
  return mockProducts.filter(product => product.isOnSale)
}

// Get product by ID
export function getProductById(id: string): Product | null {
  return mockProducts.find(product => product.id === id) || null
} 