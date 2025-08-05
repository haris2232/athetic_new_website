"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface WishlistItem {
  id: string
  name: string
  price: number
  image: string
  color?: string
  size?: string
  fit?: string
  productId?: string
}

interface WishlistContextType {
  wishlistItems: WishlistItem[]
  addToWishlist: (item: WishlistItem) => void
  removeFromWishlist: (id: string) => void
  clearWishlist: () => void
  isInWishlist: (id: string) => boolean
  wishlistCount: number
  showNotification: (message: string) => void
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [notification, setNotification] = useState<string | null>(null)

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist')
    if (savedWishlist) {
      try {
        setWishlistItems(JSON.parse(savedWishlist))
      } catch (error) {
        console.error('Error loading wishlist from localStorage:', error)
      }
    }
  }, [])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems))
  }, [wishlistItems])

  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  const addToWishlist = (newItem: WishlistItem) => {
    setWishlistItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === newItem.id)

      if (existingItem) {
        // Item already in wishlist
        showNotification(`${newItem.name} is already in your wishlist!`)
        return prevItems
      } else {
        // Add new item
        showNotification(`${newItem.name} added to wishlist!`)
        return [...prevItems, newItem]
      }
    })
  }

  const removeFromWishlist = (id: string) => {
    setWishlistItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.id === id)
      if (itemToRemove) {
        showNotification(`${itemToRemove.name} removed from wishlist!`)
      }
      return prevItems.filter(item => item.id !== id)
    })
  }

  const clearWishlist = () => {
    setWishlistItems([])
    showNotification('Wishlist cleared!')
  }

  const isInWishlist = (id: string) => {
    return wishlistItems.some(item => item.id === id)
  }

  const wishlistCount = wishlistItems.length

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      clearWishlist,
      isInWishlist,
      wishlistCount,
      showNotification
    }}>
      {children}
      
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg z-50 animate-in slide-in-from-top-2">
          {notification}
        </div>
      )}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
} 