"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Share2, Star, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import ProductReviews from "./product-reviews"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"
import { getAllProducts } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import type { Product } from "@/lib/types"

export default function ProductDetail({ product }: { product: Product }) {
  const { addToCart, showNotification, cartItems } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes && product.sizes.length > 0 ? product.sizes[0] : "M")
  const [selectedColor, setSelectedColor] = useState<string>(product.colors && product.colors.length > 0 ? product.colors[0].name : "Coral")
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [shopTheLookItems, setShopTheLookItems] = useState<any[]>([])
  const [carouselItems, setCarouselItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0)
  
  const nextImage = () => {
    if (product.images && product.images.length > 1) {
      setActiveImageIndex((prev) => (prev + 1) % product.images.length)
    }
  }

  const prevImage = () => {
    if (product.images && product.images.length > 1) {
      setActiveImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
    }
  }

  const nextCarousel = () => {
    if (carouselItems.length > 4) {
      setCurrentCarouselIndex((prev) => Math.min(prev + 1, carouselItems.length - 4))
    }
  }

  const prevCarousel = () => {
    setCurrentCarouselIndex((prev) => Math.max(prev - 1, 0))
  }
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    highlight: true,
    purpose: false,
    features: false,
    materials: false,
    reviews: false,
  })

  // Use dynamic color options from product
  const colorOptions = product.colors || [
    { name: "Coral", image: "/placeholder.svg?height=80&width=60" },
    { name: "Red", image: "/placeholder.svg?height=80&width=60" },
    { name: "Pink", image: "/placeholder.svg?height=80&width=60" },
    { name: "Navy", image: "/placeholder.svg?height=80&width=60" },
    { name: "Light Pink", image: "/placeholder.svg?height=80&width=60" },
    { name: "Cream", image: "/placeholder.svg?height=80&width=60" },
    { name: "Black", image: "/placeholder.svg?height=80&width=60" },
  ]

  const sizeOptions = product.sizes || ["S", "M", "L", "XL", "XXL"]

  // Fetch dynamic products for Shop the Look and Carousel
  useEffect(() => {
    const fetchDynamicProducts = async () => {
      try {
        setLoading(true)
        const allProducts = await getAllProducts()
        
        // Filter out current product and get a mix of men's and women's products
        const filteredProducts = allProducts.filter(p => p.id !== product.id)
        
        // Create Shop the Look items (5 items)
        const shopItems = filteredProducts.slice(0, 5).map((p, index) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          originalPrice: p.originalPrice,
          image: p.image || "/placeholder.svg?height=300&width=250",
          isNew: index % 3 === 0, // Every 3rd item is "NEW"
        }))
        
        // Create Carousel items (8 items with discounts for scrolling)
        const carouselItems = filteredProducts.slice(5, 13).map((p, index) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          originalPrice: p.originalPrice,
          image: p.image || "/placeholder.svg?height=300&width=300",
          discount: [30, 50, 30, 25, 40, 35, 45, 20][index] || 30, // Different discount percentages
        }))
        
        setShopTheLookItems(shopItems)
        setCarouselItems(carouselItems)
      } catch (error) {
        console.error('Error fetching dynamic products:', error)
        // Fallback to static data if API fails
        setShopTheLookItems([
    {
      id: 1,
      name: "Essential Oversized Tee - Pearl White",
      price: "$28.00",
      originalPrice: "$44.00",
      image: "/placeholder.svg?height=300&width=250",
      isNew: false,
    },
    {
      id: 2,
      name: "Crew Socks 3 Pack - Pearl White",
      price: "$26.00",
      image: "/placeholder.svg?height=300&width=250",
      isNew: true,
    },
    {
      id: 3,
      name: "Essential Oversized Tee - Pearl White",
      price: "$28.00",
      originalPrice: "$44.00",
      image: "/placeholder.svg?height=300&width=250",
      isNew: false,
    },
    {
      id: 4,
      name: "Crew Socks 3 Pack - Pearl White",
      price: "$26.00",
      image: "/placeholder.svg?height=300&width=250",
      isNew: true,
    },
    {
      id: 5,
      name: "Essential Oversized Tee - Pearl White",
      price: "$28.00",
      originalPrice: "$44.00",
      image: "/placeholder.svg?height=300&width=250",
      isNew: false,
    },
        ])
        setCarouselItems([
          {
            id: 1,
            name: "SQUATWOLF Baseball Cap - Pink",
            price: "$36.00",
            image: "/placeholder.svg?height=300&width=300",
            discount: 30,
          },
          {
            id: 2,
            name: "Athletic Training Shirt - Coral",
            price: "$48.00",
            image: "/placeholder.svg?height=300&width=300",
            discount: 30,
          },
          {
            id: 3,
            name: "Zip-Up Hoodie - Coral Pink",
            price: "$72.00",
            image: "/placeholder.svg?height=300&width=300",
            discount: 50,
          },
          {
            id: 4,
            name: "SQUATWOLF Athletic Socks - White",
            price: "$26.00",
            image: "/placeholder.svg?height=300&width=300",
            discount: 30,
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchDynamicProducts()
  }, [product.id])

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description || `Check out this amazing product: ${product.name}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleAddToCart = () => {
    // Check if product is already in cart
    if (isProductInCart) {
      showNotification("Product is already in cart!")
      return
    }
    
    // Convert price string to number (remove $ and convert to number)
    const priceNumber = parseFloat(product.price.replace(/[^0-9.]/g, ''))
    
    addToCart({
      id: product.id,
      name: product.name,
      price: priceNumber,
      image: product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg",
      color: selectedColor,
      size: selectedSize,
      quantity: 1,
      fit: "REGULAR FIT"
    })
  }

  const handleWishlistToggle = () => {
    const wishlistItem = {
      id: product.id,
      name: product.name,
      price: parseFloat(product.price.replace(/[^0-9.]/g, '')),
      image: product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg",
      color: selectedColor,
      size: selectedSize,
      fit: "REGULAR FIT"
    }

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(wishlistItem)
    }
  }

  // Check if product is already in cart
  const isProductInCart = cartItems.some(item => 
    item.id === product.id && 
    item.color === selectedColor && 
    item.size === selectedSize
  )

  return (
    <div className="bg-white">
      {/* Main Product Section - Now Dark */}
      <section className="py-12 bg-[#212121] text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                          {/* Product Images */}
              <div className="space-y-4">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-800 cursor-pointer">
                  <Image
                    src={product.images && product.images.length > 0 ? product.images[activeImageIndex] : "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />

                  {/* Navigation arrows */}
                  {product.images && product.images.length > 1 && (
                    <>
                      <button 
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4 text-black" />
                      </button>
                      <button 
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4 text-black" />
                      </button>
                    </>
                  )}

                  {/* Navigation dots */}
                  <div className="absolute bottom-4 left-4 flex space-x-2">
                    {product.images && product.images.length > 0 ? 
                      product.images.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full cursor-pointer ${index === activeImageIndex ? "bg-[#cbf26c]" : "bg-white/50"}`}
                          onClick={() => setActiveImageIndex(index)}
                        />
                      )) : 
                      [...Array(1)].map((_, index) => (
                        <div
                          key={index}
                          className="w-2 h-2 rounded-full bg-[#cbf26c]"
                        />
                      ))
                    }
                  </div>
                </div>
              </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Sale Badge */}
              {product.discountPercentage && product.discountPercentage > 0 && (
                <div className="flex justify-end">
                  <Badge className="bg-white text-[#212121] border border-white font-semibold">
                    {product.discountPercentage}% OFF
                  </Badge>
                </div>
              )}

              {/* Product Title */}
              <div className="space-y-2">
                <h1 className="text-2xl lg:text-3xl font-bold text-white uppercase">
                  {product.name}
                </h1>
                {product.subCategory && (
                  <p className="text-gray-400 uppercase tracking-wide">{product.subCategory}</p>
                )}
              </div>

              {/* Pricing */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  {product.originalPrice && (
                    <span className="text-gray-400 line-through text-lg">{formatCurrency(parseFloat(product.originalPrice.replace(/[^0-9.]/g, '')))}</span>
                  )}
                  <span className="text-2xl font-bold text-white">{formatCurrency(parseFloat(product.price.replace(/[^0-9.]/g, '')))}</span>
                </div>
                <p className="text-sm text-gray-300">EARN 507 PACK VIP POINTS</p>
              </div>

              {/* Rating and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-white">{product.rating?.toFixed(1) || "4.8"}</span>
                    <Star className="h-4 w-4 text-white fill-white ml-1" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-8 w-8 hover:bg-gray-700 ${
                      isInWishlist(product.id) ? 'text-red-500' : 'text-white'
                    }`}
                    onClick={handleWishlistToggle}
                  >
                    <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-gray-700" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Color Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{selectedColor}</span>
                </div>
                <div className="flex space-x-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.name}
                      className={`relative w-12 h-16 rounded-md overflow-hidden border-2 ${
                        selectedColor === color.name ? "border-white" : "border-gray-600"
                      }`}
                      onClick={() => setSelectedColor(color.name)}
                    >
                      {color.hex ? (
                        <div 
                          className="w-full h-full" 
                          style={{ backgroundColor: color.hex }}
                        />
                      ) : (
                        <Image 
                          src={color.image || "/placeholder.svg"} 
                          alt={color.name} 
                          fill 
                          className="object-cover" 
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">Size</span>
                  <button className="text-sm text-white underline hover:no-underline">SIZE GUIDE</button>
                </div>
                <div className="flex space-x-2">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      className={`w-12 h-10 rounded-md border-2 font-medium transition-colors ${
                        selectedSize === size
                          ? "bg-white text-[#212121] border-white"
                          : "bg-transparent text-white border-gray-600 hover:border-white"
                      }`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-400">Keelan is 6'2" and wears Medium</p>
              </div>

              {/* Add to Cart */}
              <div className="space-y-3">
                <Button
                  size="lg"
                  className={`w-full font-semibold py-4 rounded-md transition-all duration-300 ${
                    isProductInCart 
                      ? "bg-green-600 text-white cursor-not-allowed" 
                      : "bg-white text-[#212121] hover:bg-gray-100"
                  }`}
                  onClick={handleAddToCart}
                  disabled={isProductInCart}
                >
                  {isProductInCart ? "✓ ALREADY IN CART" : "ADD TO CART"}
                </Button>
              <Button
                asChild
                  variant="outline"
                size="lg"
                  className="w-full border-white text-white hover:bg-white hover:text-[#212121] font-semibold py-4 rounded-md transition-all duration-300"
              >
                  <Link href="/cart">VIEW CART</Link>
              </Button>
              </div>

              {/* Shop the Look */}
              <div className="space-y-4 pt-8">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium uppercase tracking-wide">SHOP THE LOOK</span>
                  <div className="flex space-x-2">
                    <div className="w-12 h-12 bg-white rounded-md overflow-hidden">
                      <Image
                        src="/placeholder.svg?height=48&width=48"
                        alt="Shop the look item 1"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-12 h-12 bg-white rounded-md overflow-hidden">
                      <Image
                        src="/placeholder.svg?height=48&width=48"
                        alt="Shop the look item 2"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#2B2B2B] rounded-full"></div>
                  <span className="text-white text-sm uppercase tracking-wide">ONLINE EXCLUSIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dark Product Details Section */}
      <section className="bg-[#1a1a1a] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Side - Collapsible Sections */}
            <div className="space-y-4">
              {/* Product Highlight */}
              <Collapsible open={openSections.highlight} onOpenChange={() => toggleSection("highlight")}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-4 border-b border-gray-600 hover:border-gray-500 transition-colors">
                  <span className="text-sm font-medium uppercase tracking-wide">PRODUCT HIGHLIGHT</span>
                  {openSections.highlight ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="py-6">
                  <div className="space-y-4">
                    {product.images && product.images.length > 0 && (
                      <div className="w-full h-64 bg-[#e8d5d5] rounded-lg overflow-hidden">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={400}
                          height={256}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {product.description && (
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {product.description}
                      </p>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Purpose */}
              <Collapsible open={openSections.purpose} onOpenChange={() => toggleSection("purpose")}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-4 border-b border-gray-600 hover:border-gray-500 transition-colors">
                  <span className="text-sm font-medium uppercase tracking-wide">PURPOSE</span>
                  {openSections.purpose ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="py-6">
                  <div className="text-gray-300 text-sm leading-relaxed">
                    {product.purpose ? (
                      <p>{product.purpose}</p>
                    ) : (
                      <p>
                        Designed for high-intensity training, running, and everyday athletic activities. These shorts
                        provide optimal comfort and performance for all your fitness needs.
                      </p>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Features & Fit */}
              <Collapsible open={openSections.features} onOpenChange={() => toggleSection("features")}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-4 border-b border-gray-600 hover:border-gray-500 transition-colors">
                  <span className="text-sm font-medium uppercase tracking-wide">FEATURES & FIT</span>
                  {openSections.features ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="py-6">
                  <div className="text-gray-300 text-sm leading-relaxed space-y-2">
                    {product.features ? (
                      <div dangerouslySetInnerHTML={{ __html: product.features.replace(/\n/g, '<br/>') }} />
                    ) : (
                      <ul className="list-disc pl-5 space-y-1">
                        <li>7-inch inseam for optimal coverage</li>
                        <li>Regular fit design</li>
                        <li>Elastic waistband with drawstring</li>
                        <li>Secure zip pocket for essentials</li>
                        <li>Four-way stretch construction</li>
                      </ul>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Materials & Care */}
              <Collapsible open={openSections.materials} onOpenChange={() => toggleSection("materials")}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-4 border-b border-gray-600 hover:border-gray-500 transition-colors">
                  <span className="text-sm font-medium uppercase tracking-wide">MATERIALS & CARE</span>
                  {openSections.materials ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="py-6">
                  <div className="text-gray-300 text-sm leading-relaxed space-y-4">
                    {product.materials && (
                      <div>
                        <h4 className="font-medium text-white mb-2">Materials:</h4>
                        <div dangerouslySetInnerHTML={{ __html: product.materials.replace(/\n/g, '<br/>') }} />
                      </div>
                    )}
                    {product.care && (
                      <div>
                        <h4 className="font-medium text-white mb-2">Care Instructions:</h4>
                        <div dangerouslySetInnerHTML={{ __html: product.care.replace(/\n/g, '<br/>') }} />
                      </div>
                    )}
                    {!product.materials && !product.care && (
                      <>
                        <div>
                          <h4 className="font-medium text-white mb-2">Materials:</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>88% Polyester, 12% Elastane</li>
                            <li>Moisture-wicking fabric technology</li>
                            <li>Anti-odor treatment</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-white mb-2">Care Instructions:</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Machine wash cold with like colors</li>
                            <li>Do not bleach</li>
                            <li>Tumble dry low</li>
                            <li>Do not iron</li>
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Reviews */}
              <Collapsible open={openSections.reviews} onOpenChange={() => toggleSection("reviews")}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-4 border-b border-gray-600 hover:border-gray-500 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium uppercase tracking-wide">REVIEWS</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3 w-3 ${i < (product.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}`} 
                        />
                      ))}
                    </div>
                  </div>
                  {openSections.reviews ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="py-6">
                  <ProductReviews product={product} />
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Right Side - Large Product Image */}
            <div className="relative">
              <div className="relative h-[600px] overflow-hidden rounded-lg">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled.png-sLs0eMOJM0ysIcvO4cGs2DA7laNfRI.jpeg"
                  alt="Person wearing coral shorts with white socks and sneakers"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop the Look Section */}
      <section className="bg-[#f5f5f5] py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-[#212121] mb-8 uppercase tracking-wide">SHOP THE LOOK</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm">
                  <div className="relative aspect-[4/5] overflow-hidden bg-gray-200 animate-pulse"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                </div>
              ))
            ) : (
              shopTheLookItems.map((item) => (
                <Link key={item.id} href={`/product/${item.id}`} className="block">
                  <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {item.isNew && <Badge className="absolute top-2 left-2 bg-[#212121] text-white text-xs">NEW</Badge>}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-[#212121] mb-2 line-clamp-2">{item.name}</h3>
                  <div className="flex items-center space-x-2">
                    {item.originalPrice && (
                      <span className="text-sm text-[#6e6e6e] line-through">{formatCurrency(parseFloat(item.originalPrice.replace(/[^0-9.]/g, '')))}</span>
                    )}
                    <span className="text-sm font-bold text-[#212121]">{formatCurrency(parseFloat(item.price.replace(/[^0-9.]/g, '')))}</span>
                  </div>
                </div>
              </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* You May Also Like Carousel Section */}
      <section className="bg-[#e8e8e8] py-16">
        <div className="container mx-auto px-4">
          <div className="relative">
            {/* Navigation Arrows */}
            <button 
              onClick={prevCarousel}
              disabled={currentCarouselIndex === 0}
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow ${
                currentCarouselIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
              }`}
            >
              <ChevronLeft className="h-6 w-6 text-[#212121]" />
            </button>
            <button 
              onClick={nextCarousel}
              disabled={currentCarouselIndex >= carouselItems.length - 4}
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow ${
                currentCarouselIndex >= carouselItems.length - 4 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
              }`}
            >
              <ChevronRight className="h-6 w-6 text-[#212121]" />
            </button>

            {/* Product Carousel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-16">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="group">
                    <div className="relative bg-white rounded-lg overflow-hidden shadow-sm">
                      <div className="aspect-square relative overflow-hidden bg-gray-200 animate-pulse"></div>
                </div>
                <div className="mt-4 text-center">
                      <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : (
                carouselItems.slice(currentCarouselIndex, currentCarouselIndex + 4).map((item) => (
                  <Link key={item.id} href={`/product/${item.id}`} className="group block">
                    <div className="relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="aspect-square relative overflow-hidden">
                    <Image
                          src={item.image || "/placeholder.svg?height=300&width=300"}
                          alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-[#212121] text-white text-xs font-bold px-2 py-1 rounded">
                          -{item.discount}%
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                      <p className="text-lg font-bold text-[#212121]">{formatCurrency(parseFloat(item.price.replace(/[^0-9.]/g, '')))}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Join the Akhlekt Family Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Form */}
            <div className="bg-[#2a2a2a] p-8 lg:p-12 rounded-lg">
              <div className="space-y-8">
                {/* Heading */}
                <div className="space-y-4">
                  <h2 className="text-3xl lg:text-4xl font-bold text-[#cbf26c] leading-tight uppercase tracking-wide">
                    JOIN THE ATHLEKT FAMILY
                  </h2>
                  <p className="text-white text-base leading-relaxed">
                    But I Must Explain To You How All This Mistaken Idea Of Denouncing Pleasure And Praising Pain Was
                    Born...
                  </p>
                </div>

                {/* Form */}
                <form className="space-y-6">
                  {/* First Name */}
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      className="w-full h-14 px-4 bg-transparent border border-[#4a4a4a] text-white placeholder:text-[#9a9a9a] focus:border-[#cbf26c] focus:ring-0 rounded-none focus:outline-none"
                      required
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      className="w-full h-14 px-4 bg-transparent border border-[#4a4a4a] text-white placeholder:text-[#9a9a9a] focus:border-[#cbf26c] focus:ring-0 rounded-none focus:outline-none"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      className="w-full h-14 px-4 bg-transparent border border-[#4a4a4a] text-white placeholder:text-[#9a9a9a] focus:border-[#cbf26c] focus:ring-0 rounded-none focus:outline-none"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone"
                      className="w-full h-14 px-4 bg-transparent border border-[#4a4a4a] text-white placeholder:text-[#9a9a9a] focus:border-[#cbf26c] focus:ring-0 rounded-none focus:outline-none"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="bg-[#4a4a4a] text-white hover:bg-[#5a5a5a] font-semibold px-8 py-4 h-auto rounded-none border-l-4 border-[#cbf26c] transition-all duration-300 hover:border-l-[#9fcc3b]"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-lg">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled-rVpXn9966PC2lrC2cQk9P8PCAgV8J5.png"
                  alt="Young man in black tank top wearing SQUATWOLF cap in gym"
                  width={600}
                  height={700}
                  className="w-full h-[700px] object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}