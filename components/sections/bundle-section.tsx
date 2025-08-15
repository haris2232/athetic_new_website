"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { getBundles, type Bundle } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { Package } from "lucide-react"

interface BundleSectionProps {
  category?: 'men' | 'women' | 'mixed'
}

export function BundleSection({ category }: BundleSectionProps) {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)
  const { addBundleToCart, isBundleInCart } = useCart()

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

  const handleAddBundleToCart = (bundle: Bundle) => {
    addBundleToCart({
      id: bundle._id || bundle.id,
      name: bundle.name,
      bundlePrice: bundle.bundlePrice,
      originalPrice: bundle.originalPrice,
      products: bundle.products.map(product => ({
        id: product._id || product.id,
        name: product.title || product.name,
        price: product.basePrice || parseFloat(product.price || '0'),
        image: product.images?.[0] || product.image,
        quantity: 1,
        size: product.sizeOptions?.[0] || product.sizes?.[0] || 'M',
        color: product.colors?.[0]?.name || 'Default'
      })),
      category: bundle.category
    })
  }

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
        className="w-full rounded-md shadow-md mb-8"
        style={{ maxHeight: '300px', objectFit: 'cover' }}
      />
      <div className="flex flex-col lg:flex-row gap-8">
        {bundles.map((bundle, index) => {
          const savings = bundle.originalPrice - bundle.bundlePrice
          const savingsPercentage = Math.round((savings / bundle.originalPrice) * 100)

          return (
            <div key={bundle._id} className="flex-1 bg-[#1a1a1a] rounded-lg p-6">
              <h2 className="text-white text-2xl font-bold mb-6 text-center">{bundle.name}</h2>

              {/* THIS IS THE MODIFIED LINE */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {bundle.products.map((product, productIndex) => (
                  <div key={productIndex} className="bg-[#2a2a2a] rounded-lg p-4">
                    <img
                      src={product.images?.[0] || "/placeholder.svg"}
                      alt={product.title || product.name}
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                    <h3 className="text-white text-sm font-medium">{product.title || product.name}</h3>
                    <p className="text-gray-400 text-xs">{product.description || 'Premium quality'}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-white font-bold">{formatCurrency(product.basePrice || parseFloat(product.price || '0'))}</span>
                      <div className="flex items-center">
                        <span className="text-yellow-400 text-xs">★</span>
                        <span className="text-white text-xs ml-1">{product.reviewRating || product.rating || 4.5}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <div className="mb-4">
                  <div className="text-gray-400 text-sm line-through">
                    Original: {formatCurrency(bundle.originalPrice)}
                  </div>
                  <div className="text-white text-xl font-bold">
                    Bundle: {formatCurrency(bundle.bundlePrice)}
                  </div>
                  <div className="text-green-400 text-sm font-medium">
                    Save {formatCurrency(savings)} ({savingsPercentage}% off)
                  </div>
                </div>

                <Button
                  onClick={() => handleAddBundleToCart(bundle)}
                  disabled={isBundleInCart(bundle._id || bundle.id)}
                  className={`w-full font-bold py-3 px-6 rounded-lg ${
                    isBundleInCart(bundle._id || bundle.id)
                      ? "bg-green-600 text-white cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {isBundleInCart(bundle._id || bundle.id) ? "✓ BUNDLE IN CART" : `SAVE ${formatCurrency(savings)}`}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}