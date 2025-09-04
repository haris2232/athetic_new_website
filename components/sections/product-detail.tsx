"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Star, Heart, Share2, Package } from "lucide-react"
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
  const getVariantPrice = (variant) => {
    if (variant?.priceOverride && variant.priceOverride > 0) {
      return variant.priceOverride;
    }
    return product.basePrice || parseFloat(product.price.replace(/[^0-9.]/g, ''));
  };

  // Calculate current price based on selected variant
  const currentPrice = getVariantPrice(selectedVariation);
  const discountAmount = (currentPrice * (product.discountPercentage || 0)) / 100;
  const finalPrice = currentPrice - discountAmount;

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
          setShopTheLookItems(products.slice(0, 5).map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            image: product.image,
            isNew: Math.random() > 0.7 // Randomly mark some as new
          })))
          
          // Set Carousel items (next 4 products)
          setCarouselItems(products.slice(5, 9).map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            discount: Math.floor(Math.random() * 30) + 10 // Random discount 10-40%
          })))
          
          // Set highlighted product (if current product has highlight)
          if (product.isProductHighlight && product.highlightImage) {
          setHighlightedProduct({
              id: product.id,
              name: product.name,
              image: product.highlightImage
            })
          }
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
                  {product.discountPercentage > 0 && (
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

              {/* Color Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">Color</span>
                  <span className="text-sm text-white">{selectedColor}</span>
                </div>
                <div className="flex space-x-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.name}
                      className={`w-12 h-12 rounded-lg border-2 transition-colors ${
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
                        <Image 
                          src={getFullImageUrl(color.image)} 
                          alt={color.name} 
                          fill 
                          className="object-cover rounded-md" 
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
              <div className="space-y-4 pt-8">
                <div className="flex items-center justify-between">
                  {/* <span className="text-white font-medium uppercase tracking-wide">SHOP THE LOOK</span> */}
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

                {/* <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#2B2B2B] rounded-full"></div>
                  <span className="text-white text-sm uppercase tracking-wide">ONLINE EXCLUSIVE</span>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}