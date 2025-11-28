'use client'

import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import type { Bundle, BundlePackOption, BundleColorOption } from "@/lib/api"

interface BundleAddToCartProps {
  bundle: Bundle
  selection: BundleSelectionState
}

type BundleSelectionState = {
  pack?: BundlePackOption
  size?: string
  length?: string
  color?: BundleColorOption
}

export function BundleAddToCart({ bundle, selection }: BundleAddToCartProps) {
  const { addBundleToCart, isBundleInCart } = useCart()
  const bundleId = bundle._id || bundle.id
  const bundleKey = [
    bundleId,
    selection.pack?.name ?? "default",
    selection.size ?? "default",
    selection.length ?? "default",
    selection.color?.name ?? "default",
  ].join("|")
  const alreadyInCart = bundleId ? isBundleInCart(bundleId, bundleKey) : false
  const packQuantity = selection.pack?.quantity ?? 1
  const packTotal = selection.pack?.totalPrice ?? bundle.finalPrice ?? bundle.bundlePrice ?? 0
  const packUnitPrice =
    selection.pack?.pricePerItem ?? (packQuantity > 0 ? Number((packTotal / packQuantity).toFixed(2)) : packTotal)
  const sizeAdjustment =
    selection.size && bundle.sizePriceVariation
      ? Number(bundle.sizePriceVariation[selection.size] ?? 0)
      : 0
  const totalPrice = packTotal + sizeAdjustment

  const handleAddToCart = () => {
    if (!bundleId || !selection.pack) return

    addBundleToCart({
      id: bundleId,
      name: bundle.name,
      thumbnail:
        selection.color?.thumbnailImage ||
        bundle.heroImage ||
        bundle.galleryImages?.[0] ||
        "/placeholder.svg",
      selectedPack: selection.pack,
      selectedSize: selection.size,
      selectedLength: selection.length,
      selectedColor: selection.color
        ? {
            name: selection.color.name,
            description: selection.color.description,
          }
        : undefined,
      totalPrice,
      unitPrice: packUnitPrice,
      dealTag: bundle.dealTag,
    })
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={alreadyInCart || !selection.pack}
      className={`w-full h-12 rounded-full font-semibold ${
        alreadyInCart ? "bg-emerald-600 hover:bg-emerald-600" : "bg-black hover:bg-zinc-900"
      }`}
    >
      {alreadyInCart ? "Bundle Added" : "Add to Cart"}
    </Button>
  )
}

export type { BundleSelectionState }

