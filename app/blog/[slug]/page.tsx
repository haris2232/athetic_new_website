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

// Content formatting function with proper styling
const formatBlogContent = (content: string) => {
  if (!content) return ""
  
  let formatted = content
    // Ensure proper line breaks
    .replace(/\n/g, '<br />')
    
  // Add proper classes to HTML elements
  formatted = formatted
    .replace(/<h1>/g, '<h1 class="text-3xl font-bold mt-8 mb-4 text-gray-900">')
    .replace(/<\/h1>/g, '</h1>')
    .replace(/<h2>/g, '<h2 class="text-2xl font-bold mt-6 mb-3 text-gray-900">')
    .replace(/<\/h2>/g, '</h2>')
    .replace(/<h3>/g, '<h3 class="text-xl font-bold mt-5 mb-2 text-gray-900">')
    .replace(/<\/h3>/g, '</h3>')
    .replace(/<p>/g, '<p class="mb-4 leading-relaxed text-gray-700 text-base">')
    .replace(/<\/p>/g, '</p>')
    .replace(/<ul>/g, '<ul class="list-disc list-inside mb-4 space-y-2 pl-4">')
    .replace(/<\/ul>/g, '</ul>')
    .replace(/<ol>/g, '<ol class="list-decimal list-inside mb-4 space-y-2 pl-4">')
    .replace(/<\/ol>/g, '</ol>')
    .replace(/<li>/g, '<li class="text-gray-700 mb-1">')
    .replace(/<\/li>/g, '</li>')
    .replace(/<blockquote>/g, '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-6 text-gray-600 bg-gray-50 py-2">')
    .replace(/<\/blockquote>/g, '</blockquote>')
    .replace(/<code>/g, '<code class="bg-gray-100 px-2 py-1 rounded font-mono text-sm text-gray-800">')
    .replace(/<\/code>/g, '</code>')
    .replace(/<strong>/g, '<strong class="font-bold text-gray-900">')
    .replace(/<\/strong>/g, '</strong>')
    .replace(/<em>/g, '<em class="italic text-gray-700">')
    .replace(/<\/em>/g, '</em>')
    .replace(/<a href="/g, '<a target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 hover:underline transition-colors" href="')
    .replace(/<img src="/g, '<img class="rounded-lg my-6 max-w-full h-auto shadow-md" src="')
    .replace(/<img/g, '<img class="rounded-lg my-6 max-w-full h-auto shadow-md"')
    .replace(/<hr/g, '<hr class="my-8 border-gray-300"')

  return formatted
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

        // Different API endpoints try karte hain
        const endpoints = [
          `${API_BASE_URL}/blogs/public/by-url/${encodeURIComponent(decodedSlug)}`,
          `${API_BASE_URL}/blogs/url/${encodeURIComponent(decodedSlug)}`,
          `${API_BASE_URL}/blogs/slug/${encodeURIComponent(decodedSlug)}`
        ]

        let response = null
        for (const endpoint of endpoints) {
          try {
            response = await fetch(endpoint, { signal: controller.signal })
            if (response.ok) break
          } catch (e) {
            continue
          }
        }

        if (!response || !response.ok) {
          const message = response?.status === 404 ? "Blog not found" : `Unable to load blog (${response?.status || 'Network error'})`
          setError(message)
          setBlog(null)
          return
        }

        const data = await response.json()
        console.log("API Response:", data) // Debug ke liye

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
        console.error("Fetch error:", err)
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
    return new Date(blog.createdAt).toLocaleDateString('en-US', {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }, [blog?.createdAt])

  const formattedContent = useMemo(() => {
    if (!blog?.content) return ""
    return formatBlogContent(blog.content)
  }, [blog?.content])

  // Debug ke liye
  useEffect(() => {
    if (blog) {
      console.log("Blog data:", blog)
      console.log("Formatted content:", formattedContent)
    }
  }, [blog, formattedContent])

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="text-sm mb-8 text-gray-600 flex items-center gap-2 flex-wrap">
            <Link href="/" className="hover:text-gray-900 transition-colors duration-200">
              Home
            </Link>
            <span>/</span>
            <Link href="/blogs" className="hover:text-gray-900 transition-colors duration-200">
              Blogs
            </Link>
            <span>/</span>
            <span className="text-gray-900 truncate">{blog?.adminName || decodedSlug || "Blog"}</span>
          </nav>

          {loading ? (
            <div className="py-16 text-center">
              <div className="animate-pulse space-y-6 max-w-2xl mx-auto">
                <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                <div className="h-64 bg-gray-200 rounded w-full"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="py-24 text-center">
              <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold mb-4 text-gray-900">{error}</h1>
                <p className="text-gray-600 mb-8">
                  {error === "Blog not found"
                    ? "The blog post you're looking for doesn't exist or may have been removed."
                    : "There was a problem loading this blog post. Please try again later."}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/blogs"
                    className="inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-3 text-white hover:bg-black transition-colors duration-200 font-medium"
                  >
                    View All Blogs
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-full border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          ) : blog ? (
            <article className="space-y-8">
              {/* Cover Image */}
              {blog.coverImage && (
                <div className="w-full overflow-hidden rounded-2xl bg-gray-100 shadow-lg">
                  <img
                    src={getFullImageUrl(blog.coverImage)}
                    alt={blog.adminName}
                    className="w-full h-auto object-cover max-h-[520px]"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>
              )}

              {/* Blog Header */}
              <header className="space-y-4 text-center">
                <p className="text-sm uppercase tracking-wider text-gray-500 font-medium">
                  Published on {publicationDate}
                </p>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900">
                  {blog.adminName}
                </h1>
                <p className="text-gray-600 text-lg">/{blog.url}</p>
              </header>

              {/* Blog Content */}
              <section 
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: formattedContent }}
              />

              {/* Blog Footer */}
              <footer className="pt-8 mt-8 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
                  <div>
                    Published on {publicationDate}
                  </div>
                  <div className="flex gap-4">
                    {/* <button className="hover:text-gray-900 transition-colors duration-200">
                      Share
                    </button>
                    <button className="hover:text-gray-900 transition-colors duration-200">
                      Save
                    </button> */}
                  </div>
                </div>
              </footer>
            </article>
          ) : null}
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        .blog-content {
          line-height: 1.7;
          color: #374151;
        }
        
        .blog-content h1 {
          font-size: 2.25rem;
          font-weight: bold;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #111827;
        }
        
        .blog-content h2 {
          font-size: 1.875rem;
          font-weight: bold;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #111827;
        }
        
        .blog-content h3 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          color: #111827;
        }
        
        .blog-content p {
          margin-bottom: 1rem;
          line-height: 1.7;
          color: #374151;
        }
        
        .blog-content ul, .blog-content ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        
        .blog-content li {
          margin-bottom: 0.5rem;
          color: #374151;
        }
        
        .blog-content blockquote {
          border-left: 4px solid #d1d5db;
          padding-left: 1rem;
          font-style: italic;
          margin: 1.5rem 0;
          color: #6b7280;
          background-color: #f9fafb;
          padding: 1rem;
        }
        
        .blog-content code {
          background-color: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
          color: #1f2937;
        }
        
        .blog-content a {
          color: #2563eb;
          text-decoration: none;
        }
        
        .blog-content a:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }
        
        .blog-content img {
          border-radius: 0.5rem;
          margin: 1.5rem 0;
          max-width: 100%;
          height: auto;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .blog-content strong {
          font-weight: bold;
          color: #111827;
        }
        
        .blog-content em {
          font-style: italic;
          color: #374151;
        }
        
        .blog-content hr {
          margin: 2rem 0;
          border: 0;
          border-top: 1px solid #d1d5db;
        }
        
        @media (max-width: 768px) {
          .blog-content h1 {
            font-size: 1.875rem;
          }
          
          .blog-content h2 {
            font-size: 1.5rem;
          }
          
          .blog-content h3 {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  )
}