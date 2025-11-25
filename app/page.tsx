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

// CLOUDINARY URLs - GIF VERSION
const CLOUDINARY_URLS = {
  mobile: "/video/move-mob-com.gif",
  desktop: "/video/move-desk-com.gif"
};

interface HomepageSettings {
  homepageImage1?: string;
  homepageImage1Type?: 'image' | 'video';
  homepageImage2?: string;
  homepageImage3?: string;
  discoverYourFitMen?: string;
  discoverYourFitWomen?: string;
  discoverYourFitNewArrivals?: string;
  discoverYourFitSets?: string;
}

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

export default function HomePage() {
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings>({})
  const [homepageSettingsLoaded, setHomepageSettingsLoaded] = useState(false)
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

  // Lightbox helpers
  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }
  
  const closeLightbox = () => {
    setLightboxOpen(false)
    setLightboxIndex(null)
  }
  
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

  // Fetch homepage images from API (for other sections)
  useEffect(() => {
    const fetchHomepageImages = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/settings/public`);
        if (response.ok) {
          const settings = await response.json();
          setHomepageSettings({
            homepageImage1: settings.homepageImage1 || '',
            homepageImage1Type: settings.homepageImage1Type || 'image',
            homepageImage2: settings.homepageImage2 || '',
            homepageImage3: settings.homepageImage3 || '',
            discoverYourFitMen: settings.discoverYourFitMen || '',
            discoverYourFitWomen: settings.discoverYourFitWomen || '',
            discoverYourFitNewArrivals: settings.discoverYourFitNewArrivals || '',
            discoverYourFitSets: settings.discoverYourFitSets || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch homepage images:', error);
      } finally {
        setHomepageSettingsLoaded(true);
      }
    };
    fetchHomepageImages();
  }, []);

  // Fetch recent products from API
  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await fetch(`${API_BASE_URL}/products/public/all`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            const sortedProducts = [...data.data].sort((a: Product, b: Product) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            });
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
            const sortedProducts = [...data.data].sort((a: Product, b: Product) => {
              const purchaseCountA = a.purchaseCount || 0;
              const purchaseCountB = b.purchaseCount || 0;
              if (purchaseCountB !== purchaseCountA) {
                return purchaseCountB - purchaseCountA;
              }
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            });
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
          
          const activeBundles = bundlesArray
            .filter((bundle: Bundle) => {
              const isActive = bundle.isActive !== false;
              return isActive;
            })
            .slice(0, 4);
          
          setBundles(activeBundles);
        }
      } catch (error) {
        console.error('Failed to fetch bundles:', error);
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
            const sortedImages = data.data
              .sort((a: any, b: any) => a.order - b.order)
              .map((img: any) => img.imageUrl);
            setCarouselImages(sortedImages);
          }
        } else {
          setCarouselImages(["/10.png", "/11.png", "/12.png", "/13.png"]);
        }
      } catch (error) {
        console.error('Failed to fetch carousel images:', error);
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

  const discoverImageOverrides: Record<string, string> = {
    men: homepageSettings.discoverYourFitMen || '',
    women: homepageSettings.discoverYourFitWomen || '',
    "new arrivals": homepageSettings.discoverYourFitNewArrivals || '',
    sets: homepageSettings.discoverYourFitSets || '',
  };

  const getDiscoverBackgroundImage = (name: string, category?: Category): string => {
    const normalized = name.trim().toLowerCase();
    const override = discoverImageOverrides[normalized];

    if (override) {
      const overrideUrl = getImageUrl(override);
      if (overrideUrl) {
        return overrideUrl;
      }
    }

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
      
      {/* Section 1: CLOUDINARY GIF SECTION */}
      <section className="relative w-full overflow-x-hidden">
        <div className="w-full h-3 bg-black"></div>
        
        <div className="bg-white relative w-full overflow-hidden mx-auto"
          style={{
            marginTop: 'clamp(1rem, 3vw, 2.5rem)',
            width: '100%',
            maxWidth: '100%',
          }}
        >
          {/* Mobile GIF */}
          <div className="block md:hidden w-full h-full">
            <img
              src={CLOUDINARY_URLS.mobile}
              alt="Athlekt"
              className="w-full h-full object-cover"
              style={{
                objectFit: 'contain',
                objectPosition: 'center center',
              }}
            />
          </div>
          
          {/* Desktop GIF */}
          <div className="hidden md:block w-full h-full">
            <img
              src={CLOUDINARY_URLS.desktop}
              alt="Athlekt" 
              className="w-full h-full object-cover"
              style={{
                objectFit: 'cover',
                objectPosition: 'center center',
              }}
            />
          </div>
        </div>
      </section>

{/* Section 2: DISCOVER YOUR FIT */}
<section className="bg-white text-[#212121] py-8 md:py-12 lg:py-16">
  <div className="container mx-auto px-4 max-w-[1250px]">
    <div className="mb-6 md:mb-8 text-left md:text-left">
      <h1 
        className="uppercase mb-4 md:mb-6 text-black leading-none"
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
        className="text-black leading-normal max-w-4xl mx-auto md:mx-0"
        style={{
          fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
          fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
          letterSpacing: '0px',
          fontWeight: 500
        }}
      >
        Explore breathable, real-body fits for runs, lifts, and everything in between we call life.
      </p>
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
              className="relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity block"
              style={{
                width: '100%',
                aspectRatio: '642/230',
                borderRadius: 'clamp(12px, 2vw, 32px)',
                backgroundImage: `url(${categoryImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'top center', // CHANGED: center to top center
                backgroundColor: '#E0E0E0',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-black/35 via-black/10 to-transparent" />
              <div className="absolute inset-0 flex items-start justify-start p-4 md:p-6 lg:p-8">
                <div className="z-10">
                  <h3 
                    className="text-white uppercase"
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
                      className="text-white uppercase"
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
              className="relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity block"
              style={{
                width: '100%',
                aspectRatio: '642/230',
                borderRadius: 'clamp(12px, 2vw, 32px)',
                backgroundImage: `url(${categoryImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'top center', // CHANGED: center to top center
                backgroundColor: '#E0E0E0',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-black/35 via-black/10 to-transparent" />
              <div className="absolute inset-0 flex items-start justify-start p-4 md:p-6 lg:p-8">
                <div className="z-10">
                  <h3 
                    className="text-white uppercase"
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
                      className="text-white uppercase"
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

      {/* Section 3: WHAT'S NEW */}
      <section className="bg-white text-[#212121] py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-[1250px]">
          <div className="mb-6 md:mb-8 text-left md:text-left">
            <h1 
              className="uppercase mb-4 md:mb-6 text-black leading-none"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontWeight: 400,
                fontSize: 'clamp(2.5rem, 8vw, 5.625rem)',
                letterSpacing: '0.5px'
              }}
            >
              NEW ARRIVAL
            </h1>
            <p 
              className="text-black leading-normal max-w-4xl mx-auto md:mx-0"
              style={{
                fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                letterSpacing: '0px',
                fontWeight: 500
              }}
            >
              Fresh colors. Updated fits. Same all-day comfort. See what's new.
            </p>
          </div>

          {/* Product Slider - Recent Products */}
          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-8 md:mt-12">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i}
                  className="bg-gray-200 relative overflow-hidden w-full animate-pulse"
                  style={{
                    aspectRatio: '307/450',
                    borderRadius: 'clamp(26px, 2vw, 32px)',
                  }}
                />
              ))}
            </div>
          ) : recentProducts.length > 0 ? (
            <div className="relative mt-8 md:mt-12">
              <div
                ref={whatsNewCarouselRef}
                onWheel={handleWhatsNewWheel}
                className="whats-new-scroll flex gap-4 md:gap-6 overflow-x-auto scroll-smooth pb-2 px-4 md:px-0"
              >
                {recentProducts.map((product, index) => {
                  const productId = product.id || product._id || `product-${index}`;
                  const productName = getProductName(product);
                  const productImage = getProductImage(product);
                  const productPrice = getProductPrice(product);
                  const nameLines = splitProductName(productName.toUpperCase());
                  const hasProductDiscount = hasDiscount(product);
                  const discountPercentage = getDiscountPercentage(product);

                  return (
                    <Link
                      key={productId}
                      href={`/product/${productId}`}
                      className="flex-shrink-0 bg-white relative overflow-hidden hover:opacity-90 transition-opacity mx-2 md:mx-0"
                      style={{
                        width: 'min(280px, 70vw)',
                        aspectRatio: '307/450',
                      }}
                    >
                      <img 
                        src={productImage}
                        alt={productName}
                        className="w-full h-full object-cover"
                        style={{
                          borderRadius: 'clamp(26px, 2vw, 32px)',
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />

                      {/* Discount Badges */}
                      {hasProductDiscount && (
                        <>
                          {/* SALE Tag - Top Left */}
                          <div className="absolute top-3 md:top-4 left-3 md:left-4 bg-red-600 text-white px-2 md:px-3 py-1 md:py-1.5 text-sm font-bold uppercase tracking-wider rounded-full">
                            SALE
                          </div>
                          
                          {/* Discount Percentage - Top Right */}
                          <div className="absolute top-3 md:top-4 right-3 md:right-4 bg-white text-black px-2 md:px-3 py-1 md:py-1.5 text-sm font-bold rounded-full">
                            {discountPercentage}% OFF
                          </div>
                        </>
                      )}
                      
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-black text-white p-3 md:p-4 rounded-b-[32px] flex items-center justify-between"
                        style={{
                          height: 'clamp(50px, 8vw, 60px)',
                        }}
                      >
                        <div className="flex flex-col text-left">
                          <span 
                            className="uppercase text-white"
                            style={{
                              fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                              fontSize: 'clamp(0.65rem, 2.2vw, 0.75rem)',
                              lineHeight: '1.2',
                              letterSpacing: '0px',
                              fontWeight: 500,
                            }}
                          >
                            {nameLines.line1}
                          </span>
                          {nameLines.line2 && (
                            <span 
                              className="uppercase text-white"
                              style={{
                                fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                                fontSize: 'clamp(0.65rem, 2.2vw, 0.75rem)',
                                lineHeight: '1.2',
                                letterSpacing: '0px',
                                fontWeight: 500,
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
                            fontSize: 'clamp(1rem, 3vw, 1.375rem)',
                            lineHeight: '1.2',
                            letterSpacing: '0px',
                            fontWeight: 600,
                          }}
                        >
                          AED {Math.round(productPrice)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-left py-8 md:py-12 mt-8 md:mt-12">
              <p className="text-gray-500">No recent products available</p>
            </div>
          )}

          {/* View All Button */}
          {!loadingProducts && recentProducts.length > 0 && (
            <div className="flex justify-center items-center mt-6 md:mt-8">
              <Link
                href="/collection"
                className="bg-black text-white uppercase px-6 md:px-8 py-2 md:py-3 rounded-lg hover:opacity-90 transition-opacity font-medium inline-block"
                style={{
                  fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                  fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
                  letterSpacing: '0.5px',
                  fontWeight: 500,
                  minWidth: '120px',
                  textAlign: 'center',
                }}
              >
                view all
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Section 4: WHAT MAKE US MOVE */}
      <section className="bg-white text-[#212121] py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-[1250px] text-left md:text-left">
          <h1 
            className="uppercase mb-4 md:mb-6 text-black leading-none"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontWeight: 400,
              fontSize: 'clamp(2.5rem, 8vw, 5.625rem)',
              letterSpacing: '0.5px'
            }}
          >
            WHAT MAKE US MOVE
          </h1>
        </div>
        
        {/* Mobile Image */}
        <div className="block md:hidden w-full">
          <div 
            className="relative w-full"
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '3/4',
              minHeight: 'clamp(400px, 100vw, 600px)',
              backgroundColor: '#FFFFFF',
              backgroundImage: 'url(/images/move-mob.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: 1,
            }}
          />
        </div>
        
        {/* Desktop Image */}
        <div className="hidden md:block w-full">
          <img
            src={homepageSettings.homepageImage2 
              ? getImageUrl(homepageSettings.homepageImage2) 
              : '/images/move-desk.png'
            }
            alt="What make us move"
            className="w-full h-auto object-cover"
            style={{
              objectPosition: 'center'
            }}
          />
        </div>
      </section>

      {/* Section 5: COMMUNITY FAVOURITES */}
      <section className="bg-white text-[#212121] py-8 ">
        <div className="container mx-auto px-4 max-w-[1250px]">
          <div className="mb-6 md:mb-8 text-left md:text-left">
            <div className="flex items-left center gap-2 md:gap-3 mb-4 md:mb-6  md:justify-start">
              <h1 
                className="uppercase text-black leading-none"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontWeight: 400,
                  fontSize: 'clamp(2.5rem, 8vw, 5.625rem)',
                  letterSpacing: '0.5px'
                }}
              >
                best sellers
              </h1>
              <Star className="w-6 h-6 md:w-8 md:h-8 text-yellow-400 fill-yellow-400" />
            </div>
            <p 
              className="text-black leading-normal max-w-4xl mx-auto md:mx-0"
              style={{
                fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                letterSpacing: '0px',
                fontWeight: 500
              }}
            >
              Loved by all for breathability, performance, and perfect fits, designed to move with you from workouts to weekends.
            </p>
          </div>

          {/* Community Favorites Products Slider */}
          {loadingCommunityFavorites ? (
            <div className="flex gap-4 md:gap-6 mt-8 md:mt-12 overflow-x-hidden px-4 md:px-0">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-shrink-0 bg-gray-200 animate-pulse rounded-[32px]" 
                  style={{ 
                    width: 'min(280px, 70vw)', 
                    aspectRatio: '307/450' 
                  }} 
                />
              ))}
            </div>
          ) : communityFavorites.length > 0 ? (
            <div className="relative mt-8 md:mt-12">
              {/* Navigation Arrows */}
              <button
                onClick={() => scrollCommunityCarousel('left')}
                className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-12 z-10 rounded-full border border-black bg-white flex items-center justify-center transition-colors hover:bg-gray-100"
                style={{
                  width: 'clamp(32px, 8vw, 48px)',
                  height: 'clamp(32px, 8vw, 48px)',
                }}
                aria-label="Previous product"
              >
                <ChevronLeft className="text-black w-4 h-4 md:w-6 md:h-6" />
              </button>
              
              <button
                onClick={() => scrollCommunityCarousel('right')}
                className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-12 z-10 rounded-full border border-black bg-white flex items-center justify-center transition-colors hover:bg-gray-100"
                style={{
                  width: 'clamp(32px, 8vw, 48px)',
                  height: 'clamp(32px, 8vw, 48px)',
                }}
                aria-label="Next product"
              >
                <ChevronRight className="text-black w-4 h-4 md:w-6 md:h-6" />
              </button>

              {/* Community Favorites Slider Container */}
              <div
                ref={communityCarouselRef}
                className="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth pb-4 community-slider px-4 md:px-0"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {communityFavorites.map((product, index) => {
                  const productId = product.id || product._id || `product-${index}`;
                  const productName = getProductName(product);
                  const productImage = getProductImage(product);
                  const productPrice = getProductPrice(product);
                  const nameLines = splitProductName(productName.toUpperCase());
                  const hasProductDiscount = hasDiscount(product);
                  const discountPercentage = getDiscountPercentage(product);
                  const purchaseCount = product.purchaseCount || 0;

                  return (
                    <Link
                      key={productId}
                      href={`/product/${productId}`}
                      className="flex-shrink-0 bg-white relative overflow-hidden hover:opacity-90 transition-opacity mx-2 md:mx-0"
                      style={{
                        width: 'min(280px, 70vw)',
                        aspectRatio: '307/450'
                      }}
                    >
                      <img 
                        src={productImage}
                        alt={productName}
                        className="w-full h-full object-cover"
                        style={{
                          borderRadius: 'clamp(26px, 2vw, 32px)',
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />

                      {/* Purchase Count Badge */}
                      {purchaseCount > 0 && (
                        <div className="absolute top-3 md:top-4 left-3 md:left-4 bg-green-600 text-white px-2 md:px-3 py-1 md:py-1.5 text-sm font-bold uppercase tracking-wider rounded-full">
                          {purchaseCount}+ SOLD
                        </div>
                      )}

                      {/* Discount Badges */}
                      {hasProductDiscount && (
                        <div className="absolute top-3 md:top-4 right-3 md:right-4 bg-white text-black px-2 md:px-3 py-1 md:py-1.5 text-sm font-bold rounded-full">
                          {discountPercentage}% OFF
                        </div>
                      )}
                      
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-black text-white p-3 md:p-4 rounded-b-[32px] flex items-center justify-between"
                        style={{
                          height: 'clamp(50px, 8vw, 60px)',
                        }}
                      >
                        <div className="flex flex-col text-left">
                          <span 
                            className="uppercase text-white"
                            style={{
                              fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                              fontSize: 'clamp(0.65rem, 2.2vw, 0.75rem)',
                              lineHeight: '1.2',
                              letterSpacing: '0px',
                              fontWeight: 500,
                            }}
                          >
                            {nameLines.line1}
                          </span>
                          {nameLines.line2 && (
                            <span 
                              className="uppercase text-white"
                              style={{
                                fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                                fontSize: 'clamp(0.65rem, 2.2vw, 0.75rem)',
                                lineHeight: '1.2',
                                letterSpacing: '0px',
                                fontWeight: 500,
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
                            fontSize: 'clamp(1rem, 3vw, 1.375rem)',
                            lineHeight: '1.2',
                            letterSpacing: '0px',
                            fontWeight: 600,
                          }}
                        >
                          AED {Math.round(productPrice)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination Dots */}
              <div className="flex items-center justify-center gap-2 mt-4 md:mt-6">
                {communityFavorites.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToCommunitySlide(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentCommunityIndex 
                        ? 'w-2.5 h-2.5 bg-gray-800' 
                        : 'w-2 h-2 bg-gray-400'
                    }`}
                    aria-label={`Go to product ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-left py-8 md:py-12 mt-8 md:mt-12">
              <p className="text-gray-500">No community favorites available</p>
            </div>
          )}
        </div>
      </section>

      {/* Section 6: WHY ATHLEKT */}
      <section className="bg-white text-[#212121] py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-0 max-w-[1250px]">
          {/* Mobile Layout */}
          <div className="flex flex-col items-left gap-4 py-8 lg:hidden text-left px-4">
            
            <div className="relative w-full max-w-sm">
              <div className="relative z-10 overflow-hidden bg-white shadow-lg rounded-2xl">
                <img
                  src={homepageSettings.homepageImage3 ? getImageUrl(homepageSettings.homepageImage3) : "/9.png"}
                  alt="Why Athlekt"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="flex w-full max-w-sm flex-col items-left gap-4 px-0">
              <h2
                className="text-black uppercase w-full text-left"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "clamp(2rem, 8vw, 2.875rem)",
                  lineHeight: 1,
                  letterSpacing: "-1px",
                  margin: 0,
                }}
              >
                OUR STORY
              </h2>
              <div
                className="text-black w-full text-left"
                style={{
                  fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                  fontSize: "clamp(0.875rem, 3vw, 0.9375rem)",
                  fontWeight: 500,
                  lineHeight: "1.4",
                  letterSpacing: "-0.3px",
                }}
              >
                  <p style={{ marginBottom: 'clamp(18px, 2vw, 24px)' }}>
                    At Athlekt, we started with a simple question, why should activewear only fit a few?
                  </p>
                  <p style={{ marginBottom: 'clamp(18px, 2vw, 24px)' }}>
                    Most athletic brands are built around a single idea of the "ideal" body, leaving everyone else out. We wanted to change that.
                  </p>
                  <p style={{ marginBottom: '' }}>
                    Athlekt is made for real people - for dad bods, mums, and everyone finding their own rhythm. Our pieces are crafted to move, breathe, and adapt to your body, not the other way around. Designed in the Gulf, for the Gulf.
                  </p>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:block relative" style={{ paddingTop: 'clamp(100px, 10vw, 150px)', paddingBottom: '0px' }}>
            {/* Main Content */}
            <div className="relative" style={{ minHeight: '25rem', zIndex: 10 }}>
              {/* Left Side - Image */}
              <div
                className="absolute"
                style={{
                  position: 'absolute',
                  left: 'clamp(50px, 9.5vw, 111px)',
                  top: 'clamp(-55px, -8vw, -95px)',
                  height: 'clamp(200px, 25.5vw, 380px)',
                  opacity: 1,
                  overflow: 'hidden',
                  zIndex: 10
                }}
              >
                <img 
                  src={homepageSettings.homepageImage3 ? getImageUrl(homepageSettings.homepageImage3) : '/9.png'} 
                  alt="Why Athlekt" 
                  className="w-full h-full object-cover"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center top',
                    display: 'block'
                  }}
                />
              </div>

              {/* Right Side - Text Content */}
              <div
                className="absolute"
                style={{
                  position: 'absolute',
                  left: 'clamp(450px, 60vw, 750px)',
                  top: 'clamp(-25px, -2.5vw, -12px)',
                  width: 'clamp(250px, 32vw, 490px)',
                  maxWidth: '490px',
                  zIndex: 20
                }}
              >
                {/* Heading */}
                <h2 
                  className="uppercase text-black text-left"
                  style={{
                    position: 'relative',
                    width: 'clamp(200px, 20vw, 320px)',
                    height: 'auto',
                    minHeight: 'clamp(55px, 5.5vw, 85px)',
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 'clamp(40px, 5vw, 80px)',
                    fontWeight: 400,
                    lineHeight: '1',
                    letterSpacing: 'clamp(-1.5px, -0.23vw, -3.37px)',
                    color: '#000000',
                    opacity: 1,
                    borderRadius: '0px',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                    transform: 'rotate(0deg)',
                    margin: '0',
                    padding: '0',
                    marginBottom: 'clamp(5px, 0.8vw, 12px)'
                  }}
                >
                  OUR STORY
                </h2>

                {/* Body Text */}
                <div
                  className="text-black text-left"
                  style={{
                    position: 'relative',
                    width: 'clamp(250px, 32vw, 490px)',
                    height: 'auto',
                    minHeight: 'clamp(150px, 13vw, 200px)',
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: 'clamp(13px, 1.4vw, 22px)',
                    fontWeight: 500,
                    lineHeight: 'clamp(18px, 1.7vw, 28px)',
                    letterSpacing: 'clamp(-0.3px, -0.055vw, -0.79px)',
                    color: '#000000',
                    opacity: 1,
                    borderRadius: '0px',
                    textAlign: 'left',
                    transform: 'rotate(0deg)',
                    margin: '0',
                    padding: '0',
                    marginBottom: '0'
                  }}
                >
                  <p style={{ marginBottom: 'clamp(18px, 2vw, 24px)' }}>
                    At Athlekt, we started with a simple question, why should activewear only fit a few?
                  </p>
                  <p style={{ marginBottom: 'clamp(18px, 2vw, 24px)' }}>
                    Most athletic brands are built around a single idea of the "ideal" body, leaving everyone else out. We wanted to change that.
                  </p>
                  <p style={{ marginBottom: '' }}>
                    Athlekt is made for real people - for dad bods, mums, and everyone finding their own rhythm. Our pieces are crafted to move, breathe, and adapt to your body, not the other way around. Designed in the Gulf, for the Gulf.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: COMPLETE THE LOOK */}
      <section className="bg-white text-[#212121]">
        <div className="container mx-auto px-4 max-w-[1250px]">
          <div className="mb-6 md:mb-8 text-left md:text-left">
            <h1 
              className="uppercase mb-4 md:mb-6 text-black leading-none"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontWeight: 400,
                fontSize: 'clamp(2.5rem, 8vw, 5.625rem)',
                letterSpacing: '0.5px'
              }}
            >
              Bundles
            </h1>
            <p 
              className="text-black leading-normal max-w-4xl mx-auto md:mx-0"
              style={{
                fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                letterSpacing: '0px',
                fontWeight: 500
              }}
            >
              Bundle up your favorites, build your Athlekt set, and get more for less.
            </p>
          </div>

          {/* Bundle Slider */}
          {loadingBundles ? (
            <div className="flex gap-4 md:gap-6 mt-8 md:mt-12 overflow-x-hidden px-4 md:px-0">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i}
                  className="flex-shrink-0 bg-gray-200 relative overflow-hidden w-full animate-pulse rounded-[32px]"
                  style={{
                    width: 'min(280px, 70vw)',
                    aspectRatio: '307/450'
                  }}
                />
              ))}
            </div>
          ) : bundles.length > 0 ? (
            <div className="relative mt-8 md:mt-12">
              {/* Navigation Arrows */}
              <button
                onClick={() => scrollBundleCarousel('left')}
                className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-12 z-10 rounded-full border border-black bg-white flex items-center justify-center transition-colors hover:bg-gray-100"
                style={{
                  width: 'clamp(32px, 8vw, 48px)',
                  height: 'clamp(32px, 8vw, 48px)',
                }}
                aria-label="Previous bundle"
              >
                <ChevronLeft className="text-black w-4 h-4 md:w-6 md:h-6" />
              </button>
              
              <button
                onClick={() => scrollBundleCarousel('right')}
                className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-12 z-10 rounded-full border border-black bg-white flex items-center justify-center transition-colors hover:bg-gray-100"
                style={{
                  width: 'clamp(32px, 8vw, 48px)',
                  height: 'clamp(32px, 8vw, 48px)',
                }}
                aria-label="Next bundle"
              >
                <ChevronRight className="text-black w-4 h-4 md:w-6 md:h-6" />
              </button>

              {/* Bundle Slider Container */}
              <div
                ref={bundleCarouselRef}
                className="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth pb-4 bundle-slider px-4 md:px-0"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {bundles.slice(0, 4).map((bundle) => {
                  const bundleId = bundle.id || bundle._id;
                  const bundleName = bundle.name || 'Bundle';
                  const bundleImage = getBundleImage(bundle);
                  const bundlePrice = bundle.bundlePrice || 0;
                  const nameLines = splitProductName(bundleName.toUpperCase());
                  const bundleHref = getBundleProductHref(bundle);
                  
                  return (
                    <Link 
                      key={bundleId}
                      href={bundleHref}
                      className="flex-shrink-0 bg-white relative overflow-hidden w-full cursor-pointer hover:opacity-90 transition-opacity mx-2 md:mx-0"
                      style={{
                        width: 'min(280px, 70vw)',
                        aspectRatio: '307/450'
                      }}
                    >
                      {bundle.badgeText && (
                        <span
                          className="absolute top-3 md:top-4 left-3 md:left-4 bg-white/90 text-black uppercase tracking-[0.2em] text-sm font-semibold px-2 md:px-3 py-1 md:py-1 rounded-full shadow-md z-20"
                          style={{
                            fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif"
                          }}
                        >
                          {bundle.badgeText}
                        </span>
                      )}
                      <img 
                        src={bundleImage} 
                        alt={bundleName}
                        className="w-full h-full object-cover"
                        style={{
                          borderRadius: 'clamp(26px, 2vw, 32px)'
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-black/90 text-white p-3 md:p-4 rounded-b-[32px] flex items-center justify-between gap-4"
                        style={{
                          minHeight: 'clamp(60px, 8vw, 72px)',
                          zIndex: 20
                        }}
                      >
                        <div className="flex flex-col text-left">
                          <span 
                            className="uppercase text-white"
                            style={{
                              fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                              fontSize: 'clamp(0.65rem, 2.2vw, 0.75rem)',
                              lineHeight: '1.2',
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
                                fontSize: 'clamp(0.65rem, 2.2vw, 0.75rem)',
                                lineHeight: '1.2',
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
                            fontSize: 'clamp(1rem, 3vw, 1.375rem)',
                            lineHeight: '1.2',
                            letterSpacing: '0px',
                            fontWeight: 600
                          }}
                        >
                          AED {Math.round(bundlePrice)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination Dots */}
              <div className="flex items-center justify-center gap-2 mt-4 md:mt-6">
                {bundles.slice(0, 4).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToBundleSlide(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentBundleIndex 
                        ? 'w-2.5 h-2.5 bg-gray-800' 
                        : 'w-2 h-2 bg-gray-400'
                    }`}
                    aria-label={`Go to bundle ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-left py-8 md:py-12 mt-8 md:mt-12">
              <p className="text-gray-500">No bundles available</p>
            </div>
          )}
        </div>
      </section>

      {/* Section 8: MOVE WITH US */}
      <section className="bg-white text-[#212121] py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-[1250px]">
          {/* Heading and Subtitle */}
          <div className="mb-6 md:mb-8 text-left md:text-left">
            <h1 
              className="uppercase mb-4 md:mb-6 text-black leading-none"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontWeight: 400,
                fontSize: 'clamp(2.5rem, 8vw, 5.625rem)',
                letterSpacing: 'clamp(-1.5px, -0.23vw, -3.37px)'
              }}
            >
              MOVE, TAG, MOTIVATE
            </h1>
            <p 
              className="text-black leading-normal max-w-4xl mx-auto md:mx-0"
              style={{
                fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                letterSpacing: '0px',
                fontWeight: 500,
                marginTop: '2px'
              }}
            >
              Your everyday motion can motivate someone else. Post in Athlekt, tag @Athlekt, and we'll feature your move.
            </p>
          </div>

          {/* Image Carousel with Auto Scroll */}
          <div className="relative">
            {/* Navigation Arrows */}
            <button
              onClick={() => scrollCarousel('left')}
              className="absolute top-1/2 -translate-y-1/2 z-10 rounded-full border border-black bg-white flex items-center justify-center transition-colors hover:bg-gray-100"
              style={{
                left: '-12px',
                width: 'clamp(32px, 8vw, 48px)',
                height: 'clamp(32px, 8vw, 48px)',
                border: '1px solid #000000',
                backgroundColor: '#FFFFFF'
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="text-black" style={{ width: 'clamp(16px, 4vw, 24px)', height: 'clamp(16px, 4vw, 24px)' }} />
            </button>
            <button
              onClick={() => scrollCarousel('right')}
              className="absolute top-1/2 -translate-y-1/2 z-10 rounded-full border border-black bg-white flex items-center justify-center transition-colors hover:bg-gray-100"
              style={{
                right: '-12px',
                width: 'clamp(32px, 8vw, 48px)',
                height: 'clamp(32px, 8vw, 48px)',
                border: '1px solid #000000',
                backgroundColor: '#FFFFFF'
              }}
              aria-label="Next image"
            >
              <ChevronRight className="text-black" style={{ width: 'clamp(16px, 4vw, 24px)', height: 'clamp(16px, 4vw, 24px)' }} />
            </button>

            {/* Carousel Container */}
            {loadingCarouselImages ? (
              <div className="flex justify-start items-center gap-4 md:gap-6 px-4" style={{
                minHeight: 'clamp(240px, 60vw, 380px)',
                overflowX: 'auto'
              }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-200 animate-pulse rounded-[40px] flex-shrink-0" style={{
                    width: 'clamp(160px, 40vw, 240px)',
                    height: 'clamp(240px, 60vw, 380px)'
                  }} />
                ))}
              </div>
            ) : carouselImages.length > 0 ? (
              <div 
                ref={carouselRef}
                className="flex overflow-x-auto scroll-smooth gap-4 md:gap-6 px-4"
                style={{
                  scrollSnapType: 'x mandatory',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
                onMouseEnter={() => setIsCarouselHovered(true)}
                onMouseLeave={() => setIsCarouselHovered(false)}
                onTouchStart={() => setIsCarouselHovered(true)}
                onTouchEnd={() => setTimeout(() => setIsCarouselHovered(false), 3000)}
              >
                {carouselImages.map((image, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 cursor-pointer"
                    onClick={() => openLightbox(index)}
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
                        borderRadius: 'clamp(16px, 3vw, 40px)',
                        opacity: 1,
                        overflow: 'hidden'
                      }}
                    >
                      <Image
                        src={image}
                        alt={`Carousel image ${index + 1}`}
                        fill
                        className="object-cover"
                        style={{
                          borderRadius: 'clamp(16px, 3vw, 40px)',
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
              <div className="text-left py-8 md:py-12 px-4">
                <p className="text-gray-500">No images available at the moment.</p>
              </div>
            )}
          </div>

          {/* Pagination Dots */}
          {!loadingCarouselImages && carouselImages.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-4 md:mt-6">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentCarouselIndex(index)
                    if (carouselRef.current) {
                      const containerWidth = carouselRef.current.clientWidth
                      const gap = 24
                      const imageWidth = Math.max(160, Math.min(240, containerWidth * 0.4))
                      const scrollPosition = index * (imageWidth + gap)
                      carouselRef.current.scrollTo({
                        left: scrollPosition,
                        behavior: 'smooth'
                      })
                    }
                  }}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentCarouselIndex 
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

      {/* Lightbox / Modal for MOVE WITH US images */}
      {lightboxOpen && lightboxIndex != null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={(e) => {
            if (e.currentTarget === e.target) closeLightbox()
          }}
        >
          <div className="relative max-w-[92vw] max-h-[92vh] w-full">
            <button
              onClick={closeLightbox}
              aria-label="Close"
              className="absolute right-2 top-2 z-50 rounded-full bg-white/90 p-2 text-black shadow"
            >
              ✕
            </button>

            {/* Prev */}
            {lightboxIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex((i) => (i == null ? 0 : Math.max(0, i - 1)))
                }}
                aria-label="Previous"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-50 rounded-full bg-white/90 p-2 text-black shadow"
              >
                ‹
              </button>
            )}

            {/* Next */}
            {lightboxIndex < carouselImages.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex((i) => (i == null ? 0 : Math.min(carouselImages.length - 1, i + 1)))
                }}
                aria-label="Next"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-50 rounded-full bg-white/90 p-2 text-black shadow"
              >
                ›
              </button>
            )}

            <div className="w-full h-full flex items-center justify-center p-4">
              <div className="relative max-w-full max-h-full rounded" style={{ width: 'auto', height: 'auto' }}>
                <Image
                  src={carouselImages[lightboxIndex]}
                  alt={`Image ${lightboxIndex + 1}`}
                  width={1200}
                  height={900}
                  className="object-contain max-w-[90vw] max-h-[90vh]"
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

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