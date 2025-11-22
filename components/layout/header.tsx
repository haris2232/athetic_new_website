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
  images?: any[];
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

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await fetch('https://athlekt.com/backendnew/api/products')
        const data = await response.json()
        
        if (data.success && data.data) {
          setAllProducts(data.data)
          setProductsLoaded(true)
        }
      } catch (error) {
        console.error("Error fetching products:", error)
      }
    }

    fetchAllProducts()
  }, [])

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

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase()
    
    if (query.length < 2) {
      setSearchResults([])
      setIsSearchDropdownOpen(false)
      return
    }

    if (!productsLoaded) {
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
        console.error("Search error:", error)
        setIsSearchLoading(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery, allProducts, productsLoaded])

  const getImageUrl = (product: Product): string => {
    try {
      if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
        return "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
      }

      const firstImage = product.images[0]
      let imageUrl = ''

      if (typeof firstImage === 'string') {
        imageUrl = firstImage
      } else if (firstImage && typeof firstImage === 'object') {
        imageUrl = firstImage.url || firstImage.src || firstImage.imageUrl || firstImage.path || firstImage.image || ''
        
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

      if (imageUrl && imageUrl.trim()) {
        imageUrl = imageUrl.trim()
        
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

      return "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"

    } catch (error) {
      return "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
    }
  }

  const handleSuggestionClick = (slug: string) => {
    setIsSearchDropdownOpen(false)
    setSearchQuery('')
    router.push(`/product/${slug}`)
  }

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

  const isActivePath = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  const getSubCategories = (gender: string) => {
    if (loading) return []
    
    const genderSubCategories = subCategories.filter(subCat => {
      const categoryName = subCat.category.toLowerCase()
      if (gender === "women") {
        return categoryName === "women"
      } else {
        return categoryName === "men"
      }
      return subCat.category.toLowerCase() === gender.toLowerCase();
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
                className="block px-6 py-3 text-[#212121] hover:bg-gray-50 transition-colors text-[14px]"
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
              <div className="px-6 py-3 text-gray-400 text-[14px]">
                {loading ? "Loading..." : "No categories"}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <header className="bg-[#0f1013] text-white sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4 w-full">
        {/* Main Header Row - Fixed height and proper spacing */}
        <div className="flex items-center justify-between h-20 w-full">
          {/* Logo - Responsive sizing */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image 
              src="/logos.png" 
              alt="ATHLEKT" 
              width={140}
              height={35}
              className="h-8 w-auto sm:h-9 md:h-10 object-contain max-w-[140px] md:max-w-[160px]"
              priority 
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 flex-shrink-0">
            <Link
              href="/collection"
              className={`transition-colors font-medium uppercase text-[15px] ${
                isActivePath("/collection") ? "text-[#cbf26c]" : "text-white hover:text-[#cbf26c]"
              }`}
            >
              PRODUCTS
            </Link>

            <CategoryDropdown
              gender="men"
              isOpen={isMenMenuOpen}
              onMouseEnter={() => setIsMenMenuOpen(true)}
              onMouseLeave={() => setIsMenMenuOpen(false)}
            />

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

          {/* Search and Icons - Proper spacing and wrapping */}
          <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
            {/* Desktop Search Bar - Hidden on mobile */}
            <div className="hidden md:flex items-center search-container">
              <div className="relative">
                <div className="flex items-center bg-black border border-white rounded-full overflow-hidden">
                  <input
                    type="search"
                    placeholder="Search for products..."
                    className="px-4 py-2 w-48 lg:w-64 bg-black text-white border-none outline-none h-10 placeholder:text-gray-400 text-[14px]"
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
                      <div className="p-4 text-center text-gray-500 text-[14px]">Loading products...</div>
                    ) : isSearchLoading ? (
                      <div className="p-4 text-center text-gray-500 text-[14px]">Searching...</div>
                    ) : searchResults.length > 0 ? (
                      <>
                        <div className="p-2 bg-gray-50 border-b">
                          <p className="text-[14px] text-gray-500">
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
                              <span className="text-[#212121] text-[14px] font-medium block truncate">
                                {product.title}
                              </span>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-[#cbf26c] text-[14px] font-bold">${product.basePrice}</span>
                                <span className="text-[14px] text-gray-500 capitalize truncate ml-2">
                                  {product.category} • {product.subCategory}
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </>
                    ) : searchQuery.trim().length >= 2 ? (
                      <div className="p-4 text-center text-gray-500 text-[14px]">
                        No products found for "{searchQuery}"
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* Icons - Proper spacing */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button variant="ghost" size="icon" className="relative hover:bg-[#141619] text-white group w-10 h-10" asChild>
                <Link href="/wishlist">
                  <Heart className="h-5 w-5 group-hover:text-[#cbf26c] transition-colors" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#cbf26c] text-[#212121] text-[14px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </Button>

              <Button variant="ghost" size="icon" className="hover:bg-[#141619] text-white group w-10 h-10" asChild>
                <Link href="/profile">
                  <User className="h-5 w-5 group-hover:text-[#cbf26c] transition-colors" />
                </Link>
              </Button>

              <Button variant="ghost" size="icon" className="relative hover:bg-[#141619] text-white group w-10 h-10" asChild>
                <Link href="/cart">
                  <ShoppingBag className="h-5 w-5 group-hover:text-[#cbf26c] transition-colors" />
                  <span className="absolute -top-1 -right-1 bg-[#cbf26c] text-[#212121] text-[14px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                </Link>
              </Button>

              {/* Hamburger Button - Fixed positioning and size */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-[#141619] text-white w-10 h-10 flex items-center justify-center"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar - Only show when menu is closed */}
        {!isMenuOpen && (
          <div className="lg:hidden pb-4 search-container w-full">
            <div className="relative w-full">
              <div className="flex items-center bg-white border border-gray-300 rounded-full overflow-hidden w-full">
                <input
                  type="search"
                  placeholder="Search for products..."
                  className="px-4 py-2 w-full bg-white text-black border-none outline-none h-10 placeholder:text-gray-500 text-[14px]"
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
                  className="px-4 py-2 hover:bg-gray-100 transition-colors flex-shrink-0"
                >
                  <Search className="text-gray-600 h-4 w-4" />
                </button>
              </div>
              
              {/* Mobile Search Suggestions Dropdown */}
              {isSearchDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white shadow-lg rounded-xl overflow-hidden z-50 max-h-80 overflow-y-auto">
                  {!productsLoaded ? (
                    <div className="p-4 text-center text-gray-500 text-[14px]">Loading products...</div>
                  ) : isSearchLoading ? (
                    <div className="p-4 text-center text-gray-500 text-[14px]">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    <>
                      <div className="p-2 bg-gray-50 border-b">
                        <p className="text-[14px] text-gray-500">
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
                            <span className="text-[#212121] text-[14px] font-medium block truncate">
                              {product.title}
                            </span>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[#cbf26c] text-[14px] font-bold">${product.basePrice}</span>
                              <span className="text-[14px] text-gray-500 capitalize truncate ml-2">
                                {product.category} • {product.subCategory}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </>
                  ) : searchQuery.trim().length >= 2 ? (
                    <div className="p-4 text-center text-gray-500 text-[14px]">
                      No products found for "{searchQuery}"
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-6 border-t border-[#141619] w-full">
            <nav className="flex flex-col space-y-6 w-full">
              <Link
                href="/collection"
                className={`transition-colors font-medium uppercase text-[15px] ${
                  isActivePath("/collection") ? "text-[#cbf26c]" : "text-white hover:text-[#cbf26c]"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                PRODUCTS
              </Link>

              <div className="space-y-3">
                <span className="font-medium uppercase text-[15px] text-white">
                  CATEGORIES
                </span>
                <div className="pl-4 space-y-2">
                  <Link
                    href="/categories?gender=men"
                    className="block text-white hover:text-[#cbf26c] transition-colors text-[14px]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Men
                  </Link>
                  <Link
                    href="/categories?gender=women"
                    className="block text-white hover:text-[#cbf26c] transition-colors text-[14px]"
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
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}