import Link from "next/link"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Button } from "@/components/ui/button"

export default function ProductNotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="text-center px-4">
          <h1 className="text-4xl font-bold text-[#212121] mb-4">Product Not Found</h1>
          <p className="text-[#6e6e6e] text-lg mb-8 max-w-md mx-auto">
            We couldn't find the product you're looking for. It may have been removed or doesn't exist.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-[#212121] text-white hover:bg-black">
              <Link href="/">Return to Home</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-[#212121] text-[#212121] hover:bg-[#212121] hover:text-white bg-transparent"
            >
              <Link href="/collection">Browse Collection</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
