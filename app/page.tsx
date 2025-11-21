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

// ... (sabhi interfaces yahi rahenge - HomepageSettings, Product, Bundle, Category, Blog)

export default function HomePage() {
  // ... (sabhi existing state variables)

  // INSTANT PLAY Video refs
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const [mobileVideoReady, setMobileVideoReady] = useState(false);
  const [desktopVideoReady, setDesktopVideoReady] = useState(false);

  // INSTANT PLAY Effect - Ultra Fast
  useEffect(() => {
    console.log('🎬 INSTANT PLAY initializing...');
    
    const playVideos = () => {
      console.log('🎬 Playing videos instantly...');
      
      // Mobile video
      if (mobileVideoRef.current) {
        mobileVideoRef.current.play().then(() => {
          console.log('📱 Mobile video playing');
          setMobileVideoReady(true);
        }).catch(e => {
          console.log('📱 Mobile video play failed:', e);
          // Fallback - show controls
          mobileVideoRef.current!.controls = true;
        });
      }

      // Desktop video  
      if (desktopVideoRef.current) {
        desktopVideoRef.current.play().then(() => {
          console.log('🖥️ Desktop video playing');
          setDesktopVideoReady(true);
        }).catch(e => {
          console.log('🖥️ Desktop video play failed:', e);
          // Fallback - show controls
          desktopVideoRef.current!.controls = true;
        });
      }
    };

    // IMMEDIATE play - no delay
    const timer = setTimeout(playVideos, 50);

    // User interaction se bhi play
    const handleUserInteraction = () => {
      playVideos();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  // Video event handlers for instant feedback
  const handleMobileVideoLoad = () => {
    console.log('📱 Mobile video loaded');
    setMobileVideoReady(true);
  };

  const handleDesktopVideoLoad = () => {
    console.log('🖥️ Desktop video loaded');
    setDesktopVideoReady(true);
  };

  // ... (sabhi existing functions - lightbox, scrolling, etc.)

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />
      
      {/* Section 1: MOVE WITH PURPOSE - ULTRA FAST INSTANT PLAY */}
      <section className="relative w-full overflow-x-hidden">
        {/* Top Black Bar */}
        <div className="w-full h-3 bg-black"></div>
        
        {/* Hero Box - INSTANT PLAY */}
        <div className="bg-white relative w-full overflow-hidden mx-auto"
          style={{
            marginTop: 'clamp(1rem, 3vw, 2.5rem)',
            width: '100%',
            maxWidth: '100%',
            height: 'clamp(300px, 70vh, 700px)',
          }}
        >
          {/* Mobile Video - INSTANT PLAY */}
          <div className="block md:hidden w-full h-full">
            <video
              ref={mobileVideoRef}
              src="/video/move-mob-com.mp4"
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
              onLoadedData={handleMobileVideoLoad}
              onCanPlayThrough={handleMobileVideoLoad}
              onLoadStart={() => console.log('📱 Mobile video loading...')}
            >
              Your browser does not support the video tag.
            </video>
            
            {/* INSTANT Loading State */}
            {!mobileVideoReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-gray-500 text-sm">Loading video...</div>
              </div>
            )}
          </div>
          
          {/* Desktop Video - INSTANT PLAY */}
          <div className="hidden md:block w-full h-full">
            <video
              ref={desktopVideoRef}
              src="/video/move-desk-com.mp4"
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
              onLoadedData={handleDesktopVideoLoad}
              onCanPlayThrough={handleDesktopVideoLoad}
              onLoadStart={() => console.log('🖥️ Desktop video loading...')}
            >
              Your browser does not support the video tag.
            </video>

            {/* INSTANT Loading State */}
            {!desktopVideoReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-gray-500 text-sm">Loading video...</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ... (Baki sab sections exactly same rahenge) */}

      <Footer />
    </div>
  )
}