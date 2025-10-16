"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Trash2, Heart, Package, Percent, Plus, Minus } from "lucide-react"
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
  { name: 'Mastercard', src: 'https://img.icons8.com/color/48/mastercard-logo.png', alt: 'Mastercard' },
  { name: 'PayPal', src: 'https://img.icons8.com/color/48/paypal.png', alt: 'PayPal' },
  { name: 'Apple Pay', src: 'https://img.icons8.com/ios-filled/50/mac-os.png', alt: 'Apple Pay' },
  { name: 'Klarna', src: 'https://cdn.shopify.com/s/files/1/1331/8591/files/Klarna_PaymentBadge_OutsideCheckout_Black.png?v=1584014942', alt: 'Klarna' },
  { name: 'American Express', src: 'https://img.icons8.com/color/48/amex.png', alt: 'American Express' },
];

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, showNotification } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { getCurrencySymbol, formatPrice, currency } = useCurrency()
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [bundleDiscount, setBundleDiscount] = useState<any>(null)
  const [shippingInfo, setShippingInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [lastCartHash, setLastCartHash] = useState<string>('')

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  useEffect(() => {
    const calculateBundleDiscount = async () => {
      if (cartItems.length === 0) {
        setBundleDiscount(null)
        return
      }
      setLoading(true)
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
        setLoading(false)
      }
    }
    calculateBundleDiscount()
  }, [cartItems])

  useEffect(() => {
    const calculateShipping = async () => {
      if (cartItems.length === 0) {
        setShippingInfo(null)
        return
      }
      setLoading(true)
      try {
        const response = await fetch('/api/shipping/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subtotal: subtotal, region: 'US', weight: 0 })
        })
        if (response.ok) {
          const data = await response.json()
          setShippingInfo(data)
        } else {
          setShippingInfo(null)
        }
      } catch (error) {
        console.error('Error calculating shipping:', error)
        setShippingInfo(null)
      } finally {
        setLoading(false)
      }
    }
    calculateShipping()
  }, [cartItems, subtotal])

  useEffect(() => {
    const fetchSuggestedProducts = async () => {
      if (shippingInfo && !shippingInfo.isFreeShipping && shippingInfo.remainingForFreeShipping > 0) {
        // Create a hash of cart items to prevent unnecessary re-fetching
        const cartHash = cartItems.map(item => `${item.id}-${item.quantity}`).join('|');
        
        // Only fetch if cart has actually changed
        if (cartHash === lastCartHash && suggestedProducts.length > 0) {
          console.log('🔄 Cart unchanged, skipping suggestion fetch');
          return;
        }
        
        setLastCartHash(cartHash);
        setLoadingSuggestions(true);
        try {
          const allProducts = await getAllProducts();
          console.log('🔍 Fetched products for suggestions:', allProducts.length);
          
          const cartProductIds = cartItems.map(item => item.productId || item.id);
          console.log('🛒 Cart product IDs:', cartProductIds);
          
          const availableProducts = allProducts.filter(product => {
            const productId = product.id || (product as any)._id;
            return productId && !cartProductIds.includes(productId);
          });
          console.log('✅ Available products after filtering cart items:', availableProducts.length);
          
          const suggestions = availableProducts
            .filter(product => {
              if (!product.price && !(product as any).basePrice) return false;
              const productPrice = product.price ? 
                parseFloat(product.price.replace(/[^0-9.]/g, '')) : 
                (product as any).basePrice;
              const flexibility = Math.min(shippingInfo.remainingForFreeShipping * 0.3, 30);
              const isValid = productPrice <= shippingInfo.remainingForFreeShipping + flexibility;
              console.log(`💰 Product ${product.name}: price=${productPrice}, remaining=${shippingInfo.remainingForFreeShipping}, valid=${isValid}`);
              return isValid;
            })
            .sort((a, b) => {
              const priceA = a.price ? parseFloat(a.price.replace(/[^0-9.]/g, '')) : (a as any).basePrice;
              const priceB = b.price ? parseFloat(b.price.replace(/[^0-9.]/g, '')) : (b as any).basePrice;
              const diffA = Math.abs(shippingInfo.remainingForFreeShipping - priceA);
              const diffB = Math.abs(shippingInfo.remainingForFreeShipping - priceB);
              return diffA - diffB;
            })
            .slice(0, 3);
          
          console.log('🎯 Final suggestions:', suggestions.length);
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
    
    // Add a small delay to prevent rapid re-fetching
    const timeoutId = setTimeout(fetchSuggestedProducts, 100);
    return () => clearTimeout(timeoutId);
  }, [cartItems, shippingInfo, lastCartHash, suggestedProducts.length]);

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
  const shipping = shippingInfo?.isFreeShipping ? 0 : (shippingInfo?.shippingCost || 0)
  const total = subtotal - totalDiscount + shipping
  const freeShippingThreshold = shippingInfo?.rule?.freeShippingAt || 0
  const amountForFreeShipping = shippingInfo?.remainingForFreeShipping || 0

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
          <div className="bg-white text-[#212121] p-8 lg:p-12">
            <div className="max-w-2xl mx-auto">
              <div className="mb-12">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl lg:text-3xl font-bold text-[#000000] uppercase tracking-wide">
                    {getCurrencySymbol()} {Math.floor(amountForFreeShipping)} MORE TO GET FREE SHIPPING
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {loadingSuggestions ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="group">
                        <div className="relative bg-white rounded-lg overflow-hidden mb-4">
                          <div className="aspect-[3/4] relative bg-gray-300 animate-pulse">
                            <div className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
                              <Heart className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
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
                          <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4 cursor-pointer">
                            <div className="aspect-[3/4] relative">
                              <Image
                                src={productImage}
                                alt={productName}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  console.log('🖼️ Image failed to load for product:', productName, productImage);
                                  e.currentTarget.src = "/placeholder.svg";
                                }}
                                onLoad={() => {
                                  console.log('✅ Image loaded successfully for product:', productName);
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
                                className={`absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors z-10 ${
                                  isInWishlist(productId) ? 'text-red-500' : 'text-gray-600'
                                }`}
                              >
                                <Heart className={`h-4 w-4 ${isInWishlist(productId) ? 'fill-current' : ''}`} />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-sm font-medium text-[#212121]">{productName}</h3>
                            <p className="text-lg font-bold text-[#212121]">{formatPrice(productPrice)}</p>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="col-span-3 text-center py-8">
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <Button
                    asChild
                    size="lg"
                    className="bg-[#e9fc00] text-[#212121] hover:bg-[#9fcc3b] font-semibold px-12 py-4 text-lg rounded-md"
                  >
                    <Link href="/collection">
                      Shop Now
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#212121] text-white p-8 lg:p-12">
            <div className="max-w-md mx-auto">
              {shippingInfo && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-white">
                      {shippingInfo.isFreeShipping
                        ? "Free Shipping Applied!"
                        : `You're ${Math.floor(amountForFreeShipping)} AED away from Free Standard Shipping`
                      }
                    </span>
                  </div>
                  {!shippingInfo.isFreeShipping && (
                    <>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#ebff00] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{formatPrice(0)}</span>
                        <span>{formatPrice(freeShippingThreshold)}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
              <div className="mb-4 p-4 bg-gray-800 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-300">Items in cart</span>
                  <span className="text-sm font-medium text-gray-300">{cartItems.length} items</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-300">Total quantity</span>
                  <span className="text-sm font-medium text-gray-300">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)} pieces
                  </span>
                </div>
              </div>
              <div className="space-y-6 mb-8">
                {cartItems.map((item, index) => (
                  <div key={`${item.id}-${item.size}-${item.color}-${index}`} className="flex space-x-4">
                    <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log('🖼️ Cart item image failed to load:', item.name, item.image);
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                        onLoad={() => {
                          console.log('✅ Cart item image loaded:', item.name);
                        }}
                        priority={false}
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold text-white">
                        {item.isBundle ? (
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-green-600" />
                            <span>{item.name} (Bundle)</span>
                          </div>
                        ) : (
                          item.name
                        )}
                      </h3>
                      {item.isBundle && item.bundleProducts && (
                        <div className="text-xs text-gray-500 mb-2">
                          <p className="font-medium mb-1">Includes:</p>
                          {item.bundleProducts.map((p, index) => (
                            <div key={index} className="ml-2 mb-1">
                              <span className="font-medium">{p.name}</span>
                              {p.size && p.color && (
                                <span className="text-gray-400 ml-1">
                                  ({p.size}, {p.color})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {!item.isBundle && (
                        <>
                          <p className="text-sm text-gray-600">{item.fit}</p>
                          <p className="text-sm text-gray-400">
                            {item.color} | {item.size}
                          </p>
                        </>
                      )}
                      <div className="space-y-1">
                        <p className="text-sm text-gray-400">
                          {item.isBundle ? 'Bundle Price:' : 'Price:'} {formatPrice(item.price)} each
                        </p>
                        <p className="font-bold text-white">{formatPrice(item.price * item.quantity)} total</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-2">
                        {!item.isBundle && (
                          <button
                            onClick={() => handleWishlistToggle(item)}
                            className={`hover:text-red-500 ${
                              isInWishlist(item.id) ? 'text-red-500' : 'text-gray-400'
                            }`}
                          >
                            <Heart className={`h-4 w-4 ${isInWishlist(item.id) ? 'fill-current' : ''}`} />
                          </button>
                        )}
                        <button className="text-gray-400 hover:text-red-500" onClick={() => removeFromCart(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center border border-gray-600 rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-300 hover:bg-gray-700 rounded-r-none"
                          onClick={() => {
                            updateQuantity(item.id, item.quantity - 1);
                            showNotification(`${item.name} quantity updated.`);
                          }}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium text-white select-none">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-300 hover:bg-gray-700 rounded-l-none"
                          onClick={() => {
                            updateQuantity(item.id, item.quantity + 1);
                            showNotification(`${item.name} quantity updated.`);
                          }}
                          disabled={item.quantity >= 10}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {bundleDiscount?.hasBundleDiscount && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">Bundle Discount Applied!</span>
                  </div>
                  <p className="text-sm text-green-700 mb-2">
                    You've qualified for the "{bundleDiscount.bundle.name}" bundle
                  </p>
                  <div className="flex items-center space-x-2">
                    <Percent className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700">
                      Save {formatPrice(bundleDiscount.discountAmount)} ({bundleDiscount.discountPercentage}% off)
                    </span>
                  </div>
                </div>
              )}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between">
                  <span className="text-gray-300">Subtotal</span>
                  <span className="font-medium text-white">{formatPrice(subtotal)}</span>
                </div>
                {bundleDiscount?.hasBundleDiscount && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center space-x-1">
                      <Package className="h-4 w-4" />
                      <span>Bundle Discount</span>
                    </span>
                    <span>-{formatPrice(bundleDiscount.discountAmount)}</span>
                  </div>
                )}
                {promoApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount (10%)</span>
                    <span>-{formatPrice(promoDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-300">
                    {shippingInfo?.isFreeShipping ? "Shipping" : "Estimated Shipping"}
                  </span>
                  <span className={`font-medium ${shippingInfo?.isFreeShipping ? 'text-green-600' : ''}`}>
                    {shippingInfo?.isFreeShipping ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-white">Total</span>
                    <div className="text-right">
                      <span className="text-sm text-gray-400 mr-2">{currency}</span>
                      <span className="text-xl font-bold text-white">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                asChild
                className="w-full bg-white text-[#212121] hover:bg-gray-200 font-semibold py-4 text-lg rounded-md mb-6"
              >
                <Link href="/checkout">CHECKOUT</Link>
              </Button>
              <div className="flex justify-center items-center space-x-4">
                {paymentMethods.map((method) => (
                  <div key={method.name} className="relative w-12 h-8">
                    <Image
                      src={method.src}
                      alt={method.alt}
                      fill
                      sizes="48px"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
