export interface Product {
  id: string
  name: string
  price: string
  originalPrice?: string
  image: string
  images: string[]
  category: string
  subCategory?: string
  description?: string
  fullDescription?: string
  discountPercentage?: number
  purpose?: string
  features?: string
  materials?: string
  care?: string
  isOnSale?: boolean
  isProductHighlight?: boolean
  highlightImage?: string
  colors?: Array<{
    name: string;
    hex?: string;
    image?: string;
    images?: string[];
  }>
  sizes?: string[]
  variants?: any[]
  defaultVariant?: string
  rating?: number
  reviewCount?: number
}
