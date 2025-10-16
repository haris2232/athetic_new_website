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
  const [isMenMenuOpen, setIsMenMenuOpen] = useState(false) // ADDED: State for Men dropdown
  const [isWomenMenuOpen, setIsWomenMenuOpen] = useState(false) // ADDED: State for Women dropdown
  const [isTopSellerOpen, setIsTopSellerOpen] = useState(false) // ADDED: State for new Top Sellers dropdown
  // REMOVED: isCategoriesOpen and selectedGender states
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

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setIsSearchDropdownOpen(false)
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      // If inside mobile menu, close it after search
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
    }, 300) // 300ms debounce delay

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
        
        // Check if user is banned by calling backend
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
        // User is banned, force logout
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
      }, 30000) // Check every 30 seconds
      
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
    
    // Filter sub-categories based on gender
    const genderSubCategories = subCategories.filter(subCat => {
      const categoryName = subCat.category.toLowerCase()
      if (gender === "women") {
        return categoryName === "women"
      } else {
        return categoryName === "men"
      }
    })

    // Remove duplicates by grouping by name and taking the first occurrence
    const uniqueSubCategories = genderSubCategories.reduce((acc, subCat) => {
      if (!acc.find(item => item.name === subCat.name)) {
        acc.push(subCat)
      }
      return acc
    }, [] as typeof genderSubCategories)

    // Convert to navigation format
    return uniqueSubCategories.map(subCat => ({
      href: `/categories/${subCat.name.toLowerCase().replace(/\s+/g, '-')}`,
      label: subCat.name,
      id: subCat.id
    }))
  }

  // Reusable component for category dropdowns
  const CategoryDropdown = ({ gender, isOpen, onMouseEnter, onMouseLeave, onLinkClick }: { gender: 'men' | 'women', isOpen: boolean, onMouseEnter: () => void, onMouseLeave: () => void, onLinkClick: () => void }) => {
    const categories = getSubCategories(gender);
    return (
      <div className="relative group" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <Link href={`/categories?gender=${gender}`} className={`transition-colors font-medium tracking-wide uppercase text-sm ${isActivePath(`/${gender}`) ? "text-[#cbf26c]" : "text-white hover:text-[#cbf26c]"}`}>
          {gender}
        </Link>
        <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-200 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
          <div className="bg-white shadow-lg rounded-md overflow-hidden z-50 min-w-[200px]">
            {categories.map(category => (
              <Link key={category.id} href={`${category.href}?gender=${gender}`} className="block px-6 py-3 text-[#212121] hover:bg-gray-50 transition-colors" onClick={onLinkClick}>
                {category.label}
              </Link>
            ))}
            {categories.length === 0 && <div className="px-6 py-3 text-gray-400">{loading ? "Loading..." : "No categories"}</div>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <header className="bg-[#0f1013] text-white sticky top-0 z-50">
      {/* Top Utility Bar */}
      <div className="border-b border-[#141619]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-end h-8 text-xs">
            <div className="hidden lg:flex items-center space-x-6">
              {user ? (
                <>
                  <span className="text-[#d9d9d9]">
                    {user.firstName || user.name || user.email}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="text-[#d9d9d9] hover:text-white transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login" className="text-[#d9d9d9] hover:text-white transition-colors">
                  Login
                </Link>
              )}
              <Link href="/accessibility" className="text-[#d9d9d9] hover:text-white transition-colors">
                Accessibility Statement
              </Link>
              <Link href="/help" className="text-[#d9d9d9] hover:text-white transition-colors">
                Help
              </Link>
              {!user && (
                <Link href="/signup" className="text-[#d9d9d9] hover:text-white transition-colors">
                  Email Sign Up
                </Link>
              )}
              <Link href="/blog" className="text-[#d9d9d9] hover:text-white transition-colors">
                Blog
              </Link>
              <div className="flex items-center text-[#d9d9d9] hover:text-white transition-colors cursor-pointer">
                English
                <ChevronDown className="h-3 w-3 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="ATHLEKT" width={140} height={37} className="h-9 w-auto" priority />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-12">
            <Link
              href="/"
              className={`transition-colors font-medium tracking-wide uppercase text-sm ${
                isActivePath("/") ? "text-[#cbf26c]" : "text-white hover:text-[#cbf26c]"
              }`}
            >
              HOME
            </Link>
            <Link
              href="/collection"
              className={`transition-colors font-medium tracking-wide uppercase text-sm ${
                isActivePath("/collection") ? "text-[#cbf26c]" : "text-white hover:text-[#cbf26c]"
              }`}
            >
              COLLECTION
            </Link>

            {/* Men's Category Dropdown */}
            <CategoryDropdown
              gender="men"
              isOpen={isMenMenuOpen}
              onMouseEnter={() => setIsMenMenuOpen(true)}
              onMouseLeave={() => setIsMenMenuOpen(false)}
              onLinkClick={() => setIsMenMenuOpen(false)}
            />

            {/* Women's Category Dropdown */}
            <CategoryDropdown
              gender="women"
              isOpen={isWomenMenuOpen}
              onMouseEnter={() => setIsWomenMenuOpen(true)}
              onMouseLeave={() => setIsWomenMenuOpen(false)}
              onLinkClick={() => setIsWomenMenuOpen(false)}
            />

            {/* Sale Link */}
            <Link href="/sale">
              <button
                className="transition-colors font-medium tracking-wide uppercase text-sm text-white hover:text-[#cbf26c]"
              >
                SALE
              </button>
            </Link>
            
            {/* ADDED: Top Sellers with Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setIsTopSellerOpen(true)}
              onMouseLeave={() => setIsTopSellerOpen(false)}
            >
              <button
                className="transition-colors font-medium tracking-wide uppercase text-sm text-white hover:text-[#cbf26c]"
              >
                TOP SELLERS
              </button>

              {/* Dropdown Menu */}
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-200 ${
                  isTopSellerOpen ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
              >
                <div className="bg-white shadow-lg rounded-md overflow-hidden z-50">
                  <div className="min-w-[200px]">
                    <div className="bg-white">
                      <Link
                        href="/sale/men"
                        className="block w-full text-left px-6 py-3 transition-colors font-medium text-[#212121] hover:bg-gray-50 border-b border-gray-100"
                        onClick={() => setIsTopSellerOpen(false)}
                      >
                        Men Top Seller
                      </Link>
                      <Link
                        href="/sale/women"
                        className="block w-full text-left px-6 py-3 transition-colors font-medium text-[#212121] hover:bg-gray-50"
                        onClick={() => setIsTopSellerOpen(false)}
                      >
                        Women Top Seller
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </nav>

          {/* Search and Icons */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6e6e6e] h-4 w-4" />
                <Input
                  type="search"
                  placeholder="What are you looking for to..."
                  className="pl-10 pr-4 w-80 bg-white text-[#212121] border-none rounded-md h-10 placeholder:text-[#6e6e6e]"
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
                  onBlur={() => setTimeout(() => setIsSearchDropdownOpen(false), 200)} // Delay to allow click
                  onFocus={() => searchQuery && setSearchResults.length > 0 && setIsSearchDropdownOpen(true)}
                />
                {/* Search Suggestions Dropdown */}
                {isSearchDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white shadow-lg rounded-md overflow-hidden z-50">
                    {isSearchLoading ? (
                      <div className="p-4 text-center text-gray-500">Loading...</div>
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
                      <div className="p-4 text-center text-gray-500">No products found.</div>
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
                href="/"
                className={`transition-colors font-medium tracking-wide uppercase text-sm ${
                  isActivePath("/") ? "text-[#cbf26c]" : "text-white hover:text-[#cbf26c]"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                HOME
              </Link>
              <Link
                href="/collection"
                className={`transition-colors font-medium tracking-wide uppercase text-sm ${
                  isActivePath("/collection") ? "text-[#cbf26c]" : "text-white hover:text-[#cbf26c]"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                COLLECTION
              </Link>

              {/* Mobile Categories */}
              <div className="space-y-3">
                <Link href="/categories" onClick={() => setIsMenuOpen(false)}>
                  <span className={`font-medium tracking-wide uppercase text-sm ${isActivePath("/categories") ? "text-[#cbf26c]" : "text-white"}`}>
                    CATEGORIES
                  </span>
                </Link>
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

              {/* Mobile Sale */}
              <Link
                href="/sale"
                className={`transition-colors font-medium tracking-wide uppercase text-sm ${
                  isActivePath("/sale") ? "text-[#cbf26c]" : "text-white hover:text-[#cbf26c]"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                SALE
              </Link>

              {/* ADDED: Mobile Top Sellers */}
              <div className="space-y-3">
                <span
                  className={`font-medium tracking-wide uppercase text-sm text-white`}
                >
                  TOP SELLERS
                </span>
                <div className="pl-4 space-y-2">
                  <Link
                    href="/sale/men"
                    className="block text-white hover:text-[#cbf26c] transition-colors text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Men Top Seller
                  </Link>
                  <Link
                    href="/sale/women"
                    className="block text-white hover:text-[#cbf26c] transition-colors text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Women Top Seller
                  </Link>
                </div>
              </div>
              
              {/* Mobile Search */}
              <div className="pt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6e6e6e] h-4 w-4" />
                  <Input
                    type="search"
                    placeholder="What are you looking for to..."
                    className="pl-10 bg-white text-[#212121] border-none rounded-md h-10 placeholder:text-[#6e6e6e]"
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
                  {/* Mobile Search Suggestions Dropdown */}
                  {isSearchDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white shadow-lg rounded-md overflow-hidden z-50">
                      {isSearchLoading ? (
                        <div className="p-4 text-center text-gray-500">Loading...</div>
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
                      ) : <div className="p-4 text-center text-gray-500">No products found.</div>}
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Utility Links */}
              <div className="pt-4 border-t border-[#141619] space-y-4">
                {user ? (
                  <>
                    <span className="text-[#d9d9d9] text-sm flex items-center">
                      <User className="h-3 w-3 mr-2" />
                      {user.firstName || user.name || user.email}
                    </span>
                    <Link
                      href="/profile"
                      className="text-[#d9d9d9] hover:text-white transition-colors text-sm flex items-center"
                    >
                      <User className="h-3 w-3 mr-2" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-[#d9d9d9] hover:text-white transition-colors text-sm flex items-center w-full text-left"
                    >
                      <LogOut className="h-3 w-3 mr-2" />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="text-[#d9d9d9] hover:text-white transition-colors text-sm flex items-center"
                  >
                    <User className="h-3 w-3 mr-2" />
                    Login
                  </Link>
                )}
                <Link href="/help" className="text-[#d9d9d9] hover:text-white transition-colors text-sm">
                  Help
                </Link>
                <Link href="/blog" className="text-[#d9d9d9] hover:text-white transition-colors text-sm">
                  Blog
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}