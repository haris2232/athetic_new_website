"use client"

import type React from "react"
import { CartProvider } from "@/lib/cart-context"
import { CurrencyProvider } from "@/lib/currency-context"
import { WishlistProvider } from "@/lib/wishlist-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CurrencyProvider>
      <CartProvider>
        <WishlistProvider>
          {children}
        </WishlistProvider>
      </CartProvider>
    </CurrencyProvider>
  )
}