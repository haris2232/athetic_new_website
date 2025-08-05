import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Truck, RotateCcw, CreditCard, Settings, ShoppingBag, Info, ChevronDown, Flag } from "lucide-react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export default function HelpPage() {
  return (
    <div className="min-h-screen ">
      <Header />
      <div className="relative">
        {/* Background Image - Half Height */}
        <div className="relative h-[60vh] z-0 ">
          <Image
            src="/images/brand-statement.jpg"
            alt="Help Background"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="absolute top-0  right-0 z-20">
            <div className="container mx-auto px-4 py-4">
              <div className="flex justify-end items-center space-x-6 text-white text-sm">
                <button className="hover:text-[#cbf26c] transition-colors">
                  Submit A Request
                </button>
                <div className="flex items-center space-x-2 cursor-pointer hover:text-[#cbf26c] transition-colors">
                  <Flag className="h-4 w-4" />
                  <span>English (United States)</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Top Header */}
          {/* Main Help Section - Overlapping Background */}
          <div className="relative  -mt-[370px]">
            <div className="container mx-auto px-4 py-16">
              <div className="max-w-4xl mx-auto">
                {/* Main Title */}
                <div className="text-center mb-8">
                  <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                    HOW CAN WE HELP?
                  </h1>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-8">
                  <div className="relative">
                    <Input
                      type="search"
                      placeholder="Search"
                      className="w-full h-14 pl-6 pr-12 text-lg bg-transparent border-0 placeholder:text-[#FFFFFF4D] text-[#FFFFFF4D] focus:outline-none focus:ring-0"
                    />
                    <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#FFFFFF4D] h-6 w-6" />
                    <hr className="border-[#FFFFFF4D] mt-3"/>
                  </div>
                </div>

                {/* Return Information */}
                <div className="text-center mb-12">
                  <p className="text-white text-lg">
                    NEED TO RETURN AN ITEM? No problem! Start your return{" "}
                    <a href="#" className="text-[#cbf26c] font-bold underline hover:text-[#a8d85a]">
                      HERE
                    </a>
                  </p>
                </div>

                {/* Categorized Help Sections */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-16">
                  <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-56">
                    <CardHeader className="text-center pb-2 mt-10">
                      <Truck className="h-12 w-12 mx-auto text-black mb-3" />
                      <CardTitle className="text-lg font-semibold text-black">Orders & Delivery</CardTitle>
                    </CardHeader>
                  </Card>

                  <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer ">
                    <CardHeader className="text-center pb-2 mt-10">
                      <RotateCcw className="h-12 w-12 mx-auto text-black mb-3" />
                      <CardTitle className="text-lg font-semibold text-black">Returns & Refunds</CardTitle>
                    </CardHeader>
                  </Card>

                  <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                    <CardHeader className="text-center pb-2 mt-10">
                      <CreditCard className="h-12 w-12 mx-auto text-black mb-3" />
                      <CardTitle className="text-lg font-semibold text-black">Payments & Promotions</CardTitle>
                    </CardHeader>
                  </Card>

                  <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-56">
                    <CardHeader className="text-center pb-2 mt-10">
                      <Settings className="h-12 w-12 mx-auto text-black mb-3" />
                      <CardTitle className="text-lg font-semibold text-black">Technical</CardTitle>
                    </CardHeader>
                  </Card>

                  <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                    <CardHeader className="text-center pb-2 mt-10">
                      <ShoppingBag className="h-12 w-12 mx-auto text-black mb-3" />
                      <CardTitle className="text-lg font-semibold text-black">Product</CardTitle>
                    </CardHeader>
                  </Card>

                  <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                    <CardHeader className="text-center pb-2 mt-10">
                      <Info className="h-12 w-12 mx-auto text-black mb-3" />
                      <CardTitle className="text-lg font-semibold text-black">General Information</CardTitle>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Questions Section */}
          <div className="bg-white -mt-48">
            <div className="container mx-auto px-4 py-16">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg p-8 shadow-lg">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-black mb-2">
                      POPULAR QUESTIONS
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Got a question? Check out our popular articles below to find the answer you're looking for.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gray-50 border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-black mb-2">
                          Delivery Information
                        </h3>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-50 border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-black mb-2">
                          How do I track my order?
                        </h3>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-50 border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-black mb-2">
                          I've received my order but it's wrong
                        </h3>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-50 border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-black mb-2">
                          How do I return my items?
                        </h3>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-50 border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-black mb-2">
                          I still haven't received my refund
                        </h3>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-50 border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-black mb-2">
                          When do items restock?
                        </h3>
                      </CardContent>
                    </Card>
                  </div>
                </div>

              </div>
            </div>
          </div>
          
                {/* Need More Help Section */}
                <div className="text-center -mt-3 bg-[#F5F5F5] w-[1920px] h-[196px] opacity-100 flex items-center justify-center" style={{ top: '1725.5px' }}>
                  <div>
                    <h2 className="text-3xl font-bold text-black mb-4">
                      NEED MORE HELP?
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Please contact our support team here
                     
                    </p>
                  </div>
                </div>
        </div>
      </div>
      <Footer />
    </div>
  )
} 