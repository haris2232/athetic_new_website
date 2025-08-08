"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1) // 1: email, 2: OTP, 3: new password
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("https://athlekt.com/backendnew/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to send OTP")
      }

      setSuccess("OTP sent to your email successfully!")
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

      const response = await fetch("https://athlekt.com/backendnew/api/auth/reset-password", {

        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password")
      }

      setSuccess("Password reset successful! You can now login with your new password.")
      setStep(3)
    } catch (err: any) {
      setError(err.message || "Failed to reset password")
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
            FORGOT PASSWORD
          </h1>
          <p className="text-[#d9d9d9] text-sm">
            {step === 1 && "Enter your email to receive a reset code"}
            {step === 2 && "Enter the OTP sent to your email"}
            {step === 3 && "Password reset successful"}
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

        {/* Step 1: Email Input */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-4">
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

            <Button
              type="submit"
              className="w-full bg-white text-[#212121] font-bold uppercase py-3 rounded-md hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              {loading ? "SENDING..." : "SEND OTP"}
            </Button>
          </form>
        )}

        {/* Step 2: OTP and New Password */}
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

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="New Password*"
                value={formData.newPassword}
                onChange={(e) => handleInputChange("newPassword", e.target.value)}
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

            <Button
              type="submit"
              className="w-full bg-white text-[#212121] font-bold uppercase py-3 rounded-md hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              {loading ? "RESETTING..." : "RESET PASSWORD"}
            </Button>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="text-center">
            <Button
              onClick={() => window.location.href = "/login"}
              className="w-full bg-white text-[#212121] font-bold uppercase py-3 rounded-md hover:bg-gray-100 transition-colors"
            >
              GO TO LOGIN
            </Button>
          </div>
        )}

        {/* Back to Login Link */}
        <div className="text-center mt-6">
          <p className="text-[#d9d9d9] text-sm">
            Remember your password?{" "}
            <Link href="/login" className="font-bold text-white hover:text-[#cbf26c]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 