"use client"

import { useEffect, useState } from "react"
import dynamic from 'next/dynamic'

// Header ko bhi dynamic import karein
const Header = dynamic(() => import('@/components/layout/header'), { ssr: true })
const Footer = dynamic(() => import('@/components/layout/footer'), { ssr: true })

// Video section ko completely client-side banayein
const VideoSection = () => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <section className="relative w-full overflow-x-hidden">
        <div className="w-full h-3 bg-black"></div>
        <div className="bg-gray-200 w-full" style={{ height: 'clamp(300px, 70vh, 700px)', marginTop: 'clamp(1rem, 3vw, 2.5rem)' }} />
      </section>
    )
  }

  return (
    <section className="relative w-full overflow-x-hidden">
      <div className="w-full h-3 bg-black"></div>
      <div className="bg-white relative w-full overflow-hidden mx-auto"
        style={{
          marginTop: 'clamp(1rem, 3vw, 2.5rem)',
          height: 'clamp(300px, 70vh, 700px)',
        }}
      >
        {/* Simple image as fallback */}
        <div className="block md:hidden w-full h-full bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-2">ATHLEKT</h3>
            <p className="text-gray-600">Performance Activewear</p>
          </div>
        </div>
        
        <div className="hidden md:block w-full h-full bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">ATHLEKT</h3>
            <p className="text-gray-600">Designed for Movement</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-gray-200 w-full h-16"></div>
        {/* Loading skeleton */}
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-64 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />
      <VideoSection />
      
      {/* Rest of your sections - make sure they don't use window or document directly */}
      {/* ... */}
      
      <Footer />
    </div>
  )
}