"use client"

import { usePathname } from "next/navigation"
import { ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-context"

export default function FloatingCartButton() {
  const pathname = usePathname()
  const { openCartSidebar, cartItems } = useCart()
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  // Hide the button on the cart page
  if (pathname === "/cart") {
    return null
  }

  return (
    <button
      onClick={openCartSidebar}
      className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 bg-[#e9fc00] text-[#212121] hover:bg-[#b6d93b] font-semibold uppercase px-5 py-3 rounded-full shadow-lg transition-all"
    >
      <ShoppingBag className="h-5 w-5" />
      Cart
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
          {totalItems}
        </span>
      )}
    </button>
  )
}
