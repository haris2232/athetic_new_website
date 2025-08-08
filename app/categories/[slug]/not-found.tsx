import Link from "next/link"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Category Not Found</h2>
          <p className="text-gray-600 mb-6">
            The category you're looking for doesn't exist.
          </p>
          <Link
            href="/categories"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse All Categories
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
} 