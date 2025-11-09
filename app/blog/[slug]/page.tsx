"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://athlekt.com/backendnew/api"

interface Blog {
  _id: string
  adminName: string
  url: string
  content: string
  coverImage?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const getFullImageUrl = (url?: string) => {
  if (!url) return ""
  if (url.startsWith("http")) return url
  const baseUrl = API_BASE_URL.replace("/api", "")
  if (url.startsWith("/")) return `${baseUrl}${url}`
  return `${baseUrl}/${url}`
}

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  const decodedSlug = useMemo(() => decodeURIComponent(params.slug || "").trim(), [params.slug])
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!decodedSlug) {
      setError("Missing blog identifier")
      setLoading(false)
      return
    }

    const controller = new AbortController()

    const fetchBlog = async () => {
      try {
        setLoading(true)
        setError(null)

        const endpoint = `${API_BASE_URL}/blogs/public/by-url/${encodeURIComponent(decodedSlug)}`
        const response = await fetch(endpoint, { signal: controller.signal })

        if (!response.ok) {
          const message = response.status === 404 ? "Blog not found" : `Unable to load blog (${response.status})`
          setError(message)
          setBlog(null)
          return
        }

        const data = await response.json()
        const blogData = data?.data || data

        if (!blogData) {
          setError("Blog data is unavailable")
          setBlog(null)
          return
        }

        setBlog(blogData as Blog)
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return
        }
        setError("Something went wrong while loading the blog")
        setBlog(null)
      } finally {
        setLoading(false)
      }
    }

    fetchBlog()

    return () => {
      controller.abort()
    }
  }, [decodedSlug])

  const publicationDate = useMemo(() => {
    if (!blog?.createdAt) return ""
    return new Date(blog.createdAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }, [blog?.createdAt])

  return (
    <div className="min-h-screen bg-white text-[#212121]">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="text-sm mb-6 text-[#6e6e6e] flex items-center gap-2">
            <Link href="/" className="hover:text-[#212121] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/" className="hover:text-[#212121] transition-colors">
              Community Favourites
            </Link>
            <span>/</span>
            <span className="text-[#212121] capitalize truncate">{decodedSlug || "Blog"}</span>
          </nav>

          {loading ? (
            <div className="py-24 text-center text-[#6e6e6e]">Loading blog...</div>
          ) : error ? (
            <div className="py-24 text-center">
              <h1 className="text-2xl font-semibold mb-2">{error}</h1>
              <p className="text-[#6e6e6e] mb-6">
                {error === "Blog not found"
                  ? "It looks like this blog entry doesn’t exist or is no longer active."
                  : "Please try again later or contact support if the issue persists."}
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-[#212121] px-6 py-2 text-white hover:bg-black transition-colors"
              >
                Back to Home
              </Link>
            </div>
          ) : blog ? (
            <article className="space-y-10">
              {blog.coverImage && (
                <div className="w-full overflow-hidden rounded-3xl bg-[#f5f5f5]">
                  <img
                    src={getFullImageUrl(blog.coverImage)}
                    alt={blog.adminName}
                    className="w-full h-auto object-cover"
                    style={{ maxHeight: "520px", width: "100%" }}
                  />
                </div>
              )}

              <header className="space-y-3">
                <p className="uppercase text-sm tracking-wide text-[#6e6e6e]">{publicationDate}</p>
                <h1 className="text-4xl font-bold leading-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  {blog.adminName}
                </h1>
                <p className="text-[#6e6e6e]">/{blog.url}</p>
              </header>

              <section
                className="prose prose-lg max-w-none prose-headings:font-semibold prose-p:text-[#212121] prose-strong:text-[#212121] prose-a:text-[#212121] prose-a:underline"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </article>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  )
}
