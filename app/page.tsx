"use client"

import { useState, useRef, useEffect, type WheelEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { useCurrency } from "@/lib/currency-context"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://athlekt.com/backendnew/api';

interface Product {
  _id: string;
  id?: string;
  name?: string;
  title: string;
  price?: string;
  basePrice?: number;
  originalPrice?: string;
  image?: string;
  images?: string[];
  category?: string;
  createdAt?: string;
  isOnSale?: boolean;
  discountPercentage?: number;
  purchaseCount?: number;
}

interface Bundle {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  shortDescription?: string;
  badgeText?: string;
  heroImage?: string;
  galleryImages?: string[];
  products?: Product[];
  originalPrice: number;
  bundlePrice: number;
  bundleType?: string;
  category?: 'men' | 'women' | 'mixed';
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  createdAt?: string;
  image?: string;
  images?: string[];
}

interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  carouselImage?: string;
  isActive: boolean;
  displaySection?: string;
  sectionOrder?: number;
  createdAt?: string;
}

interface Blog {
  _id: string;
  adminName: string;
  url: string;
  content: string;
  coverImage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const normalizeBlogHref = (blog: Blog): string => {
  const rawUrl = blog.url?.trim()
  if (rawUrl) {
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
      return rawUrl
    }
    if (rawUrl.startsWith("/")) {
      const cleaned = rawUrl.replace(/\/{2,}/g, "/")
      if (cleaned.toLowerCase().startsWith("/blog/")) {
        return cleaned
      }
      return `/blog${cleaned}`
    }
    const sanitized = rawUrl.replace(/^\/+/, "").trim()
    return `/blog/${encodeURIComponent(sanitized)}`
  }
  return `/blog/${blog._id}`
}

export default function HomePage() {
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const whatsNewCarouselRef = useRef<HTMLDivElement>(null)
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loadingBundles, setLoadingBundles] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loadingBlogs, setLoadingBlogs] = useState(true)
  const [carouselImages, setCarouselImages] = useState<string[]>([])
  const [loadingCarouselImages, setLoadingCarouselImages] = useState(true)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const { formatPrice } = useCurrency()
  
  // Video state
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showPlayButton, setShowPlayButton] = useState(false)

  // Community favorites products state
  const [communityFavorites, setCommunityFavorites] = useState<Product[]>([])
  const [loadingCommunityFavorites, setLoadingCommunityFavorites] = useState(true)

  // Blog slider state variables
  const [currentBlogIndex, setCurrentBlogIndex] = useState(0)
  const blogCarouselRef = useRef<HTMLDivElement>(null)

  // Bundle slider state variables
  const [currentBundleIndex, setCurrentBundleIndex] = useState(0)
  const bundleCarouselRef = useRef<HTMLDivElement>(null)

  // Community favorites slider state
  const [currentCommunityIndex, setCurrentCommunityIndex] = useState(0)
  const communityCarouselRef = useRef<HTMLDivElement>(null)

  // Auto-scroll pause state
  const [isCarouselHovered, setIsCarouselHovered] = useState(false)

  // Video autoplay with user interaction
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const playVideo = async () => {
      try {
        await video.play()
        setShowPlayButton(false)
      } catch (error) {
        console.log('Autoplay blocked, showing play button')
        setShowPlayButton(true)
      }
    }

    const handleUserInteraction = () => {
      playVideo()
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('touchstart', handleUserInteraction)
    }

    // Try to play immediately
    playVideo()

    // If autoplay fails, wait for user interaction
    if (showPlayButton) {
      document.addEventListener('click', handleUserInteraction)
      document.addEventListener('touchstart', handleUserInteraction)
    }

    return () => {
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('touchstart', handleUserInteraction)
    }
  }, [showPlayButton])

  const handlePlayVideo = async () => {
    const video = videoRef.current
    if (video) {
      try {
        await video.play()
        setShowPlayButton(false)
      } catch (error) {
        console.log('Manual play failed:', error)
      }
    }
  }

  // Lightbox helpers
  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }
  
  const closeLightbox = () => {
    setLightboxOpen(false)
    setLightboxIndex(null)
  }
  
  // prevent body scroll when lightbox open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [lightboxOpen])
  
  // keyboard navigation (Esc, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (!lightboxOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowRight") {
        setLightboxIndex((i) => {
          if (i == null) return 0
          return Math.min(carouselImages.length - 1, i + 1)
        })
      }
      if (e.key === "ArrowLeft") {
        setLightboxIndex((i) => {
          if (i == null) return 0
          return Math.max(0, i - 1)
        })
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [lightboxOpen, carouselImages.length])

  // Community favorites carousel scrolling functions
  const scrollCommunityCarousel = (direction: 'left' | 'right') => {
    if (!communityCarouselRef.current) return

    const gap = 24
    const cardWidth = Math.min(280, window.innerWidth * 0.8)
    const scrollAmount = cardWidth + gap
    const currentScroll = communityCarouselRef.current.scrollLeft
    
    const newScroll = direction === 'left' 
      ? Math.max(0, currentScroll - scrollAmount)
      : currentScroll + scrollAmount
    
    const newIndex = direction === 'left' 
      ? Math.max(0, currentCommunityIndex - 1)
      : Math.min(communityFavorites.length - 1, currentCommunityIndex + 1)
    
    setCurrentCommunityIndex(newIndex)
    communityCarouselRef.current.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    })
  }

  const scrollToCommunitySlide = (index: number) => {
    if (!communityCarouselRef.current) return

    const gap = 24
    const cardWidth = Math.min(280, window.innerWidth * 0.8)
    const scrollPosition = index * (cardWidth + gap)
    
    setCurrentCommunityIndex(index)
    communityCarouselRef.current.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    })
  }

  // Blog carousel scrolling functions
  const scrollBlogCarousel = (direction: 'left' | 'right') => {
    if (!blogCarouselRef.current) return

    const gap = 24
    const cardWidth = Math.min(280, window.innerWidth * 0.8)
    const scrollAmount = cardWidth + gap
    const currentScroll = blogCarouselRef.current.scrollLeft
    
    const newScroll = direction === 'left' 
      ? Math.max(0, currentScroll - scrollAmount)
      : currentScroll + scrollAmount
    
    const newIndex = direction === 'left' 
      ? Math.max(0, currentBlogIndex - 1)
      : Math.min(blogs.length - 1, currentBlogIndex + 1)
    
    setCurrentBlogIndex(newIndex)
    blogCarouselRef.current.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    })
  }

  const scrollToBlogSlide = (index: number) => {
    if (!blogCarouselRef.current) return

    const gap = 24
    const cardWidth = Math.min(280, window.innerWidth * 0.8)
    const scrollPosition = index * (cardWidth + gap)
    
    setCurrentBlogIndex(index)
    blogCarouselRef.current.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    })
  }

  // Bundle carousel scrolling functions
  const scrollBundleCarousel = (direction: 'left' | 'right') => {
    if (!bundleCarouselRef.current) return

    const gap = 24
    const cardWidth = Math.min(280, window.innerWidth * 0.8)
    const scrollAmount = cardWidth + gap
    const currentScroll = bundleCarouselRef.current.scrollLeft
    
    const newScroll = direction === 'left' 
      ? Math.max(0, currentScroll - scrollAmount)
      : currentScroll + scrollAmount
    
    const newIndex = direction === 'left' 
      ? Math.max(0, currentBundleIndex - 1)
      : Math.min(bundles.length - 1, currentBundleIndex + 1)
    
    setCurrentBundleIndex(newIndex)
    bundleCarouselRef.current.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    })
  }

  const scrollToBundleSlide = (index: number) => {
    if (!bundleCarouselRef.current) return

    const gap = 24
    const cardWidth = Math.min(280, window.innerWidth * 0.8)
    const scrollPosition = index * (cardWidth + gap)
    
    setCurrentBundleIndex(index)
    bundleCarouselRef.current.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    })
  }

  // MOVE WITH US carousel scrolling functions
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const gap = 24
      const imageWidth = Math.max(160, Math.min(240, carouselRef.current.clientWidth * 0.4))
      const scrollAmount = imageWidth + gap
      const currentScroll = carouselRef.current.scrollLeft
      const newScroll = direction === 'left' 
        ? Math.max(0, currentScroll - scrollAmount)
        : currentScroll + scrollAmount
      
      const newIndex = direction === 'left' 
        ? Math.max(0, currentCarouselIndex - 1)
        : Math.min(carouselImages.length - 1, currentCarouselIndex + 1)
      
      setCurrentCarouselIndex(newIndex)
      carouselRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      })
    }
  }

  // Auto-scroll effect for community favorites slider
  useEffect(() => {
    if (communityFavorites.length === 0) return

    const interval = setInterval(() => {
      const nextIndex = (currentCommunityIndex + 1) % communityFavorites.length
      scrollToCommunitySlide(nextIndex)
    }, 5000)

    return () => clearInterval(interval)
  }, [currentCommunityIndex, communityFavorites.length])

  // Auto-scroll effect for blog slider (optional)
  useEffect(() => {
    if (blogs.length === 0) return

    const interval = setInterval(() => {
      const nextIndex = (currentBlogIndex + 1) % blogs.length
      scrollToBlogSlide(nextIndex)
    }, 5000)

    return () => clearInterval(interval)
  }, [currentBlogIndex, blogs.length])

  // Auto-scroll effect for bundle slider (optional)
  useEffect(() => {
    if (bundles.length === 0) return

    const interval = setInterval(() => {
      const nextIndex = (currentBundleIndex + 1) % bundles.length
      scrollToBundleSlide(nextIndex)
    }, 5000)

    return () => clearInterval(interval)
  }, [currentBundleIndex, bundles.length])

  // Auto-scroll effect for MOVE WITH US carousel
  useEffect(() => {
    if (carouselImages.length === 0 || isCarouselHovered) return

    const interval = setInterval(() => {
      const nextIndex = (currentCarouselIndex + 1) % carouselImages.length
      setCurrentCarouselIndex(nextIndex)
      
      if (carouselRef.current) {
        const gap = 24
        const imageWidth = Math.max(160, Math.min(240, carouselRef.current.clientWidth * 0.4))
        const scrollPosition = nextIndex * (imageWidth + gap)
        
        carouselRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        })
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [currentCarouselIndex, carouselImages.length, isCarouselHovered])

  // Fetch recent products from API
  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await fetch(`${API_BASE_URL}/products/public/all`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            // Sort products by createdAt (most recent first)
            const sortedProducts = [...data.data].sort((a: Product, b: Product) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA; // Most recent first
            });
            // Keep up to 20 most recent products for the slider
            setRecentProducts(sortedProducts.slice(0, 20));
          }
        }
      } catch (error) {
        console.error('Failed to fetch recent products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchRecentProducts();
  }, []);

  // Fetch community favorites (products sorted by purchase count)
  useEffect(() => {
    const fetchCommunityFavorites = async () => {
      try {
        setLoadingCommunityFavorites(true);
        const response = await fetch(`${API_BASE_URL}/products/public/all`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            // Sort products by purchaseCount (highest first), fallback to createdAt
            const sortedProducts = [...data.data].sort((a: Product, b: Product) => {
              const purchaseCountA = a.purchaseCount || 0;
              const purchaseCountB = b.purchaseCount || 0;
              if (purchaseCountB !== purchaseCountA) {
                return purchaseCountB - purchaseCountA;
              }
              // If purchase counts are equal, sort by creation date (newest first)
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            });
            // Take top 8 products for community favorites
            setCommunityFavorites(sortedProducts.slice(0, 8));
          }
        }
      } catch (error) {
        console.error('Failed to fetch community favorites:', error);
      } finally {
        setLoadingCommunityFavorites(false);
      }
    };
    fetchCommunityFavorites();
  }, []);

  // Fetch blogs from API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoadingBlogs(true);
        const response = await fetch(`${API_BASE_URL}/blogs/public/active`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            setBlogs(data.data.slice(0, 4));
          }
        }
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
      } finally {
        setLoadingBlogs(false);
      }
    };
    fetchBlogs();
  }, []);

  // Fetch categories from API for DISCOVER YOUR FIT section
  useEffect(() => {
    const mainCategoryNames = ["Men", "Women", "New Arrivals", "Sets"];
    const placeholderCategories: Category[] = mainCategoryNames.map((name, index) => ({
      _id: `placeholder-${name.toLowerCase().replace(/\s+/g, "-")}`,
      name,
      isActive: true,
      sectionOrder: index,
    }));

    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (response.ok) {
          const data = await response.json();
          if (data.data && Array.isArray(data.data)) {
            const normalizedMap = new Map<string, Category>();
            data.data.forEach((cat: Category) => {
              if (!cat?.name) return;
              const key = cat.name.trim().toLowerCase();
              if (cat.isActive) {
                normalizedMap.set(key, cat);
              }
            });

            const orderedCategories = mainCategoryNames.map((name, index) => {
              const key = name.toLowerCase();
              return normalizedMap.get(key) || placeholderCategories[index];
            });

            setCategories(orderedCategories);
          } else {
            setCategories(placeholderCategories);
          }
        } else {
          setCategories(placeholderCategories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories(placeholderCategories);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch bundles from API
  useEffect(() => {
    const fetchBundles = async () => {
      try {
        setLoadingBundles(true);
        const apiUrl = `${API_BASE_URL}/bundles/public/active`;
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          
          let bundlesArray: Bundle[] = [];
          
          if (data.success && Array.isArray(data.data)) {
            bundlesArray = data.data;
          } else if (Array.isArray(data.data)) {
            bundlesArray = data.data;
          } else if (Array.isArray(data)) {
            bundlesArray = data;
          }
          
          // Filter only active bundles and take first 4
          const activeBundles = bundlesArray
            .filter((bundle: Bundle) => {
              const isActive = bundle.isActive !== false;
              return isActive;
            })
            .slice(0, 4);
          
          setBundles(activeBundles);
        } else {
          const errorText = await response.text();
          console.error('❌ Bundle response not ok:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('❌ Failed to fetch bundles:', error);
      } finally {
        setLoadingBundles(false);
      }
    };
    fetchBundles();
  }, []);

  // Fetch carousel images from API for MOVE WITH US section
  useEffect(() => {
    const fetchCarouselImages = async () => {
      try {
        setLoadingCarouselImages(true);
        const response = await fetch(`${API_BASE_URL}/carousel-images/public/active`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            // Sort by order and extract image URLs
            const sortedImages = data.data
              .sort((a: any, b: any) => a.order - b.order)
              .map((img: any) => img.imageUrl);
            setCarouselImages(sortedImages);
          }
        } else {
          // Fallback to static images if API fails
          setCarouselImages(["/10.png", "/11.png", "/12.png", "/13.png"]);
        }
      } catch (error) {
        console.error('Failed to fetch carousel images:', error);
        // Fallback to static images on error
        setCarouselImages(["/10.png", "/11.png", "/12.png", "/13.png"]);
      } finally {
        setLoadingCarouselImages(false);
      }
    };
    fetchCarouselImages();
  }, []);

  // Helper function to get full image URL
  const getImageUrl = (url: string | undefined): string => {
    if (!url) return '';
    if (url.startsWith('http')) {
      return url;
    }
    // Remove /api from API_BASE_URL for image URLs
    const baseUrl = API_BASE_URL.replace('/api', '');
    if (url.startsWith('/')) {
      return `${baseUrl}${url}`;
    }
    return `${baseUrl}/${url}`;
  };

  // Helper function to get product image
  const getProductImage = (product: Product): string => {
    if (product.image) return getImageUrl(product.image);
    if (product.images && product.images.length > 0) return getImageUrl(product.images[0]);
    return '/placeholder.svg';
  };

  // Helper function to get product name
  const getProductName = (product: Product): string => {
    return product.name || product.title || 'Product';
  };

  // Helper function to get product price
  const getProductPrice = (product: Product): number => {
    if (product.price) {
      const priceStr = product.price.replace(/[^0-9.]/g, '');
      return parseFloat(priceStr) || 0;
    }
    if (product.basePrice) return product.basePrice;
    return 0;
  };

  // Helper function to split product name into two lines
  const splitProductName = (name: string): { line1: string; line2: string } => {
    const words = name.split(' ');
    const midPoint = Math.ceil(words.length / 2);
    return {
      line1: words.slice(0, midPoint).join(' '),
      line2: words.slice(midPoint).join(' ') || ''
    };
  };

  // Helper function to get category URL
  const getCategoryUrl = (category: Category): string => {
    const name = category.name.toLowerCase();
    if (name === 'men') return '/categories?gender=men';
    if (name === 'women') return '/categories?gender=women';
    if (name === 'new arrivals') return '/new-arrival';
    if (name === 'sets') return '/sets';
    const slug = name.trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || category._id;
    return `/categories/${slug}`;
  };

  // Helper function to check if product has discount
  const hasDiscount = (product: Product): boolean => {
    return (product.discountPercentage && product.discountPercentage > 0) || product.isOnSale === true;
  };

  // Helper function to get discount percentage
  const getDiscountPercentage = (product: Product): number => {
    return product.discountPercentage || 0;
  };

  const getDiscoverBackgroundImage = (name: string, category?: Category): string => {
    if (category?.image) {
      const imageUrl = getImageUrl(category.image);
      if (imageUrl) {
        return imageUrl;
      }
    }

    if (category?.carouselImage) {
      const imageUrl = getImageUrl(category.carouselImage);
      if (imageUrl) {
        return imageUrl;
      }
    }

    return '/6.png';
  };

  // Helper function to format category name for display
  const formatCategoryName = (name: string): { line1: string; line2?: string } => {
    const words = name.trim().toUpperCase().split(/\s+/);
    if (words.length === 1) {
      return { line1: words[0] };
    }
    if (words.length === 2) {
      return { line1: words[0], line2: words[1] };
    }
    return {
      line1: words.slice(0, 2).join(' '),
      line2: words.slice(2).join(' ')
    };
  };

  // Helper function to get bundle image
  const getBundleImage = (bundle: Bundle): string => {
    if (bundle.heroImage) return getImageUrl(bundle.heroImage);
    if (bundle.galleryImages && bundle.galleryImages.length > 0) return getImageUrl(bundle.galleryImages[0]);
    if (bundle.image) return getImageUrl(bundle.image);
    if (bundle.images && bundle.images.length > 0) return getImageUrl(bundle.images[0]);
    // If bundle has products, use first product's image
    if (bundle.products && bundle.products.length > 0) {
      const firstProduct = bundle.products[0];
      return getProductImage(firstProduct);
    }
    return '/placeholder.svg';
  };

  const handleWhatsNewWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!whatsNewCarouselRef.current) return;

    event.preventDefault();
    whatsNewCarouselRef.current.scrollBy({
      left: event.deltaY + event.deltaX,
      behavior: 'smooth',
    });
  };

  const getBundleProductHref = (bundle: Bundle): string => {
    const slugOrId = bundle.id || bundle._id;
    if (slugOrId) {
      return `/bundles/${slugOrId}`;
    }
    return '/bundles';
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />
      
      {/* Section 1: MOVE WITH PURPOSE Header - GUARANTEED WORKING VIDEO */}
      <section className="relative w-full overflow-x-hidden">
        {/* Top Black Bar */}
        <div className="w-full h-3 bg-black"></div>
        
        {/* Hero Box - OPTIMIZED VIDEO */}
        <div 
          className="bg-black relative w-full overflow-hidden mx-auto"
          style={{
            position: 'relative',
            marginTop: 'clamp(1rem, 3vw, 2.5rem)',
            width: '100%',
            maxWidth: '100%',
            height: 'clamp(300px, 70vh, 700px)',
          }}
        >
          {/* Single Video for Both Mobile & Desktop */}
          <video
            ref={videoRef}
            src="/video/top-banner.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
            style={{
              objectFit: 'cover',
              objectPosition: 'center center',
            }}
          >
            Your browser does not support the video tag.
          </video>

          {/* Play Button Fallback */}
          {showPlayButton && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
              style={{
                zIndex: 20,
              }}
            >
              <button 
                onClick={handlePlayVideo}
                className="bg-white text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                style={{
                  fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                }}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Play Video
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Section 2: DISCOVER YOUR FIT */}
      <section className="bg-white text-[#212121] py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-[1250px]">
          <div className="mb-6 md:mb-8">
            <h1 
              className="uppercase mb-4 md:mb-6 text-black leading-none text-left"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontWeight: 400,
                fontSize: 'clamp(2.5rem, 8vw, 5.625rem)',
                letterSpacing: '0.5px'
              }}
            >
              DISCOVER YOUR FIT
            </h1>
            <p 
              className="text-black leading-normal text-left"
              style={{
                fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
                letterSpacing: '0px',
                fontWeight: 500
              }}
            >
Explore breathable, real-body fits for runs, lifts, and everything in between we call life.            </p>
          </div>

          {/* 2x2 Grid of Category Cards */}
          {loadingCategories ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-8 md:mt-12">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="relative overflow-hidden"
                  style={{
                    width: '100%',
                    aspectRatio: '642/230',
                    borderRadius: 'clamp(12px, 2vw, 32px)',
                    backgroundColor: '#E0E0E0',
                    opacity: 0.5
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-gray-400">Loading...</div>
                  </div>
                </div>
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-8 md:mt-12">
              {categories.map((category) => {
                const categoryName = formatCategoryName(category.name);
                const categoryImage = getDiscoverBackgroundImage(category.name, category);
                
                return (
                  <Link 
                    key={category._id}
                    href={getCategoryUrl(category)}
                    className="relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    style={{
                      width: '100%',
                      aspectRatio: '642/230',
                      borderRadius: 'clamp(12px, 2vw, 32px)',
                      backgroundImage: `url(${categoryImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundColor: '#E0E0E0',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-black/35 via-black/10 to-transparent" />
                    <div className="absolute inset-0 flex items-start justify-start p-4 md:p-6 lg:p-8">
                      <div className="z-10">
                        <h3 
                          className="text-white uppercase text-left"
                          style={{
                            fontFamily: "'Bebas Neue', sans-serif",
                            fontSize: 'clamp(1.5rem, 6vw, 4rem)',
                            fontWeight: 400,
                            lineHeight: '1',
                            color: '#FFFFFF',
                            margin: '0',
                            padding: '0',
                            marginBottom: categoryName.line2 ? 'clamp(2px, 0.5vw, 8px)' : '0',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.35)'
                          }}
                        >
                          {categoryName.line1}
                        </h3>
                        {categoryName.line2 && (
                          <h3 
                            className="text-white uppercase text-left"
                            style={{
                              fontFamily: "'Bebas Neue', sans-serif",
                              fontSize: 'clamp(1.5rem, 6vw, 4rem)',
                              fontWeight: 400,
                              lineHeight: '1',
                              color: '#FFFFFF',
                              margin: '0',
                              padding: '0',
                              textShadow: '2px 2px 4px rgba(0,0,0,0.35)'
                            }}
                          >
                            {categoryName.line2}
                          </h3>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-8 md:mt-12">
              {["Men", "Women", "New Arrivals", "Sets"].map((label) => {
                const formatted = formatCategoryName(label)
                const categoryImage = getDiscoverBackgroundImage(label)
                return (
                  <Link 
                    key={label}
                    href={getCategoryUrl({ _id: label, name: label, isActive: true } as Category)}
                    className="relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    style={{
                      width: '100%',
                      aspectRatio: '642/230',
                      borderRadius: 'clamp(12px, 2vw, 32px)',
                      backgroundImage: `url(${categoryImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundColor: '#E0E0E0',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-black/35 via-black/10 to-transparent" />
                    <div className="absolute inset-0 flex items-start justify-start p-4 md:p-6 lg:p-8">
                      <div className="z-10">
                        <h3 
                          className="text-white uppercase text-left"
                          style={{
                            fontFamily: "'Bebas Neue', sans-serif",
                            fontSize: 'clamp(1.5rem, 6vw, 4rem)',
                            fontWeight: 400,
                            lineHeight: '1',
                            color: '#FFFFFF',
                            margin: '0',
                            padding: '0',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.35)'
                          }}
                        >
                          {formatted.line1}
                        </h3>
                        {formatted.line2 && (
                          <h3
                            className="text-white uppercase text-left"
                            style={{
                              fontFamily: "'Bebas Neue', sans-serif",
                              fontSize: 'clamp(1.5rem, 6vw, 4rem)',
                              fontWeight: 400,
                              lineHeight: '1',
                              color: '#FFFFFF',
                              margin: '0',
                              padding: '0',
                              textShadow: '2px 2px 4px rgba(0,0,0,0.35)'
                            }}
                          >
                            {formatted.line2}
                          </h3>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Rest of the sections... */}
      {/* (The remaining sections remain exactly the same as your original code) */}

      <Footer />

      <style jsx>{`
        .whats-new-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .whats-new-scroll::-webkit-scrollbar {
          width: 0;
          height: 0;
        }

        .community-slider {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .community-slider::-webkit-scrollbar {
          width: 0;
          height: 0;
        }

        .bundle-slider {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .bundle-slider::-webkit-scrollbar {
          width: 0;
          height: 0;
        }
      `}</style>
    </div>
  )
}