"use client"

import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import { useCurrency } from "@/lib/currency-context"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2, Plus, Minus } from "lucide-react"

export default function CartSidebar() {
  const {
    isCartSidebarOpen,
    closeCartSidebar,
    cartItems,
    removeFromCart,
    updateQuantity,
    showNotification,
    shippingInfo,
  } = useCart()
  const { formatPrice } = useCurrency()

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const freeShippingThreshold = shippingInfo?.rule?.freeShippingAt || 0
  const amountForFreeShipping = shippingInfo?.remainingForFreeShipping || 0
  const shippingProgress = freeShippingThreshold > 0 ? Math.min(100, (subtotal / freeShippingThreshold) * 100) : 0

  return (
    <Sheet open={isCartSidebarOpen} onOpenChange={closeCartSidebar}>
      <SheetContent className="w-[400px] sm:w-[540px] bg-[#212121] text-white border-l-0 flex flex-col">
        <SheetHeader className="text-left">
          <SheetTitle className="text-2xl font-bold uppercase text-white">
            Your Cart ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
          </SheetTitle>
        </SheetHeader>
        {shippingInfo && cartItems.length > 0 && (
          <div className="px-0 py-4">
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-gray-300">
                {shippingInfo.isFreeShipping
                  ? "You've got Free Shipping!"
                  : `You're ${formatPrice(amountForFreeShipping)} away from free shipping`}
              </span>
            </div>
            {!shippingInfo.isFreeShipping && (
              <>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-[#e9fc00] h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </>
            )}
          </div>
        )}
        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-lg text-gray-400">Your cart is empty.</p>
            <SheetClose asChild>
              <Button
                asChild
                className="mt-4 bg-[#e9fc00] text-[#212121] hover:bg-[#b6d93b] font-semibold"
              >
                <Link href="/collection">Continue Shopping</Link>
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 my-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-4">
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-gray-700">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-400">
                        {item.color} | {item.size}
                      </p>
                      <p className="text-sm font-bold mt-1">
                        {formatPrice(item.price)}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-gray-600 rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-300 hover:bg-gray-700 rounded-r-none"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-300 hover:bg-gray-700 rounded-l-none"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={item.quantity >= 10}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-red-500"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="mt-auto bg-[#212121] -mx-6 -mb-6 p-6 border-t border-gray-700">
              <div className="w-full space-y-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <p className="text-xs text-gray-400">
                  Taxes and shipping calculated at checkout.
                </p>
                <Button asChild className="w-full bg-white text-[#212121] hover:bg-gray-200 font-semibold py-3 text-base">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}