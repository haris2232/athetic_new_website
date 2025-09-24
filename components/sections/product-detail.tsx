"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Star, Heart, Share2, Package, ZoomIn, X } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"
import { formatCurrency } from "@/lib/utils"
import { Product } from "@/lib/types"
import ProductReviews from "@/components/sections/product-reviews"
import { submitForm } from "@/lib/api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://athlekt.com/backendnew';

const getFullImageUrl = (url: string | undefined): string => {
  if (!url) {
      return "/placeholder.svg";
  }
  if (url.startsWith('http')) {
      return url;
  }
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

export default function ProductDetail({ product }: { product: Product }) {
  const { addToCart, showNotification, cartItems } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes && product.sizes.length > 0 ? product.sizes[0] : "M")
  const [selectedColor, setSelectedColor] = useState<string>(product.colors && product.colors.length > 0 ? product.colors[0].name : "Coral")
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [shopTheLookItems, setShopTheLookItems] = useState<any[]>([])
  const [carouselItems, setCarouselItems] = useState<any[]>([])
  const [highlightedProduct, setHighlightedProduct] = useState<any>(null)
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [zoomImage, setZoomImage] = useState<string | null>(null)

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

  // Add this state to track the selected variation
  const [selectedVariation, setSelectedVariation] = useState(() => {
    // Find the default variation based on initial selectedSize and selectedColor
    return product.variants?.find(
      v => v.size === selectedSize && v.color.name === selectedColor
    ) || null;
  });

  // Update selectedVariation when size or color changes
  useEffect(() => {
    if (product.variants) {
      const variation = product.variants.find(
        v => v.size === selectedSize && v.color.name === selectedColor
      );
      setSelectedVariation(variation || null);
    }
  }, [selectedSize, selectedColor, product.variants]);

  // Function to get variant-specific price
  const getVariantPrice = (variant: any): number => {
    if (variant?.priceOverride && variant.priceOverride > 0) {
      return variant.priceOverride;
    }
    return (product as any).basePrice || parseFloat(product.price.replace(/[^0-9.]/g, ''));
  };

  // Calculate current price based on selected variant
  const currentPrice = getVariantPrice(selectedVariation);
  const discountAmount = (currentPrice * (product.discountPercentage || 0)) / 100;
  const finalPrice = currentPrice - discountAmount;

  // Set highlighted product for current product (if it has highlight image)
  useEffect(() => {
    console.log('Product highlight check:', {
      hasHighlightImage: !!product.highlightImage,
      highlightImage: product.highlightImage,
      productId: product.id,
      productName: product.name
    })
    
    if (product.highlightImage) {
      setHighlightedProduct({
        id: product.id,
        name: product.name,
        image: product.highlightImage
      })
    }
  }, [product.highlightImage, product.id, product.name])

  // Fetch dynamic products for Shop the Look, Carousel, and Highlighted Products
  useEffect(() => {
    const fetchDynamicProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_BASE_URL}/api/products/public`)
        const data = await response.json()
        
        if (data.success && data.data) {
          const products = data.data
          
          // Set Shop the Look items (first 5 products)
          setShopTheLookItems(products.slice(0, 5).map((product: any) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            image: product.image,
            isNew: Math.random() > 0.7 // Randomly mark some as new
          })))
          
          // Set Carousel items (next 4 products)
          setCarouselItems(products.slice(5, 9).map((product: any) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            discount: Math.floor(Math.random() * 30) + 10 // Random discount 10-40%
          })))
        }
      } catch (error) {
        console.error('Error fetching dynamic products:', error)
        // Fallback to static data
        setShopTheLookItems([
    {
      id: 1,
      name: "Essential Oversized Tee - Pearl White",
      price: "$28.00",
      originalPrice: "$44.00",
      image: getFullImageUrl("/placeholder.svg?height=300&width=250"),
      isNew: false,
    },
    {
      id: 2,
            name: "Athletic Training Shirt - Coral",
            price: "$48.00",
            originalPrice: "$72.00",
      image: getFullImageUrl("/placeholder.svg?height=300&width=250"),
      isNew: true,
    },
    {
      id: 3,
            name: "Zip-Up Hoodie - Coral Pink",
            price: "$72.00",
            originalPrice: "$96.00",
      image: getFullImageUrl("/placeholder.svg?height=300&width=250"),
      isNew: false,
    },
    {
      id: 4,
            name: "SQUATWOLF Athletic Socks - White",
      price: "$26.00",
            originalPrice: "$36.00",
      image: getFullImageUrl("/placeholder.svg?height=300&width=250"),
            isNew: false,
    },
    {
      id: 5,
      name: "Essential Oversized Tee - Pearl White",
      price: "$28.00",
      originalPrice: "$44.00",
      image: getFullImageUrl("/placeholder.svg?height=300&width=250"),
      isNew: false,
    },
        ])

        setCarouselItems([
          {
            id: 1,
            name: "SQUATWOLF Baseball Cap - Pink",
            price: "$36.00",
            image: getFullImageUrl("/placeholder.svg?height=300&width=300"),
            discount: 30,
          },
          {
            id: 2,
            name: "Athletic Training Shirt - Coral",
            price: "$48.00",
            image: getFullImageUrl("/placeholder.svg?height=300&width=300"),
            discount: 30,
          },
          {
            id: 3,
            name: "Zip-Up Hoodie - Coral Pink",
            price: "$72.00",
            image: getFullImageUrl("/placeholder.svg?height=300&width=300"),
            discount: 50,
          },
          {
            id: 4,
            name: "SQUATWOLF Athletic Socks - White",
            price: "$26.00",
            image: getFullImageUrl("/placeholder.svg?height=300&width=300"),
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
      [section]: !prev[section as keyof typeof prev],
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
    
    // Use variant-specific price
    const variantPrice = getVariantPrice(selectedVariation);
    
    addToCart({
      id: product.id,
      name: product.name,
      price: variantPrice,
      image: product.images && product.images.length > 0 ? getFullImageUrl(product.images[0]) : "/placeholder.svg",
      color: selectedColor,
      size: selectedSize,
      quantity: 1,
      fit: "REGULAR FIT"
    })
  }

  const handleWishlistToggle = () => {
    const variantPrice = getVariantPrice(selectedVariation);
    const wishlistItem = {
      id: product.id,
      name: product.name,
      price: variantPrice,
      image: product.images && product.images.length > 0 ? getFullImageUrl(product.images[0]) : "/placeholder.svg",
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

  // Form submission handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')

    // ADDED: Simple client-side validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setSubmitMessage('Please fill out all fields.')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await submitForm(formData)
      
      if (response.success) {
        setSubmitMessage('Thank you for joining the Athlekt family! Check your email for a welcome message.')
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: ''
        })
      } else {
        setSubmitMessage(response.message || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitMessage('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Check if product is already in cart
  const variantId = `${product.id}-${selectedSize || 'default'}-${selectedColor || 'default'}`
  const isProductInCart = cartItems.some(item => item.id === variantId)

  const [openSections, setOpenSections] = useState({
    purpose: false,
    features: false,
    materials: false,
    reviews: false,
  })

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
    if (currentCarouselIndex < carouselItems.length - 4) {
      setCurrentCarouselIndex(prev => prev + 1)
    }
  }

  const prevCarousel = () => {
    if (currentCarouselIndex > 0) {
      setCurrentCarouselIndex(prev => prev - 1)
    }
  }

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
                  src={product.images && product.images.length > 0 ? getFullImageUrl(product.images[activeImageIndex]) : getFullImageUrl("/placeholder.svg")}
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

                {/* Image indicators */}
                {product.images && product.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === activeImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                        onClick={() => setActiveImageIndex(index)}
                      />
                    ))}
                </div>
                )}
            </div>

              {/* Thumbnail images */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(0, 4).map((image, index) => (
                    <button
                        key={index}
                      className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                        index === activeImageIndex ? 'border-white' : 'border-transparent hover:border-gray-400'
                      }`}
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <Image
                        src={getFullImageUrl(image)}
                        alt={`${product.name} ${index + 1}`}
                        width={100}
                        height={100}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
                )}
              </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
                <div className="flex items-center space-x-4">
                  {selectedVariation?.originalPrice && (
                    <span className="text-gray-400 line-through text-lg">
                      {formatCurrency(parseFloat(selectedVariation.originalPrice.replace(/[^0-9.]/g, '')))}
                    </span>
                  )}
                  <span className="text-2xl font-bold text-white">
                    {formatCurrency(finalPrice)}
                  </span>
                  {((product as any).discountPercentage || 0) > 0 && (
                    <span className="text-lg text-gray-300 line-through ml-2">
                      {formatCurrency(currentPrice)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-300">EARN 507 PACK VIP POINTS</p>
              </div>

              {/* Rating and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < (product.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-300">({product.reviewCount || 0} reviews)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={handleWishlistToggle}
                    className={`p-2 rounded-full transition-colors ${
                      isInWishlist(product.id) 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  </button>
                  <button 
                    onClick={handleShare}
                    className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Color/Pattern Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">Color</span>
                  <span className="text-sm text-white">{selectedColor}</span>
                </div>
                <div className="flex space-x-2">
                  {colorOptions.map((color) => (
                    <div
                      key={color.name}
                      className={`w-12 h-12 rounded-lg border-2 transition-colors cursor-pointer ${
                        selectedColor === color.name
                          ? "border-white"
                          : "border-gray-600 hover:border-gray-400"
                      }`}
                      onClick={() => setSelectedColor(color.name)}
                    >
                      {color.hex ? (
                        <div 
                          className="w-full h-full rounded-md" 
                          style={{ backgroundColor: color.hex }}
                        />
                      ) : (
                        <div className="w-full h-full rounded-md overflow-hidden relative group">
                          <Image 
                            src={getFullImageUrl(color.image)} 
                            alt={color.name} 
                            width={48}
                            height={48}
                            className="object-cover w-full h-full" 
                          />
                          {/* Zoom Icon Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                            <div
                              onClick={(e) => {
                                e.stopPropagation()
                                setZoomImage(getFullImageUrl(color.image))
                              }}
                              className="bg-white/90 hover:bg-white text-gray-800 rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110 cursor-pointer"
                            >
                              <ZoomIn className="h-3 w-3" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
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
                      className={`px-3 py-2 rounded-md border-2 font-medium transition-colors ${
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
              {/* <div className="space-y-4 pt-8">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <div className="w-12 h-12 bg-red rounded-md overflow-hidden">
                      <Image
                        src={getFullImageUrl("/placeholder.svg?height=48&width=48")}
                        alt="Shop the look item 1"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-12 h-12 bg-white rounded-md overflow-hidden">
                      <Image
                        src={getFullImageUrl("/placeholder.svg?height=48&width=48")}
                        alt="Shop the look item 2"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Dark Product Details Section */}
      <section className="bg-[#1a1a1a] text-white py-12">
        <div className="container mx-auto px-4">
          {/* Grid layout updated to two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Side - Collapsible Sections */}
            <div className="space-y-4">
              {/* Product Description */}
              <div className="py-4 border-b border-gray-600">
                  <div className="space-y-4">
                    {product.description && (
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {product.description}
                      </p>
                    )}
                  </div>
              </div>

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
             <div className="flex items-start justify-center lg:justify-end">
               {product.images && product.images.length > 0 && (
                 <div className="w-full max-w-md lg:max-w-lg">
                   {/* Product Highlight Section - Show if current product has highlight image */}
                    {console.log('Rendering highlight section:', { highlightedProduct })}
                    {highlightedProduct && (
                      <>
                        {/* Product Highlight Heading */}
                        <div className="mb-6">
                          <h3 className="text-sm font-medium uppercase tracking-wide text-white">PRODUCT HIGHLIGHT</h3>
                        </div>
                        
                        {/* Highlighted Product - Only Image */}
                        <div className="mb-6">
                          <div className="bg-[#2a2a2a] rounded-lg overflow-hidden hover:bg-[#3a3a3a] transition-colors">
                            <div className="relative aspect-square">
                              <Image
                                src={getFullImageUrl(highlightedProduct.image)}
                                alt={highlightedProduct.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                 </div>
               )}
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
                    src={getFullImageUrl(item.image)}
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
                          src={getFullImageUrl(item.image)}
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

      {/* Join the Athlekt Family Section */}
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
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  {/* First Name */}
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
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
                      value={formData.lastName}
                      onChange={handleInputChange}
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
                      value={formData.email}
                      onChange={handleInputChange}
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
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Phone"
                      className="w-full h-14 px-4 bg-transparent border border-[#4a4a4a] text-white placeholder:text-[#9a9a9a] focus:border-[#cbf26c] focus:ring-0 rounded-none focus:outline-none"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#4a4a4a] text-white hover:bg-[#5a5a5a] font-semibold px-8 py-4 h-auto rounded-none border-l-4 border-[#cbf26c] transition-all duration-300 hover:border-l-[#9fcc3b] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Sending...' : 'Send'}
                    </button>
                  </div>

                  {/* Success/Error Message */}
                  {submitMessage && (
                    <div className={`text-sm ${submitMessage.includes('Thank you') ? 'text-[#cbf26c]' : 'text-red-400'}`}>
                      {submitMessage}
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-lg">
                <Image
                  src="\images\menbanner.png"
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

      {/* Zoom Modal */}
      {zoomImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setZoomImage(null)}
              className="absolute -top-12 right-0 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={zoomImage}
                alt="Zoomed pattern"
                width={800}
                height={800}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}