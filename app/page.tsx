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
  mobile: "https://res.cloudinary.com/dyfbyr8ym/image/upload/v1763784318/move-desk-com_vs2gte_xuy7at.gif",
  desktop: "https://res.cloudinary.com/dyfbyr8ym/image/upload/v1763784318/move-desk-com_vs2gte_xuy7at.gif"
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

      {/* REST OF YOUR CODE REMAINS EXACTLY THE SAME */}
      {/* Section 2: DISCOVER YOUR FIT */}
      <section className="bg-white text-[#212121] py-8 md:py-12 lg:py-16">
        {/* ... rest of your existing code ... */}
      </section>

      {/* Section 3: WHAT'S NEW */}
      <section className="bg-white text-[#212121] py-8 md:py-12 lg:py-16">
        {/* ... rest of your existing code ... */}
      </section>

      {/* Section 4: WHAT MAKE US MOVE */}
      <section className="bg-white text-[#212121] py-8 md:py-12 lg:py-16">
        {/* ... rest of your existing code ... */}
      </section>

      {/* Section 5: COMMUNITY FAVOURITES */}
      <section className="bg-white text-[#212121] py-8 md:py-12 lg:py-16">
        {/* ... rest of your existing code ... */}
      </section>

      {/* Section 6: WHY ATHLEKT */}
      <section className="bg-white text-[#212121] py-8 md:py-12 lg:py-16">
        {/* ... rest of your existing code ... */}
      </section>

      {/* Section 7: COMPLETE THE LOOK */}
      <section className="bg-white text-[#212121] py-8 md:py-12 lg:py-16">
        {/* ... rest of your existing code ... */}
      </section>

      {/* Section 8: MOVE WITH US */}
      <section className="bg-white text-[#212121] py-8 md:py-12 lg:py-16">
        {/* ... rest of your existing code ... */}
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