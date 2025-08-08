"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"
import { useCurrency } from "@/lib/currency-context"

export default function FeaturedProducts() {
  const { addToCart, showNotification } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { formatPrice } = useCurrency()

  const products = [
    {
      id: "1",
      name: "Premium Cotton T-Shirt",
      price: 45.00,
      image: "/images/products/featured-1.jpg",
      fit: "Regular Fit",
      color: "White"
    },
    {
      id: "2",
      name: "Athletic Performance Shorts",
      price: 35.00,
      image: "/images/products/featured-2.jpg",
      fit: "Regular Fit",
      color: "Black"
    },
    {
      id: "3",
      name: "Slim Fit Jeans",
      price: 55.00,
      image: "/images/products/featured-3.jpg",
      fit: "Slim Fit",
      color: "Blue"
    },
    {
      id: "4",
      name: "Casual Hoodie",
      price: 75.00,
      image: "/images/products/featured-4.jpg",
      fit: "Regular Fit",
      color: "Gray"
    }
  ]



  const handleWishlistToggle = (product: any) => {
    const wishlistItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      color: product.color,
      size: "M",
      fit: product.fit
    }

    if (isInWishlist(wishlistItem.id)) {
      removeFromWishlist(wishlistItem.id)
    } else {
      addToWishlist(wishlistItem)
    }
  }
  
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
          <p className="text-gray-600">Discover our most popular items</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="group block">
              <div className="relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-[3/4] relative">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Heart Icon */}
                  <button 
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleWishlistToggle(product)
                    }}
                    className={`absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors z-10 ${
                      isInWishlist(product.id) ? 'text-red-500' : 'text-gray-600'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.fit} • {product.color}</p>
                  <p className="text-lg font-semibold">{formatPrice(product.price)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
