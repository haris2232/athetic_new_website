"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"

export default function FloatingCartButton() {
  return (
    <Link
      href="/cart"
      className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 bg-[#e9fc00] text-[#212121] hover:bg-[#b6d93b] font-semibold uppercase px-5 py-3 rounded-full shadow-lg transition-all"
    >
      <ShoppingBag className="h-5 w-5" />
      Cart
    </Link>
  )
}
