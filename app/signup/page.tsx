"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

export default function SignupPage() {
  const [step, setStep] = useState(1) // 1: complete form, 2: OTP verification
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    password: "",
    marketingOptIn: false,
    otp: ""
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // First send OTP
      const otpResponse = await fetch("https://athlekt.com/backendnew/api/auth/send-signup-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      })

      const otpData = await otpResponse.json()

      if (!otpResponse.ok) {
        throw new Error(otpData.message || "Failed to send OTP")
      }

      setSuccess("OTP sent to your email successfully! Please check your inbox.")
      setStep(2)
    } catch (err: any) {
      setError(err.message || "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }


  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("https://athlekt.com/backendnew/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Signup failed")
      }

      setSuccess("Account created successfully! You can now login.")
      setTimeout(() => {
        window.location.href = "/login"
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1013] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white uppercase mb-2">
            ATHLEKT SIGNUP
          </h1>
          <p className="text-[#d9d9d9] text-sm">
            {step === 1 && "Create your account with all details"}
            {step === 2 && "Enter OTP sent to your email to complete registration"}
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Step 1: Complete Signup Form */}
        {step === 1 && (
          <form onSubmit={handleSubmitForm} className="space-y-4">
            {/* First Name */}
            <div>
              <Input
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="w-full bg-[#141619] border border-white text-white placeholder:text-[#6e6e6e] h-12 px-4"
                disabled={loading}
              />
            </div>

            {/* Last Name */}
            <div>
              <Input
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="w-full bg-[#141619] border border-white text-white placeholder:text-[#6e6e6e] h-12 px-4"
                disabled={loading}
              />
            </div>

            {/* Date of Birth */}
            <div>
              <Input
                type="date"
                placeholder="Date of Birth"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                className="w-full bg-[#141619] border border-white text-white placeholder:text-[#6e6e6e] h-12 px-4"
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div>
              <Input
                type="email"
                placeholder="Email address*"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full bg-[#141619] border border-white text-white placeholder:text-[#6e6e6e] h-12 px-4"
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password*"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full bg-[#141619] border border-white text-white placeholder:text-[#6e6e6e] h-12 px-4 pr-12"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6e6e6e] hover:text-white"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Marketing Opt-in */}
            <div className="flex items-start space-x-3 pt-2">
              <Checkbox
                id="marketing"
                checked={formData.marketingOptIn}
                onCheckedChange={(checked) => handleInputChange("marketingOptIn", checked as boolean)}
                className="mt-1"
                disabled={loading}
              />
              <label htmlFor="marketing" className="text-sm text-[#d9d9d9] leading-relaxed">
                Tick here to receive email about our products, app, sales, exclusive content and more. See our{" "}
                <Link href="/privacy-policy" className="font-bold text-white hover:text-[#cbf26c]">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Form Button */}
            <Button
              type="submit"
              className="w-full bg-white text-[#212121] font-bold uppercase py-3 rounded-md hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              {loading ? "SENDING OTP..." : "SUBMIT & SEND OTP"}
            </Button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Enter OTP*"
                value={formData.otp}
                onChange={(e) => handleInputChange("otp", e.target.value)}
                className="w-full bg-[#141619] border border-white text-white placeholder:text-[#6e6e6e] h-12 px-4"
                required
                disabled={loading}
                maxLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-white text-[#212121] font-bold uppercase py-3 rounded-md hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              {loading ? "VERIFYING..." : "VERIFY OTP & CREATE ACCOUNT"}
            </Button>
          </form>
        )}



        {/* Sign In Link */}
        <div className="text-center mt-6">
          <p className="text-[#d9d9d9] text-sm">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-white hover:text-[#cbf26c]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 