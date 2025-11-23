"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Trash2, Heart, Package, Percent, Plus, Minus, Truck, Shield, RotateCcw } from "lucide-react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"
import { useCurrency } from "@/lib/currency-context"
import { getAllProducts } from "@/lib/api"
import type { Product } from "@/lib/types"

// Array of payment methods with online logo URLs
const paymentMethods = [
  { name: 'Visa', src: 'https://img.icons8.com/color/48/visa.png', alt: 'Visa' },
  { name: 'Mastercard', src: 'https://img.icons8.com/color/48/mastercard-logos.png', alt: 'Mastercard' },
  { name: 'PayPal', src: 'https://img.icons8.com/color/48/paypal.png', alt: 'PayPal' },
  { name: 'Apple Pay', src: 'https://img.icons8.com/ios-filled/50/mac-os.png', alt: 'Apple Pay' },
  { name: 'Klarna', src: 'https://cdn.shopify.com/s/files/1/1331/8591/files/Klarna_PaymentBadge_OutsideCheckout_Black.png?v=1584014942', alt: 'Klarna' },
  { name: 'American Express', src: 'https://img.icons8.com/color/48/amex.png', alt: 'American Express' },
];

const trustFeatures = [
  { icon: Shield, text: "Secure Payment" },
  { icon: Truck, text: "Free Shipping Over 300 AED" },
  { icon: RotateCcw, text: "Easy Returns" }
];

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, showNotification, shippingInfo } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { getCurrencySymbol, formatPrice, currency } = useCurrency()
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [bundleDiscount, setBundleDiscount] = useState<any>(null)
  const [bundleLoading, setBundleLoading] = useState(false)

  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [lastCartHash, setLastCartHash] = useState<string>('')

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  
  // Debug shipping info - yeh check karenge kya aa raha hai
  console.log('🛒 Shipping Info from Context:', shippingInfo)
  console.log('🛒 Cart Items:', cartItems)
  console.log('🛒 Subtotal:', subtotal)

  // Temporary fix: Direct 300 AED logic use karte hain
  const FREE_SHIPPING_THRESHOLD = 300
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const shippingCost = isFreeShipping ? 0 : (shippingInfo?.shippingCost || 20)

  // Use context data if available, otherwise use direct logic
  const effectiveIsFreeShipping = shippingInfo?.isFreeShipping !== undefined ? shippingInfo.isFreeShipping : isFreeShipping
  const effectiveRemainingForFreeShipping = shippingInfo?.remainingForFreeShipping !== undefined ? shippingInfo.remainingForFreeShipping : remainingForFreeShipping
  const effectiveFreeShippingThreshold = shippingInfo?.rule?.freeShippingAt || FREE_SHIPPING_THRESHOLD

  console.log('🛒 Effective Values:', {
    effectiveIsFreeShipping,
    effectiveRemainingForFreeShipping, 
    effectiveFreeShippingThreshold,
    contextIsFreeShipping: shippingInfo?.isFreeShipping,
    contextRemaining: shippingInfo?.remainingForFreeShipping
  })

  useEffect(() => {
    const calculateBundleDiscount = async () => {
      if (cartItems.length === 0) {
        setBundleDiscount(null)
        return
      }
      setBundleLoading(true)
      try {
        const response = await fetch('/api/bundles/calculate-discount', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cartItems: cartItems.map(item => ({
              productId: item.productId,
              price: item.price,
              quantity: item.quantity
            }))
          })
        })
        if (response.ok) {
          const data = await response.json()
          setBundleDiscount(data)
        }
      } catch (error) {
        console.error('Error calculating bundle discount:', error)
      } finally {
        setBundleLoading(false)
      }
    }
    calculateBundleDiscount()
  }, [cartItems, subtotal])

  useEffect(() => {
    const fetchSuggestedProducts = async () => {
      // Show suggestions only when NOT achieving free shipping and we have remaining amount
      if (!effectiveIsFreeShipping && effectiveRemainingForFreeShipping > 0) {
        const cartHash = cartItems.map(item => `${item.id}-${item.quantity}`).join('|');
        
        if (cartHash === lastCartHash && suggestedProducts.length > 0) {
          return;
        }
        
        setLastCartHash(cartHash);
        setLoadingSuggestions(true);
        try {
          const allProducts = await getAllProducts();
          const cartProductIds = cartItems.map(item => item.productId || item.id);
          
          const availableProducts = allProducts.filter(product => {
            const productId = product.id || (product as any)._id;
            return productId && !cartProductIds.includes(productId);
          });
          
          const suggestions = availableProducts
            .filter(product => {
              if (!product.price && !(product as any).basePrice) return false;
              const productPrice = product.price ? 
                parseFloat(product.price.replace(/[^0-9.]/g, '')) : 
                (product as any).basePrice;
              const flexibility = Math.min(effectiveRemainingForFreeShipping * 0.3, 30);
              return productPrice <= effectiveRemainingForFreeShipping + flexibility;
            })
            .sort((a, b) => {
              const priceA = a.price ? parseFloat(a.price.replace(/[^0-9.]/g, '')) : (a as any).basePrice;
              const priceB = b.price ? parseFloat(b.price.replace(/[^0-9.]/g, '')) : (b as any).basePrice;
              const diffA = Math.abs(effectiveRemainingForFreeShipping - priceA);
              const diffB = Math.abs(effectiveRemainingForFreeShipping - priceB);
              return diffA - diffB;
            })
            .slice(0, 3);
          
          setSuggestedProducts(suggestions as any);
        } catch (error) {
          console.error('Error fetching suggested products:', error);
          setSuggestedProducts([]);
        } finally {
          setLoadingSuggestions(false);
        }
      } else {
        setSuggestedProducts([]);
        setLastCartHash('');
      }
    };
    
    const timeoutId = setTimeout(fetchSuggestedProducts, 100);
    return () => clearTimeout(timeoutId);
  }, [cartItems, effectiveIsFreeShipping, effectiveRemainingForFreeShipping, lastCartHash, suggestedProducts.length]);

  const handleWishlistToggle = (product: Product | any) => {
    const wishlistItem = {
      id: product.id,
      name: product.name,
      price: typeof product.price === 'string' ? parseFloat(product.price.replace(/[^0-9.]/g, '')) : product.price,
      image: product.image,
      color: product.color || "Default",
      size: product.size || "M",
      fit: product.fit || "Regular Fit"
    }
    if (isInWishlist(wishlistItem.id)) {
      removeFromWishlist(wishlistItem.id)
    } else {
      addToWishlist(wishlistItem)
    }
  }

  const promoDiscount = promoApplied ? subtotal * 0.1 : 0
  const bundleDiscountAmount = bundleDiscount?.discountAmount || 0
  const totalDiscount = promoDiscount + bundleDiscountAmount
  const shipping = effectiveIsFreeShipping ? 0 : shippingCost
  const total = subtotal - totalDiscount + shipping

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        {/* Trust Banner */}
        <div className="bg-[#212121] border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 text-sm text-white">
              {trustFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <feature.icon className="h-4 w-4 text-[#e9fc00]" />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
          {/* Left Column - Products & Suggestions */}
          <div className="bg-white text-[#212121] p-6 lg:p-12">
            <div className="max-w-2xl mx-auto">
              {/* Page Header */}
              <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold text-[#000000] uppercase tracking-tight mb-2">
                  Your Shopping Cart
                </h1>
                <p className="text-gray-600">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>

              {/* Free Shipping Banner */}
              <div className="mb-12">
                <div className="bg-gradient-to-r from-[#212121] to-gray-900 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-xl lg:text-2xl font-bold uppercase tracking-wide ${
                      effectiveIsFreeShipping ? 'text-green-400' : 'text-[#e9fc00]'
                    }`}>
                      {effectiveIsFreeShipping ? (
                        <div className="flex items-center space-x-2">
                          <span>🎉</span>
                          <span>CONGRATULATIONS! FREE SHIPPING ACHIEVED</span>
                        </div>
                      ) : (
                        `${getCurrencySymbol()} ${Math.floor(effectiveRemainingForFreeShipping)} MORE TO GET FREE SHIPPING`
                      )}
                    </h2>
                  </div>
                  
                  {!effectiveIsFreeShipping && (
                    <div className="space-y-3">
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-[#e9fc00] h-3 rounded-full transition-all duration-500 ease-out"
                          style={{ 
                            width: `${Math.min(100, ((effectiveFreeShippingThreshold - effectiveRemainingForFreeShipping) / effectiveFreeShippingThreshold) * 100)}%` 
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-300">
                        <span>{formatPrice(0)}</span>
                        <span>{formatPrice(effectiveFreeShippingThreshold)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Suggested Products - Only show when NOT achieving free shipping */}
              {!effectiveIsFreeShipping && effectiveRemainingForFreeShipping > 0 && (
                <div className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-[#000000]">
                      Complete Your Look
                    </h3>
                    <div className="text-sm text-gray-600">
                      Add {formatPrice(effectiveRemainingForFreeShipping)} more for free shipping
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {loadingSuggestions ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="group">
                          <div className="relative bg-gray-100 rounded-xl overflow-hidden mb-4">
                            <div className="aspect-[3/4] relative bg-gray-300 animate-pulse">
                              <div className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
                                <Heart className="h-4 w-4 text-gray-400" />
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                            <div className="h-6 bg-gray-300 rounded animate-pulse"></div>
                          </div>
                        </div>
                      ))
                    ) : suggestedProducts.length > 0 ? (
                      suggestedProducts.map((product) => {
                        const productId = product.id || (product as any)._id;
                        const productName = product.name || (product as any).title;
                        const productPrice = product.price ? 
                          parseFloat(product.price.replace(/[^0-9.]/g, '')) : 
                          (product as any).basePrice || 0;
                        const productImage = product.image || product.images?.[0] || "/placeholder.svg";
                        
                        return (
                          <Link key={productId} href={`/product/${productId}`} className="group block">
                            <div className="relative bg-gray-50 rounded-xl overflow-hidden mb-4 cursor-pointer border border-gray-200 hover:border-gray-300 transition-all duration-300">
                              <div className="aspect-[3/4] relative">
                                <Image
                                  src={productImage}
                                  alt={productName}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    e.currentTarget.src = "/placeholder.svg";
                                  }}
                                  priority={false}
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleWishlistToggle(product);
                                  }}
                                  className={`absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all duration-200 shadow-md hover:shadow-lg z-10 ${
                                    isInWishlist(productId) ? 'text-red-500' : 'text-gray-600'
                                  }`}
                                >
                                  <Heart className={`h-4 w-4 ${isInWishlist(productId) ? 'fill-current' : ''}`} />
                                </button>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <h3 className="text-sm font-medium text-[#212121] line-clamp-2">{productName}</h3>
                              <p className="text-lg font-bold text-[#212121]">{formatPrice(productPrice)}</p>
                            </div>
                          </Link>
                        );
                      })
                    ) : (
                      <div className="col-span-3 text-center py-8 text-gray-500">
                        No suggestions available
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center mt-8">
                    <Button
                      asChild
                      size="lg"
                      className="bg-[#e9fc00] text-[#212121] hover:bg-[#d4e600] font-semibold px-8 py-3 text-base rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <Link href="/collection">
                        Continue Shopping
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* Show celebration message when free shipping is achieved */}
              {effectiveIsFreeShipping && (
                <div className="mb-12 text-center">
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-2xl font-bold text-green-800 mb-2">
                      You've Unlocked Free Shipping!
                    </h3>
                    <p className="text-green-600">
                      Your order qualifies for free standard shipping
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Cart Summary */}
          <div className="bg-[#212121] text-white p-6 lg:p-12">
            <div className="max-w-md mx-auto sticky top-6">
              {/* Cart Summary Card */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700">
                {/* Cart Stats */}
                <div className="mb-6 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-300">Items in cart</span>
                    <span className="text-sm font-medium text-white bg-[#e9fc00] text-[#212121] px-2 py-1 rounded-full">
                      {cartItems.length} items
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Total quantity</span>
                    <span className="text-sm font-medium text-white">
                      {cartItems.reduce((sum, item) => sum + item.quantity, 0)} pieces
                    </span>
                  </div>
                </div>

                {/* Cart Items */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p>Your cart is empty</p>
                      <Button asChild className="mt-4 bg-[#e9fc00] text-[#212121] hover:bg-[#d4e600]">
                        <Link href="/collection">Start Shopping</Link>
                      </Button>
                    </div>
                  ) : (
                    cartItems.map((item, index) => (
                      <div key={`${item.id}-${item.size}-${item.color}-${index}`} className="flex space-x-4 p-3 bg-gray-900/30 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-600">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                            priority={false}
                          />
                        </div>
                        <div className="flex-1 space-y-1 min-w-0">
                          <h3 className="font-semibold text-white text-sm truncate">
                            {item.isBundle ? (
                              <div className="flex items-center space-x-1">
                                <Package className="h-3 w-3 text-green-400 flex-shrink-0" />
                                <span className="truncate">{item.name}</span>
                              </div>
                            ) : (
                              item.name
                            )}
                          </h3>
                          {item.isBundle && (
                            <div className="text-xs text-gray-400 space-y-0.5">
                              {item.bundlePack && (
                                <div className="truncate">
                                  <span className="font-medium">Pack:</span> {item.bundlePack.name} · {item.bundlePack.quantity}pcs
                                </div>
                              )}
                              {item.bundleDealTag && (
                                <div className="text-amber-400 font-semibold uppercase text-xs">
                                  {item.bundleDealTag}
                                </div>
                              )}
                            </div>
                          )}
                          {!item.isBundle && (
                            <div className="text-xs text-gray-400">
                              {item.color} | {item.size}
                            </div>
                          )}
                          <div className="space-y-0.5">
                            <p className="text-xs text-gray-400">
                              {formatPrice(item.price)} each
                            </p>
                            <p className="font-bold text-white text-sm">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <div className="flex items-center space-x-1">
                            {!item.isBundle && (
                              <button
                                onClick={() => handleWishlistToggle(item)}
                                className={`p-1 rounded hover:bg-gray-700 transition-colors ${
                                  isInWishlist(item.id) ? 'text-red-500' : 'text-gray-400'
                                }`}
                              >
                                <Heart className={`h-3 w-3 ${isInWishlist(item.id) ? 'fill-current' : ''}`} />
                              </button>
                            )}
                            <button 
                              className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="flex items-center border border-gray-600 rounded-lg bg-gray-800">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-gray-300 hover:bg-gray-700 rounded-r-none"
                              onClick={() => {
                                updateQuantity(item.id, item.quantity - 1);
                                showNotification(`${item.name} quantity updated.`);
                              }}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-xs font-medium text-white select-none">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-gray-300 hover:bg-gray-700 rounded-l-none"
                              onClick={() => {
                                updateQuantity(item.id, item.quantity + 1);
                                showNotification(`${item.name} quantity updated.`);
                              }}
                              disabled={item.quantity >= 10}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Order Summary */}
                {cartItems.length > 0 && (
                  <>
                    {/* Discounts */}
                    {bundleDiscount?.hasBundleDiscount && (
                      <div className="mb-4 p-4 bg-green-900/20 border border-green-800 rounded-xl">
                        <div className="flex items-center space-x-2 mb-2">
                          <Package className="h-4 w-4 text-green-400" />
                          <span className="font-semibold text-green-400">Bundle Discount Applied!</span>
                        </div>
                        <p className="text-sm text-green-300 mb-2">
                          "{bundleDiscount.bundle.name}" bundle
                        </p>
                        <div className="flex items-center space-x-2">
                          <Percent className="h-3 w-3 text-green-400" />
                          <span className="text-sm text-green-300">
                            Save {formatPrice(bundleDiscount.discountAmount)} ({bundleDiscount.discountPercentage}% off)
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Order Summary */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Subtotal</span>
                        <span className="font-medium text-white">{formatPrice(subtotal)}</span>
                      </div>
                      
                      {bundleDiscount?.hasBundleDiscount && (
                        <div className="flex justify-between text-sm text-green-400">
                          <span className="flex items-center space-x-1">
                            <Package className="h-3 w-3" />
                            <span>Bundle Discount</span>
                          </span>
                          <span>-{formatPrice(bundleDiscount.discountAmount)}</span>
                        </div>
                      )}
                      
                      {promoApplied && (
                        <div className="flex justify-between text-sm text-green-400">
                          <span>Promo Code (10%)</span>
                          <span>-{formatPrice(promoDiscount)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Shipping</span>
                        <span className={`font-medium ${effectiveIsFreeShipping ? 'text-green-400' : 'text-white'}`}>
                          {effectiveIsFreeShipping ? "FREE 🎉" : formatPrice(shippingCost)}
                        </span>
                      </div>
                      
                      <div className="border-t border-gray-600 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-white">Total</span>
                          <div className="text-right">
                            <span className="text-sm text-gray-400 mr-2">{currency}</span>
                            <span className="text-xl font-bold text-white">{formatPrice(total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <Button
                      asChild
                      className="w-full bg-[#e9fc00] text-[#212121] hover:bg-[#d4e600] font-semibold py-4 text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl mb-4"
                    >
                      <Link href="/checkout">
                        PROCEED TO CHECKOUT
                      </Link>
                    </Button>
                  </>
                )}

                {/* Payment Methods */}
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-3">We Accept</p>
                  <div className="flex justify-center items-center space-x-3 flex-wrap gap-2">
                    {paymentMethods.map((method) => (
                      <div key={method.name} className="relative w-8 h-6 bg-white rounded-sm p-0.5">
                        <Image
                          src={method.src}
                          alt={method.alt}
                          fill
                          sizes="32px"
                          style={{ objectFit: 'contain' }}
                          className="p-0.5"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}