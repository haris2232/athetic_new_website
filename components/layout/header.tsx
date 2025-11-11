"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Search, Heart, User, ShoppingBag, Menu, X, ChevronDown, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"

interface SubCategory {
  id: string
  name: string
  category: string
}

interface ProductSuggestion {
  _id: string;
  name: string;
  slug: string;
  images: { url: string }[];
  price: number;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMenMenuOpen, setIsMenMenuOpen] = useState(false)
  const [isWomenMenuOpen, setIsWomenMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<ProductSuggestion[]>([])
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false)
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()

  const navigateTo = (href: string) => {
    setIsMenuOpen(false)
    setIsMenMenuOpen(false)
    setIsWomenMenuOpen(false)
    router.push(href)
  }

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setIsSearchDropdownOpen(false)
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      if (isMenuOpen) {
        setIsMenuOpen(false)
      }
    }
  }

  // Search icon click handler
  const handleSearchIconClick = () => {
    if (searchQuery.trim()) {
      setIsSearchDropdownOpen(false)
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      if (isMenuOpen) {
        setIsMenuOpen(false)
      }
    }
  }

  // Debounced search suggestions fetching
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([])
      setIsSearchDropdownOpen(false)
      return
    }

    setIsSearchLoading(true)
    setIsSearchDropdownOpen(true)

    const delayDebounceFn = setTimeout(() => {
      fetch(`https://athlekt.com/backendnew/api/products/search?q=${encodeURIComponent(searchQuery.trim())}&limit=5`)
        .then(res => res.json())
        .then(data => {
          setSearchResults(data.products || [])
          setIsSearchLoading(false)
        })
        .catch(error => {
          console.error("Error fetching search results:", error)
          setIsSearchLoading(false)
          setSearchResults([])
        })
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const handleSuggestionClick = () => {
    setIsSearchDropdownOpen(false);
    setSearchQuery('');
  }

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

  // Check authentication status and ban status
  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        setUser(user)
        checkBanStatus(token, user.email)
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [])

  const checkBanStatus = async (token: string, email: string) => {
    try {
      const response = await fetch(`https://athlekt.com/backendnew/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.status === 403) {
        console.log("🚫 User is banned, forcing logout...")
        handleLogout()
        alert("Your account has been banned by the administrator.")
      }
    } catch (error) {
      console.error("Error checking ban status:", error)
    }
  }

  // Periodic ban check every 30 seconds
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        const token = localStorage.getItem("token")
        if (token) {
          checkBanStatus(token, user.email)
        }
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [user])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    window.location.href = "/"
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
      <div className="relative group" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <Link
          href={`/categories?gender=${gender}`}
          className={`transition-colors font-medium uppercase text-[15px] ${isActivePath(`/${gender}`) ? "text-[#cbf26c]" : "text-white hover:text-[#cbf26c]"}`}
          onClick={(event) => {
            event.preventDefault()
            navigateTo(`/categories?gender=${gender}`)
          }}
        >
          {gender.toUpperCase()}
        </Link>
        <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-200 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
          <div className="bg-white shadow-lg rounded-md overflow-hidden z-50 min-w-[200px]">
            {categories.map(category => (
              <Link
                key={category.id || `${gender}-${category.href}`}
                href={`${category.href}?gender=${gender}`}
                className="block px-6 py-3 text-[#212121] hover:bg-gray-50 transition-colors text-sm"
                onClick={(event) => {
                  event.preventDefault()
                  navigateTo(`${category.href}?gender=${gender}`)
                }}
              >
                {category.label}
              </Link>
            ))}
            {categories.length === 0 && <div className="px-6 py-3 text-gray-400 text-sm">{loading ? "Loading..." : "No categories"}</div>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <header className="bg-[#0f1013] text-white sticky top-0 z-50">
      {/* Main Header - Simplified according to image */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Left aligned with smaller size */}
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

          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              href="/collection"
              className={`transition-colors font-medium uppercase text-[15px] ${
                isActivePath("/collection") ? "text-[#cbf26c]" : "text-white hover:text-[#cbf26c]"
              }`}
              onClick={(event) => {
                event.preventDefault()
                navigateTo("/collection")
              }}
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

            {/* BLOGS */}
            <Link
              href="/blog"
              className={`transition-colors font-medium uppercase text-[15px] ${
                isActivePath("/blog") ? "text-[#cbf26c]" : "text-white hover:text-[#cbf26c]"
              }`}
              onClick={(event) => {
                event.preventDefault()
                navigateTo("/blog")
              }}
            >
              BLOGS
            </Link>
          </nav>

          {/* Search and Icons - Right aligned */}
          <div className="flex items-center space-x-4">
            {/* Search Bar - Black background with white border, white text, search icon on right - PROPERLY ROUNDED */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <div className="flex items-center bg-black border border-white rounded-full overflow-hidden">
                  <input
                    type="search"
                    placeholder="Search for products..."
                    className="px-4 py-2 w-64 bg-black text-white border-none outline-none h-10 placeholder:text-gray-400 text-sm"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      if (e.target.value) {
                        setIsSearchDropdownOpen(true)
                      } else {
                        setIsSearchDropdownOpen(false)
                      }
                    }}
                    onKeyDown={handleSearch}
                    onBlur={() => setTimeout(() => setIsSearchDropdownOpen(false), 200)}
                    onFocus={() => searchQuery && setSearchResults.length > 0 && setIsSearchDropdownOpen(true)}
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
                  <div className="absolute top-full left-0 mt-2 w-full bg-white shadow-lg rounded-xl overflow-hidden z-50">
                    {isSearchLoading ? (
                      <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((product) => (
                        <Link key={product._id} href={`/product/${product.slug}`} onClick={handleSuggestionClick} className="flex items-center p-3 hover:bg-gray-100 transition-colors border-b last:border-b-0">
                          <Image 
                            src={product.images[0]?.url || '/placeholder.png'} 
                            alt={product.name} 
                            width={40} 
                            height={40} 
                            className="w-10 h-10 object-cover rounded-md mr-3"
                          />
                          <span className="text-[#212121] text-sm">{product.name}</span>
                        </Link>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">No products found.</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-3">
              {/* Wishlist */}
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

              {/* User Account */}
              {user ? (
                <Button variant="ghost" size="icon" className="hover:bg-[#141619] text-white group" asChild>
                  <Link href="/profile">
                    <User className="h-5 w-5 group-hover:text-[#cbf26c] transition-colors" />
                  </Link>
                </Button>
              ) : (
                <Button variant="ghost" size="icon" className="hover:bg-[#141619] text-white group" asChild>
                  <Link href="/login">
                    <User className="h-5 w-5 group-hover:text-[#cbf26c] transition-colors" />
                  </Link>
                </Button>
              )}

              {/* Shopping Bag */}
              <Button variant="ghost" size="icon" className="relative hover:bg-[#141619] text-white group" asChild>
                <Link href="/cart">
                  <ShoppingBag className="h-5 w-5 group-hover:text-[#cbf26c] transition-colors" />
                  <span className="absolute -top-1 -right-1 bg-[#cbf26c] text-[#212121] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                </Link>
              </Button>

              {/* Mobile Menu Button */}
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
                onClick={(event) => {
                  event.preventDefault()
                  navigateTo("/collection")
                }}
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
                    onClick={(event) => {
                      event.preventDefault()
                      navigateTo("/categories?gender=men")
                    }}
                  >
                    Men
                  </Link>
                  <Link
                    href="/categories?gender=women"
                    className="block text-white hover:text-[#cbf26c] transition-colors text-sm"
                    onClick={(event) => {
                      event.preventDefault()
                      navigateTo("/categories?gender=women")
                    }}
                  >
                    Women
                  </Link>
                </div>
              </div>

              <Link
                href="/blog"
                className={`transition-colors font-medium uppercase text-[15px] ${
                  isActivePath("/blog") ? "text-[#cbf26c]" : "text-white hover:text-[#cbf26c]"
                }`}
                onClick={(event) => {
                  event.preventDefault()
                  navigateTo("/blog")
                }}
              >
                BLOGS
              </Link>

              {/* Mobile Search - PROPERLY ROUNDED */}
              <div className="pt-4">
                <div className="relative">
                  <div className="flex items-center bg-black border border-white rounded-full overflow-hidden">
                    <input
                      type="search"
                      placeholder="Search for products..."
                      className="px-4 py-2 w-full bg-black text-white border-none outline-none h-10 placeholder:text-gray-400 text-sm"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        if (e.target.value) {
                          setIsSearchDropdownOpen(true)
                        } else {
                          setIsSearchDropdownOpen(false)
                        }
                      }}
                      onKeyDown={handleSearch}
                      onBlur={() => setTimeout(() => setIsSearchDropdownOpen(false), 200)}
                      onFocus={() => searchQuery && setSearchResults.length > 0 && setIsSearchDropdownOpen(true)}
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
                    <div className="absolute top-full left-0 mt-2 w-full bg-white shadow-lg rounded-xl overflow-hidden z-50">
                      {isSearchLoading ? (
                        <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((product) => (
                          <Link key={product._id} href={`/product/${product.slug}`} onClick={handleSuggestionClick} className="flex items-center p-3 hover:bg-gray-100 transition-colors border-b last:border-b-0">
                            <Image 
                              src={product.images[0]?.url || '/placeholder.png'} 
                              alt={product.name} 
                              width={40} 
                              height={40} 
                              className="w-10 h-10 object-cover rounded-md mr-3"
                            />
                            <span className="text-[#212121] text-sm">{product.name}</span>
                          </Link>
                        ))
                      ) : <div className="p-4 text-center text-gray-500 text-sm">No products found.</div>}
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