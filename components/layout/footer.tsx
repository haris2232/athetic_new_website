"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Footer() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("You are successfully subscribed!")
    setEmail("")
  }

  return (
    <footer className="bg-black text-white py-16 px-6 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* TOP SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Left: Ready to Move */}
          <div>
            <h2
              className="text-[48px] md:text-[56px] leading-none font-bold mb-4"
              style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.5px' }}
            >
              READY TO MOVE?
            </h2>
            <p className="text-lg text-[#d9d9d9] font-medium">
              Explore our collections and find your next gear
            </p>
          </div>

          {/* Middle: Categories + Customer Services */}
          <div className="flex justify-between">
            <div>
              <h4 className="text-sm font-semibold mb-4 text-[#cbf26c] uppercase tracking-wide">Categories</h4>
              <ul className="space-y-3 text-[#d9d9d9] text-sm">
                <li>
                  <Link href="/" className="hover:text-[#cbf26c] transition">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/categories?gender=men" className="hover:text-[#cbf26c] transition">
                    Men
                  </Link>
                </li>
                <li>
                  <Link href="/categories?gender=women" className="hover:text-[#cbf26c] transition">
                    Women
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4 text-[#cbf26c] uppercase tracking-wide">
                Customer Services
              </h4>
              <ul className="space-y-3 text-[#d9d9d9] text-sm">
                <li>
                  <Link href="/shipping-policy" className="hover:text-[#cbf26c] transition">
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link href="/refund-policy" className="hover:text-[#cbf26c] transition">
                    Refund Policy
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="hover:text-[#cbf26c] transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-[#cbf26c] transition">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Stay in the Loop */}
          <div>
            <h2
              className="text-[36px] leading-none font-bold mb-4"
              style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.5px' }}
            >
              STAY IN THE LOOP
            </h2>
            <p className="text-[#d9d9d9] text-sm leading-relaxed mb-6">
              Early access to{" "}
              <span className="text-[#cbf26c] font-semibold">new drops</span>,{" "}
              <span className="text-[#cbf26c] font-semibold">member only offers</span>, and{" "}
              <span className="text-[#cbf26c] font-semibold">performance tips</span>
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2">
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-transparent border border-[#6e6e6e] rounded-full px-4 py-2 text-white placeholder:text-[#b5b5b5] w-full sm:w-[260px]"
              />
              <Button
                type="submit"
                className="rounded-full bg-[#cbf26c] hover:bg-[#a8e534] text-black px-6 py-2 font-semibold transition"
              >
                Subscribe
              </Button>
            </form>
            {message && <p className="text-[#cbf26c] text-sm mt-2">{message}</p>}
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="mt-20 flex justify-start">
          <div className="flex flex-col items-start">
            <div className="flex items-center space-x-2 mb-4">
              {/* ✅ Logo with proper proportions */}
              <img
                src="/logos.png"
                alt="Athlekt"
                className="h-10 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
