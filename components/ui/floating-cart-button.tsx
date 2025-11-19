"use client"

import { usePathname } from "next/navigation"
import { ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useState, useEffect } from "react"

export default function FloatingCartButton() {
  const pathname = usePathname()
  const { openCartSidebar, cartItems } = useCart()
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const [isPulsing, setIsPulsing] = useState(false)
  const [isBouncing, setIsBouncing] = useState(false)
  const [prevItems, setPrevItems] = useState(totalItems)
  const [isHovered, setIsHovered] = useState(false)
  const [isFloating, setIsFloating] = useState(false)

  // Pulse animation when items are added
  useEffect(() => {
    if (totalItems > prevItems && totalItems > 0) {
      setIsPulsing(true)
      setIsBouncing(true)
      
      const pulseTimer = setTimeout(() => setIsPulsing(false), 600)
      const bounceTimer = setTimeout(() => setIsBouncing(false), 1000)
      
      return () => {
        clearTimeout(pulseTimer)
        clearTimeout(bounceTimer)
      }
    }
    setPrevItems(totalItems)
  }, [totalItems, prevItems])

  // Auto floating animation
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovered) {
        setIsFloating(true)
        setTimeout(() => setIsFloating(false), 2000)
      }
    }, 8000)
    
    return () => clearInterval(interval)
  }, [isHovered])

  // Hide the button on the cart page
  if (pathname === "/cart") {
    return null
  }

  return (
    <button
      onClick={openCartSidebar}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        fixed bottom-8 right-8 z-50 
        inline-flex items-center justify-center
        bg-gradient-to-br from-[#e9fc00] via-[#d4ff00] to-[#ffff00]
        text-[#212121] 
        hover:from-[#ffff00] hover:via-[#e9fc00] hover:to-[#d4ff00]
        font-extrabold 
        p-5 rounded-full 
        shadow-2xl 
        transition-all duration-500 ease-out
        transform
        border-3 border-black
        group
        overflow-hidden
        cursor-pointer
        ${isPulsing ? 'animate-pulse scale-110' : ''}
        ${isBouncing ? 'animate-bounce' : ''}
        ${isHovered ? 'scale-110 rotate-12' : 'scale-100 rotate-0'}
        ${isFloating ? 'translate-y-[-10px]' : 'translate-y-0'}
        hover:shadow-3xl
        active:scale-95
      `}
      style={{
        boxShadow: `
          0 12px 35px rgba(233, 252, 0, 0.5),
          0 0 0 2px rgba(0, 0, 0, 0.2),
          inset 0 2px 10px rgba(255, 255, 255, 0.3),
          ${isHovered ? 
            '0 25px 50px rgba(233, 252, 0, 0.7), 0 0 30px rgba(233, 252, 0, 0.4)' : 
            '0 8px 25px rgba(0, 0, 0, 0.2)'
          }
        `,
        border: '3px solid #000000',
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {/* Animated gradient background */}
      <div className={`
        absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-yellow-100/20 
        rounded-full 
        transition-all duration-700
        ${isHovered ? 'scale-150 opacity-100 rotate-180' : 'scale-100 opacity-50 rotate-0'}
      `} />
      
      {/* Pulse glow effect */}
      <div className={`
        absolute inset-0 bg-[#e9fc00] rounded-full 
        transition-all duration-1000
        ${isPulsing ? 'animate-ping opacity-30' : 'opacity-0'}
      `} />

      {/* Shine effect */}
      <div className={`
        absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent 
        rounded-full 
        transform -skew-x-12
        transition-all duration-1000
        ${isHovered ? 'translate-x-full' : '-translate-x-full'}
      `} />

      {/* Main Icon Container */}
      <div className="relative z-10 transform transition-all duration-500">
        <ShoppingBag className={`
          h-7 w-7 
          transition-all duration-500 ease-out
          drop-shadow-lg
          ${isHovered ? 'scale-110 -rotate-12' : 'scale-100 rotate-0'}
          ${isPulsing ? 'animate-pulse' : ''}
          ${isFloating ? 'translate-y-[-2px]' : ''}
        `} />
        
        {/* Floating particles on hover */}
        {isHovered && (
          <>
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-300 rounded-full animate-pulse shadow-lg" />
            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-yellow-300 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.3s' }} />
            <div className="absolute -top-2 -left-2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.6s' }} />
            <div className="absolute -bottom-2 -right-2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.9s' }} />
          </>
        )}
      </div>
      
      {/* Enhanced Item Count Badge */}
      {totalItems > 0 && (
        <span className={`
          absolute -top-4 -right-4 
          flex items-center justify-center 
          rounded-full 
          bg-gradient-to-br from-red-600 via-red-500 to-red-400
          text-white font-black
          transition-all duration-500 ease-out
          shadow-2xl
          z-20
          border-2 border-white
          ${totalItems > 9 ? 'min-w-8 h-8 text-[11px] px-1' : 'h-7 w-7 text-xs'}
          ${totalItems > 99 ? 'min-w-9 h-9 text-[10px]' : ''}
          ${isPulsing ? 'scale-125 animate-pulse' : ''}
          ${isHovered ? 'scale-110 -rotate-12' : 'scale-100 rotate-0'}
          ${isBouncing ? 'animate-bounce' : ''}
          ${isFloating ? 'translate-y-[-2px]' : ''}
          group-hover:shadow-xl
          group-hover:border-yellow-200
        `}
        style={{
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4), inset 0 1px 2px rgba(255,255,255,0.3)'
        }}>
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
      
      {/* Advanced Hover Tooltip */}
      <div className={`
        absolute -top-20 right-0 
        bg-gradient-to-br from-gray-900 to-black text-white text-sm font-bold 
        px-4 py-3 rounded-2xl 
        transition-all duration-500 ease-out
        shadow-2xl
        whitespace-nowrap
        border border-gray-600
        ${isHovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
        transform
        backdrop-blur-sm
      `}
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
      }}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingBag className="h-4 w-4 text-yellow-400" />
            {totalItems > 0 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            )}
          </div>
          <span className="text-white font-semibold">
            {totalItems === 0 ? 'Cart is empty' : `${totalItems} item${totalItems > 1 ? 's' : ''} in cart`}
          </span>
        </div>
        
        {/* Tooltip arrow */}
        <div className="absolute -bottom-2 right-5 w-4 h-4 bg-gray-900 transform rotate-45 border-r border-b border-gray-600" />
      </div>

      {/* Ripple effect on click */}
      <div className={`
        absolute inset-0 rounded-full bg-white/40 
        transition-all duration-700
        ${isPulsing ? 'scale-150 opacity-0' : 'scale-100 opacity-0'}
      `} />

      {/* Continuous subtle glow */}
      <div className={`
        absolute inset-0 rounded-full bg-yellow-400/20 
        opacity-30
      `} />
    </button>
  )
}