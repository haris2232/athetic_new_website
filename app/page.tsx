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

type HeroContent =
  | { type: 'image'; src: string; alt: string }
  | { type: 'video'; src: string; alt: string };

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
  const { formatPrice } = useCurrency()

  // Fetch homepage images from API
  useEffect(() => {
    const fetchHomepageImages = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/settings/public`);
        if (response.ok) {
          const settings = await response.json();
          console.log('🏠 Homepage settings received:', settings);
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
          console.log('🏠 Homepage settings state updated');
        } else {
          console.error('❌ Failed to fetch homepage images, status:', response.status);
        }
      } catch (error) {
        console.error('❌ Failed to fetch homepage images:', error);
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

  // Fetch blogs from API for COMMUNITY FAVOURITES section
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoadingBlogs(true);
        const response = await fetch(`${API_BASE_URL}/blogs/public/active`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            setBlogs(data.data.slice(0, 4)); // Limit to 4 blogs
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
        console.log('🔍 Fetching bundles from:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('📦 Bundle response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📦 Bundle response data:', data);
          console.log('📦 Data keys:', Object.keys(data));
          console.log('📦 data.data exists?', !!data.data);
          console.log('📦 data.data is array?', Array.isArray(data.data));
          console.log('📦 data.success?', data.success);
          
          // Handle both response formats: { data: [...] } or { success: true, data: [...] }
          let bundlesArray: Bundle[] = [];
          
          if (data.success && Array.isArray(data.data)) {
            bundlesArray = data.data;
            console.log('✅ Using format: { success: true, data: [...] }');
          } else if (Array.isArray(data.data)) {
            bundlesArray = data.data;
            console.log('✅ Using format: { data: [...] }');
          } else if (Array.isArray(data)) {
            bundlesArray = data;
            console.log('✅ Using format: [...] (direct array)');
          } else {
            console.warn('⚠️ Unknown response format. Data:', data);
          }
          
          console.log('📦 Total bundles received:', bundlesArray.length);
          if (bundlesArray.length > 0) {
            console.log('📦 First bundle:', {
              name: bundlesArray[0].name,
              isActive: bundlesArray[0].isActive,
              bundlePrice: bundlesArray[0].bundlePrice,
              products: bundlesArray[0].products?.length || 0
            });
          }
          
          // Filter only active bundles and take first 4
          const activeBundles = bundlesArray
            .filter((bundle: Bundle) => {
              const isActive = bundle.isActive !== false;
              if (!isActive) {
                console.log(`⚠️ Bundle "${bundle.name}" is not active (isActive: ${bundle.isActive})`);
              }
              return isActive;
            })
            .slice(0, 4);
          
          console.log('✅ Active bundles after filtering:', activeBundles.length);
          if (activeBundles.length > 0) {
            console.log('✅ Bundles to display:', activeBundles.map(b => b.name));
          } else {
            console.warn('⚠️ No active bundles found to display');
          }
          
          setBundles(activeBundles);
        } else {
          const errorText = await response.text();
          console.error('❌ Bundle response not ok:', response.status, response.statusText);
          console.error('❌ Error response body:', errorText);
        }
      } catch (error) {
        console.error('❌ Failed to fetch bundles:', error);
        if (error instanceof Error) {
          console.error('❌ Error details:', {
            message: error.message,
            stack: error.stack
          });
        }
      } finally {
        setLoadingBundles(false);
      }
    };
    fetchBundles();
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
    if (name === 'new arrivals') return '/categories/new-arrivals';
    if (name === 'sets') return '/categories/sets';
    const slug = name.trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || category._id;
    return `/categories/${slug}`;
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

  // Content for the hero box - can be image or video
  const heroContent: HeroContent | null = homepageSettings.homepageImage1
    ? {
        type: homepageSettings.homepageImage1Type === 'video' ? 'video' : 'image',
        src: getImageUrl(homepageSettings.homepageImage1),
    alt: 'Hero content'
  }
    : homepageSettingsLoaded
      ? {
          type: 'image',
          src: '/10.png',
          alt: 'Hero content'
        }
      : null

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

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const gap = 24 // gap-6 = 24px on md+ screens
      // Reduced box width: 240px (responsive: clamp(160px, 18vw, 240px))
      const imageWidth = Math.max(160, Math.min(240, carouselRef.current.clientWidth * 0.18)) // Responsive width
      const scrollAmount = imageWidth + gap // Scroll by one image width + gap
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

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />
      
      {/* Section 1: MOVE WITH PURPOSE Header */}
      <section className="relative w-full overflow-x-hidden">
        {/* Top Black Bar */}
        <div className="w-full h-3 bg-black"></div>
        
        {/* Text Section - Above the box */}
        <div className="w-full py-8 md:py-12 lg:py-16 bg-white relative">
          <div className="container mx-auto px-4 text-center">
            {/* MOVE WITH PURPOSE - Fully Responsive (Large screens = large size, Small screens = small size) */}
            <h1 
              className="text-black uppercase"
              style={{
                fontFamily: "'Bebas Neue', sans-serif", // AG Title Desktop alternative
                fontSize: 'clamp(28px, 5vw, 82px)', // Responsive: 28px (small) to 82px (large desktop) - better scaling
                fontWeight: 700,
                lineHeight: '1.1', // Tighter line height
                letterSpacing: '0px',
                color: '#000000',
                opacity: 1,
                borderRadius: '0px',
                width: 'clamp(280px, 85vw, 821px)', // Responsive width - better scaling
                maxWidth: '821px', // Desktop max width
                height: 'auto',
                margin: '0 auto',
                padding: '0',
                textAlign: 'center',
                position: 'relative',
                marginTop: 'clamp(16px, 2.5vw, 40px)', // Responsive top margin
                marginBottom: 'clamp(6px, 1.2vw, 15px)' // Responsive gap - dono lines ke beech
              }}
            >
              MOVE WITH PURPOSE
            </h1>
            
            {/* Performance-driven text - Fully Responsive (Large screens = large size, Small screens = small size) */}
            <p 
              className="text-black"
              style={{
                fontFamily: "'Gilroy', 'Arial', sans-serif", // Default sans-serif for body text
                fontSize: 'clamp(12px, 1.5vw, 18px)', // Responsive: 12px (small) to 18px (large desktop) - better scaling
                fontWeight: 400,
                lineHeight: '1.4', // Better readability
                letterSpacing: '0px',
                color: '#000000',
                opacity: 1,
                borderRadius: '0px',
                width: 'clamp(260px, 88vw, 936px)', // Responsive width - better scaling
                maxWidth: '936px', // Desktop max width
                height: 'auto',
                margin: '0 auto',
                padding: '0',
                textAlign: 'center',
                position: 'relative'
              }}
            >
              Performance-driven activewear designed for <em className="italic" style={{ fontStyle: 'italic' }}>every body, every day</em>
            </p>
          </div>
        </div>

        {/* Hero Box - Below the text (Exact Figma Properties) */}
        <div 
          className="bg-white relative mx-auto overflow-hidden"
          style={{
            // Position - Exact Figma Properties
            position: 'relative',
            marginTop: 'clamp(20px, 4vw, 40px)', // Spacing after text
             marginLeft: 'auto',
             marginRight: 'auto',
            
            // Dimensions - Exact Figma Properties - Adjusted to prevent overflow
            width: 'clamp(90vw, calc(100vw - 110px), 1311px)', // Desktop: 1311px, max width with margins
            maxWidth: '1311px', // Prevent overflow
            height: 'clamp(300px, 50vw, 645px)', // Desktop: 645px
            minHeight: 'clamp(300px, 50vw, 645px)',
            
            // Appearance - Exact Figma Properties
            opacity: 1,
            borderRadius: '0px',
            
            // Fill Pattern - Exact Figma Properties (will be behind image/video)
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0',
            backgroundColor: '#FFFFFF',
            
            // Rotation
            transform: 'rotate(0deg)'
          }}
        >
          {/* Image or Video Content */}
           {heroContent ? (
             heroContent.type === 'image' ? (
               <div className="relative w-full h-full">
            <Image
                   src={heroContent.src}
              alt={heroContent.alt}
              fill
              className="object-cover"
              style={{
                objectFit: 'cover',
                objectPosition: 'center center',
                width: '100%',
                height: '100%'
              }}
              priority
            />
               </div>
          ) : (
               <div className="relative w-full h-full">
            <video
                   src={heroContent.src}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{
                objectFit: 'cover',
                objectPosition: 'center center',
                width: '100%',
                height: '100%'
              }}
            >
              Your browser does not support the video tag.
            </video>
               </div>
             )
           ) : (
             <div className="w-full h-full bg-gray-100 animate-pulse" />
          )}
        </div>
      </section>

      {/* Section 2: DISCOVER YOUR FIT - Subtitle below heading */}
      <section className="bg-white text-[#212121] pt-0 pb-20 mt-12">
        <div className="container mx-auto px-4 max-w-[1250px]">
          <div className="mb-8">
            <h1 
              className="uppercase mb-6 text-black leading-none"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontWeight: 400,
                fontSize: '90px',
                letterSpacing: '-3.37px'
              }}
            >
              DISCOVER YOUR FIT
            </h1>
            <p 
              className="text-black text-left leading-normal"
              style={{
                fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                fontSize: '14px',
                letterSpacing: '0px',
                fontWeight: 500
              }}
            >
              Browse by category to find the perfect style for your day, your workout, or your recovery
            </p>
          </div>

          {/* 2x2 Grid of Category Cards - Dynamically loaded from database */}
          {loadingCategories ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="relative overflow-hidden"
              style={{
                    width: '100%',
                    aspectRatio: '642/230',
                    borderRadius: 'clamp(16px, 2vw, 32px)',
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
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
               {categories.map((category) => {
                 const categoryName = formatCategoryName(category.name);
                 const categoryImage = getDiscoverBackgroundImage(category.name, category);
                 
                 return (
            <Link 
                       key={category._id}
                       href={getCategoryUrl(category)}
              className="relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              style={{
                position: 'relative',
                left: '0',
                marginTop: '0',
                       width: '100%',
                       maxWidth: '100%',
                       aspectRatio: '642/230',
                opacity: 1,
                       borderRadius: 'clamp(16px, 2vw, 32px)',
                       backgroundImage: `url(${categoryImage})`,
                       backgroundSize: 'cover',
                       backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: '#E0E0E0',
                transform: 'rotate(0deg)',
                overflow: 'hidden'
              }}
            >
               <div className="absolute inset-0 bg-gradient-to-br from-black/35 via-black/10 to-transparent" />
              <div className="absolute inset-0 flex items-start justify-start" style={{ padding: 'clamp(16px, 2vw, 32px)' }}>
                <div className="z-10">
                  <h3 
                    className="text-white uppercase"
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                             fontSize: 'clamp(32px, 4.5vw, 65.01px)',
                      fontWeight: 400,
                             lineHeight: 'clamp(28px, 4vw, 58px)',
                      letterSpacing: '0px',
                      color: '#FFFFFF',
                      opacity: 1,
                      borderRadius: '0px',
                      textAlign: 'left',
                      position: 'relative',
                      margin: '0',
                      padding: '0',
                             marginBottom: categoryName.line2 ? 'clamp(4px, 0.5vw, 8px)' : '0',
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
                               fontSize: 'clamp(32px, 4.5vw, 65.01px)',
                      fontWeight: 400,
                               lineHeight: 'clamp(28px, 4vw, 58px)',
                      letterSpacing: '0px',
                      color: '#FFFFFF',
                      opacity: 1,
                      borderRadius: '0px',
                      textAlign: 'left',
                      position: 'relative',
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
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
               {["Men", "Women", "New Arrivals", "Sets"].map((label) => {
                 const formatted = formatCategoryName(label)
                 const categoryImage = getDiscoverBackgroundImage(label)
                 return (
            <Link 
                     key={label}
                     href={getCategoryUrl({ _id: label, name: label, isActive: true } as Category)}
              className="relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              style={{
                position: 'relative',
                       width: '100%',
                       aspectRatio: '642/230',
                       borderRadius: 'clamp(16px, 2vw, 32px)',
               backgroundImage: `url(${categoryImage})`,
                       backgroundSize: 'cover',
                       backgroundPosition: 'center',
                backgroundColor: '#E0E0E0',
                overflow: 'hidden'
              }}
            >
                     <div className="absolute inset-0 bg-gradient-to-br from-black/35 via-black/10 to-transparent" />
              <div className="absolute inset-0 flex items-start justify-start" style={{ padding: 'clamp(16px, 2vw, 32px)' }}>
                       <div className="z-10">
                <h3 
                           className="text-white uppercase"
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                             fontSize: 'clamp(32px, 4.5vw, 65.01px)',
                    fontWeight: 400,
                             lineHeight: 'clamp(28px, 4vw, 58px)',
                    letterSpacing: '0px',
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
                               fontSize: 'clamp(32px, 4.5vw, 65.01px)',
                               fontWeight: 400,
                               lineHeight: 'clamp(28px, 4vw, 58px)',
                               letterSpacing: '0px',
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

      {/* Section 3: WHAT'S NEW - Subtitle below heading */}
      <section className="bg-white text-[#212121] pt-0 pb-20 mt-12">
        <div className="container mx-auto px-4 max-w-[1250px]">
          <div className="mb-8">
            <h1 
              className="uppercase mb-6 text-black leading-none"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontWeight: 400,
                fontSize: '90px',
                letterSpacing: '-3.37px'
              }}
            >
              WHAT'S NEW
            </h1>
            <p 
              className="text-black text-left leading-normal"
              style={{
                fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                fontSize: '14px',
                letterSpacing: '0px',
                fontWeight: 500
              }}
            >
              Our latest fabric innovations and fresh drops. Limited runs, timeless performance
            </p>
          </div>

          {/* Product Slider - Recent Products */}
          {loadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {[1, 2, 3, 4].map((i) => (
            <div 
                  key={i}
                  className="bg-gray-200 relative overflow-hidden w-full animate-pulse"
              style={{
                    aspectRatio: '307/450',
                    borderRadius: '32px',
                  }}
                />
              ))}
            </div>
          ) : recentProducts.length > 0 ? (
            <div className="relative mt-12">
              <div
                ref={whatsNewCarouselRef}
                onWheel={handleWhatsNewWheel}
                className="whats-new-scroll flex gap-6 overflow-x-auto scroll-smooth pb-2"
              >
                {recentProducts.map((product, index) => {
                  const productId = product.id || product._id || `product-${index}`;
                  const productName = getProductName(product);
                  const productImage = getProductImage(product);
                  const productPrice = getProductPrice(product);
                  const nameLines = splitProductName(productName.toUpperCase());

                  return (
                    <Link
                      key={productId}
                      href={`/product/${productId}`}
                      className="flex-shrink-0 bg-white relative overflow-hidden hover:opacity-90 transition-opacity"
              style={{
                        width: 'min(280px, 80vw)',
                        aspectRatio: '307/450',
              }}
            >
              <img 
                        src={productImage}
                        alt={productName}
                className="w-full h-full object-cover"
                style={{
                          borderRadius: '32px',
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                }}
              />
              <div 
                className="absolute bottom-0 left-0 right-0 bg-black text-white p-4 rounded-b-[32px] flex items-center justify-between"
                style={{
                          height: '60px',
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
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
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
                    fontSize: '22px',
                    lineHeight: '26px',
                    letterSpacing: '0px',
                            fontWeight: 600,
                  }}
                >
                          {formatPrice(productPrice)}
                </p>
              </div>
                    </Link>
                  );
                })}
            </div>
                </div>
          ) : (
            <div className="text-center py-12 mt-12">
              <p className="text-gray-500">No recent products available</p>
              </div>
          )}

          {/* View All Button - Centered, Styled, and Positioned */}
          {!loadingProducts && recentProducts.length > 0 && (
            <div className="flex justify-center items-center mt-8">
              <Link
                href="/collection"
                className="bg-black text-white uppercase px-8 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium inline-block"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                  fontSize: '14px',
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

      {/* Section 4: FORM MEETS FUNCTION - 8.png Background Image - Same width as products section - Fully Responsive & Complete */}
      <section className="bg-white text-[#212121] pt-0 pb-20 mt-12">
        <div className="container mx-auto px-4 max-w-[1250px]">
          {/* Container with 8.png Background Image - Fully Responsive & Complete (No edges cut off) */}
          <div 
            className="relative mx-auto w-full"
            style={{
              position: 'relative',
              width: '100%', // Full width of container - responsive
              maxWidth: '100%', // Same as products section container
              
              // Height - Responsive: Width aur Height dono proportionally adjust
              // Aspect ratio: 1440/937 (desktop) = ~1.536
              aspectRatio: '1440/937', // Maintain aspect ratio - width aur height dono saath mein adjust
              minHeight: 'clamp(400px, 50vw, 937px)', // Minimum height for very small screens
              
              backgroundColor: '#FFFFFF', // White background
              backgroundImage: homepageSettings.homepageImage2 
                ? `url(${getImageUrl(homepageSettings.homepageImage2)})` 
                : 'url(/8.png)', // Use homepageImage2 or fallback to 8.png
              backgroundSize: 'contain', // Contain - poora image complete dikhe (no cut off)
              backgroundPosition: 'center', // Center the image
              backgroundRepeat: 'no-repeat', // No repeat
              opacity: 1,
              borderRadius: '0px',
              overflow: 'visible' // Visible - edges cut off nahi honge
            }}
          >
            {/* Empty container - background image - Fully responsive & complete */}
          </div>
        </div>
      </section>

      {/* Section 5: COMMUNITY FAVOURITES - Subtitle below heading */}
      <section className="bg-white text-[#212121] pt-0 pb-20 mt-12">
        <div className="container mx-auto px-4 max-w-[1250px]">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <h1 
                className="uppercase text-black leading-none"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontWeight: 400,
                  fontSize: '90px',
                  letterSpacing: '-3.37px'
                }}
              >
                COMMUNITY FAVOURITES
              </h1>
              <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
            </div>
            <p 
              className="text-black text-left leading-normal"
              style={{
                fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                fontSize: '14px',
                letterSpacing: '0px',
                fontWeight: 500
              }}
            >
              The core pieces earning the most love. Trusted, proven, essential.
            </p>
          </div>

          {/* Blog Grid - 4 Blogs */}
          {loadingBlogs ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-[32px] w-full" style={{ aspectRatio: '307/450' }} />
              ))}
                </div>
          ) : blogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {blogs.map((blog) => {
                const blogImage = blog.coverImage ? getImageUrl(blog.coverImage) : ""
                return (
                  <Link 
                    key={blog._id}
                    href={normalizeBlogHref(blog)}
                    className="bg-white relative overflow-hidden w-full block hover:opacity-90 transition-opacity"
              style={{
                aspectRatio: '307/450'
              }}
            >
                    <div className="relative w-full h-full rounded-[32px] overflow-hidden">
                      {blogImage ? (
                        <Image
                          src={blogImage}
                          alt={blog.adminName || "Blog cover"}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 25vw"
                        />
                      ) : (
                        <div 
                          className="bg-gradient-to-br from-gray-100 to-gray-200 w-full h-full flex items-center justify-center"
                        >
                          <div className="text-center p-8">
                            <div className="text-6xl mb-4">📝</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{blog.adminName}</h3>
                </div>
              </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/70" />
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-black text-white p-4 flex items-center justify-between"
                style={{
                  height: '60px'
                }}
              >
                        <div className="flex flex-col text-left flex-1 min-w-0">
                  <span 
                            className="uppercase text-white truncate"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: '13.41px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                      fontWeight: 500
                    }}
                            title={blog.adminName}
                  >
                            {blog.adminName.length > 20 ? blog.adminName.substring(0, 20) + '...' : blog.adminName}
                  </span>
                  <span 
                            className="uppercase text-white text-xs truncate"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                              fontSize: '11px',
                      lineHeight: '14.6px',
                      letterSpacing: '0px',
                              fontWeight: 400
                    }}
                            title={blog.url}
                  >
                            {blog.url.length > 25 ? blog.url.substring(0, 25) + '...' : blog.url}
                  </span>
                </div>
              </div>
            </div>
                  </Link>
                )
              })}
                </div>
          ) : (
            <div className="text-center py-12 mt-12">
              <p className="text-gray-500">No blogs available at the moment.</p>
              </div>
          )}
        </div>
      </section>

      {/* Section 6: WHY ATHLEKT - Exact Figma Design - Fully Responsive - Fixed for large screens */}
      <section className="bg-white text-[#212121] pt-0 pb-0 mt-12 relative" style={{ overflowX: 'hidden', overflowY: 'visible' }}>
        <div className="container mx-auto px-4 max-w-[1250px]">
          {/* Container - Same width as products section - Exact Figma Layout - Allow overflow on top - Aligned like COMMUNITY FAVOURITES */}
          <div 
            className="relative mx-auto"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '100%',
              minHeight: 'auto', // Auto height - no minimum height constraint
              paddingTop: 'clamp(100px, 10vw, 150px)', // Top padding - allow image overflow on top
              paddingBottom: '0px', // Bottom padding - removed to reduce gap
              marginBottom: '0px', // No bottom margin - reduce gap
              overflow: 'visible' // Visible - allow image to overflow on top
            }}
          >
            {/* Background Rectangle - Linear Gradient (Pic 1-2) - Behind everything - Exact Figma - Fully Responsive - Reduced size */}
            <div
              className="absolute"
              style={{
                position: 'absolute',
                // Responsive positioning - aligned left like COMMUNITY FAVOURITES (container padding = 16px)
                left: 'clamp(0px, 1.28vw, 16px)', // Aligned left - exact same as COMMUNITY FAVOURITES (small: 0px, large: 16px)
                top: 'clamp(50px, 7.5vw, 130px)', // Fully responsive top position - proportional scaling (small: 50px, large: 130px)
                // Responsive dimensions - Fully proportional scaling across all desktop sizes and zoom levels
                // Maintains exact proportions at all zoom levels - uses viewport units for consistent scaling
                width: 'clamp(320px, 48.25vw, 682px)', // Fully responsive width - proportional scaling (small: 320px, large: 682px)
                height: 'clamp(200px, 29.75vw, 412px)', // Fully responsive height - proportional scaling (small: 200px, large: 412px)
                
                // Background - Linear Gradient (Pic 1-2) - Exact colors
                background: 'linear-gradient(180deg, #91ADB9 0%, #3A6685 100%)', // Linear gradient from light blue-grey to dark blue
                
                // Appearance
                opacity: 1,
                borderRadius: 'clamp(40px, 5.5vw, 96px)', // Responsive corner radius - scales from small desktop (40px) to large (96px)
                
                // Border - Stroke inside (Pic 1-2)
                border: '1px solid #000000', // Black stroke, 1px, inside position
                boxSizing: 'border-box',
                
                // Rotation
                transform: 'rotate(180deg)', // Desktop: Rotation: 180deg
                
                zIndex: 1 // Behind content
              }}
            />

            {/* Main Content - Exact Figma Layout with Absolute Positioning - Allow overflow on top */}
            <div 
              className="relative"
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                minHeight: 'clamp(650px, 70vw, 900px)', // Increased height for large screens - prevents content clipping
                overflow: 'visible', // Visible - allow image to overflow on top
                zIndex: 10 // Above background
              }}
            >
              {/* Left Side - Image 9.png - Centered within background box - Increased size */}
              <div
                className="absolute"
                style={{
                  position: 'absolute',
                  // Responsive positioning - centered within background box - Fully proportional scaling
                  // Image scales proportionally with box - maintains exact proportions at all zoom levels
                  left: 'clamp(50px, 9.5vw, 111px)', // Centered within box - Fully responsive X position (small: 50px, large: 111px)
                  // Responsive top position - proportional scaling across all desktop sizes and zoom levels
                  top: 'clamp(-105px, -8vw, -95px)', // Fully responsive top position - scales proportionally at all zoom levels (small: -105px, large: -95px)
                  // Responsive dimensions - Proportional scaling - maintains exact proportions at all zoom levels
                  // Image scales proportionally as screen size or zoom level changes
                  width: 'clamp(240px, 35vw, 520px)', // Fully responsive width - proportional scaling (small: 240px, large: 520px)
                  height: 'clamp(250px, 35.5vw, 580px)', // Fully responsive height - proportional scaling (small: 250px, large: 580px)
                  opacity: 1,
                  borderRadius: 'clamp(18px, 2.8vw, 48px)', // Responsive corner radius - scales from small desktop (18px) to large (48px)
                  overflow: 'hidden', // Hidden - clip overflow at bottom to prevent going below box
                  zIndex: 10 // Above background
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
                    objectPosition: 'center top', // Position image to show top portion
                    borderRadius: 'clamp(24px, 3vw, 48px)', // Match container border radius
                    display: 'block' // Prevent image bottom spacing issue
                  }}
                />
              </div>

              {/* Right Side - Text Content - Exact Figma Position - Fully Responsive - Moved right and up */}
              <div
                className="absolute"
                style={{
                  position: 'absolute',
                  // Responsive positioning - moved more to right and up
                  // Container max-width: 1250px, padding: 16px each side = 32px total
                  // Content area: 1250px - 32px = 1218px
                  // Text width: 500px (increased for natural wrapping)
                  // Positioned more to the right side - Fully proportional scaling across all desktop sizes and zoom levels
                  // Text content scales proportionally - maintains exact proportions at all zoom levels
                  left: 'clamp(450px, 60vw, 750px)', // Fully responsive right position - proportional scaling at all zoom levels (small: 450px, large: 750px)
                  top: 'clamp(-25px, -2.5vw, -12px)', // Fully responsive top position - proportional scaling at all zoom levels (small: -25px, large: -12px)
                  // Responsive dimensions - Fully proportional scaling - maintains exact proportions at all zoom levels
                  width: 'clamp(250px, 32vw, 490px)', // Fully responsive width - proportional scaling at all zoom levels (small: 250px, large: 490px)
                  maxWidth: '490px', // Max width constraint
                  zIndex: 20 // Above image
                }}
              >
              {/* Heading - WHY ATHLEKT (Pic 4-5) - Exact Figma - Fully Responsive - One line */}
              <h2 
                className="uppercase text-black"
                style={{
                  position: 'relative',
                  // Responsive dimensions - increased width to fit one line - Better scaling
                  width: 'clamp(200px, 20vw, 320px)', // Responsive width - scales from small desktop (200px) to large (320px)
                  height: 'auto',
                  minHeight: 'clamp(55px, 5.5vw, 85px)', // Responsive height - scales from small desktop (55px) to large (85px)
                  
                  // Typography - AG heading b (Bebas Neue alternative) - Exact Figma - Responsive
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 'clamp(40px, 5vw, 80px)', // Responsive font size - scales from small desktop (40px) to large (80px)
                  fontWeight: 400,
                  lineHeight: '1',
                  letterSpacing: 'clamp(-1.5px, -0.23vw, -3.37px)', // Desktop: -3.37px, responsive (small: -1.5px, large: -3.37px)
                  
                  // Fill
                  color: '#000000',
                  
                  // Appearance
                  opacity: 1,
                  borderRadius: '0px',
                  
                  // Alignment
                  textAlign: 'left', // Left align
                  whiteSpace: 'nowrap', // Prevent text wrapping - keep on one line
                  
                  // Rotation
                  transform: 'rotate(0deg)',
                  
                  margin: '0',
                  padding: '0',
                  marginBottom: 'clamp(5px, 0.8vw, 12px)' // Further reduced gap before text - responsive (small: 5px, large: 12px)
                }}
              >
                WHY ATHLEKT
              </h2>

              {/* Body Text (Pic 6-7, content from Pic 8) - Exact Figma - Fully Responsive - Increased width for natural wrapping */}
              <div
                className="text-black"
                style={{
                  position: 'relative',
                  // Responsive dimensions - Fully proportional scaling - maintains exact proportions
                  width: 'clamp(250px, 32vw, 490px)', // Fully responsive width - proportional scaling (small: 250px, large: 490px)
                  height: 'auto',
                  minHeight: 'clamp(150px, 13vw, 200px)', // Responsive height - scales from small desktop (150px) to large (200px)
                  
                  // Typography - Gilroy-Medium (Pic 6-7) - Exact Figma - Responsive
                  fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                  fontSize: 'clamp(13px, 1.4vw, 22px)', // Responsive font size - scales from small desktop (13px) to large (22px)
                  fontWeight: 500,
                  lineHeight: 'clamp(18px, 1.7vw, 28px)', // Responsive line height - scales from small desktop (18px) to large (28px)
                  letterSpacing: 'clamp(-0.3px, -0.055vw, -0.79px)', // Desktop: -0.79px, responsive (small: -0.3px, large: -0.79px)
                  
                  // Fill
                  color: '#000000',
                  
                  // Appearance
                  opacity: 1,
                  borderRadius: '0px',
                  
                  // Alignment
                  textAlign: 'left', // Left align
                  
                  // Rotation
                  transform: 'rotate(0deg)',
                  
                  margin: '0',
                  padding: '0',
                  marginBottom: 'clamp(10px, 1.5vw, 22px)' // Further reduced gap before feature boxes - moved up more - responsive (small: 10px, large: 22px)
                }}
              >
                <p style={{ marginBottom: 'clamp(18px, 2vw, 24px)' }}>
                  We believe activewear shouldn't compromise. Comfort meets performance, design meets function.
                </p>
                <p style={{ marginBottom: '0' }}>
                  Whether it's lifting, running, stretching, or relaxing.. Whether you're an athlete or rocking a dad-bod.. we've engineered fabrics and fits to support your pace and lifestyle.
                </p>
              </div>

              {/* Feature Boxes - 3 Boxes (Pic 9) - Exact Figma - Ek line mein, text ke left edge se align - Increased width */}
              <div 
                className="flex flex-row gap-4"
                style={{
                  marginTop: '0', // Gap already in text marginBottom
                  width: 'clamp(250px, 32vw, 490px)', // Fully responsive width - proportional scaling (small: 250px, large: 490px)
                  maxWidth: '490px',
                  justifyContent: 'flex-start', // Left align - text ke left edge se start
                  alignItems: 'flex-start' // Top align
                }}
              >
                {/* Box 1 - Engineered Fabrics - Exact Figma - Ek line mein - Fully Responsive - Reduced size */}
                <div
                  className="border-2 border-black rounded-lg text-center flex flex-col items-center justify-center"
                  style={{
                    border: '1px solid #000000', // Black border
                    borderRadius: 'clamp(10px, 1.3vw, 20px)', // Responsive corner radius - scales from small desktop (10px) to large (20px)
                    backgroundColor: '#FFFFFF',
                    padding: 'clamp(12px, 1.2vw, 18px)', // Reduced padding - Responsive (small: 12px, large: 18px)
                    width: 'clamp(85px, 9.5vw, 145px)', // Responsive width - scales from small desktop (85px) to large (145px)
                    height: 'clamp(85px, 8.5vw, 125px)', // Responsive height - scales from small desktop (85px) to large (125px)
                    flexShrink: '0', // Don't shrink
                    flexGrow: '0' // Don't grow - fixed width
                  }}
                >
                  <div 
                    className="mx-auto mb-3 flex items-center justify-center"
                    style={{
                      width: 'clamp(38px, 3.5vw, 50px)', // Reduced icon size - Responsive (small: 38px, large: 50px)
                      height: 'clamp(38px, 3.5vw, 50px)'
                    }}
                  >
                    {/* Icon - Woven pattern / X shapes */}
                    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4L8 8L12 12L16 8L12 4Z" stroke="#000000" strokeWidth="2" fill="none"/>
                      <path d="M4 12L8 8L12 12L8 16L4 12Z" stroke="#000000" strokeWidth="2" fill="none"/>
                      <path d="M12 12L16 8L20 12L16 16L12 12Z" stroke="#000000" strokeWidth="2" fill="none"/>
                      <path d="M12 20L8 16L12 12L16 16L12 20Z" stroke="#000000" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  <p 
                    className="text-black font-medium text-center"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: 'clamp(11px, 1.1vw, 16px)', // Reduced font size - Responsive (small: 11px, large: 16px)
                      fontWeight: 500,
                      color: '#000000',
                      margin: '0',
                      lineHeight: '1.4'
                    }}
                  >
                    Engineered<br />Fabrics
                  </p>
                </div>

                {/* Box 2 - Precision Fit - Exact Figma - Ek line mein - Fully Responsive - Reduced size */}
                <div
                  className="border-2 border-black rounded-lg text-center flex flex-col items-center justify-center"
                  style={{
                    border: '1px solid #000000', // Black border
                    borderRadius: 'clamp(10px, 1.3vw, 20px)', // Responsive corner radius - scales from small desktop (10px) to large (20px)
                    backgroundColor: '#FFFFFF',
                    padding: 'clamp(12px, 1.2vw, 18px)', // Reduced padding - Responsive (small: 12px, large: 18px)
                    width: 'clamp(85px, 9.5vw, 145px)', // Responsive width - scales from small desktop (85px) to large (145px)
                    height: 'clamp(85px, 8.5vw, 125px)', // Responsive height - scales from small desktop (85px) to large (125px)
                    flexShrink: '0', // Don't shrink
                    flexGrow: '0' // Don't grow - fixed width
                  }}
                >
                  <div 
                    className="mx-auto mb-3 flex items-center justify-center"
                    style={{
                      width: 'clamp(38px, 3.5vw, 50px)', // Reduced icon size - Responsive (small: 38px, large: 50px)
                      height: 'clamp(38px, 3.5vw, 50px)'
                    }}
                  >
                    {/* Icon - Double-headed arrow */}
                    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 12H21M8 7L3 12L8 17M16 7L21 12L16 17" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="12" y1="8" x2="12" y2="16" stroke="#000000" strokeWidth="2"/>
                    </svg>
                  </div>
                  <p 
                    className="text-black font-medium text-center"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: 'clamp(11px, 1.1vw, 16px)', // Reduced font size - Responsive (small: 11px, large: 16px)
                      fontWeight: 500,
                      color: '#000000',
                      margin: '0',
                      lineHeight: '1.4'
                    }}
                  >
                    Precision<br />Fit
                  </p>
                </div>

                {/* Box 3 - Sustainable Practices - Exact Figma - Ek line mein - Fully Responsive - Reduced size */}
                <div
                  className="border-2 border-black rounded-lg text-center flex flex-col items-center justify-center"
                  style={{
                    border: '1px solid #000000', // Black border
                    borderRadius: 'clamp(10px, 1.3vw, 20px)', // Responsive corner radius - scales from small desktop (10px) to large (20px)
                    backgroundColor: '#FFFFFF',
                    padding: 'clamp(12px, 1.2vw, 18px)', // Reduced padding - Responsive (small: 12px, large: 18px)
                    width: 'clamp(85px, 9.5vw, 145px)', // Responsive width - scales from small desktop (85px) to large (145px)
                    height: 'clamp(85px, 8.5vw, 125px)', // Responsive height - scales from small desktop (85px) to large (125px)
                    flexShrink: '0', // Don't shrink
                    flexGrow: '0' // Don't grow - fixed width
                  }}
                >
                  <div 
                    className="mx-auto mb-3 flex items-center justify-center"
                    style={{
                      width: 'clamp(38px, 3.5vw, 50px)', // Reduced icon size - Responsive (small: 38px, large: 50px)
                      height: 'clamp(38px, 3.5vw, 50px)'
                    }}
                  >
                    {/* Icon - Leaf */}
                    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8 6 4 10 4 16C4 18 5 20 7 20C9 20 10 18 10 16C10 14 9 12 8 11C8 11 9 10 11 10C13 10 14 11 14 11C13 12 12 14 12 16C12 18 13 20 15 20C17 20 18 18 18 16C18 10 14 6 10 2H12Z" stroke="#000000" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  <p 
                    className="text-black font-medium text-center"
                    style={{
                      fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                      fontSize: 'clamp(11px, 1.1vw, 16px)', // Reduced font size - Responsive (small: 11px, large: 16px)
                      fontWeight: 500,
                      color: '#000000',
                      margin: '0',
                      lineHeight: '1.4'
                    }}
                  >
                    Sustainable<br />Practices
                  </p>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: COMPLETE THE LOOK - Subtitle below heading */}
      <section className="bg-white text-[#212121] pt-0 pb-20" style={{ marginTop: '2px' }}>
        <div className="container mx-auto px-4 max-w-[1250px]">
          <div className="mb-8">
            <h1 
              className="uppercase mb-6 text-black leading-none"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontWeight: 400,
                fontSize: '90px',
                letterSpacing: '-3.37px'
              }}
            >
              COMPLETE THE LOOK
            </h1>
            <p 
              className="text-black text-left leading-normal"
              style={{
                fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                fontSize: '14px',
                letterSpacing: '0px',
                fontWeight: 500
              }}
            >
              Match it. Train it. Wear it. Our curated sets make it simple.
            </p>
          </div>

          {/* Bundle Grid - 4 Bundles */}
          {loadingBundles ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {[1, 2, 3, 4].map((i) => (
            <div 
                  key={i}
                  className="bg-gray-200 relative overflow-hidden w-full animate-pulse"
              style={{
                    aspectRatio: '307/450',
                  borderRadius: '32px'
                }}
              />
              ))}
                </div>
          ) : bundles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
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
                    className="bg-white relative overflow-hidden w-full cursor-pointer hover:opacity-90 transition-opacity"
              style={{
                aspectRatio: '307/450'
              }}
            >
              {bundle.badgeText && (
                <span
                  className="absolute top-4 left-4 bg-white/90 text-black uppercase tracking-[0.2em] text-xs font-semibold px-3 py-1 rounded-full shadow-md"
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
                  borderRadius: '32px'
                }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                }}
              />
              <div 
                className="absolute bottom-0 left-0 right-0 bg-black/90 text-white p-4 rounded-b-[32px] flex items-center justify-between gap-4"
                style={{
                  minHeight: '72px',
                  zIndex: 20
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
                        {formatPrice(bundlePrice)}
                </p>
              </div>
              {bundle.shortDescription && (
                <div
                  className="absolute left-0 right-0 bottom-[72px] bg-gradient-to-t from-black/80 to-transparent text-white px-6 pb-10 pt-6"
                  style={{
                    borderBottomLeftRadius: '32px',
                    borderBottomRightRadius: '32px',
                    zIndex: 10
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
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 mt-12">
              <p className="text-gray-500">No bundles available</p>
                </div>
          )}
        </div>
      </section>

      {/* Section 8: MOVE WITH US - Image Carousel with Hover Effect - Fully Responsive */}
      <section className="bg-white text-[#212121] pt-0 pb-20 mt-12">
        <div className="container mx-auto px-4 max-w-[1250px]">
          {/* Heading and Subtitle - Same font as above sections */}
          <div className="mb-8">
            <h1 
              className="uppercase mb-6 text-black leading-none"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontWeight: 400,
                fontSize: 'clamp(40px, 5vw, 90px)', // Responsive font size
                letterSpacing: 'clamp(-1.5px, -0.23vw, -3.37px)' // Responsive letter spacing
              }}
            >
              MOVE WITH US
            </h1>
            <p 
              className="text-black text-left leading-normal"
              style={{
                fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                fontSize: 'clamp(14px, 1.5vw, 18px)', // Responsive font size
                letterSpacing: '0px',
                fontWeight: 500,
                marginTop: '2px' // Small gap between heading and subtitle
              }}
            >
              Real athletes, real movement. Tag us @Athlekt to be featured.
            </p>
          </div>

          {/* Image Carousel - Fully Responsive */}
          <div className="relative">
            {/* Navigation Arrows - Figma Design - Positioned to frame images */}
            <button
              onClick={() => scrollCarousel('left')}
              className="absolute top-1/2 -translate-y-1/2 z-10 rounded-full border border-black bg-white flex items-center justify-center transition-colors"
              style={{
                left: '0',
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
              onClick={() => scrollCarousel('right')}
              className="absolute top-1/2 -translate-y-1/2 z-10 rounded-full border border-black bg-white flex items-center justify-center transition-colors"
              style={{
                right: '0',
                width: 'clamp(32px, 3.5vw, 48px)',
                height: 'clamp(32px, 3.5vw, 48px)',
                border: '1px solid #000000',
                backgroundColor: '#FFFFFF'
              }}
              aria-label="Next image"
            >
              <ChevronRight className="text-black" style={{ width: 'clamp(16px, 1.8vw, 24px)', height: 'clamp(16px, 1.8vw, 24px)' }} />
            </button>

            {/* Carousel Container - Shows multiple images - Centered between arrows */}
            {loadingCarouselImages ? (
              <div className="flex justify-center items-center gap-4 md:gap-6" style={{
                paddingLeft: 'clamp(48px, 5.5vw, 64px)',
                paddingRight: 'clamp(48px, 5.5vw, 64px)',
                minHeight: 'clamp(240px, 28vw, 380px)'
              }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-200 animate-pulse rounded-[40px] flex-shrink-0" style={{
                    width: 'clamp(160px, 18vw, 240px)',
                    height: 'clamp(240px, 28vw, 380px)'
                  }} />
                ))}
              </div>
            ) : carouselImages.length > 0 ? (
            <div 
              ref={carouselRef}
              className="flex overflow-x-hidden scroll-smooth gap-4 md:gap-6"
              style={{
                scrollSnapType: 'x mandatory',
                paddingLeft: 'clamp(48px, 5.5vw, 64px)', // Space for left arrow
                paddingRight: 'clamp(48px, 5.5vw, 64px)', // Space for right arrow
                margin: '0 auto',
                width: '100%',
                maxWidth: '100%',
                display: 'flex',
                justifyContent: 'center', // Center images between arrows
                alignItems: 'center'
              }}
            >
              {carouselImages.map((image, index) => (
                <div
                  key={index}
                  className="flex-shrink-0"
                  style={{
                    scrollSnapAlign: 'start',
                    // Figma dimensions - reduced size to match design
                    width: 'clamp(160px, 18vw, 240px)', // Reduced from 276px to 240px max
                    height: 'clamp(240px, 28vw, 380px)', // Reduced from 431px to 380px max
                    minWidth: '160px',
                    minHeight: '240px'
                  }}
                >
                  <div
                    className="relative w-full h-full overflow-hidden cursor-pointer transition-transform duration-300 ease-out"
                    style={{
                      // Exact Figma dimensions
                      width: '100%',
                      height: '100%',
                      transform: 'translateY(0)',
                      borderRadius: 'clamp(24px, 3vw, 40px)', // Reduced border radius to match smaller size
                      opacity: 1, // Figma: 100% opacity
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <Image
                      src={image}
                      alt={`Carousel image ${index + 1}`}
                      fill
                      className="object-cover"
                      style={{
                        borderRadius: 'clamp(24px, 3vw, 40px)', // Same border radius as container
                        objectFit: 'cover', // Fit image inside box
                        objectPosition: 'center top' // Show top portion of image
                      }}
                      sizes="(max-width: 640px) 160px, (max-width: 768px) 200px, (max-width: 1024px) 220px, 240px"
                    />
                  </div>
                </div>
              ))}
            </div>
            ) : (
              <div className="text-center py-12" style={{
                paddingLeft: 'clamp(48px, 5.5vw, 64px)',
                paddingRight: 'clamp(48px, 5.5vw, 64px)',
              }}>
                <p className="text-gray-500">No images available at the moment.</p>
              </div>
            )}
          </div>

          {/* Pagination Dots - Responsive */}
          {!loadingCarouselImages && carouselImages.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentCarouselIndex(index)
                  if (carouselRef.current) {
                    const containerWidth = carouselRef.current.clientWidth
                    const gap = 24
                    // Reduced box width: 240px (responsive: clamp(160px, 18vw, 240px))
                    const imageWidth = Math.max(160, Math.min(240, containerWidth * 0.18)) // Responsive width
                    const scrollPosition = index * (imageWidth + gap)
                    carouselRef.current.scrollTo({
                      left: scrollPosition,
                      behavior: 'smooth'
                    })
                  }
                }}
                className={`transition-all duration-300 ${
                  index === currentCarouselIndex 
                    ? 'w-2.5 h-2.5 bg-gray-400' 
                    : 'w-2 h-2 bg-gray-600'
                } rounded-full`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          )}
        </div>
      </section>

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
      `}</style>
    </div>
  )
}
