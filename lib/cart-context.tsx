"use client"

import { usePathname, useSearchParams } from 'next/navigation'
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
  shippingInfo: any
  isCartSidebarOpen: boolean
  openCartSidebar: () => void
  closeCartSidebar: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [notification, setNotification] = useState<string | null>(null)
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [shippingInfo, setShippingInfo] = useState<any>(null)

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

  // Close sidebar on route change
  useEffect(() => {
    closeCartSidebar()
  }, [pathname, searchParams])

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  useEffect(() => {
    const calculateShipping = async () => {
      if (cartItems.length === 0) {
        setShippingInfo(null)
        return
      }
      try {
        const response = await fetch('/api/shipping/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subtotal: subtotal, region: 'US', weight: 0 }),
        })
        if (response.ok) {
          const data = await response.json()
          setShippingInfo(data)
        } else {
          setShippingInfo(null)
        }
      } catch (error) {
        console.error('Error calculating shipping in context:', error)
        setShippingInfo(null)
      }
    }
    calculateShipping()
  }, [cartItems, subtotal])

  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  const addToCart = (newItem: CartItem) => {
    setCartItems(prevItems => {
      // Create unique ID for variant combinations
      const variantId = `${newItem.id}-${newItem.size || 'default'}-${newItem.color || 'default'}`
      const itemWithVariantId = { ...newItem, id: variantId }
      
      const existingItem = prevItems.find(item => 
        item.id === variantId &&
        !item.isBundle // Don't merge with bundle items
      )

      if (existingItem) {
        // Update quantity if item already exists
        const updatedItems = prevItems.map(item =>
          item.id === variantId && !item.isBundle
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
        showNotification(`${newItem.name} quantity updated in cart!`)
        return updatedItems
      } else {
        // Add new item with unique variant ID
        showNotification(`${newItem.name} added to cart!`)
        return [...prevItems, itemWithVariantId]
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
    if (quantity < 1) {
      // Remove item if quantity is 0 or less
      removeFromCart(id)
      return
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    console.log('🛒 clearCart called - clearing cart items');
    setCartItems([]);
    // Also clear from localStorage immediately
    localStorage.removeItem('cart');
    console.log('🛒 Cart cleared from both state and localStorage');
  }

  const isBundleInCart = (bundleId: string) => {
    return cartItems.some(item => item.isBundle && item.bundleId === bundleId)
  }

  // Count unique products (not total quantity)
  const cartCount = cartItems.length

  const openCartSidebar = () => setIsCartSidebarOpen(true)
  const closeCartSidebar = () => setIsCartSidebarOpen(false)

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      addBundleToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal: subtotal,
      showNotification,
      isBundleInCart,
      shippingInfo,
      isCartSidebarOpen,
      openCartSidebar,
      closeCartSidebar,
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