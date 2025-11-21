"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://athlekt.com/backendnew/api";

// same Blog type as homepage
interface Blog {
  _id: string;
  adminName: string;
  url: string;
  content: string;
  coverImage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ✅ same helper as homepage
const normalizeBlogHref = (blog: Blog): string => {
  const rawUrl = blog.url?.trim();
  if (rawUrl) {
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) return rawUrl;
    if (rawUrl.startsWith("/")) {
      const cleaned = rawUrl.replace(/\/{2,}/g, "/");
      if (cleaned.toLowerCase().startsWith("/blog/")) return cleaned;
      return `/blog${cleaned}`;
    }
    const sanitized = rawUrl.replace(/^\/+/, "").trim();
    return `/blog/${encodeURIComponent(sanitized)}`;
  }
  return `/blog/${blog._id}`;
};

// ✅ image URL helper (same logic as homepage)
const getImageUrl = (url?: string): string => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const baseUrl = API_BASE_URL.replace("/api", "");
  if (url.startsWith("/")) return `${baseUrl}${url}`;
  return `${baseUrl}/${url}`;
};

export default function AllBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/blogs/public/active`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            setBlogs(data.data); // ✅ show all blogs, no slice limit
          }
        }
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="py-16 px-6 sm:px-12">
        <h1 className="text-4xl font-extrabold uppercase tracking-wider text-black text-center mb-12">
          All Blogs
        </h1>

        {loading ? (
          <p className="text-center text-gray-600 text-lg">Loading blogs...</p>
        ) : blogs.length === 0 ? (
          <div className="text-center text-gray-500">
            <h3 className="text-xl font-semibold mb-2">No Blogs Found</h3>
            <p>Please check back later for new updates!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {blogs.map((blog) => {
              const image = getImageUrl(blog.coverImage);
              return (
                <a
                  key={blog._id}
                  href={normalizeBlogHref(blog)}
                  className="block bg-white shadow-md rounded-[32px] overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={blog.adminName}
                      className="w-full h-60 object-cover"
                      onError={(e) =>
                        ((e.target as HTMLImageElement).src = "/placeholder.svg")
                      }
                    />
                  ) : (
                    <div className="h-60 flex items-center justify-center bg-gray-100 text-gray-400 text-4xl">
                      📝
                    </div>
                  )}

                  <div className="p-5 bg-black text-white">
                    <h3
                      className="uppercase truncate"
                      style={{
                        fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                        fontSize: "14px",
                        fontWeight: 500,
                      }}
                      title={blog.adminName}
                    >
                      {blog.adminName}
                    </h3>
                    <p
                      className="text-sm truncate opacity-80"
                      title={blog.url}
                    >
                      {blog.url}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
