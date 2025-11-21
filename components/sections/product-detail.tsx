"use client"

import { useState, useEffect, useMemo, useRef } from "react"
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
import { submitForm } from "@/lib/api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://athlekt.com/backendnew';

interface BundleProduct {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  price?: string | number;
  basePrice?: number;
  image?: string;
  images?: string[];
  slug?: string;
}

interface Bundle {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  shortDescription?: string;
  badgeText?: string;
  heroImage?: string;
  galleryImages?: string[];
  description?: string;
  products?: BundleProduct[];
  originalPrice?: number | string;
  bundlePrice?: number | string;
  bundleType?: string;
  category?: 'men' | 'women' | 'mixed';
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  createdAt?: string;
  image?: string;
  images?: string[];
}

type ProductCardItem = BundleProduct;

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

const DEFAULT_COMMUNITY_HIGHLIGHTS = [
  "/10.png",
  "/11.png",
  "/12.png",
  "/13.png",
  "/10.png",
  "/11.png",
  "/12.png",
  "/13.png",
  "/10.png",
];

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
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loadingBundles, setLoadingBundles] = useState(true)
  const [recommendedProducts, setRecommendedProducts] = useState<ProductCardItem[]>([])
  const [loadingRecommended, setLoadingRecommended] = useState(true)
  const [communityHighlights, setCommunityHighlights] = useState<string[]>(DEFAULT_COMMUNITY_HIGHLIGHTS)
  const hasSizeGuideImage = Boolean(product.sizeGuideImage)
  const sizeGuideImagePath = hasSizeGuideImage ? product.sizeGuideImage! : ""

  // MOVE WITH US carousel state
  const [moveWithUsImages, setMoveWithUsImages] = useState<string[]>([])
  const [loadingMoveWithUs, setLoadingMoveWithUs] = useState(true)
  const [currentMoveWithUsIndex, setCurrentMoveWithUsIndex] = useState(0)
  const moveWithUsCarouselRef = useRef<HTMLDivElement>(null)
  const [isMoveWithUsHovered, setIsMoveWithUsHovered] = useState(false)

  // NEW: Zoom functionality state
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })

  // NEW: Gallery scroll state
  const [galleryScrollPosition, setGalleryScrollPosition] = useState(0)
  const galleryScrollRef = useRef<HTMLDivElement>(null)

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

  // NEW: Handle mouse move for zoom effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return
    
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    setZoomPosition({ x, y })
  }

  // NEW: Toggle zoom
  const toggleZoom = () => {
    setIsZoomed(!isZoomed)
  }

  // NEW: Navigate to next/previous image
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

  // NEW: Scroll gallery up/down
  const scrollGalleryUp = () => {
    if (galleryScrollRef.current) {
      const newPosition = Math.max(0, galleryScrollPosition - 1)
      setGalleryScrollPosition(newPosition)
      const thumbnail = galleryScrollRef.current.children[newPosition] as HTMLElement
      if (thumbnail) {
        thumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }

  const scrollGalleryDown = () => {
    if (galleryScrollRef.current && currentImages.length > 0) {
      const newPosition = Math.min(currentImages.length - 1, galleryScrollPosition + 1)
      setGalleryScrollPosition(newPosition)
      const thumbnail = galleryScrollRef.current.children[newPosition] as HTMLElement
      if (thumbnail) {
        thumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }

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

  // CORRECTED: Function to get base price (without discount)
  const getBasePrice = (variant: any): number => {
    if (variant?.priceOverride && variant.priceOverride > 0) {
      return variant.priceOverride;
    }
    // Use originalPrice if available, otherwise use basePrice or parse from product.price
    const originalPrice = (product as any).originalPrice || (product as any).basePrice || product.price;
    if (typeof originalPrice === 'number') {
      return originalPrice;
    }
    if (typeof originalPrice === 'string') {
      return parseFloat(originalPrice.replace(/[^0-9.]/g, ''));
    }
    return 0;
  };

  // CORRECTED: Function to get discounted price
  const getDiscountedPrice = (variant: any): number => {
    const basePrice = getBasePrice(variant);
    const discountPercentage = product.discountPercentage || 0;
    const discountAmount = (basePrice * discountPercentage) / 100;
    return basePrice - discountAmount;
  };

  // Calculate prices based on selected variant
  const basePrice = getBasePrice(selectedVariation);
  const finalPrice = getDiscountedPrice(selectedVariation);
  const discountAmount = (basePrice * (product.discountPercentage || 0)) / 100;

  const remainingBundles = bundles;

  const splitBundleName = (name: string): { line1: string; line2?: string } => {
    const words = name?.trim().split(/\s+/) ?? [];
    if (words.length === 0) {
      return { line1: '' };
    }
    const midpoint = Math.ceil(words.length / 2);
    return {
      line1: words.slice(0, midpoint).join(' '),
      line2: words.slice(midpoint).join(' ') || undefined,
    };
  };

  const getBundlePriceValue = (bundle: Bundle): number => {
    const price = bundle.bundlePrice ?? bundle.originalPrice ?? 0;
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
      const numeric = parseFloat(price.replace(/[^0-9.]/g, ''));
      return Number.isFinite(numeric) ? numeric : 0;
    }
    return 0;
  };

  const getBundleImage = (bundle: Bundle): string => {
    if (bundle.heroImage) return getFullImageUrl(bundle.heroImage);
    if (bundle.galleryImages && bundle.galleryImages.length > 0) return getFullImageUrl(bundle.galleryImages[0]);
    if (bundle.image) return getFullImageUrl(bundle.image);
    if (bundle.images && bundle.images.length > 0) return getFullImageUrl(bundle.images[0]);
    const firstProduct = bundle.products && bundle.products.length > 0 ? bundle.products[0] : undefined;
    if (firstProduct) {
      if (firstProduct.image) return getFullImageUrl(firstProduct.image);
      if (firstProduct.images && firstProduct.images.length > 0) return getFullImageUrl(firstProduct.images[0]);
    }
    return "/placeholder.svg";
  };

  const getBundleProductHref = (bundle: Bundle): string => {
    const slugOrId = bundle.id || bundle._id;
    if (slugOrId) {
      return `/bundles/${slugOrId}`;
    }
    return '/bundles';
  };

const parsePriceToNumber = (price: string | number | undefined, fallback?: number): number => {
  if (typeof price === 'number' && Number.isFinite(price)) {
    return price;
  }
  if (typeof price === 'string') {
    const numeric = parseFloat(price.replace(/[^0-9.]/g, ''));
    if (Number.isFinite(numeric)) {
      return numeric;
    }
  }
  if (typeof fallback === 'number' && Number.isFinite(fallback)) {
    return fallback;
  }
  return 0;
};

const getProductCardPrice = (item: ProductCardItem): number => {
  return parsePriceToNumber(item.price, item.basePrice);
};

const getProductCardImage = (item: ProductCardItem): string => {
  if (item.image) return getFullImageUrl(item.image);
  if (item.images && item.images.length > 0) return getFullImageUrl(item.images[0]);
  return "/placeholder.svg";
};

const getProductCardHref = (item: ProductCardItem): string => {
  const slugOrId = (item as any).slug || item.id || item._id;
  if (slugOrId) {
    return `/product/${slugOrId}`;
  }
  return '/product';
};

const getProductCardId = (item: ProductCardItem): string | undefined => {
  return (item.id || item._id) ?? undefined;
};

const getProductCardKey = (item: ProductCardItem): string => {
  const id = getProductCardId(item);
  if (id) {
    return id;
  }
  const name = (item.name || item.title || 'product').toLowerCase();
  return `${name}-${getProductCardImage(item)}`;
};

// FIXED: Corrected API endpoint for fetching products
const fetchProductList = async (queryString = ''): Promise<ProductCardItem[]> => {
  try {
    // Use the correct API endpoint
    const response = await fetch(`${API_BASE_URL}/api/products/public/all${queryString}`);
    if (!response.ok) {
      console.error('Error fetching products list:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    if (data?.success && Array.isArray(data.data)) {
      return data.data;
    }
    if (Array.isArray(data?.data)) {
      return data.data;
    }
    if (Array.isArray(data)) {
      return data;
    }

    console.warn('Unexpected products response format', data);
    return [];
  } catch (error) {
    console.error('Failed to fetch products list:', error);
    return [];
  }
};

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

  // Fetch MOVE WITH US carousel images
  useEffect(() => {
    const fetchMoveWithUsImages = async () => {
      try {
        setLoadingMoveWithUs(true);
        const response = await fetch(`${API_BASE_URL}/carousel-images/public/active`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            // Sort by order and extract image URLs
            const sortedImages = data.data
              .sort((a: any, b: any) => a.order - b.order)
              .map((img: any) => img.imageUrl);
            setMoveWithUsImages(sortedImages);
          }
        } else {
          // Fallback to static images if API fails
          setMoveWithUsImages(["/10.png", "/11.png", "/12.png", "/13.png"]);
        }
      } catch (error) {
        console.error('Failed to fetch MOVE WITH US images:', error);
        // Fallback to static images on error
        setMoveWithUsImages(["/10.png", "/11.png", "/12.png", "/13.png"]);
      } finally {
        setLoadingMoveWithUs(false);
      }
    };
    fetchMoveWithUsImages();
  }, []);

  // MOVE WITH US carousel scrolling functions
  const scrollMoveWithUsCarousel = (direction: 'left' | 'right') => {
    if (!moveWithUsCarouselRef.current) return;

    const gap = 24
    const imageWidth = Math.max(160, Math.min(240, moveWithUsCarouselRef.current.clientWidth * 0.4))
    const scrollAmount = imageWidth + gap
    const currentScroll = moveWithUsCarouselRef.current.scrollLeft
    
    const newScroll = direction === 'left' 
      ? Math.max(0, currentScroll - scrollAmount)
      : currentScroll + scrollAmount
    
    const newIndex = direction === 'left' 
      ? Math.max(0, currentMoveWithUsIndex - 1)
      : Math.min(moveWithUsImages.length - 1, currentMoveWithUsIndex + 1)
    
    setCurrentMoveWithUsIndex(newIndex)
    moveWithUsCarouselRef.current.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    })
  }

  const scrollToMoveWithUsSlide = (index: number) => {
    if (!moveWithUsCarouselRef.current) return;

    const gap = 24
    const imageWidth = Math.max(160, Math.min(240, moveWithUsCarouselRef.current.clientWidth * 0.4))
    const scrollPosition = index * (imageWidth + gap)
    
    setCurrentMoveWithUsIndex(index)
    moveWithUsCarouselRef.current.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    })
  }

  // Auto-scroll effect for MOVE WITH US carousel
  useEffect(() => {
    if (moveWithUsImages.length === 0 || isMoveWithUsHovered) return;

    const interval = setInterval(() => {
      const nextIndex = (currentMoveWithUsIndex + 1) % moveWithUsImages.length
      setCurrentMoveWithUsIndex(nextIndex)
      
      if (moveWithUsCarouselRef.current) {
        const gap = 24
        const imageWidth = Math.max(160, Math.min(240, moveWithUsCarouselRef.current.clientWidth * 0.4))
        const scrollPosition = nextIndex * (imageWidth + gap)
        
        moveWithUsCarouselRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        })
      }
    }, 4000) // Auto-scroll every 4 seconds

    return () => clearInterval(interval)
  }, [currentMoveWithUsIndex, moveWithUsImages.length, isMoveWithUsHovered])

  // FIXED: Corrected bundles API endpoint
  useEffect(() => {
    const fetchBundles = async () => {
      try {
        setLoadingBundles(true)
        const response = await fetch(`${API_BASE_URL}/bundles/public/active`)
        if (!response.ok) {
          console.error('Error fetching bundles:', response.status, response.statusText)
          return
        }

        const data = await response.json()
        let bundlesArray: Bundle[] = []

        if (data?.success && Array.isArray(data.data)) {
          bundlesArray = data.data
        } else if (Array.isArray(data?.data)) {
          bundlesArray = data.data
        } else if (Array.isArray(data)) {
          bundlesArray = data
        } else {
          console.warn('Unexpected bundles response format', data)
        }

        const activeBundles = bundlesArray.filter((bundle) => bundle.isActive !== false)
        setBundles(activeBundles)
      } catch (error) {
        console.error('Failed to fetch bundles:', error)
      } finally {
        setLoadingBundles(false)
      }
    }

    fetchBundles()
  }, [])

  // FIXED: Corrected recommended products fetching with error handling
  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        setLoadingRecommended(true)

        const currentProductId = product.id || (product as any)._id
        const seenKeys = new Set<string>()

        const primaryQuery = product.category ? `?category=${encodeURIComponent(product.category)}` : ''
        const primaryProducts = await fetchProductList(primaryQuery)
        const recommendations: ProductCardItem[] = []

        const addUniqueProducts = (items: ProductCardItem[]) => {
          items.forEach((item) => {
            const candidateId = getProductCardId(item)
            if (candidateId && candidateId === currentProductId) {
              return
            }

            const key = getProductCardKey(item)
            if (!seenKeys.has(key)) {
              seenKeys.add(key)
              recommendations.push(item)
            }
          })
        }

        addUniqueProducts(primaryProducts)

        if (recommendations.length < 4) {
          const fallbackProducts = await fetchProductList()
          addUniqueProducts(fallbackProducts)
        }

        if (recommendations.length < 4 && primaryProducts.length > 0) {
          addUniqueProducts(primaryProducts)
        }

        setRecommendedProducts(recommendations.slice(0, 4))
      } catch (error) {
        console.error('Failed to fetch recommended products:', error)
        setRecommendedProducts([])
      } finally {
        setLoadingRecommended(false)
      }
    }

    fetchRecommended()
  }, [product.category, product.id, (product as any)._id])

  // Fetch dynamic products for Shop the Look, Carousel, and Highlighted Products
  useEffect(() => {
    const fetchDynamicProducts = async () => {
      try {
        setLoading(true)
        // FIXED: Corrected API endpoint
        const response = await fetch(`${API_BASE_URL}/api/products/public`)
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        
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

  useEffect(() => {
    const fetchCommunityHighlights = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/settings/public`)
        if (response.ok) {
          const data = await response.json()
          const settingsData = data?.data && typeof data.data === "object" ? data.data : data
          const images = DEFAULT_COMMUNITY_HIGHLIGHTS.map((fallback, index) => {
            const field = `communityHighlight${index + 1}` as const
            const value = settingsData?.[field]
            return value ? getFullImageUrl(value) : fallback
          })
          setCommunityHighlights(images)
        }
      } catch (error) {
        console.error("Failed to fetch community highlights:", error)
      }
    }

    fetchCommunityHighlights()
  }, [])

  const [openSections, setOpenSections] = useState({
    purpose: false,
    features: false,
    materials: false,
    reviews: false,
  })

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
    // Use final price (with discount)
    addToCart({
      id: product.id,
      name: product.name,
      price: finalPrice, // CORRECTED: Use finalPrice instead of variantPrice
      image: currentImages.length > 0 ? getFullImageUrl(currentImages[0]) : (product.images && product.images.length > 0 ? getFullImageUrl(product.images[0]) : "/placeholder.svg"),
      color: selectedColor,
      size: selectedSize,
      quantity: quantity,
      fit: "REGULAR FIT"
    })
  }

  const handleWishlistToggle = () => {
    const wishlistItem = {
      id: product.id,
      name: product.name,
      price: finalPrice, // CORRECTED: Use finalPrice
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

  const defaultDescription = "The Athlekt Classic Hybrid Tee is designed to move with you wherever the day takes you. Lightweight, breathable, and stretchable, it delivers all-day comfort whether you're training, on the move, or unwinding after a long day. Its adaptive fit complements every body type from athletes to dads with dad bods offering a clean, confident silhouette without compromising comfort. Perfect for both lifestyle and gym, this tee keeps you cool, sharp, and ready for anything from your morning session to your evening plans. One tee. Every moment. Athlekt."
  const defaultFit = "Boxy, oversized look—size down if you prefer a closer fit."
  const defaultPurpose = [
    "Designed to support high-intensity training, everyday movement, and casual wear without sacrificing comfort.",
  ]
  const defaultMaterials = [
    "This lightweight, drapey fabric is smooth on the outside and looped on the inside with a slightly faded, vintage-looking finish",
    "65% Cotton, 35% Polyester",
  ]
  const defaultCare = ["Machine wash cold", "Tumble dry low"]

  const getParagraphs = (value?: string, fallback?: string) => {
    const text = value?.trim() ? value : fallback?.trim() ? fallback : ""
    if (!text) return []

    return text
      .split(/\r?\n+/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
  }

  const getListItems = (value?: string, fallback: string[] = []) => {
    const source = value?.trim()
      ? value
          .split(/\r?\n+/)
          .map((item) => item.replace(/^[\s\u2022•\-]+/, '').trim())
          .filter(Boolean)
      : fallback

    return source
  }

  const descriptionParagraphs = getParagraphs(product.fullDescription || product.description, defaultDescription)
  const purposeParagraphs = getListItems(product.purpose, defaultPurpose)
  const fitItems = getListItems(product.features, [defaultFit])
  const materialsItems = getListItems(product.materials, defaultMaterials)
  const careItems = getListItems(product.care, defaultCare)
  const initialRating = Number(product.rating ?? (product as any).reviewRating ?? 0)
  const initialCount = Number(product.reviewCount ?? (product as any).reviewCount ?? 0)
  const [reviewStats, setReviewStats] = useState({
    average: Number.isFinite(initialRating) ? initialRating : 0,
    count: Number.isFinite(initialCount) ? initialCount : 0,
  })

  const roundedRating = Math.round(reviewStats.average)
  const clampedRating = Math.min(5, Math.max(0, roundedRating))
  const hasReviews = reviewStats.count > 0
  const reviewSummary = hasReviews
    ? `${reviewStats.average.toFixed(1)} out of 5 based on ${reviewStats.count} review${reviewStats.count === 1 ? '' : 's'}.`
    : "No reviews yet. Be the first to share your experience with this product."

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
      <section className="py-4 md:py-6 lg:py-8 xl:py-10 bg-white text-[#212121]">
        <div className="container mx-auto px-4 max-w-[1250px]">
          <div className="flex flex-col md:flex-row gap-4 md:gap-5 lg:gap-6 xl:gap-8 items-start">
            {/* Product Images - Fully Responsive */}
            <div className="w-full lg:w-auto flex-shrink-0 md:self-start">
              {/* Desktop & Tablet - Responsive Sizes */}
              <div className="hidden md:flex md:gap-4 xl:gap-6 flex-shrink-0">
                {/* Thumbnails - Left side, vertical stack - Scrollable with arrows */}
                {currentImages && currentImages.length > 0 && (
                  <div className="flex flex-col items-center gap-2">
                    {/* Up Arrow */}
                    {currentImages.length > 3 && (
                      <button
                        onClick={scrollGalleryUp}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                        disabled={galleryScrollPosition === 0}
                      >
                        <ChevronUp className="h-4 w-4 text-gray-600" />
                      </button>
                    )}
                    
                    {/* Scrollable Thumbnails Container - Show 3 at a time */}
                    <div 
                      ref={galleryScrollRef}
                      className="flex flex-col gap-3 max-h-[380px] overflow-y-auto"
                      style={{ scrollBehavior: 'smooth' }}
                      onMouseEnter={(e) => e.currentTarget.style.scrollbarWidth = 'thin'}
                      onMouseLeave={(e) => e.currentTarget.style.scrollbarWidth = 'none'}
                    >
                      {currentImages.map((image, index) => (
                        <button
                          key={index}
                          className="relative overflow-hidden transition-colors flex-shrink-0"
                          style={{
                            width: 'clamp(70px, 9vw, 140px)',
                            height: 'clamp(79px, 9.87vw, 127px)',
                            borderRadius: '12px',
                            border: index === activeImageIndex ? '2px solid #3B82F6' : '2px solid #D1D5DB',
                            backgroundColor: '#FFFFFF',
                            opacity: 1
                          }}
                          onClick={() => {
                            setActiveImageIndex(index)
                            setGalleryScrollPosition(index)
                          }}
                        >
                          <Image
                            src={getFullImageUrl(image)}
                            alt={`${product.name} ${index + 1}`}
                            fill
                            className="object-cover"
                            style={{
                              objectFit: 'cover',
                              objectPosition: 'center top',
                              borderRadius: '12px'
                            }}
                          />
                        </button>
                      ))}
                    </div>

                    {/* Down Arrow */}
                    {currentImages.length > 3 && (
                      <button
                        onClick={scrollGalleryDown}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                        disabled={galleryScrollPosition === currentImages.length - 1}
                      >
                        <ChevronDown className="h-4 w-4 text-gray-600" />
                      </button>
                    )}
                  </div>
                )}
                
                {/* Main Image - Responsive with Zoom and Navigation Arrows */}
                <div className="relative">
                  <div 
                    className="relative overflow-hidden bg-white flex-shrink-0 cursor-zoom-in"
                    style={{
                      width: 'clamp(220px, 28vw, 380px)',
                      height: 'clamp(260px, 32vw, 420px)',
                      borderRadius: '12px',
                      opacity: 1,
                      backgroundColor: '#FFFFFF'
                    }}
                    onMouseEnter={() => setIsZoomed(true)}
                    onMouseLeave={() => setIsZoomed(false)}
                    onMouseMove={handleMouseMove}
                    onClick={toggleZoom}
                  >
                    <Image
                      src={currentImages && currentImages.length > 0 ? getFullImageUrl(currentImages[activeImageIndex]) : getFullImageUrl("/placeholder.svg")}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-200"
                      style={{
                        objectFit: 'cover',
                        objectPosition: 'center top',
                        borderRadius: '12px',
                        transform: isZoomed ? 'scale(1.5)' : 'scale(1)',
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                      }}
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 40vw, 455px"
                    />
                    
                    {/* Zoom Indicator */}
                    <div className={`absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full transition-opacity duration-200 ${isZoomed ? 'opacity-100' : 'opacity-0'}`}>
                      <ZoomIn className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Navigation Arrows for Main Image */}
                  {currentImages && currentImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 transition-all duration-200 shadow-lg"
                        style={{
                          width: '40px',
                          height: '40px'
                        }}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 transition-all duration-200 shadow-lg"
                        style={{
                          width: '40px',
                          height: '40px'
                        }}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  {currentImages && currentImages.length > 1 && (
                    <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {activeImageIndex + 1} / {currentImages.length}
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile - Responsive */}
              <div className="md:hidden flex flex-col gap-4">
                {/* Main Image - Mobile with Navigation */}
                <div className="relative w-full overflow-hidden bg-white rounded-xl" style={{ aspectRatio: '4/5', minHeight: '400px' }}>
                  <Image
                    src={currentImages && currentImages.length > 0 ? getFullImageUrl(currentImages[activeImageIndex]) : getFullImageUrl("/placeholder.svg")}
                    alt={product.name}
                    fill
                    className="object-cover"
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'center top',
                      borderRadius: '12px'
                    }}
                    priority
                    sizes="100vw"
                  />
                  
                  {/* Mobile Navigation Arrows */}
                  {currentImages && currentImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 transition-all duration-200 shadow-lg"
                        style={{
                          width: '40px',
                          height: '40px'
                        }}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 transition-all duration-200 shadow-lg"
                        style={{
                          width: '40px',
                          height: '40px'
                        }}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}

                  {/* Mobile Image Counter */}
                  {currentImages && currentImages.length > 1 && (
                    <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {activeImageIndex + 1} / {currentImages.length}
                    </div>
                  )}
                </div>

                {/* Mobile Thumbnails - Horizontal Scrollable */}
                {currentImages && currentImages.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 px-2">
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
                            objectPosition: 'center top',
                            borderRadius: '8px'
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Info - Figma Exact Spacing */}
            <div className="w-full md:w-auto md:flex-1 flex-shrink-0 flex flex-col md:justify-between md:self-stretch">
              {/* Top Section - Aligned with Image Top */}
              <div className="flex flex-col md:flex-shrink-0 w-full">
                {/* Product Name & Price Row - Figma Exact */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4 w-full">
                  <h1 
                    className="uppercase text-black mb-0 w-full md:w-auto"
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 'clamp(28px, 3.2vw, 48px)',
                      fontWeight: 400,
                      lineHeight: 'clamp(26px, 3vw, 44px)',
                      letterSpacing: '0.5px',
                      color: '#000000',
                      margin: 0,
                      padding: 0,
                      whiteSpace: 'pre-line',
                      width: '100%'
                    }}
                  >
                    {(() => {
                      const name = product.name || "MEN'S HYBRID CLASSIC";
                      if (name.startsWith("MEN'S ")) {
                        const rest = name.replace("MEN'S ", "");
                        const restWithNonBreakingSpace = rest.replace(/HYBRID CLASSIC/g, 'HYBRID\u00A0CLASSIC');
                        return "MEN'S\n" + restWithNonBreakingSpace;
                      }
                      return name;
                    })()}
                  </h1>
                  
                  {/* Price - Responsive and Right Aligned */}
                  <div className="flex flex-col items-start md:items-end md:text-right mt-0 w-full md:w-auto" style={{ paddingTop: '0px', width: '100%' }}>
                    {product.discountPercentage > 0 && basePrice > finalPrice && (
                      <span 
                        className="line-through md:w-full md:text-right"
                        style={{
                          fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                          fontSize: 'clamp(11px, 1.1vw, 16px)',
                          fontWeight: 400,
                          color: '#000000',
                          textDecorationColor: '#EF4444',
                          textDecorationThickness: '2px',
                          marginBottom: '4px',
                          lineHeight: 'clamp(28px, 3vw, 40px)',
                          height: 'clamp(28px, 3vw, 40px)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          width: '100%'
                        }}
                      >
                        {formatCurrency(basePrice)}
                      </span>
                    )}
                    <span 
                      className="text-black md:w-full md:text-right"
                      style={{
                        fontFamily: "'Gilroy-Bold', 'Gilroy', sans-serif",
                        fontSize: 'clamp(18px, 2vw, 28px)',
                        fontWeight: 700,
                        lineHeight: 'clamp(26px, 3vw, 40px)',
                        letterSpacing: '0px',
                        color: '#000000',
                        height: 'clamp(26px, 3vw, 40px)',
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
                  className="text-black mb-6 w-full"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: 'clamp(12px, 1.1vw, 14px)',
                    fontWeight: 400,
                    lineHeight: '1.4',
                    letterSpacing: '0px',
                    color: '#000000',
                    maxWidth: '100%',
                    margin: 0,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  {product.description || "Designed for a boxy, oversized look—size down if you prefer a closer fit."}
                </p>
              </div>

              {/* Middle Section - Centered between Top and Bottom */}
              <div className="flex flex-col md:justify-center md:py-4 w-full">

                {/* Size Selection - Figma Exact Alignment */}
                <div className="mb-6 w-full">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center" style={{ gap: '12px' }}>
                      <span 
                        className="uppercase text-black"
                        style={{
                          fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                          fontSize: 'clamp(12px, 1.2vw, 14px)',
                          fontWeight: 600,
                          lineHeight: '1'
                        }}
                      >
                        SIZE:
                      </span>
                      {sizeOptions.map((size) => (
                        <button 
                          key={size}
                          className="transition-colors cursor-pointer flex items-center justify-center flex-shrink-0"
                          style={{
                            fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                            fontSize: 'clamp(12px, 1.2vw, 14px)',
                            fontWeight: 600,
                            width: 'clamp(50px, 5vw, 75px)',
                            height: 'clamp(40px, 4vw, 38px)',
                            borderRadius: '30px',
                            border: '2px solid #000000',
                            backgroundColor: selectedSize === size ? '#000000' : '#FFFFFF',
                            color: selectedSize === size ? '#FFFFFF' : '#000000',
                            lineHeight: '1',
                            padding: 0
                          }}
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    {hasSizeGuideImage && (
                      <div
                        className="flex items-center gap-2 cursor-pointer"
                        style={{ flexWrap: 'nowrap' }}
                        role="button"
                        tabIndex={0}
                        onClick={() => setIsSizeGuideOpen(true)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            setIsSizeGuideOpen(true)
                          }
                        }}
                      >
                        <span 
                          className="uppercase text-black whitespace-nowrap"
                          style={{
                            fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                            fontSize: 'clamp(12px, 1.2vw, 14px)',
                            fontWeight: 600,
                            lineHeight: '1'
                          }}
                        >
                          SIZE CHART
                        </span>
                        <Package className="h-4 w-4 text-black flex-shrink-0" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Color Selection - Figma Exact Alignment */}
                <div className="mb-6 w-full">
                  <div className="flex items-center" style={{ gap: '12px' }}>
                    <span 
                      className="uppercase text-black"
                      style={{
                        fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                        fontSize: 'clamp(12px, 1.2vw, 14px)',
                        fontWeight: 600,
                        lineHeight: '1'
                      }}
                    >
                      COLOR:
                    </span>
                    {colorOptions.map((color, idx) => {
                      const defaultColors = ['#808080', '#000000', '#FFFF00', '#0066FF']
                      const colorHex = color.hex || defaultColors[idx] || '#808080'
                      
                      return (
                        <div
                          key={color.name}
                          className="transition-colors cursor-pointer flex-shrink-0"
                          style={{
                            width: 'clamp(28px, 2.8vw, 32px)',
                            height: 'clamp(28px, 2.8vw, 32px)',
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
              <div className="flex flex-col md:flex-shrink-0 w-full">

                {/* Quantity Selection & Action Buttons - Figma Exact Spacing */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch w-full">
                  {/* Quantity Selector - Figma Exact */}
                  <div 
                    className="flex items-center justify-between"
                    style={{
                      width: '100%',
                      maxWidth: 'clamp(100px, 11vw, 120px)',
                      height: 'clamp(42px, 4.5vw, 50px)',
                      borderRadius: '20px',
                      border: '2px solid #000000',
                      backgroundColor: '#FFFFFF',
                      padding: '0 clamp(16px, 1.8vw, 20px)'
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
                        fontSize: 'clamp(16px, 1.6vw, 18px)',
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
                  <div className="flex gap-3 flex-1 w-full">
                    <Button
                      size="lg"
                      className="uppercase font-semibold transition-all duration-300"
                      style={{
                        fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                        fontSize: 'clamp(12px, 1.2vw, 14px)',
                        fontWeight: 600,
                        color: '#EBFF00',
                        backgroundColor: '#000000',
                        width: 'clamp(240px, 26vw, 300px)',
                        height: 'clamp(45px, 4.8vw, 52px)',
                        borderRadius: '20px',
                        border: 'none',
                        padding: 'clamp(4px, 0.5vw, 6px) clamp(20px, 2.2vw, 24px)',
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
                        width: 'clamp(60px, 6.5vw, 70px)',
                        height: 'clamp(42px, 4.5vw, 50px)',
                        borderRadius: '20px',
                        border: '2px solid #000000',
                        backgroundColor: '#FFFFFF',
                        padding: 'clamp(8px, 0.9vw, 10px)',
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
            </div>
          </div>
        </div>
      </section>

      {/* Description, Fit, Material & Care, Reviews Section */}
      <section className="bg-white text-[#212121] py-8">
        <div className="container mx-auto px-4 max-w-[1250px]">
          {/* Top Horizontal Line */}
          <div className="border-t border-black mb-8"></div>
          
          {/* Three Column Layout */}
          <div className="grid grid-cols-1 gap-4 md:gap-4 md:[grid-template-columns:clamp(400px,45vw,460px)_clamp(280px,32vw,340px)_clamp(240px,28vw,280px)]">
            {/* Column 1: DESCRIPTION */}
            <div className="border-b border-black pb-8 md:border-b-0 md:pb-0 md:pr-8 space-y-6">
              <div>
                <h2 
                  className="uppercase text-black mb-3"
                  style={{
                    fontFamily: "'Gilroy-Bold', 'Gilroy', sans-serif",
                    fontSize: 'clamp(16px, 1.6vw, 18px)',
                    fontWeight: 700,
                    letterSpacing: '0px'
                  }}
                >
                  DESCRIPTION
                </h2>
                <div className="space-y-3">
                  {descriptionParagraphs.map((paragraph, index) => (
                    <p 
                      key={`description-${index}`}
                      className="text-black"
                      style={{
                        fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                        fontSize: 'clamp(13px, 1.3vw, 15px)',
                        fontWeight: 400,
                        lineHeight: '1.4',
                        letterSpacing: '0px',
                        margin: 0,
                        maxWidth: 'clamp(400px, 45vw, 460px)'
                      }}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {purposeParagraphs.length > 0 && (
                <div>
                  <h3
                    className="uppercase text-black mb-3"
                    style={{
                      fontFamily: "'Gilroy-Bold', 'Gilroy', sans-serif",
                      fontSize: 'clamp(16px, 1.6vw, 18px)',
                      fontWeight: 700,
                      letterSpacing: '0px'
                    }}
                  >
                    PURPOSE
                  </h3>
                  <ul className="space-y-2">
                    {purposeParagraphs.map((item, index) => (
                      <li
                        key={`purpose-${index}`}
                        className="text-black"
                        style={{
                          fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                          fontSize: 'clamp(13px, 1.3vw, 15px)',
                          fontWeight: 400,
                          lineHeight: '1.4',
                          letterSpacing: '0px',
                          margin: 0,
                          maxWidth: 'clamp(400px, 45vw, 460px)'
                        }}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Column 2: FIT and MATERIAL & CARE */}
            <div className="space-y-1 border-b border-black pb-6 md:border-b-0 md:pb-0 md:pr-6">
              {/* FIT */}
              <div>
                <h2 
                  className="uppercase text-black mb-3"
                  style={{
                    fontFamily: "'Gilroy-Bold', 'Gilroy', sans-serif",
                    fontSize: 'clamp(16px, 1.6vw, 18px)',
                    fontWeight: 700,
                    letterSpacing: '0px'
                  }}
                >
                  FEATURES & FIT
                </h2>
                <ul className="space-y-2">
                  {fitItems.map((item, index) => (
                    <li
                      key={`fit-${index}`}
                      className="text-black"
                      style={{
                        fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                        fontSize: 'clamp(13px, 1.3vw, 15px)',
                        fontWeight: 400,
                        lineHeight: '1.4',
                        letterSpacing: '0px',
                        margin: 0,
                        maxWidth: 'clamp(280px, 32vw, 340px)'
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* MATERIAL & CARE */}
              <div className="pt-6">
                <h2 
                  className="uppercase text-black mb-3"
                  style={{
                    fontFamily: "'Gilroy-Bold', 'Gilroy', sans-serif",
                    fontSize: 'clamp(16px, 1.6vw, 18px)',
                    fontWeight: 700,
                    letterSpacing: '0px'
                  }}
                >
                  MATERIAL & CARE
                </h2>
                <div className="space-y-4">
                  {materialsItems.length > 0 && (
                    <ul className="space-y-2">
                      {materialsItems.map((item, index) => (
                        <li
                          key={`material-${index}`}
                          className="text-black"
                          style={{
                            fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                            fontSize: 'clamp(13px, 1.3vw, 15px)',
                            fontWeight: 400,
                            lineHeight: '1.4',
                            letterSpacing: '0px',
                            margin: 0,
                            maxWidth: 'clamp(400px, 45vw, 460px)'
                          }}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                  {careItems.length > 0 && (
                    <div>
                      <h4
                        className="uppercase text-black mb-2"
                        style={{
                          fontFamily: "'Gilroy-Bold', 'Gilroy', sans-serif",
                          fontSize: 'clamp(13px, 1.3vw, 15px)',
                          fontWeight: 700,
                          letterSpacing: '0.5px'
                        }}
                      >
                        CARE
                      </h4>
                      <ul className="space-y-2">
                        {careItems.map((item, index) => (
                          <li
                            key={`care-${index}`}
                            className="text-black"
                            style={{
                              fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                              fontSize: 'clamp(13px, 1.3vw, 15px)',
                              fontWeight: 400,
                              lineHeight: '1.4',
                              letterSpacing: '0px',
                              margin: 0,
                              maxWidth: 'clamp(400px, 45vw, 460px)'
                            }}
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Column 3: REVIEWS */}
            <div className="space-y-3">
              <h2
                className="uppercase text-black"
                style={{
                  fontFamily: "'Gilroy-Bold', 'Gilroy', sans-serif",
                  fontSize: 'clamp(16px, 1.6vw, 18px)',
                  fontWeight: 700,
                  letterSpacing: '0px'
                }}
              >
                REVIEWS
              </h2>
              <div className="flex items-center" style={{ gap: 'clamp(6px, 0.7vw, 8px)' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3 w-3"
                    style={{
                      fill: i < clampedRating ? '#c9ff4a' : 'transparent',
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
                  fontSize: 'clamp(13px, 1.3vw, 15px)',
                  fontWeight: 400,
                  lineHeight: '1.4',
                  letterSpacing: '0px',
                  margin: 0,
                  maxWidth: 'clamp(240px, 28vw, 280px)'
                }}
              >
                {reviewSummary}
              </p>
              {hasReviews ? (
                <Link
                  href="#customer-reviews"
                  className="uppercase text-black underline underline-offset-4"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: 'clamp(12px, 1.2vw, 14px)',
                    fontWeight: 600
                  }}
                >
                  Read all reviews
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewForm(true);
                    const reviewSection = document.getElementById("customer-reviews");
                    if (reviewSection) {
                      reviewSection.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  className="uppercase text-black underline underline-offset-4"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: 'clamp(12px, 1.2vw, 14px)',
                    fontWeight: 600,
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer'
                  }}
                >
                  Write a Review
                </button>
              )}
            </div>
          </div>
          {/* Bottom Horizontal Line */}
          <div className="border-t border-black mt-4"></div>
        </div>
      </section>

      {/* Bundles Section */}
      <section className="bg-white text-[#212121] py-8">
        <div className="container mx-auto px-4 max-w-[1250px]">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6 gap-6 lg:gap-8">
            <h1 
              className="uppercase text-black leading-none flex-shrink-0"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontWeight: 400,
                fontSize: 'clamp(48px, 6vw, 70px)',
                letterSpacing: '0.5px',
                minWidth: 'fit-content'
              }}
            >
              BUNDLES
            </h1>
            <p 
              className="text-black text-left leading-normal flex-1 lg:max-w-[clamp(300px, 32vw, 380px)]"
              style={{
                fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                fontSize: 'clamp(12px, 1.2vw, 14px)',
                letterSpacing: '0px',
                fontWeight: 500,
                lineHeight: '1.5',
                maxWidth: 'clamp(300px, 32vw, 380px)',
                width: '100%'
              }}
            >
              
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {loadingBundles ? (
              [1, 2, 3, 4].map((idx) => (
                <div
                  key={`bundle-skeleton-${idx}`}
                  className="bg-gray-200 relative overflow-hidden w-full animate-pulse"
                  style={{
                    aspectRatio: '307/450',
                    borderRadius: '32px'
                  }}
                />
              ))
            ) : remainingBundles.length > 0 ? (
              remainingBundles.map((bundle) => {
                const bundleName = (bundle.name || bundle.title || 'Bundle').toUpperCase();
                const nameLines = splitBundleName(bundleName);
                const bundlePrice = getBundlePriceValue(bundle);
                const bundleImage = getBundleImage(bundle);
                const bundleHref = getBundleProductHref(bundle);

                return (
                  <Link
                    key={bundle._id || bundle.id || bundle.name}
                    href={bundleHref}
                    className="bg-white relative overflow-hidden w-full"
                    style={{
                      aspectRatio: '307/450'
                    }}
                  >
                    {bundle.badgeText && (
                      <span
                        className="absolute top-4 left-4 z-30 bg-white/90 text-black uppercase tracking-[0.2em] text-sm font-semibold px-3 py-1 rounded-full shadow-md"
                        style={{
                          fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif"
                        }}
                      >
                        {bundle.badgeText}
                      </span>
                    )}
                    <img
                      src={bundleImage}
                      alt={bundle.name || 'Bundle Product'}
                      className="w-full h-full object-cover"
                      style={{
                        borderRadius: '32px'
                      }}
                      onError={(event) => {
                        const target = event.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                    {bundle.shortDescription && (
                      <div
                        className="absolute left-0 right-0 bottom-[72px] bg-gradient-to-t from-black/80 to-transparent text-white px-6 pb-10 pt-6 z-20"
                        style={{
                          borderBottomLeftRadius: '32px',
                          borderBottomRightRadius: '32px'
                        }}
                      >
                        <p
                          className="text-sm leading-snug"
                          style={{
                            fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                            letterSpacing: '0px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {bundle.shortDescription}
                        </p>
                      </div>
                    )}
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-black text-white p-4 rounded-b-[32px] flex items-center justify-between"
                      style={{
                        height: '72px',
                        zIndex: 30
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
                          {nameLines.line1}
                        </span>
                        {nameLines.line2 && (
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
                            {nameLines.line2}
                          </span>
                        )}
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
                        {formatCurrency(bundlePrice)}
                      </p>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No additional bundles available right now.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MOVE WITH US Section */}
      <section className="bg-white text-[#212121] py-12">
        <div className="container mx-auto px-4 max-w-[1250px]">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-8 gap-6">
            <h1 
              className="uppercase text-black leading-none"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontWeight: 400,
                fontSize: '90px',
                letterSpacing: '0.5px'
              }}
            >
              MOVE WITH US
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
              Real athletes, real movement. Tag us @Athlekt to be featured.
            </p>
          </div>

          {/* MOVE WITH US Carousel */}
          <div className="relative">
            {/* Navigation Arrows */}
            <button
              onClick={() => scrollMoveWithUsCarousel('left')}
              className="absolute top-1/2 -translate-y-1/2 z-10 rounded-full border border-black bg-white flex items-center justify-center transition-colors hover:bg-gray-100"
              style={{
                left: '-12px',
                width: 'clamp(32px, 3.5vw, 48px)',
                height: 'clamp(32px, 3.5vw, 48px)',
                border: '1px solid #000000',
                backgroundColor: '#FFFFFF'
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="text-black" style={{ width: 'clamp(16px, 1.8vw, 24px)', height: 'clamp(16px, 1.8vw, 24px)' }} />
            </button>
            <button
              onClick={() => scrollMoveWithUsCarousel('right')}
              className="absolute top-1/2 -translate-y-1/2 z-10 rounded-full border border-black bg-white flex items-center justify-center transition-colors hover:bg-gray-100"
              style={{
                right: '-12px',
                width: 'clamp(32px, 3.5vw, 48px)',
                height: 'clamp(32px, 3.5vw, 48px)',
                border: '1px solid #000000',
                backgroundColor: '#FFFFFF'
              }}
              aria-label="Next image"
            >
              <ChevronRight className="text-black" style={{ width: 'clamp(16px, 1.8vw, 24px)', height: 'clamp(16px, 1.8vw, 24px)' }} />
            </button>

            {/* Carousel Container */}
            {loadingMoveWithUs ? (
              <div className="flex justify-start items-center gap-4 md:gap-6 px-4" style={{
                minHeight: 'clamp(240px, 28vw, 380px)',
                overflowX: 'auto'
              }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-200 animate-pulse rounded-[40px] flex-shrink-0" style={{
                    width: 'clamp(160px, 40vw, 240px)',
                    height: 'clamp(240px, 60vw, 380px)'
                  }} />
                ))}
              </div>
            ) : moveWithUsImages.length > 0 ? (
              <div 
                ref={moveWithUsCarouselRef}
                className="flex overflow-x-auto scroll-smooth gap-4 md:gap-6 px-4"
                style={{
                  scrollSnapType: 'x mandatory',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
                onMouseEnter={() => setIsMoveWithUsHovered(true)}
                onMouseLeave={() => setIsMoveWithUsHovered(false)}
                onTouchStart={() => setIsMoveWithUsHovered(true)}
                onTouchEnd={() => setTimeout(() => setIsMoveWithUsHovered(false), 3000)}
              >
                {moveWithUsImages.map((image, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 cursor-pointer"
                    style={{
                      scrollSnapAlign: 'start',
                      width: 'clamp(160px, 40vw, 240px)',
                      height: 'clamp(240px, 60vw, 380px)',
                      minWidth: '160px',
                      minHeight: '240px'
                    }}
                  >
                    <div
                      className="relative w-full h-full overflow-hidden cursor-pointer transition-transform duration-300 ease-out hover:translate-y-[-8px]"
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 'clamp(24px, 3vw, 40px)',
                        opacity: 1,
                        overflow: 'hidden'
                      }}
                    >
                      <Image
                        src={image}
                        alt={`Move with us image ${index + 1}`}
                        fill
                        className="object-cover"
                        style={{
                          borderRadius: 'clamp(24px, 3vw, 40px)',
                          objectFit: 'cover',
                          objectPosition: 'center top'
                        }}
                        sizes="(max-width: 640px) 160px, (max-width: 768px) 200px, (max-width: 1024px) 220px, 240px"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <p className="text-gray-500">No images available at the moment.</p>
              </div>
            )}
          </div>

          {/* Pagination Dots */}
          {!loadingMoveWithUs && moveWithUsImages.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {moveWithUsImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToMoveWithUsSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentMoveWithUsIndex 
                      ? 'w-2.5 h-2.5 bg-gray-800' 
                      : 'w-2 h-2 bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* YOU MAY ALSO LIKE Section */}
      <div className="bg-white text-[#212121] pt-0 pb-20">
        <div className="container mx-auto px-4 max-w-[1250px]">
          {/* Top Section - YOU MAY ALSO LIKE heading and Lorem ipsum */}
          <div className="flex flex-col lg:flex-row lg:items-stretch lg:justify-between mb-8 gap-6">
            {/* Left - YOU MAY ALSO LIKE Heading */}
            <div className="flex-1 flex flex-col">
              <h1 
                className="uppercase mb-6 text-black leading-none"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontWeight: 400,
                  fontSize: '90px',
                  letterSpacing: '0.5px'
                }}
              >
                YOU MAY ALSO LIKE
              </h1>
            </div>
            
            {/* Right - Lorem ipsum text */}
            <div className="flex-1 lg:max-w-[412px] flex flex-col">
              <p 
                className="text-black text-left leading-normal"
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
          </div>

          {/* Product Grid - 4 Products */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {loadingRecommended ? (
              [1, 2, 3, 4].map((idx) => (
                <div
                  key={`recommended-skeleton-${idx}`}
                  className="bg-gray-200 relative overflow-hidden w-full animate-pulse"
                  style={{
                    aspectRatio: '307/450',
                    borderRadius: '32px'
                  }}
                />
              ))
            ) : recommendedProducts.length > 0 ? (
              recommendedProducts.map((item) => {
                const productName = (item.name || item.title || 'Product').toUpperCase()
                const nameLines = splitBundleName(productName)
                const priceValue = getProductCardPrice(item)
                const productHref = getProductCardHref(item)
                const productImage = getProductCardImage(item)
                const productId = getProductCardId(item) || productName

                return (
                  <Link
                    key={productId}
                    href={productHref}
                    className="bg-white relative overflow-hidden w-full"
                    style={{
                      aspectRatio: '307/450'
                    }}
                  >
                    <img
                      src={productImage}
                      alt={item.name || item.title || 'Product'}
                      className="w-full h-full object-cover"
                      style={{
                        borderRadius: '32px'
                      }}
                      onError={(event) => {
                        const target = event.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
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
                          {nameLines.line1}
                        </span>
                        {nameLines.line2 && (
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
                            {nameLines.line2}
                          </span>
                        )}
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
                        {formatCurrency(priceValue)}
                      </p>
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No recommendations available right now.</p>
              </div>
            )}
          </div>
        </div>
      </div>

        <div id="customer-reviews">
          <ProductReviews
            product={product}
            onStatsChange={(stats) => setReviewStats(stats)}
            showReviewForm={showReviewForm}
            setShowReviewForm={setShowReviewForm}
          />
        </div>

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
      {isSizeGuideOpen && hasSizeGuideImage && (
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
                src={getFullImageUrl(sizeGuideImagePath)}
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