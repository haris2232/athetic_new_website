"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { X } from "lucide-react"

interface ProductVariant {
  id: string
  size: string
  color: {
    name: string
    type: "hex" | "image"
    value: string
  }
  sku: string
  stock: number
  priceOverride?: number
  isActive: boolean
}

interface Product {
  _id: string
  id?: string
  title: string
  name?: string
  basePrice: number
  price?: string
  images?: string[]
  image?: string
  sizeOptions?: string[]
  sizes?: string[]
  colorOptions?: Array<{
    name: string
    type: "hex" | "image"
    value: string
  }>
  colors?: Array<{
    name: string
    type: "hex" | "image"
    value: string
  }>
  variants?: ProductVariant[]
  description?: string
  reviewRating?: number
  rating?: number
}

interface Bundle {
  _id: string
  id?: string
  name: string
  bundlePrice: number
  originalPrice: number
  products: Product[]
  category?: string
}

interface BundleVariationModalProps {
  bundle: Bundle | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (selectedVariations: Record<string, { size: string; color: string }>) => void
}

export function BundleVariationModal({ 
  bundle, 
  isOpen, 
  onClose, 
  onConfirm 
}: BundleVariationModalProps) {
  const [selectedVariations, setSelectedVariations] = useState<Record<string, { size: string; color: string }>>({})

  const handleVariationSelect = (productId: string, type: 'size' | 'color', value: string) => {
    setSelectedVariations(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [type]: value
      }
    }))
  }

  const handleConfirm = () => {
    // Check if all products have variations selected
    const allSelected = bundle?.products.every(product => {
      const productId = product._id || product.id
      const variation = selectedVariations[productId]
      return variation?.size && variation?.color
    })

    if (allSelected) {
      onConfirm(selectedVariations)
      onClose()
      setSelectedVariations({})
    }
  }

  const isVariationComplete = (productId: string) => {
    const variation = selectedVariations[productId]
    return variation?.size && variation?.color
  }

  const allVariationsSelected = bundle?.products.every(product => {
    const productId = product._id || product.id
    return isVariationComplete(productId)
  })

  if (!bundle) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Select Variations for {bundle.name}
          </DialogTitle>
          <p className="text-center text-gray-600">
            Choose size and color for each product in the bundle
          </p>
        </DialogHeader>

        <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
          {bundle.products.map((product, index) => {
            const productId = product._id || product.id
            const currentVariation = selectedVariations[productId] || {}
            
            // Get available sizes and colors
            const availableSizes = product.sizeOptions || product.sizes || ['S', 'M', 'L', 'XL']
            const availableColors = product.colorOptions || product.colors || [
              { name: 'Default', type: 'hex', value: '#000000' }
            ]

            return (
              <div key={productId} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start space-x-4">
                  <img
                    src={product.images?.[0] || product.image || "/placeholder.svg"}
                    alt={product.title || product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{product.title || product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{product.description || 'Premium quality'}</p>
                    
                    {/* Size Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Size:</label>
                      <div className="flex flex-wrap gap-2">
                        {availableSizes.map((size) => (
                          <Button
                            key={size}
                            variant={currentVariation.size === size ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleVariationSelect(productId, 'size', size)}
                            className="min-w-[40px]"
                          >
                            {size}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Color Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Color:</label>
                      <div className="flex flex-wrap gap-2">
                        {availableColors.map((color) => (
                          <Button
                            key={color.name}
                            variant={currentVariation.color === color.name ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleVariationSelect(productId, 'color', color.name)}
                            className="flex items-center space-x-2"
                          >
                            {color.type === 'hex' && (
                              <div 
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: color.value }}
                              />
                            )}
                            {color.type === 'image' && (
                              <img 
                                src={color.value} 
                                alt={color.name}
                                className="w-4 h-4 rounded-full object-cover"
                              />
                            )}
                            <span>{color.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Selection Status */}
                    <div className="flex items-center space-x-2">
                      {isVariationComplete(productId) ? (
                        <Badge variant="default" className="bg-green-500">
                          ✓ Complete
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          ⚠ Incomplete
                        </Badge>
                      )}
                      <span className="text-sm text-gray-600">
                        {currentVariation.size && currentVariation.color 
                          ? `${currentVariation.size}, ${currentVariation.color}`
                          : 'Please select size and color'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bundle Summary */}
        <div className="border-t pt-4 mt-4 bg-white sticky bottom-0">
          <div className="text-center space-y-2 mb-4">
            <div className="text-gray-600 line-through">
              Original: {formatCurrency(bundle.originalPrice)}
            </div>
            <div className="text-2xl font-bold">
              Bundle: {formatCurrency(bundle.bundlePrice)}
            </div>
            <div className="text-green-600 font-medium">
              Save {formatCurrency(bundle.originalPrice - bundle.bundlePrice)} 
              ({Math.round(((bundle.originalPrice - bundle.bundlePrice) / bundle.originalPrice) * 100)}% off)
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!allVariationsSelected}
              className="bg-green-500 hover:bg-green-600"
            >
              Add Bundle to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
