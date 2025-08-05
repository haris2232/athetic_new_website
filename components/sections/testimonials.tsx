"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Star } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Jack London",
    title: "Writer - New York, USA",
    avatar: "/placeholder.svg?height=80&width=80",
    rating: 5,
    review:
      "Lorem Ipsum Is Simply Dummy Text Of The Printing And Typesetting Industry. Lorem Ipsum Has Been The Industry's Standard Dummy Text Ever Since The 1500s, When An Unknown Printer Took A Galley Of Type And Scrambled It To Make A Type Specimen Book. It Has Survived Not Only Five Centuries, But Also The Leap Into Electronic Typesetting, Remaining Essentially Unchanged.",
  },
  {
    id: 2,
    name: "Sarah Mitchell",
    title: "Fitness Coach - Los Angeles, USA",
    avatar: "/placeholder.svg?height=80&width=80",
    rating: 5,
    review:
      "The quality of Akhlekt's athletic wear is outstanding. The fabric is breathable, durable, and maintains its shape even after intense workouts. I've been recommending these products to all my clients, and they absolutely love the comfort and performance.",
  },
  {
    id: 3,
    name: "Mike Rodriguez",
    title: "Personal Trainer - Miami, USA",
    avatar: "/placeholder.svg?height=80&width=80",
    rating: 5,
    review:
      "As a personal trainer, I need gear that can keep up with my demanding schedule. Akhlekt delivers on every front - style, comfort, and durability. The fit is perfect and the designs are modern and professional.",
  },
]

export default function Testimonials() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      handleTestimonialChange((activeTestimonial + 1) % testimonials.length)
    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [activeTestimonial])

  const handleTestimonialChange = (index: number) => {
    if (index === activeTestimonial) return

    setIsTransitioning(true)

    setTimeout(() => {
      setActiveTestimonial(index)
      setIsTransitioning(false)
    }, 150) // Half of the transition duration
  }

  return (
    <section className="py-20 bg-[#f5f5f5]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Hero Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-lg">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/athletic-man-doing-crossfit-exercises-with-rope-smoky-gym%201-spSvsFDC5fWl4KRSGmcoY22JzYd1a9.png"
                alt="Athletic man doing battle rope exercises in smoky gym"
                width={600}
                height={700}
                className="w-full h-[700px] object-cover"
                priority
              />
            </div>
          </div>

          {/* Right Side - Testimonials Content */}
          <div className="space-y-8">
            {/* Section Headers */}
            <div className="space-y-2">
              <p className="text-sm text-[#6e6e6e] uppercase tracking-wide font-medium">TESTIMONIALS</p>
              <h2 className="text-4xl md:text-5xl font-bold text-[#212121] uppercase tracking-wide">
                WHATS CLIENTS SAY
              </h2>
            </div>

            {/* Active Testimonial with Smooth Transitions */}
            <div className="space-y-6 relative">
              {/* Customer Info */}
              <div
                className={`flex items-center space-x-4 transition-all duration-300 ease-in-out ${
                  isTransitioning ? "opacity-0 transform translate-y-2" : "opacity-100 transform translate-y-0"
                }`}
              >
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src={testimonials[activeTestimonial].avatar || "/placeholder.svg"}
                    alt={testimonials[activeTestimonial].name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#212121]">{testimonials[activeTestimonial].name}</h3>
                  <p className="text-[#6e6e6e]">{testimonials[activeTestimonial].title}</p>
                </div>
                {/* Star Rating */}
                <div className="flex ml-auto">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-[#ffcd05] fill-[#ffcd05]" />
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div
                className={`transition-all duration-300 ease-in-out ${
                  isTransitioning ? "opacity-0 transform translate-y-2" : "opacity-100 transform translate-y-0"
                }`}
              >
                <p className="text-[#6e6e6e] leading-relaxed italic text-lg min-h-[120px]">
                  {testimonials[activeTestimonial].review}
                </p>
              </div>

              {/* Carousel Dots */}
              <div className="flex space-x-3 pt-4">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ease-in-out hover:scale-110 ${
                      index === activeTestimonial ? "bg-[#cbf26c] scale-110" : "bg-[#d9d9d9] hover:bg-[#cbf26c]/50"
                    }`}
                    onClick={() => handleTestimonialChange(index)}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#d9d9d9] rounded-full h-1 mt-4">
                <div
                  className="bg-[#cbf26c] h-1 rounded-full transition-all duration-[5000ms] ease-linear"
                  style={{
                    width: isTransitioning ? "0%" : "100%",
                    animation: isTransitioning ? "none" : "progress 5s linear infinite",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </section>
  )
}
