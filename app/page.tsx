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

// CLOUDINARY URLs - Ye work karenge!
const CLOUDINARY_URLS = {
  mobile: "https://res.cloudinary.com/dyfbyr8ym/video/upload/v1763752349/top-banner-mob_bu0u09.mp4",
  desktop: "https://res.cloudinary.com/dyfbyr8ym/video/upload/v1763752331/move-desk-com_vs2gte.mp4"
};

export default function HomePage() {
  // ... (sabhi existing state variables same rahenge)
  
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const [mobileVideoLoaded, setMobileVideoLoaded] = useState(false);
  const [desktopVideoLoaded, setDesktopVideoLoaded] = useState(false);

  // CLOUDINARY AUTO-PLAY - Ye pakka chalegi!
  useEffect(() => {
    console.log('🚀 CLOUDINARY AUTO-PLAY STARTING...');
    
    const playVideos = () => {
      // Mobile video
      if (mobileVideoRef.current) {
        const mobileVideo = mobileVideoRef.current;
        mobileVideo.src = CLOUDINARY_URLS.mobile;
        console.log('📱 Mobile video loading from Cloudinary...');
        
        mobileVideo.play().then(() => {
          console.log('✅ Mobile video playing successfully');
          setMobileVideoLoaded(true);
        }).catch(e => {
          console.log('❌ Mobile auto-play failed:', e);
        });
      }

      // Desktop video  
      if (desktopVideoRef.current) {
        const desktopVideo = desktopVideoRef.current;
        desktopVideo.src = CLOUDINARY_URLS.desktop;
        console.log('🖥️ Desktop video loading from Cloudinary...');
        
        desktopVideo.play().then(() => {
          console.log('✅ Desktop video playing successfully');
          setDesktopVideoLoaded(true);
        }).catch(e => {
          console.log('❌ Desktop auto-play failed:', e);
        });
      }
    };

    // Immediate play
    playVideos();

    // Retry after 1 second
    const retryTimer = setTimeout(playVideos, 1000);

    return () => clearTimeout(retryTimer);
  }, []);

  // ... (sabhi existing functions same rahenge)

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />
      
      {/* Section 1: CLOUDINARY VIDEO SECTION */}
      <section className="relative w-full overflow-x-hidden">
        {/* Top Black Bar */}
        <div className="w-full h-3 bg-black"></div>
        
        {/* Hero Box - CLOUDINARY VIDEOS */}
        <div className="bg-white relative w-full overflow-hidden mx-auto"
          style={{
            marginTop: 'clamp(1rem, 3vw, 2.5rem)',
            width: '100%',
            maxWidth: '100%',
            height: 'clamp(300px, 70vh, 700px)',
          }}
        >
          {/* Cloudinary Badge */}
          <div className="absolute top-4 left-4 z-20 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            Cloudinary ✓
          </div>

          {/* Mobile Video - CLOUDINARY */}
          <div className="block md:hidden w-full h-full">
            <video
              ref={mobileVideoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
              style={{
                objectFit: 'contain',
                objectPosition: 'center center',
              }}
              onLoadedData={() => {
                console.log('📱 Mobile video loaded');
                setMobileVideoLoaded(true);
              }}
              onError={(e) => console.log('📱 Mobile video error:', e)}
            >
              Your browser does not support the video tag.
            </video>
          </div>
          
          {/* Desktop Video - CLOUDINARY */}
          <div className="hidden md:block w-full h-full">
            <video
              ref={desktopVideoRef}
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
              onLoadedData={() => {
                console.log('🖥️ Desktop video loaded');
                setDesktopVideoLoaded(true);
              }}
              onError={(e) => console.log('🖥️ Desktop video error:', e)}
            >
              Your browser does not support the video tag.
            </video>
          </div>
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

          {/* ... (Baki sab sections exactly same) */}

        </div>
      </section>

      {/* ... (All other sections remain exactly the same) */}

      <Footer />
    </div>
  )
}