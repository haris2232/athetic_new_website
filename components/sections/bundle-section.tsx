"use client"

import { useState, useEffect } from "react"
import { getBundles, type Bundle } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { Package } from "lucide-react"
import Link from "next/link"

interface BundleSectionProps {
  category?: 'men' | 'women' | 'mixed'
}

export function BundleSection({ category }: BundleSectionProps) {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        setLoading(true)
        console.log('🔍 Fetching bundles...', category ? `for category: ${category}` : 'all bundles')

        let bundlesData
        if (category && category !== 'mixed') {
          bundlesData = await getBundles(category)
        } else {
          bundlesData = await getBundles()
        }

        console.log('📦 Bundles received:', bundlesData)
        setBundles(bundlesData)
      } catch (error) {
        console.error('❌ Error fetching bundles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBundles()
  }, [category])

  if (loading) {
    return (
      <div className="w-full px-6 py-10">
        <div className="flex justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bundles...</p>
          </div>
        </div>
      </div>
    )
  }

  if (bundles.length === 0) {
    return (
      <div className="w-full px-6 py-10">
        <div className="text-center">
          <p className="text-gray-600">No active bundles available at the moment.</p>
          <p className="text-gray-400 text-sm mt-2">Check back later for special offers!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-6 py-10">
      <img
        src="/bundle.png"
        alt="Bundle Promotion"
        className="w-full rounded-lg shadow-md mb-8"
        style={{ maxHeight: '500px', objectFit: 'cover' }}
      />
      <div className="flex flex-col lg:flex-row gap-8">
        {bundles.map((bundle, index) => {
          const savings = bundle.originalPrice - bundle.bundlePrice
          const savingsPercentage = Math.round((savings / bundle.originalPrice) * 100)
          const bundleHref = `/bundles/${bundle._id || bundle.id}`

          return (
            <div key={bundle._id} className="flex-1 bg-gray-100 rounded-lg p-6">
              <h2 className="text-[#212121] text-2xl font-bold mb-6 text-center">{bundle.name}</h2>

              {/* THIS IS THE MODIFIED LINE */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {bundle.badgeText && (
                  <span className="col-span-2 mb-2 inline-flex items-center justify-center rounded-full bg-black text-white text-xs uppercase tracking-[0.3em] px-4 py-1">
                    {bundle.badgeText}
                  </span>
                )}
                {bundle.products.map((product, productIndex) => (
                  <div key={productIndex} className="bg-white rounded-lg p-4 shadow-sm">
                    <img
                      src={product.images?.[0] || "/placeholder.svg"}
                      alt={product.title || product.name}
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                    <h3 className="text-[#212121] text-sm font-medium">{product.title || product.name}</h3>
                    <p className="text-gray-500 text-xs">{product.description || 'Premium quality'}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[#212121] font-bold">{formatCurrency(product.basePrice || parseFloat(product.price || '0'))}</span>
                      <div className="flex items-center">
                        <span className="text-yellow-400 text-xs">★</span>
                        <span className="text-[#212121] text-xs ml-1">{product.reviewRating || product.rating || 4.5}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                {bundle.shortDescription && (
                  <div className="mb-4 text-sm text-muted-foreground">
                    {bundle.shortDescription}
                  </div>
                )}
                <div className="mb-4">
                  <div className="text-gray-500 text-sm line-through">
                    Original: {formatCurrency(bundle.originalPrice)}
                  </div>
                  <div className="text-[#212121] text-xl font-bold">
                    Bundle: {formatCurrency(bundle.bundlePrice)}
                  </div>
                  <div className="text-green-400 text-sm font-medium">
                    Save {formatCurrency(savings)} ({savingsPercentage}% off)
                  </div>
                </div>
                <Link href={bundleHref} className="inline-block mt-3 text-sm font-medium text-[#212121] underline">
                  View Bundle Details
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}