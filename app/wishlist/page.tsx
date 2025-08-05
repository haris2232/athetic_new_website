"use client"

import { useState } from "react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { useWishlist } from "@/lib/wishlist-context"
import { Button } from "@/components/ui/button"
import { Heart, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCurrency } from "@/lib/currency-context"


export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist()
  const { formatPrice } = useCurrency()

  const handleRemoveFromWishlist = (id: string) => {
    removeFromWishlist(id)
  }

  const handleClearWishlist = () => {
    if (confirm("Are you sure you want to clear your wishlist?")) {
      clearWishlist()
    }
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Wishlist is Empty</h1>
            <p className="text-gray-600 mb-8">Start adding products to your wishlist to see them here.</p>
            <Link href="/collection">
              <Button className="bg-[#cbf26c] text-[#212121] hover:bg-[#b8e55a]">
                Start Shopping
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600 mt-2">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleClearWishlist}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {wishlistItems.map((item) => (
            <Link key={item.id} href={`/product/${item.id}`} className="group block">
              <div className="relative overflow-hidden bg-white hover:shadow-md transition-shadow duration-300">
                {/* Product Image */}
                <div className="relative overflow-hidden aspect-[3/4]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      // If image fails to load, replace with placeholder
                      const target = e.target as HTMLImageElement
                      target.src = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
                    }}
                  />

                  {/* Fit Label */}
                  <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-1.5 text-xs font-medium uppercase tracking-wider">
                    REGULAR FIT
                  </div>

                  {/* Remove from Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleRemoveFromWishlist(item.id)
                    }}
                    className="absolute top-4 right-4 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors z-10"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>

                {/* Product Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-[#212121] text-white p-4">
                  {/* Product Name */}
                  <h3 className="text-sm font-medium mb-2 leading-tight">{item.name}</h3>

                  {/* Pricing */}
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-white">{formatPrice(item.price)}</span>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
} 