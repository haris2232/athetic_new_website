"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { submitForm, FormSubmission } from "@/lib/api"

export default function JoinFamily() {
  const [formData, setFormData] = useState<FormSubmission>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const response = await submitForm(formData)
      
      if (response.success) {
        setSubmitMessage('Thank you for joining the Athlekt family! Check your email for a welcome message.')
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: ''
        })
      } else {
        setSubmitMessage(response.message || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitMessage('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Form */}
          <div className="bg-gray-100 p-8 lg:p-12 rounded-lg">
            <div className="space-y-8">
              {/* Heading */}
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold text-[#ebff00] leading-tight uppercase tracking-wide">
                  JOIN THE ATHLEKT FAMILY
                </h2>
                <p className="text-black text-base leading-relaxed">
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
                    className="w-full h-14 px-4 bg-transparent border border-gray-300 text-black placeholder:text-gray-500 focus:border-[#ebff00] focus:ring-0 rounded-lg"
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
                    className="w-full h-14 px-4 bg-transparent border border-gray-300 text-black placeholder:text-gray-500 focus:border-[#ebff00] focus:ring-0 rounded-lg"
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
                    className="w-full h-14 px-4 bg-transparent border border-gray-300 text-black placeholder:text-gray-500 focus:border-[#ebff00] focus:ring-0 rounded-lg"
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
                    className="w-full h-14 px-4 bg-transparent border border-gray-300 text-black placeholder:text-gray-500 focus:border-[#ebff00] focus:ring-0 rounded-lg"
                    required
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#ebff00] text-black hover:bg-opacity-80 font-semibold px-8 py-4 h-auto rounded-lg border-l-4 border-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending...' : 'Send'}
                  </Button>
                </div>

                {/* Success/Error Message */}
                {submitMessage && (
                  <div className={`text-sm ${submitMessage.includes('Thank you') ? 'text-green-600' : 'text-red-500'}`}>
                    {submitMessage}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-lg">
              <Image
                src="\images\menbanner.png"
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
