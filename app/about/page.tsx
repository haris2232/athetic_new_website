"use client"

import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Header and Footer Imports
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

const HERO_IMAGE_PATH = "/images/about-new.png" 

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://athlekt.com/backendnew/api';

export default function AboutUs() {
  // MOVE WITH US section state variables
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [carouselImages, setCarouselImages] = useState<string[]>([])
  const [loadingCarouselImages, setLoadingCarouselImages] = useState(true)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
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

  // Prevent body scroll when lightbox open
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

  // Keyboard navigation for lightbox
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

  // Carousel scrolling functions
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

  // Auto-scroll effect for carousel
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
    }, 4000) // Auto-scroll every 4 seconds

    return () => clearInterval(interval)
  }, [currentCarouselIndex, carouselImages.length, isCarouselHovered])

  // Fetch carousel images from API for MOVE WITH US section
  useEffect(() => {
    const fetchCarouselImages = async () => {
      try {
        setLoadingCarouselImages(true)
        const response = await fetch(`${API_BASE_URL}/carousel-images/public/active`)
        if (response.ok) {
          const data = await response.json()
          if (data.success && Array.isArray(data.data)) {
            // Sort by order and extract image URLs
            const sortedImages = data.data
              .sort((a: any, b: any) => a.order - b.order)
              .map((img: any) => img.imageUrl)
            setCarouselImages(sortedImages)
          }
        } else {
          // Fallback to static images if API fails
          setCarouselImages(["/10.png", "/11.png", "/12.png", "/13.png"])
        }
      } catch (error) {
        console.error('Failed to fetch carousel images:', error)
        // Fallback to static images on error
        setCarouselImages(["/10.png", "/11.png", "/12.png", "/13.png"])
      } finally {
        setLoadingCarouselImages(false)
      }
    }
    fetchCarouselImages()
  }, [])

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      
      {/* Header Component */}
      <Header />

      {/* Main Content Section */}
      <main className="flex-grow">
        
        {/* Image Section at Top - Updated for mobile responsiveness */}
        <div className="relative w-full h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] overflow-hidden bg-gray-100 mt-4">
          <div className="h-full w-full">
            <Image
              src={HERO_IMAGE_PATH}
              alt="About Athlekt"
              fill
              className="object-cover sm:object-contain"
              priority
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-white">
          
          {/* Header */}
          <div className="text-left mb-8 sm:mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              ABOUT ATHLEKT
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl">
              Redefining activewear for every body, every day
            </p>
          </div>

          {/* Brand Mission Paragraphs */}
          <div className="mx-auto space-y-6 sm:space-y-8 ">
            <p className="text-base sm:text-lg leading-relaxed text-left">
              <strong className="font-semibold">Athlekt</strong> is a UAE-born athleisure brand redefining what it means to live an active, balanced lifestyle for <strong className="font-semibold">every body and everyone, everywhere</strong>. Created for parents, professionals, and fitness enthusiasts alike, Athlekt celebrates movement in all its forms from school, office runs to gym runs, from studio sessions to weekend adventures.
            </p>

            <p className="text-base sm:text-lg leading-relaxed text-left">
              Built on the belief that <strong className="font-semibold">movement should be accessible, enjoyable, and body-positive</strong>, Athlekt designs performance-driven apparel that empowers everyone specially mums, dads, and fitness enthusiasts alike to show up for themselves with confidence and comfort. Whether you&apos;re sculpted, curvy, or somewhere in between, <strong className="font-semibold">our pieces are designed to fit your body, your life, and your rhythm</strong>.
            </p>

            <p className="text-base sm:text-lg leading-relaxed text-left">
              Our design philosophy focuses on thoughtful details: from flattering fits for dad bods to inclusive sizing that supports breastfeeding mums, and performance cuts that complement athletic builds. Every stitch and fabric choice is crafted for <strong className="font-semibold">real comfort, real movement, and real confidence</strong>.
            </p>

            <p className="text-base sm:text-lg leading-relaxed text-left">
              Rooted in <strong className="font-semibold">function</strong>, driven by <strong className="font-semibold">community</strong>, and inspired by <strong className="font-semibold">real people</strong>, Athlekt is more than activewear it&apos;s a <strong className="font-semibold">global movement for every body</strong> that believes feeling good and moving freely should belong to all.
            </p>

            <p className="text-base sm:text-lg leading-relaxed text-left">
              Our end goal is to <strong className="font-semibold">promote wellness and longevity</strong>, inspiring everyone to embrace a healthier, more balanced lifestyle.
            </p>

            {/* Contact Information */}
            <div className="text-left pt-6 sm:pt-8 border-t border-gray-200">
              <p className="text-base sm:text-lg">
                To know more or if you have any questions, feel free to reach us at <a href="mailto:info@athlekt.com" className="text-blue-600 hover:text-blue-800 font-semibold">info@athlekt.com</a>
              </p>
            </div>
          </div>
        
        </div>

        {/* MOVE WITH US Section */}
        <section className="bg-white text-[#212121] pt-0 pb-12 sm:pb-20 mt-8 sm:mt-12">
          <div className="container mx-auto px-4 sm:px-6 max-w-[1250px]">
            {/* Heading and Subtitle */}
            <div className="mb-6 sm:mb-8">
              <h1 
                className="uppercase mb-4 sm:mb-6 text-black leading-none text-left"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontWeight: 400,
                  fontSize: 'clamp(32px, 5vw, 90px)',
                  letterSpacing: 'clamp(-1.5px, -0.23vw, -3.37px)'
                }}
              >
                MOVE WITH US
              </h1>
              <p 
                className="text-black text-left leading-normal"
                style={{
                  fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                  fontSize: 'clamp(14px, 1.5vw, 18px)',
                  letterSpacing: '0px',
                  fontWeight: 500,
                  marginTop: '2px'
                }}
              >
                Real athletes, real movement. Tag us @Athlekt to be featured.
              </p>
            </div>

            {/* Image Carousel with Auto Scroll */}
            <div className="relative">
              {/* Navigation Arrows */}
              <button
                onClick={() => scrollCarousel('left')}
                className="absolute top-1/2 -translate-y-1/2 z-10 rounded-full border border-black bg-white flex items-center justify-center transition-colors hover:bg-gray-100"
                style={{
                  left: '-8px sm:-12px',
                  width: 'clamp(28px, 3.5vw, 48px)',
                  height: 'clamp(28px, 3.5vw, 48px)',
                  border: '1px solid #000000',
                  backgroundColor: '#FFFFFF'
                }}
                aria-label="Previous image"
              >
                <ChevronLeft className="text-black" style={{ width: 'clamp(14px, 1.8vw, 24px)', height: 'clamp(14px, 1.8vw, 24px)' }} />
              </button>
              <button
                onClick={() => scrollCarousel('right')}
                className="absolute top-1/2 -translate-y-1/2 z-10 rounded-full border border-black bg-white flex items-center justify-center transition-colors hover:bg-gray-100"
                style={{
                  right: '-8px sm:-12px',
                  width: 'clamp(28px, 3.5vw, 48px)',
                  height: 'clamp(28px, 3.5vw, 48px)',
                  border: '1px solid #000000',
                  backgroundColor: '#FFFFFF'
                }}
                aria-label="Next image"
              >
                <ChevronRight className="text-black" style={{ width: 'clamp(14px, 1.8vw, 24px)', height: 'clamp(14px, 1.8vw, 24px)' }} />
              </button>

              {/* Carousel Container */}
              {loadingCarouselImages ? (
                <div className="flex justify-start items-center gap-3 sm:gap-4 md:gap-6 px-2 sm:px-4" style={{
                  minHeight: 'clamp(200px, 28vw, 380px)',
                  overflowX: 'auto'
                }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-gray-200 animate-pulse rounded-[30px] sm:rounded-[40px] flex-shrink-0" style={{
                      width: 'clamp(140px, 40vw, 240px)',
                      height: 'clamp(200px, 60vw, 380px)'
                    }} />
                  ))}
                </div>
              ) : carouselImages.length > 0 ? (
                <div 
                  ref={carouselRef}
                  className="flex overflow-x-auto scroll-smooth gap-3 sm:gap-4 md:gap-6 px-2 sm:px-4"
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
                        width: 'clamp(140px, 40vw, 240px)',
                        height: 'clamp(200px, 60vw, 380px)',
                        minWidth: '140px',
                        minHeight: '200px'
                      }}
                    >
                      <div
                        className="relative w-full h-full overflow-hidden cursor-pointer transition-transform duration-300 ease-out hover:translate-y-[-8px]"
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: 'clamp(20px, 3vw, 40px)',
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
                            borderRadius: 'clamp(20px, 3vw, 40px)',
                            objectFit: 'cover',
                            objectPosition: 'center top'
                          }}
                          sizes="(max-width: 640px) 140px, (max-width: 768px) 180px, (max-width: 1024px) 220px, 240px"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 px-4">
                  <p className="text-gray-500">No images available at the moment.</p>
                </div>
              )}
            </div>

            {/* Pagination Dots */}
            {!loadingCarouselImages && carouselImages.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentCarouselIndex(index)
                      if (carouselRef.current) {
                        const containerWidth = carouselRef.current.clientWidth
                        const gap = 24
                        const imageWidth = Math.max(140, Math.min(240, containerWidth * 0.4))
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
        
      </main>

      {/* Footer Component */}
      <Footer />
      
    </div>
  )
}