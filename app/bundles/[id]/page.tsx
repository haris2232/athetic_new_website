import { notFound } from "next/navigation"
import type { Metadata } from "next"
import type { Bundle } from "@/lib/api"
import { BundleDetailView } from "@/components/sections/bundle-detail-view"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://athlekt.com/backendnew/api"

const UPLOAD_BASE_URL = API_BASE_URL.replace(/\/api$/, "")

const getFullImageUrl = (url?: string | null) => {
  if (!url) return ""
  if (url.startsWith("http")) return url
  if (url.startsWith("/")) return `${UPLOAD_BASE_URL}${url}`
  return `${UPLOAD_BASE_URL}/${url}`
}

async function fetchBundle(id: string): Promise<Bundle | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/bundles/public/detail/${id}`, {
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch bundle detail (status ${response.status})`)
    }

    const data = await response.json()
    if (data?.data) {
      return data.data
    }
  } catch (error) {
    console.error("Failed to load bundle detail:", error)
  }

  try {
    const fallbackResponse = await fetch(`${API_BASE_URL}/bundles/public/active`, {
      next: { revalidate: 60 },
    })
    if (!fallbackResponse.ok) {
      throw new Error(`Fallback fetch failed (status ${fallbackResponse.status})`)
    }
    const fallbackData = await fallbackResponse.json()
    const bundlesArray: Bundle[] = Array.isArray(fallbackData?.data)
      ? fallbackData.data
      : Array.isArray(fallbackData)
        ? fallbackData
        : []
    const found = bundlesArray.find(
      (bundle) => bundle._id === id || bundle.id === id || bundle.name === id
    )
    if (found) {
      return found
    }
  } catch (fallbackError) {
    console.error("Failed to load bundle detail via fallback:", fallbackError)
  }

  return null
}

interface PageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = params
  const bundle = await fetchBundle(id)

  if (!bundle) {
    return {}
  }

  const title = `${bundle.name} | Athlekt Bundles`
  const description = bundle.shortDescription || bundle.description || `Save with the ${bundle.name} bundle.`
  const image = getFullImageUrl(bundle.heroImage || bundle.galleryImages?.[0] || "")

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function Page({ params }: PageProps) {
  const { id } = params
  const bundle = await fetchBundle(id)

  if (!bundle) {
    notFound()
  }

  return <BundleDetailView bundle={bundle} />
}

