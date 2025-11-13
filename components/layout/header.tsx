"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Search, Heart, User, ShoppingBag, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"

interface Product {
  _id: string;
  title: string;
  slug: string;
  images?: any[]; // Changed to any for flexibility
  basePrice: number;
  category: string;
  subCategory: string;
}

interface SubCategory {
  id: string
  name: string
  category: string
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMenMenuOpen, setIsMenMenuOpen] = useState(false)
  const [isWomenMenuOpen, setIsWomenMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [productsLoaded, setProductsLoaded] = useState(false)
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()

  // Fetch all products on component mount
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        console.log("🔄 Fetching all products...")
        const response = await fetch('https://athlekt.com/backendnew/api/products')
        const data = await response.json()
        
        console.log("📦 API Response:", data) // Debug API response
        
        if (data.success && data.data) {
          console.log("✅ Products loaded:", data.data.length)
          // Log first product to see structure
          if (data.data.length > 0) {
            console.log("🔍 First product sample:", data.data[0])
            console.log("🖼️ First product images:", data.data[0].images)
          }
          setAllProducts(data.data)
          setProductsLoaded(true)
        }
      } catch (error) {
        console.error("❌ Error fetching products:", error)
      }
    }

    fetchAllProducts()
  }, [])

  // Fetch sub-categories from backend
  useEffect(() => {
    fetchSubCategories()
  }, [])

  const fetchSubCategories = async () => {
    try {
      const response = await fetch('https://athlekt.com/backendnew/api/subcategories/public')
      if (response.ok) {
        const data = await response.json()
        setSubCategories(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching sub-categories:', error)
    } finally {
      setLoading(false)
    }
  }

  // Client-side search function
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase()
    
    if (query.length < 2) {
      setSearchResults([])
      setIsSearchDropdownOpen(false)
      return
    }

    if (!productsLoaded) {
      console.log("⏳ Products not loaded yet...")
      return
    }

    setIsSearchLoading(true)
    setIsSearchDropdownOpen(true)

    const delayDebounceFn = setTimeout(() => {
      try {
        const filteredProducts = allProducts.filter(product =>
          product.title.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.subCategory.toLowerCase().includes(query) ||
          (product.slug && product.slug.toLowerCase().includes(query))
        ).slice(0, 5)

        setSearchResults(filteredProducts)
        setIsSearchLoading(false)
        
      } catch (error) {
        console.error("❌ Search error:", error)
        setIsSearchLoading(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery, allProducts, productsLoaded])

  // Robust function to get correct image URL
  const getImageUrl = (product: Product): string => {
    try {
      console.log(`🔄 Getting image for product: ${product.title}`, product.images)
      
      // If no images array or empty array
      if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
        console.log("❌ No images array or empty")
        return "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
      }

      const firstImage = product.images[0]
      console.log("📸 First image object:", firstImage)

      let imageUrl = ''

      // Handle different possible image structures
      if (typeof firstImage === 'string') {
        // Case 1: Direct URL string
        imageUrl = firstImage
      } else if (firstImage && typeof firstImage === 'object') {
        // Case 2: Object with various possible properties
        imageUrl = firstImage.url || firstImage.src || firstImage.imageUrl || firstImage.path || firstImage.image || ''
        
        // If still no URL, try to find any string property that looks like a URL
        if (!imageUrl) {
          for (const key in firstImage) {
            if (typeof firstImage[key] === 'string' && 
                (firstImage[key].includes('.jpg') || 
                 firstImage[key].includes('.jpeg') || 
                 firstImage[key].includes('.png') || 
                 firstImage[key].includes('.webp'))) {
              imageUrl = firstImage[key]
              break
            }
          }
        }
      }

      console.log("🔗 Extracted image URL:", imageUrl)

      // If we found a URL, format it properly
      if (imageUrl && imageUrl.trim()) {
        imageUrl = imageUrl.trim()
        
        // Handle different URL formats
        if (imageUrl.startsWith('http')) {
          return imageUrl
        } else if (imageUrl.startsWith('//')) {
          return `https:${imageUrl}`
        } else if (imageUrl.startsWith('/')) {
          return `https://athlekt.com${imageUrl}`
        } else {
          return `https://athlekt.com/${imageUrl}`
        }
      }

      // Fallback if no valid image found
      console.log("❌ No valid image URL found")
      return "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"

    } catch (error) {
      console.error("❌ Error getting image URL:", error)
      return "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
    }
  }

  const handleSuggestionClick = (slug: string) => {
    setIsSearchDropdownOpen(false)
    setSearchQuery('')
    router.push(`/product/${slug}`)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.search-container')) {
        setIsSearchDropdownOpen(false)
      }
      if (!target.closest('.men-dropdown')) {
        setIsMenMenuOpen(false)
      }
      if (!target.closest('.women-dropdown')) {
        setIsWomenMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setIsSearchDropdownOpen(false)
      if (isMenuOpen) {
        setIsMenuOpen(false)
      }
    }
  }

  const handleSearchIconClick = () => {
    if (searchQuery.trim()) {
      setIsSearchDropdownOpen(true)
    }
  }

  // Function to check if a path is active
  const isActivePath = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  // Get sub-categories based on selected gender
  const getSubCategories = (gender: string) => {
    if (loading) return []
    
    const genderSubCategories = subCategories.filter(subCat => {
      const categoryName = subCat.category.toLowerCase()
      if (gender === "women") {
        return categoryName === "women"
      } else {
        return categoryName === "men"
      }
    })

    const uniqueSubCategories = genderSubCategories.reduce((acc, subCat) => {
      if (!acc.find(item => item.name === subCat.name)) {
        acc.push(subCat)
      }
      return acc
    }, [] as typeof genderSubCategories)

    return uniqueSubCategories.map(subCat => ({
      href: `/categories/${subCat.name.toLowerCase().replace(/\s+/g, '-')}`,
      label: subCat.name,
      id: subCat.id
    }))
  }

  // Reusable component for category dropdowns
  const CategoryDropdown = ({
    gender,
    isOpen,
    onMouseEnter,
    onMouseLeave,
  }: {
    gender: "men" | "women"
    isOpen: boolean
    onMouseEnter: () => void
    onMouseLeave: () => void
  }) => {
    const categories = getSubCategories(gender);
    return (
      <div className={`relative group ${gender === 'men' ? 'men-dropdown' : 'women-dropdown'}`} 
           onMouseEnter={onMouseEnter} 
           onMouseLeave={onMouseLeave}>
        <Link
          href={`/categories?gender=${gender}`}
          className={`transition-colors font-medium uppercase text-[15px] ${
            isActivePath(`/categories?gender=${gender}`) ? "text-[#cbf26c]" : "text-white hover:text-[#cbf26c]"
          }`}
        >
          {gender.toUpperCase()}
        </Link>
        <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-200 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}>
          <div className="bg-white shadow-lg rounded-md overflow-hidden z-50 min-w-[200px]">
            {categories.map(category => (
              <Link
                key={category.id || `${gender}-${category.href}`}
                href={`${category.href}?gender=${gender}`}
                className="block px-6 py-3 text-[#212121] hover:bg-gray-50 transition-colors text-sm"
                onClick={() => {
                  setIsMenMenuOpen(false)
                  setIsWomenMenuOpen(false)
                  setIsMenuOpen(false)
                }}
              >
                {category.label}
              </Link>
            ))}
            {categories.length === 0 && (
              <div className="px-6 py-3 text-gray-400 text-sm">
                {loading ? "Loading..." : "No categories"}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <header className="bg-[#0f1013] text-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image 
              src="/logos.png" 
              alt="ATHLEKT" 
              width={120} 
              height={30} 
              className="h-7 w-auto" 
              priority 
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              href="/collection"
              className={`transition-colors font-medium uppercase text-[15px] ${
                isActivePath("/collection") ? "text-[#cbf26c]" : "text-white hover:text-[#cbf26c]"
              }`}
            >
              PRODUCTS
            </Link>

            {/* Men's Category Dropdown */}
            <CategoryDropdown
              gender="men"
              isOpen={isMenMenuOpen}
              onMouseEnter={() => setIsMenMenuOpen(true)}
              onMouseLeave={() => setIsMenMenuOpen(false)}
            />

            {/* Women's Category Dropdown */}
            <CategoryDropdown
              gender="women"
              isOpen={isWomenMenuOpen}
              onMouseEnter={() => setIsWomenMenuOpen(true)}
              onMouseLeave={() => setIsWomenMenuOpen(false)}
            />

            <Link
              href="/about"
              className={`transition-colors font-medium uppercase text-[15px] ${
                isActivePath("/about") ? "text-[#cbf26c]" : "text-white hover:text-[#cbf26c]"
              }`}
            >
              ABOUT
            </Link>

            <Link
              href="/contact"
              className={`transition-colors font-medium uppercase text-[15px] ${
                isActivePath("/contact") ? "text-[#cbf26c]" : "text-white hover:text-[#cbf26c]"
              }`}
            >
              CONTACT
            </Link>

            <Link
              href="/blog"
              className={`transition-colors font-medium uppercase text-[15px] ${
                isActivePath("/blog") ? "text-[#cbf26c]" : "text-white hover:text-[#cbf26c]"
              }`}
            >
              BLOGS
            </Link>
          </nav>

          {/* Search and Icons */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center search-container">
              <div className="relative">
                <div className="flex items-center bg-black border border-white rounded-full overflow-hidden">
                  <input
                    type="search"
                    placeholder="Search for products..."
                    className="px-4 py-2 w-64 bg-black text-white border-none outline-none h-10 placeholder:text-gray-400 text-sm"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      if (e.target.value.trim().length >= 2) {
                        setIsSearchDropdownOpen(true)
                      } else {
                        setIsSearchDropdownOpen(false)
                      }
                    }}
                    onKeyDown={handleSearch}
                    onFocus={() => searchQuery.trim().length >= 2 && setIsSearchDropdownOpen(true)}
                  />
                  <button 
                    onClick={handleSearchIconClick}
                    className="px-4 py-2 hover:bg-gray-800 transition-colors"
                  >
                    <Search className="text-white h-4 w-4" />
                  </button>
                </div>
                
                {/* Search Suggestions Dropdown */}
                {isSearchDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white shadow-lg rounded-xl overflow-hidden z-50 max-h-80 overflow-y-auto">
                    {!productsLoaded ? (
                      <div className="p-4 text-center text-gray-500 text-sm">Loading products...</div>
                    ) : isSearchLoading ? (
                      <div className="p-4 text-center text-gray-500 text-sm">Searching...</div>
                    ) : searchResults.length > 0 ? (
                      <>
                        <div className="p-2 bg-gray-50 border-b">
                          <p className="text-xs text-gray-500">
                            Found {searchResults.length} results for "{searchQuery}"
                          </p>
                        </div>
                        {searchResults.map((product) => (
                          <button
                            key={product._id}
                            onClick={() => {
                              console.log("🎯 Clicked product:", product)
                              handleSuggestionClick(product.slug || product._id)
                            }}
                            className="flex items-center p-3 hover:bg-gray-100 transition-colors border-b last:border-b-0 w-full text-left"
                          >
                            <div className="w-12 h-12 bg-gray-200 rounded-md mr-3 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              <Image 
                                src={getImageUrl(product)}
                                alt={product.title}
                                width={48}
                                height={48}
                                className="w-12 h-12 object-cover"
                                onError={(e) => {
                                  console.log("🖼️ Image load error for product:", product.title)
                                  const target = e.target as HTMLImageElement
                                  target.src = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
                                }}
                                onLoad={() => console.log("✅ Image loaded successfully for:", product.title)}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[#212121] text-sm font-medium block truncate">
                                {product.title}
                              </span>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-[#cbf26c] text-sm font-bold">${product.basePrice}</span>
                                <span className="text-xs text-gray-500 capitalize truncate ml-2">
                                  {product.category} • {product.subCategory}
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </>
                    ) : searchQuery.trim().length >= 2 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No products found for "{searchQuery}"
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" className="relative hover:bg-[#141619] text-white group" asChild>
                <Link href="/wishlist">
                  <Heart className="h-5 w-5 group-hover:text-[#cbf26c] transition-colors" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#cbf26c] text-[#212121] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </Button>

              {user ? (
                <Button variant="ghost" size="icon" className="hover:bg-[#141619] text-white group" asChild>
                  <Link href="/profile">
                    <User className="h-5 w-5 group-hover:text-[#cbf26c] transition-colors" />
                  </Link>
                </Button>
              ) : (
                <Button variant="ghost" size="icon" className="hover:bg-[#141619] text-white group" asChild>
                  <Link href="/profile">
                    <User className="h-5 w-5 group-hover:text-[#cbf26c] transition-colors" />
                  </Link>
                </Button>
              )}

              <Button variant="ghost" size="icon" className="relative hover:bg-[#141619] text-white group" asChild>
                <Link href="/cart">
                  <ShoppingBag className="h-5 w-5 group-hover:text-[#cbf26c] transition-colors" />
                  <span className="absolute -top-1 -right-1 bg-[#cbf26c] text-[#212121] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-[#141619] text-white"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-6 border-t border-[#141619]">
            <nav className="flex flex-col space-y-6">
              <Link
                href="/collection"
                className={`transition-colors font-medium uppercase text-[15px] ${
                  isActivePath("/collection") ? "text-[#cbf26c]" : "text-white hover:text-[#cbf26c]"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                PRODUCTS
              </Link>

              {/* Mobile Categories */}
              <div className="space-y-3">
                <span className="font-medium uppercase text-[15px] text-white">
                  CATEGORIES
                </span>
                <div className="pl-4 space-y-2">
                  <Link
                    href="/categories?gender=men"
                    className="block text-white hover:text-[#cbf26c] transition-colors text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Men
                  </Link>
                  <Link
                    href="/categories?gender=women"
                    className="block text-white hover:text-[#cbf26c] transition-colors text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Women
                  </Link>
                </div>
              </div>

              <Link
                href="/about"
                className={`transition-colors font-medium uppercase text-[15px] ${
                  isActivePath("/about") ? "text-[#cbf26c]" : "text-white hover:text-[#cbf26c]"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                ABOUT
              </Link>

              <Link
                href="/contact"
                className={`transition-colors font-medium uppercase text-[15px] ${
                  isActivePath("/contact") ? "text-[#cbf26c]" : "text-white hover:text-[#cbf26c]"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                CONTACT
              </Link>

              <Link
                href="/blog"
                className={`transition-colors font-medium uppercase text-[15px] ${
                  isActivePath("/blog") ? "text-[#cbf26c]" : "text-white hover:text-[#cbf26c]"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                BLOGS
              </Link>

              {/* Mobile Search */}
              <div className="pt-4 search-container">
                <div className="relative">
                  <div className="flex items-center bg-black border border-white rounded-full overflow-hidden">
                    <input
                      type="search"
                      placeholder="Search for products..."
                      className="px-4 py-2 w-full bg-black text-white border-none outline-none h-10 placeholder:text-gray-400 text-sm"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        if (e.target.value.trim().length >= 2) {
                          setIsSearchDropdownOpen(true)
                        } else {
                          setIsSearchDropdownOpen(false)
                        }
                      }}
                      onKeyDown={handleSearch}
                      onFocus={() => searchQuery.trim().length >= 2 && setIsSearchDropdownOpen(true)}
                    />
                    <button 
                      onClick={handleSearchIconClick}
                      className="px-4 py-2 hover:bg-gray-800 transition-colors"
                    >
                      <Search className="text-white h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Mobile Search Suggestions Dropdown */}
                  {isSearchDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white shadow-lg rounded-xl overflow-hidden z-50 max-h-80 overflow-y-auto">
                      {!productsLoaded ? (
                        <div className="p-4 text-center text-gray-500 text-sm">Loading products...</div>
                      ) : isSearchLoading ? (
                        <div className="p-4 text-center text-gray-500 text-sm">Searching...</div>
                      ) : searchResults.length > 0 ? (
                        <>
                          <div className="p-2 bg-gray-50 border-b">
                            <p className="text-xs text-gray-500">
                              Found {searchResults.length} results for "{searchQuery}"
                            </p>
                          </div>
                          {searchResults.map((product) => (
                            <button
                              key={product._id}
                              onClick={() => handleSuggestionClick(product.slug || product._id)}
                              className="flex items-center p-3 hover:bg-gray-100 transition-colors border-b last:border-b-0 w-full text-left"
                            >
                              <div className="w-12 h-12 bg-gray-200 rounded-md mr-3 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                <Image 
                                  src={getImageUrl(product)}
                                  alt={product.title}
                                  width={48}
                                  height={48}
                                  className="w-12 h-12 object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[#212121] text-sm font-medium block truncate">
                                  {product.title}
                                </span>
                                <div className="flex justify-between items-center mt-1">
                                  <span className="text-[#cbf26c] text-sm font-bold">${product.basePrice}</span>
                                  <span className="text-xs text-gray-500 capitalize truncate ml-2">
                                    {product.category} • {product.subCategory}
                                  </span>
                                </div>
                              </div>
                            </button>
                          ))}
                        </>
                      ) : searchQuery.trim().length >= 2 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No products found for "{searchQuery}"
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}