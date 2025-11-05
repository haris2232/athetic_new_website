"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge" 
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Star, Heart, Share2, Package, ZoomIn, X, Plus, Minus } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"
import { formatCurrency } from "@/lib/utils"
import { Product } from "@/lib/types"
import ProductReviews from "@/components/sections/product-reviews"
// Related section styled like MEN page (static figma block)
import { submitForm } from "@/lib/api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://athlekt.com/backendnew';

const getFullImageUrl = (url: string | undefined): string => {
  if (!url) {
      return "/placeholder.svg";
  }
  if (url.startsWith('http')) {
      return url;
  }
  // If it's a local public image (starts with /), return as-is
  if (url.startsWith('/') && !url.includes('backendnew') && !url.includes('api')) {
      return url;
  }
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

export default function ProductDetail({ product }: { product: Product }) {
  const { addToCart, showNotification, cartItems } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes && product.sizes.length > 0 ? product.sizes[0] : "M")
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState<string>(product.colors && product.colors.length > 0 ? product.colors[0].name : "Coral")
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  
  // Color to image mapping - this will be populated from product data
  const [colorImageMapping, setColorImageMapping] = useState<Record<string, string[]>>({})
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
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)

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

  // Function to get images for selected color
  const getImagesForColor = (colorName: string): string[] => {
    // First, try to get color-specific images from the product data
    const selectedColorOption = product.colors?.find(color => color.name === colorName)
    if (selectedColorOption?.images && selectedColorOption.images.length > 0) {
      return selectedColorOption.images
    }
    
    // If color-specific images exist in mapping, return them
    if (colorImageMapping[colorName] && colorImageMapping[colorName].length > 0) {
      return colorImageMapping[colorName]
    }
    
    // Otherwise, return all product images
    return product.images || []
  }

  // Current images based on selected color
  const currentImages = getImagesForColor(selectedColor)

  const sizeOptions = product.sizes || ["S", "M", "L", "XL", "XXL"]

  // Initialize color-image mapping when component loads
  useEffect(() => {
    if (product && product.colors && product.images) {
      const mapping: Record<string, string[]> = {}
      
      // Check if colors have specific images assigned
      product.colors.forEach(color => {
        if (color.images && color.images.length > 0) {
          mapping[color.name] = color.images
        } else {
          // Fallback: assign all images to colors that don't have specific images
          mapping[color.name] = product.images || []
        }
      })
      
      setColorImageMapping(mapping)
    }
  }, [product])

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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    // Using the existing notification system from the cart context
    showNotification("Link copied to clipboard!");
  }

  const handleAddToCart = () => {
    // Use variant-specific price
    const variantPrice = getVariantPrice(selectedVariation);
    
    addToCart({
      id: product.id,
      name: product.name,
      price: variantPrice,
      image: currentImages.length > 0 ? getFullImageUrl(currentImages[0]) : (product.images && product.images.length > 0 ? getFullImageUrl(product.images[0]) : "/placeholder.svg"),
      color: selectedColor,
      size: selectedSize,
      quantity: quantity,
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

  const [openSections, setOpenSections] = useState({
    purpose: false,
    features: false,
    materials: false,
    reviews: false,
  })

  const nextImage = () => {
    if (currentImages && currentImages.length > 1) {
      setActiveImageIndex((prev) => (prev + 1) % currentImages.length)
    }
  }

  const prevImage = () => {
    if (currentImages && currentImages.length > 1) {
      setActiveImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length)
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
    <div className="bg-white overflow-x-hidden">
      {/* Main Product Section - Figma Design */}
      <section className="py-6 md:py-8 lg:py-10 xl:py-12 bg-white text-[#212121]">
        <div className="container mx-auto px-4 max-w-[1250px]">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-10 xl:gap-12 items-start">
            {/* Product Images - Fully Responsive */}
            <div className="w-full lg:w-auto flex-shrink-0 md:self-start">
              {/* Desktop & Tablet - Responsive Sizes */}
              <div className="hidden md:flex md:gap-4 xl:gap-6 flex-shrink-0">
                {/* Thumbnails - Left side, vertical stack - Responsive */}
                {currentImages && currentImages.length > 0 && (
                  <div className="flex flex-col gap-3 md:gap-4 xl:gap-5 flex-shrink-0">
                    {currentImages.map((image, index) => (
                      <button
                        key={index}
                        className="relative overflow-hidden transition-colors flex-shrink-0"
                        style={{
                          width: 'clamp(100px, 12vw, 173px)',
                          height: 'clamp(90px, 11vw, 158px)',
                          borderRadius: '12px',
                          border: index === activeImageIndex ? '2px solid #3B82F6' : '2px solid #D1D5DB',
                          backgroundColor: '#FFFFFF',
                          opacity: 1
                        }}
                        onClick={() => setActiveImageIndex(index)}
                      >
                <Image
                          src={getFullImageUrl(image)}
                          alt={`${product.name} ${index + 1}`}
                  fill
                  className="object-cover"
                          style={{
                            objectFit: 'cover',
                            objectPosition: 'center',
                            borderRadius: '12px'
                          }}
                        />
                    </button>
                    ))}
                </div>
                )}
                
                {/* Main Image - Responsive */}
                <div 
                  className="relative overflow-hidden bg-white flex-shrink-0"
                  style={{
                    width: 'clamp(280px, 35vw, 455px)',
                    height: 'clamp(320px, 40vw, 514px)',
                    borderRadius: '12px',
                    opacity: 1,
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <Image
                    src={currentImages && currentImages.length > 0 ? getFullImageUrl(currentImages[activeImageIndex]) : getFullImageUrl("/placeholder.svg")}
                    alt={product.name}
                    fill
                    className="object-cover"
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'center',
                      borderRadius: '12px'
                    }}
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 40vw, 455px"
                  />
                </div>
            </div>

              {/* Mobile - Responsive */}
              <div className="md:hidden flex flex-col gap-4">
                {/* Mobile Thumbnails - Horizontal */}
              {currentImages && currentImages.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                  {currentImages.map((image, index) => (
                    <button
                        key={index}
                        className="relative overflow-hidden transition-colors flex-shrink-0"
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '8px',
                          border: index === activeImageIndex ? '2px solid #3B82F6' : '2px solid #D1D5DB',
                          backgroundColor: '#FFFFFF',
                          opacity: 1
                        }}
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <Image
                        src={getFullImageUrl(image)}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                        style={{
                          objectFit: 'cover',
                          objectPosition: 'center',
                          borderRadius: '8px'
                        }}
                      />
                    </button>
                  ))}
                </div>
                )}
                
                {/* Main Image - Mobile */}
                <div className="relative w-full overflow-hidden bg-white rounded-xl" style={{ aspectRatio: '4/5', minHeight: '400px' }}>
                  <Image
                    src={currentImages && currentImages.length > 0 ? getFullImageUrl(currentImages[activeImageIndex]) : getFullImageUrl("/placeholder.svg")}
                    alt={product.name}
                    fill
                    className="object-cover"
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'center',
                      borderRadius: '12px'
                    }}
                    priority
                    sizes="100vw"
                  />
                </div>
              </div>
              </div>

            {/* Product Info - Figma Exact Spacing */}
            <div className="w-full md:w-auto md:flex-1 flex-shrink-0 flex flex-col md:justify-between md:self-stretch">
              {/* Top Section - Aligned with Image Top */}
              <div className="flex flex-col md:flex-shrink-0">
                {/* Product Name & Price Row - Figma Exact */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                  <h1 
                    className="uppercase text-black mb-0"
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 'clamp(36px, 3.8vw, 56px)', // Reduced from 48px-70px to 36px-56px
                      fontWeight: 400,
                      lineHeight: 'clamp(34px, 3.6vw, 52px)', // Reduced line height
                      letterSpacing: '-2px',
                      color: '#000000',
                      margin: 0,
                      padding: 0,
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {(() => {
                      const name = product.name || "MEN'S HYBRID CLASSIC";
                      // Figma: "MEN'S" on first line, "HYBRID CLASSIC" on second line
                      if (name.startsWith("MEN'S ")) {
                        const rest = name.replace("MEN'S ", "");
                        return "MEN'S\n" + rest;
                      }
                      return name;
                    })()}
                  </h1>
                  
                  {/* Price - Responsive and Right Aligned */}
                  <div className="flex flex-col items-start md:items-end md:text-right mt-0" style={{ paddingTop: '0px', width: '100%', maxWidth: '100%' }}>
                    {selectedVariation?.originalPrice || (product as any).originalPrice ? (
                      <span 
                        className="line-through md:w-full md:text-right"
                        style={{
                          fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                          fontSize: 'clamp(11px, 1.1vw, 16px)', // Reduced from 12px-18px to 11px-16px
                          fontWeight: 400,
                          color: '#000000',
                          textDecorationColor: '#EF4444',
                          textDecorationThickness: '2px',
                          marginBottom: '4px',
                          lineHeight: 'clamp(28px, 3vw, 40px)', // Reduced line height
                          height: 'clamp(28px, 3vw, 40px)', // Reduced height
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          width: '100%'
                        }}
                      >
                        {formatCurrency(parseFloat((selectedVariation?.originalPrice || (product as any).originalPrice || product.originalPrice || "0").replace(/[^0-9.]/g, '')))}
                    </span>
                    ) : null}
                    <span 
                      className="text-black md:w-full md:text-right"
                      style={{
                        fontFamily: "'Gilroy-Bold', 'Gilroy', sans-serif",
                        fontSize: 'clamp(22px, 2.4vw, 34px)', // Reduced from 28px-42px to 22px-34px
                        fontWeight: 700,
                        lineHeight: 'clamp(34px, 3.6vw, 52px)', // Reduced line height
                        letterSpacing: '0px',
                        color: '#000000',
                        height: 'clamp(34px, 3.6vw, 52px)', // Reduced height
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        width: '100%'
                      }}
                    >
                    {formatCurrency(finalPrice)}
                  </span>
                </div>
              </div>

                {/* Description - Figma Exact Spacing */}
                <p 
                  className="text-black mb-8"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: 'clamp(13px, 1.15vw, 16px)', // Reduced from 14px-18px to 13px-16px
                    fontWeight: 400,
                    lineHeight: '1.5',
                    letterSpacing: '0px',
                    color: '#000000',
                    maxWidth: '334px',
                    margin: 0
                  }}
                >
                  {product.description || "Designed for a boxy, oversized look—size down if you prefer a closer fit."}
                </p>
                  </div>

              {/* Middle Section - Centered between Top and Bottom */}
              <div className="flex flex-col md:justify-center md:py-8">

              {/* Size Selection - Figma Exact Alignment */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center" style={{ gap: '12px' }}>
                    <span 
                      className="uppercase text-black"
                      style={{
                        fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                        fontSize: 'clamp(12px, 1.2vw, 14px)', // Responsive font size
                        fontWeight: 600,
                        lineHeight: '1'
                      }}
                    >
                      SIZE:
                    </span>
                    {sizeOptions.slice(0, 4).map((size) => (
                  <button 
                        key={size}
                        className="transition-colors cursor-pointer flex items-center justify-center flex-shrink-0"
                        style={{
                          fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                          fontSize: 'clamp(12px, 1.2vw, 14px)', // Responsive font size
                          fontWeight: 600,
                          width: 'clamp(28px, 2.8vw, 32px)', // Responsive width
                          height: 'clamp(28px, 2.8vw, 32px)', // Responsive height
                          borderRadius: '8px',
                          border: '2px solid #000000',
                          backgroundColor: selectedSize === size ? '#E5E7EB' : '#FFFFFF',
                          color: '#000000',
                          lineHeight: '1',
                          padding: 0
                        }}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                  </button>
                    ))}
                </div>
                  <div className="flex items-center gap-2 cursor-pointer" style={{ flexWrap: 'nowrap' }}>
                    <span 
                      className="uppercase text-black whitespace-nowrap"
                      style={{
                        fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                        fontSize: 'clamp(12px, 1.2vw, 14px)', // Responsive font size
                        fontWeight: 600,
                        lineHeight: '1'
                      }}
                    >
                      SIZE CHART
                    </span>
                    <Package className="h-4 w-4 text-black flex-shrink-0" />
              </div>
                </div>
              </div>

              {/* Color Selection - Figma Exact Alignment */}
              <div className="mb-8">
                <div className="flex items-center" style={{ gap: '12px' }}>
                  <span 
                    className="uppercase text-black"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: 'clamp(12px, 1.2vw, 14px)', // Responsive font size
                      fontWeight: 600,
                      lineHeight: '1'
                    }}
                  >
                    COLOR:
                  </span>
                  {colorOptions.slice(0, 4).map((color, idx) => {
                    // Default colors: gray, black, yellow, blue
                    const defaultColors = ['#808080', '#000000', '#FFFF00', '#0066FF']
                    const colorHex = color.hex || defaultColors[idx] || '#808080'
                    
                    return (
                    <div
                      key={color.name}
                        className="transition-colors cursor-pointer flex-shrink-0"
                        style={{
                          width: 'clamp(28px, 2.8vw, 32px)', // Responsive width
                          height: 'clamp(28px, 2.8vw, 32px)', // Responsive height
                          borderRadius: '8px',
                          border: selectedColor === color.name
                            ? '2px solid #000000'
                            : '1px solid #D1D5DB',
                          backgroundColor: colorHex,
                          opacity: 1
                        }}
                      onClick={() => {
                        setSelectedColor(color.name)
                          setActiveImageIndex(0)
                        }}
                      />
                    )
                  })}
                            </div>
                </div>
              </div>

              {/* Bottom Section - Aligned with Image Bottom */}
              <div className="flex flex-col md:flex-shrink-0">

              {/* Quantity Selection & Action Buttons - Figma Exact Spacing */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                {/* Quantity Selector - Figma Exact */}
                <div 
                  className="flex items-center justify-between"
                  style={{
                    width: '100%',
                    maxWidth: 'clamp(120px, 13vw, 140px)', // Reduced from 156px to 120px-140px
                    height: 'clamp(50px, 5.5vw, 58px)', // Reduced from 64px to 50px-58px
                    borderRadius: '20px',
                    border: '2px solid #000000',
                    backgroundColor: '#FFFFFF',
                    padding: '0 clamp(16px, 1.8vw, 20px)' // Reduced padding
                  }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-full text-black hover:bg-gray-100"
                    style={{
                      minWidth: 'auto',
                      padding: '0',
                      border: 'none',
                      borderRadius: '0'
                    }}
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <span 
                    className="text-center"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: 'clamp(16px, 1.6vw, 18px)', // Responsive font size
                      fontWeight: 600,
                      color: '#000000'
                    }}
                  >
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-full text-black hover:bg-gray-100"
                    style={{
                      minWidth: 'auto',
                      padding: '0',
                      border: 'none',
                      borderRadius: '0'
                    }}
                    onClick={() => setQuantity(prev => prev + 1)}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
              </div>

                {/* Action Buttons - Figma Exact */}
                <div className="flex gap-3 flex-1">
                <Button
                  size="lg"
                    className="uppercase font-semibold transition-all duration-300"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: 'clamp(14px, 1.4vw, 16px)', // Responsive font size
                      fontWeight: 600,
                      color: '#EBFF00',
                      backgroundColor: '#000000',
                      width: 'clamp(280px, 30vw, 340px)', // Reduced from 364px to 280px-340px
                      height: 'clamp(52px, 5.5vw, 60px)', // Reduced from 67px to 52px-60px
                      borderRadius: '20px',
                      border: 'none',
                      padding: 'clamp(4px, 0.5vw, 6px) clamp(20px, 2.2vw, 24px)', // Responsive padding
                      gap: 'clamp(4px, 0.5vw, 6px)'
                    }}
                  onClick={handleAddToCart}
                >
                    ADD TO BAG
                </Button>
                  
                  {/* Wishlist Button - Figma Exact */}
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 'clamp(70px, 7.5vw, 80px)', // Reduced from 88px to 70px-80px
                      height: 'clamp(50px, 5.5vw, 58px)', // Reduced from 64px to 50px-58px
                      borderRadius: '20px',
                      border: '2px solid #000000',
                      backgroundColor: '#FFFFFF',
                      padding: 'clamp(8px, 0.9vw, 10px)', // Responsive padding
                      gap: 'clamp(8px, 0.9vw, 10px)',
                      cursor: 'pointer'
                    }}
                    onClick={handleWishlistToggle}
                  >
                    <Heart 
                      className={`h-6 w-6 ${isInWishlist(product.id) ? 'fill-current text-red-500' : 'text-black'}`}
                      style={{
                        strokeWidth: isInWishlist(product.id) ? 0 : 2,
                        stroke: '#000000'
                      }}
                    />
                  </div>
                </div>
              </div>
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

      {/* Description, Fit, Material & Care, Reviews Section - Figma Design */}
      <section className="bg-white text-[#212121] py-12">
        <div className="container mx-auto px-4 max-w-[1250px]">
          {/* Top Horizontal Line */}
          <div className="border-t border-black mb-12"></div>
          
          {/* Three Column Layout (match Figma widths exactly on md+) */}
          <div className="grid grid-cols-1 gap-6 md:gap-6 md:[grid-template-columns:526px_378px_307px]">
            {/* Column 1: DESCRIPTION */}
            <div className="border-b border-black pb-8 md:border-b-0 md:pb-0 md:pr-8">
              <h2 
                className="uppercase text-black mb-4"
                style={{
                  fontFamily: "'Gilroy-Bold', 'Gilroy', sans-serif",
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '0px'
                }}
              >
                DESCRIPTION
              </h2>
              <p 
                className="text-black"
                style={{
                  fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                  fontSize: '16px',
                  fontWeight: 400,
                  lineHeight: '20px',
                  letterSpacing: '0px',
                  margin: 0,
                  maxWidth: '526px'
                }}
              >
                The Athlekt Classic Hybrid Tee is designed to move with you wherever the day takes you. Lightweight, breathable, and stretchable, it delivers all-day comfort whether you're training, on the move, or unwinding after a long day. Its adaptive fit complements every body type from athletes to dads with dad bods offering a clean, confident silhouette without compromising comfort. Perfect for both lifestyle and gym, this tee keeps you cool, sharp, and ready for anything from your morning session to your evening plans. One tee. Every moment. Athlekt.
              </p>
              </div>

            {/* Column 2: FIT and MATERIAL & CARE */}
            <div className="space-y-1 border-b border-black pb-8 md:border-b-0 md:pb-0 md:pr-8">
              {/* FIT */}
              <div>
                <h2 
                  className="uppercase text-black mb-4"
                  style={{
                    fontFamily: "'Gilroy-Bold', 'Gilroy', sans-serif",
                    fontSize: '20px',
                    fontWeight: 700,
                    letterSpacing: '0px'
                  }}
                >
                  FIT
                </h2>
                <p 
                  className="text-black"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: '20px',
                    letterSpacing: '0px',
                    margin: 0,
                    maxWidth: '378px'
                  }}
                >
                  Boxy, oversized look—size down if you prefer a closer fit.
                </p>
                  </div>

              {/* MATERIAL & CARE */}
              <div className="pt-8">
                <h2 
                  className="uppercase text-black mb-4"
                  style={{
                    fontFamily: "'Gilroy-Bold', 'Gilroy', sans-serif",
                    fontSize: '20px',
                    fontWeight: 700,
                    letterSpacing: '0px'
                  }}
                >
                  MATERIAL & CARE
                </h2>
                <div className="space-y-2">
                  <p 
                    className="text-black"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '16px',
                      fontWeight: 400,
                      lineHeight: '20px',
                      letterSpacing: '0px',
                      margin: 0,
                      maxWidth: '526px'
                    }}
                  >
                    This lightweight, drapey fabric is smooth on the outside and looped on the inside with a slightly faded, vintage-looking finish
                  </p>
                  <p 
                    className="text-black"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '16px',
                      fontWeight: 400,
                      lineHeight: '20px',
                      letterSpacing: '0px',
                      margin: 0,
                      maxWidth: '526px'
                    }}
                  >
                    65% Cotton, 35% Polyester
                  </p>
                  </div>
                      </div>
                      </div>

            {/* Column 3: REVIEWS */}
            <div>
              <h2 
                className="uppercase text-black mb-4"
                style={{
                  fontFamily: "'Gilroy-Bold', 'Gilroy', sans-serif",
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '0px'
                }}
              >
                REVIEWS
              </h2>
              <div className="flex items-center mb-4" style={{ gap: '9px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4"
                    style={{
                      fill: i < 4 ? '#c9ff4a' : 'transparent',
                      stroke: '#000000',
                      strokeWidth: 1
                    }}
                  />
                ))}
              </div>
              <p 
                className="text-black"
                style={{
                  fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                  fontSize: '16px',
                  fontWeight: 400,
                  lineHeight: '20px',
                  letterSpacing: '0px',
                  margin: 0,
                  maxWidth: '307px'
                }}
              >
                Boxy, oversized look—size down if you prefer a closer fit. Boxy, oversized look—size down if you prefer a closer fit.
              </p>
                  </div>
            </div>

          {/* Bottom Horizontal Line */}
          <div className="border-t border-black mt-4"></div>
                        </div>
      </section>

      {/* Bundles Section - Figma Design */}
      <section className="bg-white text-[#212121] py-12">
        <div className="container mx-auto px-4 max-w-[1250px]">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-8 gap-6">
            <h1 
              className="uppercase text-black leading-none"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontWeight: 400,
                fontSize: '90px',
                letterSpacing: '-3.37px'
              }}
            >
              BUNDLES
            </h1>
            <p 
              className="text-black text-left leading-normal lg:max-w-[412px]"
              style={{
                fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                fontSize: '14px',
                letterSpacing: '0px',
                fontWeight: 500
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((idx) => (
              <div 
                key={idx}
                className="bg-white relative overflow-hidden w-full"
                style={{
                  aspectRatio: '307/450'
                }}
              >
                <img 
                  src={`/${idx + 2}.png`} 
                  alt="Bundle Product" 
                  className="w-full h-full object-cover"
                  style={{
                    borderRadius: '32px'
                  }}
                />
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-black text-white p-4 rounded-b-[32px] flex items-center justify-between"
                  style={{
                    height: '60px'
                  }}
                >
                  <div className="flex flex-col text-left">
                    <span 
                      className="uppercase text-white"
                      style={{
                        fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                        fontSize: '13.41px',
                        lineHeight: '14.6px',
                        letterSpacing: '0px',
                        fontWeight: 500
                      }}
                    >
                      LORIUM IPSUM DOLOR
                    </span>
                    <span 
                      className="uppercase text-white"
                      style={{
                        fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                        fontSize: '13.41px',
                        lineHeight: '14.6px',
                        letterSpacing: '0px',
                        fontWeight: 500
                      }}
                    >
                      SIT DE VENUM
                    </span>
                            </div>
                  <p 
                    className="text-white font-bold text-right"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '22px',
                      lineHeight: '26px',
                      letterSpacing: '0px',
                      fontWeight: 600
                    }}
                  >
                    AED 59
                  </p>
                          </div>
                        </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Highlights Section - Figma Design */}
      <section className="bg-white text-[#212121] py-12">
        <div className="container mx-auto px-4 max-w-[1250px]">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-8 gap-6">
            <h1 
              className="uppercase text-black leading-none"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontWeight: 400,
                fontSize: '90px',
                letterSpacing: '-3.37px'
              }}
            >
              COMMUNITY HIGHLIGHTS
            </h1>
            <p 
              className="text-black text-left leading-normal lg:max-w-[412px]"
              style={{
                fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                fontSize: '14px',
                letterSpacing: '0px',
                fontWeight: 500
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
            </p>
                  </div>

          {/* Desktop mosaic grid - exact Figma: left 2x2, big center, right 2x2 */}
          <div className="hidden lg:grid gap-8 [grid-template-columns:204px_204px_384px_204px_204px] [grid-auto-rows:231px]">
            {/* Left 2x2 (each 204x231, radius 24) */}
            <div className="rounded-[24px] bg-black [grid-column:1/2] [grid-row:1/2]" />
            <div className="rounded-[24px] bg-gray-300 [grid-column:2/3] [grid-row:1/2]" />
            <div className="rounded-[24px] bg-gray-300 [grid-column:1/2] [grid-row:2/3]" />
            <div className="rounded-[24px] bg-black [grid-column:2/3] [grid-row:2/3]" />

            {/* Center big tile: 384x490, radius 24 */}
            <div className="rounded-[24px] bg-black [grid-column:3/4] [grid-row:1/3] h-[490px]" />

            {/* Right 2x2 */}
            <div className="rounded-[24px] bg-black [grid-column:4/5] [grid-row:1/2]" />
            <div className="rounded-[24px] bg-gray-300 [grid-column:5/6] [grid-row:1/2]" />
            <div className="rounded-[24px] bg-gray-300 [grid-column:4/5] [grid-row:2/3]" />
            <div className="rounded-[24px] bg-black [grid-column:5/6] [grid-row:2/3]" />
          </div>

          {/* Mobile simple grid */}
          <div className="grid md:hidden grid-cols-2 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`rounded-[24px] aspect-square ${i % 2 === 0 ? 'bg-black' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
      </section>


      {/* Customer Reviews Section - Figma Design */}
      <section className="bg-white text-[#212121] py-12">
        <div className="container mx-auto px-4 max-w-[1250px]">
          <h1 
            className="uppercase text-black mb-8"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontWeight: 400,
              fontSize: 'clamp(48px, 8vw, 90px)',
              letterSpacing: '-3.37px'
            }}
          >
            CUSTOMER REVIEWS
          </h1>
            <div className="grid grid-cols-1 lg:grid-cols-[414px_1fr] gap-8 lg:gap-12 xl:gap-16">
            {/* Left - Overall Rating */}
            <div className="w-full lg:w-[414px] lg:max-w-[414px]" style={{ marginTop: '8px' }}>
              <p 
                className="text-black mb-2"
                style={{
                  fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                  fontSize: 'clamp(24px, 3vw, 35px)',
                  letterSpacing: '-1px',
                  fontWeight: 500
                }}
              >
                Tried our Products?
              </p>
              <p 
                className="text-black mb-2"
                style={{
                  fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                  fontSize: 'clamp(20px, 2.5vw, 31px)',
                  fontWeight: 500
                }}
              >
                4 out of 5
              </p>
              <div className="flex items-center mb-4 w-full md:w-[200px]" style={{ gap: '7px', height: '40px', marginTop: '4px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-7 w-7"
                    style={{
                      fill: i < 4 ? '#c9ff4a' : 'transparent',
                      stroke: '#000000',
                      strokeWidth: 1.68
                    }}
                  />
                ))}
              </div>
              <Button
                className="bg-black text-white hover:bg-gray-800 w-full md:w-[388px] md:max-w-[388px] lg:w-[388px] xl:w-[388px]"
                style={{
                  fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                  fontSize: '16px',
                  fontWeight: 500,
                  height: '67px',
                  borderRadius: '20px',
                  paddingLeft: '25px',
                  paddingRight: '25px',
                  marginTop: '56px'
                }}
              >
                Write a Review
              </Button>
                    </div>

            {/* Right - Individual Reviews */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 xl:gap-10 w-full overflow-visible">
              {[1, 2].map((idx) => (
                <div 
                  key={idx}
                  className="p-4 w-full"
                  style={{
                    minHeight: '298px',
                    width: '100%',
                    maxWidth: '100%',
                    borderRadius: '32px',
                    backgroundColor: '#EAEAEA'
                  }}
                >
                  <h3 
                    className="text-black mb-2"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: 'clamp(24px, 3vw, 35px)',
                      letterSpacing: '-1px',
                      fontWeight: 500
                    }}
                  >
                    Awesome hoodie
                  </h3>
                    <div className="flex items-center mb-2" style={{ gap: '9px', height: '19px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4"
                          style={{
                            fill: '#c9ff4a',
                            stroke: '#000000',
                            strokeWidth: 1
                          }}
                        />
                      ))}
                    </div>
                  <p 
                    className="text-black mb-2"
                    style={{
                      fontFamily: "'Gilroy-Regular', 'Gilroy', sans-serif",
                      fontSize: 'clamp(14px, 1.5vw, 20px)',
                      fontWeight: 400,
                      letterSpacing: '0px'
                    }}
                  >
                    This hoodie is stylish and comfortable. Can be work to/from gym, at gym for lifts with lots of room, or dressed up. Super soft and comfortable. Highly recommend.
                  </p>
                  <p 
                    className="text-black"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: 'clamp(14px, 1.5vw, 20px)',
                      fontWeight: 500
                    }}
                  >
                    Jake. B
                  </p>
                  </div>
              ))}
              <div className="w-full md:col-span-2 text-right mt-4">
                <Link 
                  href="#"
                  className="uppercase text-black"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                >
                  READ MORE
                  </Link>
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

      {/* Size Guide Modal */}
      {isSizeGuideOpen && (product as any).sizeGuideImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setIsSizeGuideOpen(false)}>
          <div className="relative max-w-2xl max-h-[90vh] w-full bg-white rounded-lg p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsSizeGuideOpen(false)}
              className="absolute -top-4 -right-4 bg-white hover:bg-gray-200 text-black rounded-full p-2 transition-colors duration-200 shadow-lg z-10"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-bold text-center mb-4 text-gray-800">Size Guide</h2>
            <div className="relative rounded-lg overflow-auto max-h-[75vh]">
              <Image
                src={getFullImageUrl((product as any).sizeGuideImage)}
                alt="Product size guide"
                width={800}
                height={1200}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
        )}
    </div>
  )
}