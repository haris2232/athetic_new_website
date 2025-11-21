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

// SIRF GOOGLE DRIVE
const GOOGLE_DRIVE_URLS = {
  mobile: "https://drive.google.com/uc?export=download&id=1eU46tR8VLwDzb8YDp5W65EX_vS8kjDPt",
  desktop: "https://drive.google.com/uc?export=download&id=1HQyn0erWLAT_rmd7FiDrfpqN4Ub8htHa"
};

export default function HomePage() {
  // ... (sabhi existing state variables same)
  
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);

  // GOOGLE DRIVE AUTO-PLAY - No buttons, no controls
  useEffect(() => {
    console.log('🚀 GOOGLE DRIVE AUTO-PLAY...');
    
    const playVideos = () => {
      // Mobile video
      if (mobileVideoRef.current) {
        const mobileVideo = mobileVideoRef.current;
        mobileVideo.src = GOOGLE_DRIVE_URLS.mobile;
        mobileVideo.controls = false; // No controls
        mobileVideo.play().catch(e => {
          console.log('Mobile auto-play failed');
        });
      }

      // Desktop video  
      if (desktopVideoRef.current) {
        const desktopVideo = desktopVideoRef.current;
        desktopVideo.src = GOOGLE_DRIVE_URLS.desktop;
        desktopVideo.controls = false; // No controls
        desktopVideo.play().catch(e => {
          console.log('Desktop auto-play failed');
        });
      }
    };

    // Immediate play
    playVideos();

  }, []);

  // ... (sabhi existing functions same)

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />
      
      {/* Section 1: PURE AUTO-PLAY - NO CONTROLS */}
      <section className="relative w-full overflow-x-hidden">
        {/* Top Black Bar */}
        <div className="w-full h-3 bg-black"></div>
        
        {/* Hero Box - CLEAN VIDEO */}
        <div className="bg-white relative w-full overflow-hidden mx-auto"
          style={{
            marginTop: 'clamp(1rem, 3vw, 2.5rem)',
            width: '100%',
            maxWidth: '100%',
            height: 'clamp(300px, 70vh, 700px)',
          }}
        >
          {/* Mobile Video - NO CONTROLS */}
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
            >
              Your browser does not support the video tag.
            </video>
          </div>
          
          {/* Desktop Video - NO CONTROLS */}
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
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* ... (Baki sab sections exactly same) */}

      <Footer />
    </div>
  )
}