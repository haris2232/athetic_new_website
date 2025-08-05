"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  color?: string
  size?: string
  quantity: number
  fit?: string
  productId?: string
  isBundle?: boolean
  bundleId?: string
  bundleName?: string
  bundleProducts?: CartItem[]
}

interface Bundle {
  id: string
  name: string
  bundlePrice: number
  originalPrice: number
  products: CartItem[]
  category: string
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (item: CartItem) => void
  addBundleToCart: (bundle: Bundle) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  cartCount: number
  cartTotal: number
  showNotification: (message: string) => void
  isBundleInCart: (bundleId: string) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [notification, setNotification] = useState<string | null>(null)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems))
  }, [cartItems])

  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  const addToCart = (newItem: CartItem) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => 
        item.id === newItem.id && 
        item.color === newItem.color && 
        item.size === newItem.size &&
        !item.isBundle // Don't merge with bundle items
      )

      if (existingItem) {
        // Update quantity if item already exists
        const updatedItems = prevItems.map(item =>
          item.id === existingItem.id && 
          item.color === existingItem.color && 
          item.size === existingItem.size &&
          !item.isBundle
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
        showNotification(`${newItem.name} quantity updated in cart!`)
        return updatedItems
      } else {
        // Add new item
        showNotification(`${newItem.name} added to cart!`)
        return [...prevItems, newItem]
      }
    })
  }

  const addBundleToCart = (bundle: Bundle) => {
    setCartItems(prevItems => {
      // Check if bundle already exists in cart
      const existingBundle = prevItems.find(item => 
        item.isBundle && item.bundleId === bundle.id
      )

      if (existingBundle) {
        // Update quantity if bundle already exists
        const updatedItems = prevItems.map(item =>
          item.isBundle && item.bundleId === bundle.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
        showNotification(`${bundle.name} bundle quantity updated in cart!`)
        return updatedItems
      } else {
        // Add bundle as single item
        const bundleItem: CartItem = {
          id: `bundle-${bundle.id}`,
          name: bundle.name,
          price: bundle.bundlePrice,
          image: bundle.products[0]?.image || "/placeholder.svg",
          quantity: 1,
          isBundle: true,
          bundleId: bundle.id,
          bundleName: bundle.name,
          bundleProducts: bundle.products
        }
        showNotification(`${bundle.name} bundle added to cart!`)
        return [...prevItems, bundleItem]
      }
    })
  }

  const removeFromCart = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  const isBundleInCart = (bundleId: string) => {
    return cartItems.some(item => item.isBundle && item.bundleId === bundleId)
  }

  // Count unique products (not total quantity)
  const cartCount = cartItems.length
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      addBundleToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal,
      showNotification,
      isBundleInCart
    }}>
      {children}
      
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-in slide-in-from-top-2">
          {notification}
        </div>
      )}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
} 