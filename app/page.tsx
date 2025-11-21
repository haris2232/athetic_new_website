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

// Multiple video source options
const VIDEO_SOURCES = {
  // Primary: Google Drive
  googleDrive: {
    mobile: "https://drive.google.com/uc?export=download&id=1eU46tR8VLwDzb8YDp5W65EX_vS8kjDPt",
    desktop: "https://drive.google.com/uc?export=download&id=1HQyn0erWLAT_rmd7FiDrfpqN4Ub8htHa"
  },
  // Fallback 1: Free CDN videos
  cdn: {
    mobile: "https://assets.mixkit.co/videos/preview/mixkit-woman-training-with-dumbbells-39875-large.mp4",
    desktop: "https://assets.mixkit.co/videos/preview/mixkit-man-running-on-a-treadmill-39876-large.mp4"
  },
  // Fallback 2: Local videos
  local: {
    mobile: "/video/move-mob-com.mp4",
    desktop: "/video/move-desk-com.mp4"
  }
};

export default function HomePage() {
  // ... (sabhi existing state variables same rahenge)
  
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const [mobileVideoLoaded, setMobileVideoLoaded] = useState(false);
  const [desktopVideoLoaded, setDesktopVideoLoaded] = useState(false);
  const [currentSource, setCurrentSource] = useState<'googleDrive' | 'cdn' | 'local'>('googleDrive');
  const [showFallbackImage, setShowFallbackImage] = useState(false);

  // SMART VIDEO LOADING with multiple fallbacks
  useEffect(() => {
    console.log('🎬 SMART VIDEO LOADING STARTED...');
    
    const loadVideoWithFallback = async (videoElement: HTMLVideoElement, isMobile: boolean) => {
      const sources = [
        VIDEO_SOURCES.googleDrive[isMobile ? 'mobile' : 'desktop'],
        VIDEO_SOURCES.cdn[isMobile ? 'mobile' : 'desktop'],
        VIDEO_SOURCES.local[isMobile ? 'mobile' : 'desktop']
      ];

      for (let i = 0; i < sources.length; i++) {
        try {
          console.log(`🔄 Trying source ${i + 1}: ${sources[i]}`);
          videoElement.src = sources[i];
          
          // Wait for video to load
          await new Promise((resolve, reject) => {
            const onLoad = () => {
              videoElement.removeEventListener('loadeddata', onLoad);
              videoElement.removeEventListener('error', onError);
              resolve(true);
            };
            
            const onError = () => {
              videoElement.removeEventListener('loadeddata', onLoad);
              videoElement.removeEventListener('error', onError);
              reject(new Error('Video load failed'));
            };
            
            videoElement.addEventListener('loadeddata', onLoad);
            videoElement.addEventListener('error', onError);
            
            // Timeout after 5 seconds
            setTimeout(() => {
              videoElement.removeEventListener('loadeddata', onLoad);
              videoElement.removeEventListener('error', onError);
              reject(new Error('Timeout'));
            }, 5000);
          });

          // Try to play
          await videoElement.play();
          
          console.log(`✅ Success with source ${i + 1}`);
          setCurrentSource(i === 0 ? 'googleDrive' : i === 1 ? 'cdn' : 'local');
          return true;
          
        } catch (error) {
          console.log(`❌ Failed with source ${i + 1}:`, error);
          continue;
        }
      }
      
      // All sources failed
      console.log('❌ All video sources failed');
      return false;
    };

    const initializeVideos = async () => {
      try {
        // Load mobile video
        if (mobileVideoRef.current) {
          const mobileSuccess = await loadVideoWithFallback(mobileVideoRef.current, true);
          if (mobileSuccess) {
            setMobileVideoLoaded(true);
          }
        }

        // Load desktop video
        if (desktopVideoRef.current) {
          const desktopSuccess = await loadVideoWithFallback(desktopVideoRef.current, false);
          if (desktopSuccess) {
            setDesktopVideoLoaded(true);
          }
        }

        // If both failed, show fallback image
        if (!mobileVideoLoaded && !desktopVideoLoaded) {
          setTimeout(() => {
            if (!mobileVideoLoaded && !desktopVideoLoaded) {
              setShowFallbackImage(true);
            }
          }, 8000);
        }

      } catch (error) {
        console.log('❌ Video initialization failed:', error);
        setShowFallbackImage(true);
      }
    };

    initializeVideos();

  }, []);

  // Manual play function
  const handleManualPlay = () => {
    if (mobileVideoRef.current) {
      mobileVideoRef.current.play().catch(e => {
        console.log('Manual play failed:', e);
      });
    }
    if (desktopVideoRef.current) {
      desktopVideoRef.current.play().catch(e => {
        console.log('Manual play failed:', e);
      });
    }
  };

  // Get source badge text
  const getSourceBadge = () => {
    switch(currentSource) {
      case 'googleDrive': return 'Google Drive';
      case 'cdn': return 'CDN';
      case 'local': return 'Local';
      default: return 'Loading...';
    }
  };

  // ... (sabhi existing functions same rahenge)

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />
      
      {/* Section 1: SMART VIDEO SECTION */}
      <section className="relative w-full overflow-x-hidden">
        {/* Top Black Bar */}
        <div className="w-full h-3 bg-black"></div>
        
        {/* Hero Box - SMART VIDEO LOADING */}
        <div className="bg-white relative w-full overflow-hidden mx-auto"
          style={{
            marginTop: 'clamp(1rem, 3vw, 2.5rem)',
            width: '100%',
            maxWidth: '100%',
            height: 'clamp(300px, 70vh, 700px)',
          }}
        >
          {/* Source Indicator */}
          <div className={`absolute top-4 left-4 z-20 px-3 py-1 rounded-full text-xs font-medium ${
            currentSource === 'googleDrive' ? 'bg-green-500 text-white' :
            currentSource === 'cdn' ? 'bg-blue-500 text-white' :
            'bg-yellow-500 text-black'
          }`}>
            {getSourceBadge()}
          </div>

          {/* FALLBACK IMAGE - If all videos fail */}
          {showFallbackImage ? (
            <div className="w-full h-full bg-cover bg-center flex items-center justify-center"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=800&fit=crop')"
              }}
            >
              <div className="text-center text-white bg-black/50 p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">MOVE WITH PURPOSE</h2>
                <p>Premium Activewear for Everyday Athletes</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-white text-black px-4 py-2 rounded"
                >
                  Retry Videos
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Video */}
              <div className="block md:hidden w-full h-full relative">
                <video
                  ref={mobileVideoRef}
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover"
                  style={{
                    objectFit: 'contain',
                    objectPosition: 'center center',
                  }}
                  onLoadedData={() => setMobileVideoLoaded(true)}
                >
                  Your browser does not support the video tag.
                </video>
                
                {/* Loading State */}
                {!mobileVideoLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-3"></div>
                    <p className="text-sm mb-2">Loading video...</p>
                    <p className="text-xs text-gray-300">Trying multiple sources</p>
                    <button 
                      onClick={handleManualPlay}
                      className="mt-3 bg-white text-black px-3 py-1 rounded text-xs"
                    >
                      Tap to Play
                    </button>
                  </div>
                )}
              </div>
              
              {/* Desktop Video */}
              <div className="hidden md:block w-full h-full relative">
                <video
                  ref={desktopVideoRef}
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover"
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'center center',
                  }}
                  onLoadedData={() => setDesktopVideoLoaded(true)}
                >
                  Your browser does not support the video tag.
                </video>

                {/* Loading State */}
                {!desktopVideoLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-3"></div>
                    <p className="text-sm mb-2">Loading video...</p>
                    <p className="text-xs text-gray-300">Trying multiple sources</p>
                    <button 
                      onClick={handleManualPlay}
                      className="mt-3 bg-white text-black px-3 py-1 rounded text-xs"
                    >
                      Click to Play
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ... (Baki sab sections exactly same) */}

      <Footer />
    </div>
  )
}