"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function JoinFamily() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form submitted:", formData)
  }

  return (
    <section className="py-20 bg-[#212121]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Form */}
          <div className="bg-[#212121] p-8 lg:p-0 rounded-lg">
            <div className="space-y-8">
              {/* Heading */}
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold text-[#cbf26c] leading-tight uppercase tracking-wide">
                  JOIN THE ATHLEKT FAMILY
                </h2>
                <p className="text-white text-base leading-relaxed">
                  But I Must Explain To You How All This Mistaken Idea Of Denouncing Pleasure And Praising Pain Was
                  Born...
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* First Name */}
                <div>
                  <Input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full h-14 px-4 bg-transparent border border-[#4a4a4a] text-white placeholder:text-[#9a9a9a] focus:border-[#cbf26c] focus:ring-0 rounded-none"
                    required
                  />
                </div>

                {/* Last Name */}
                <div>
                  <Input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full h-14 px-4 bg-transparent border border-[#4a4a4a] text-white placeholder:text-[#9a9a9a] focus:border-[#cbf26c] focus:ring-0 rounded-none"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full h-14 px-4 bg-transparent border border-[#4a4a4a] text-white placeholder:text-[#9a9a9a] focus:border-[#cbf26c] focus:ring-0 rounded-none"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full h-14 px-4 bg-transparent border border-[#4a4a4a] text-white placeholder:text-[#9a9a9a] focus:border-[#cbf26c] focus:ring-0 rounded-none"
                    required
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="bg-[#4a4a4a] text-white hover:bg-[#5a5a5a] font-semibold px-8 py-4 h-auto rounded-none border-l-4 border-[#cbf26c] transition-all duration-300 hover:border-l-[#9fcc3b]"
                  >
                    Send
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-lg">
              <Image
                src="/images/gym-cap.png"
                alt="Young man in black tank top wearing SQUATWOLF cap in gym"
                width={600}
                height={700}
                className="w-full h-[700px] object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
