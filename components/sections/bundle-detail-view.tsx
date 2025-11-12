"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import type { Bundle, BundleColorOption, BundlePackOption, Product } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { BundleAddToCart, type BundleSelectionState } from "@/components/sections/bundle-add-to-cart"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://athlekt.com/backendnew/api"
const UPLOAD_BASE_URL = API_BASE_URL.replace(/\/api$/, "")

const getFullImageUrl = (url?: string | null) => {
  if (!url) return ""
  if (url.startsWith("http")) return url
  if (url.startsWith("/")) return `${UPLOAD_BASE_URL}${url}`
  return `${UPLOAD_BASE_URL}/${url}`
}

interface BundleDetailViewProps {
  bundle: Bundle
}

const getProductPrimaryImage = (product: Product): string | undefined => {
  if (product.images && product.images.length > 0) {
    return product.images[0]
  }
  if ((product as any).image) {
    return (product as any).image
  }
  return undefined
}

const getProductPrice = (product: Product): number => {
  if (typeof product.basePrice === "number") {
    return product.basePrice
  }
  if (product.price) {
    const numeric = parseFloat(product.price.toString().replace(/[^0-9.]/g, ""))
    if (!Number.isNaN(numeric)) {
      return numeric
    }
  }
  return 0
}

const buildFallbackPack = (bundle: Bundle): BundlePackOption => {
  const quantity = bundle.products?.length && bundle.products.length > 0 ? bundle.products.length : 1
  const totalPrice = bundle.finalPrice ?? bundle.bundlePrice ?? bundle.basePrice ?? bundle.originalPrice ?? 0
  return {
    name: `${quantity}-Pack`,
    quantity,
    totalPrice,
    pricePerItem: quantity > 0 ? Number((totalPrice / quantity).toFixed(2)) : totalPrice,
  }
}

const getDefaultPack = (bundle: Bundle): BundlePackOption =>
  bundle.packOptions && bundle.packOptions.length > 0 ? bundle.packOptions[0] : buildFallbackPack(bundle)

const getDefaultColor = (colors?: BundleColorOption[]): BundleColorOption | undefined =>
  colors && colors.length > 0 ? colors[0] : undefined

const getDefaultSize = (sizes?: string[]): string | undefined =>
  sizes && sizes.length > 0 ? sizes[0] : undefined

const getDefaultLength = (lengths?: string[]): string | undefined =>
  lengths && lengths.length > 0 ? lengths[0] : undefined

export function BundleDetailView({ bundle }: BundleDetailViewProps) {
  const mediaImages = useMemo(() => {
    const hero = bundle.heroImage ? [getFullImageUrl(bundle.heroImage)] : []
    const gallery = (bundle.galleryImages || []).map((img) => getFullImageUrl(img))

    const productImages =
      bundle.products
        ?.map((product) => getProductPrimaryImage(product))
        .filter(Boolean)
        .map((img) => getFullImageUrl(img as string)) ?? []

    const combined = [...hero, ...gallery, ...productImages].filter(Boolean)
    if (combined.length === 0) {
      combined.push("/placeholder.svg")
    }
    return Array.from(new Set(combined))
  }, [bundle.heroImage, bundle.galleryImages, bundle.products])

  const defaultPack = useMemo(() => getDefaultPack(bundle), [bundle])
  const defaultColor = useMemo(() => getDefaultColor(bundle.colorOptions), [bundle.colorOptions])
  const defaultSize = useMemo(() => getDefaultSize(bundle.sizeOptions), [bundle.sizeOptions])
  const defaultLength = useMemo(() => getDefaultLength(bundle.lengthOptions), [bundle.lengthOptions])

  const [selection, setSelection] = useState<BundleSelectionState>({
    pack: defaultPack,
    color: defaultColor,
    size: defaultSize,
    length: defaultLength,
  })

  useEffect(() => {
    setSelection({
      pack: defaultPack,
      color: defaultColor,
      size: defaultSize,
      length: defaultLength,
    })
  }, [defaultPack, defaultColor, defaultSize, defaultLength])

  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [overrideImage, setOverrideImage] = useState<string | null>(null)

  useEffect(() => {
    if (selection.color?.galleryImages && selection.color.galleryImages.length > 0) {
      setOverrideImage(getFullImageUrl(selection.color.galleryImages[0]))
    } else if (selection.color?.thumbnailImage) {
      setOverrideImage(getFullImageUrl(selection.color.thumbnailImage))
    } else {
      setOverrideImage(null)
    }
  }, [selection.color])

  const activeImage = overrideImage || mediaImages[activeImageIndex] || "/placeholder.svg"

  const packQuantity = selection.pack?.quantity ?? 1
  const packTotal = selection.pack?.totalPrice ?? bundle.finalPrice ?? bundle.bundlePrice ?? 0
  const packUnitPrice =
    selection.pack?.pricePerItem ?? (packQuantity > 0 ? Number((packTotal / packQuantity).toFixed(2)) : packTotal)
  const sizeAdjustment =
    selection.size && bundle.sizePriceVariation
      ? Number(bundle.sizePriceVariation[selection.size] ?? 0)
      : 0
  const totalPrice = packTotal + sizeAdjustment
  const basePrice = bundle.basePrice ?? bundle.originalPrice ?? packTotal
  const savings = Math.max(basePrice - totalPrice, 0)
  const savingsPercentage = basePrice > 0 ? Math.round((savings / basePrice) * 100) : 0

  const descriptionParagraphs =
    bundle.description?.split(/\n+/).filter((paragraph) => paragraph.trim().length > 0) ?? []

  // Default values for sections
  const defaultPurpose = "Designed to support high-intensity training, everyday movement, and casual wear without sacrificing comfort."
  const defaultFeatures = "Boxy, oversized look—size down if you prefer a closer fit."
  const defaultMaterials = "65% Cotton, 35% Polyester - This lightweight, drapey fabric is smooth on the outside and looped on the inside."
  const defaultCare = "Machine wash cold\nTumble dry low"

  const purposeItems = bundle.purpose ? bundle.purpose.split('\n') : [defaultPurpose]
  const featuresItems = bundle.features ? bundle.features.split('\n') : [defaultFeatures]
  const materialsItems = bundle.materials ? bundle.materials.split('\n') : [defaultMaterials]
  const careItems = bundle.care ? bundle.care.split('\n') : defaultCare.split('\n')

  const handleColorSelect = (color: BundleColorOption) => {
    setSelection((prev) => ({ ...prev, color }))
    if (color.galleryImages && color.galleryImages.length > 0) {
      setOverrideImage(getFullImageUrl(color.galleryImages[0]))
    } else if (color.thumbnailImage) {
      setOverrideImage(getFullImageUrl(color.thumbnailImage))
    } else {
      setOverrideImage(null)
    }
  }

  const handlePackSelect = (pack: BundlePackOption) => {
    setSelection((prev) => ({ ...prev, pack }))
  }

  const handleSizeSelect = (size: string) => {
    setSelection((prev) => ({ ...prev, size }))
  }

  const handleLengthSelect = (length: string) => {
    setSelection((prev) => ({ ...prev, length }))
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto max-w-6xl space-y-16 px-4 py-12 lg:py-16">
        <nav className="flex gap-2 text-sm text-muted-foreground">
          <Link href="/" className="transition hover:text-zinc-900">
            Home
          </Link>
          <span>/</span>
          <Link href="/bundles" className="transition hover:text-zinc-900">
            Bundles
          </Link>
          <span>/</span>
          <span className="text-zinc-900">{bundle.name}</span>
        </nav>

        <div className="flex flex-col gap-10 lg:flex-row">
          <div className="flex flex-col gap-4 lg:w-1/2 lg:flex-row lg:h-[560px]">
            <div className="order-2 flex gap-3 overflow-x-auto pr-1 lg:order-1 lg:w-[96px] lg:flex-col lg:gap-3 lg:overflow-y-auto lg:overflow-x-hidden lg:pr-0 lg:justify-between">
              {mediaImages.map((imageUrl, idx) => (
                <button
                  key={`${imageUrl}-${idx}`}
                  onClick={() => {
                    setActiveImageIndex(idx)
                    setOverrideImage(null)
                  }}
                  aria-label={`View bundle image ${idx + 1}`}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl transition ${
                    overrideImage
                      ? "opacity-60"
                      : activeImageIndex === idx
                        ? "ring-2 ring-black shadow"
                        : "ring-1 ring-transparent hover:ring-zinc-300"
                  }`}
                >
                  <img
                    src={imageUrl}
                    alt={`${bundle.name} thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
            <div className="relative order-1 flex-1 overflow-hidden rounded-3xl bg-zinc-100 p-4 md:p-6">
              <img src={activeImage} alt={bundle.name} className="h-full w-full object-contain" />
              {mediaImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveImageIndex((prev) => (prev === 0 ? mediaImages.length - 1 : prev - 1))
                      setOverrideImage(null)
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white"
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveImageIndex((prev) => (prev === mediaImages.length - 1 ? 0 : prev + 1))
                      setOverrideImage(null)
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white"
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-6 lg:flex-1">
            <div className="space-y-3">
              {bundle.badgeText && (
                <span className="inline-flex items-center rounded-full bg-black px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white">
                  {bundle.badgeText}
                </span>
              )}
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                {bundle.name}
              </h1>
              {(typeof bundle.ratingValue === "number" || typeof bundle.reviewsCount === "number") && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  {typeof bundle.ratingValue === "number" && (
                    <span className="font-semibold">★ {bundle.ratingValue.toFixed(1)}</span>
                  )}
                  {typeof bundle.reviewsCount === "number" && (
                    <span>{bundle.reviewsCount.toLocaleString()} reviews</span>
                  )}
                </div>
              )}
              {bundle.shortDescription && (
                <p className="text-base text-muted-foreground">{bundle.shortDescription}</p>
              )}
            </div>

            <div className="space-y-3 rounded-3xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm">
              <div className="flex items-baseline gap-3">
                <span className="text-xl font-semibold text-zinc-900">{formatCurrency(totalPrice)}</span>
                {savings > 0 && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatCurrency(basePrice)}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <div className="text-sm font-semibold text-emerald-600">
                  Save {formatCurrency(savings)} ({savingsPercentage}%)
                </div>
              )}
              {selection.pack && (
                <div className="text-xs text-muted-foreground">
                  {selection.pack.name} · {selection.pack.quantity} pieces • {formatCurrency(packUnitPrice)}/item
                </div>
              )}
              {selection.size && bundle.sizePriceVariation && bundle.sizePriceVariation[selection.size] && (
                <div className="text-xs text-muted-foreground">
                  Size adjustment: +{formatCurrency(bundle.sizePriceVariation[selection.size])}
                </div>
              )}
              {bundle.dealTag && (
                <div className="text-xs font-semibold uppercase text-amber-600">{bundle.dealTag}</div>
              )}
            </div>

            {bundle.colorOptions && bundle.colorOptions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-zinc-900">
                    Colors{" "}
                    {selection.color?.name && (
                      <span className="font-normal capitalize text-muted-foreground">
                        · {selection.color.name}
                      </span>
                    )}
                  </p>
                  {selection.color?.description && (
                    <p className="text-xs text-muted-foreground">{selection.color.description}</p>
                  )}
                </div>
                <div className="grid grid-flow-col auto-cols-[88px] gap-3 overflow-x-auto pb-1">
                  {bundle.colorOptions.map((color) => (
                    <button
                      key={color.name}
                      aria-label={color.name}
                      onClick={() => handleColorSelect(color)}
                      className={`relative flex h-20 w-[88px] flex-shrink-0 flex-col rounded-2xl transition ${
                        selection.color?.name === color.name
                          ? "ring-2 ring-black shadow"
                          : "ring-1 ring-transparent hover:ring-zinc-300"
                      }`}
                    >
                      <div className="relative h-20 overflow-hidden rounded-2xl bg-zinc-100">
                        <img
                          src={getFullImageUrl(color.thumbnailImage) || bundle.heroImage || "/placeholder.svg"}
                          alt={color.name}
                          className="h-full w-full object-cover"
                        />
                        {color.badge && (
                          <span className="absolute left-1.5 top-1.5 rounded-full bg-black/80 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                            {color.badge}
                          </span>
                        )}
                      </div>
                      <span className="sr-only">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {bundle.packOptions && bundle.packOptions.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-zinc-900">
                  Packs{" "}
                  {selection.pack?.quantity && (
                    <span className="font-normal text-muted-foreground">
                      · {selection.pack.quantity} pieces
                    </span>
                  )}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {bundle.packOptions.map((pack) => (
                    <button
                      key={pack.name}
                      onClick={() => handlePackSelect(pack)}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        selection.pack?.name === pack.name
                          ? "border-black bg-black text-white shadow"
                          : "border-zinc-200 bg-white hover:border-black"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-base font-semibold">{pack.name}</div>
                        <div className="text-sm opacity-80">{formatCurrency(pack.totalPrice ?? 0)}</div>
                      </div>
                      <div
                        className={`mt-1 text-xs font-semibold uppercase ${
                          selection.pack?.name === pack.name ? "text-white/80" : "text-emerald-600"
                        }`}
                      >
                        {formatCurrency(pack.pricePerItem ?? 0)}/item
                      </div>
                      {pack.tag && (
                        <div
                          className={`mt-2 inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${
                            selection.pack?.name === pack.name
                              ? "bg-white/20 text-white"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {pack.tag}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {bundle.sizeOptions && bundle.sizeOptions.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-zinc-900">
                  Size{" "}
                  {selection.size && (
                    <span className="font-normal text-muted-foreground">· {selection.size}</span>
                  )}
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {bundle.sizeOptions.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeSelect(size)}
                      className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                        selection.size === size
                          ? "border-black bg-black text-white"
                          : "border-zinc-200 bg-white hover:border-black"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {bundle.lengthOptions && bundle.lengthOptions.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-zinc-900">
                  Length{" "}
                  {selection.length && (
                    <span className="font-normal text-muted-foreground">· {selection.length}</span>
                  )}
                </p>
                <div className="flex gap-3">
                  {bundle.lengthOptions.map((length) => (
                    <button
                      key={length}
                      onClick={() => handleLengthSelect(length)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        selection.length === length
                          ? "border-black bg-black text-white"
                          : "border-zinc-200 bg-white hover:border-black"
                      }`}
                    >
                      {length}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>Base</span>
                <span>{formatCurrency(packTotal)}</span>
              </div>
              {selection.size && bundle.sizePriceVariation && bundle.sizePriceVariation[selection.size] && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Size adj.</span>
                  <span>{formatCurrency(sizeAdjustment)}</span>
                </div>
              )}
            </div>

            <BundleAddToCart bundle={bundle} selection={selection} />

            {descriptionParagraphs.length > 0 && (
              <div className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-zinc-900">Why you'll love it</h2>
                {descriptionParagraphs.map((paragraph, idx) => (
                  <p key={idx} className="text-sm leading-relaxed text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description, Purpose, Features & Fit, Material & Care Sections - Product Page Style */}
        <section className="bg-white text-[#212121] py-8">
          <div className="container mx-auto px-4 max-w-[1250px]">
            {/* Top Horizontal Line */}
            <div className="border-t border-black mb-8"></div>
            
            {/* Three Column Layout */}
            <div className="grid grid-cols-1 gap-4 md:gap-4 md:[grid-template-columns:clamp(400px,45vw,460px)_clamp(280px,32vw,340px)_clamp(240px,28vw,280px)]">
              
              {/* Column 1: DESCRIPTION */}
              <div className="border-b border-black pb-8 md:border-b-0 md:pb-0 md:pr-8 space-y-6">
                <div>
                  <h2 
                    className="uppercase text-black mb-3"
                    style={{
                      fontFamily: "'Gilroy-Bold', 'Gilroy', sans-serif",
                      fontSize: 'clamp(16px, 1.6vw, 18px)',
                      fontWeight: 700,
                      letterSpacing: '0px'
                    }}
                  >
                    DESCRIPTION
                  </h2>
                  <div className="space-y-3">
                    {descriptionParagraphs.map((paragraph, index) => (
                      <p 
                        key={`description-${index}`}
                        className="text-black"
                        style={{
                          fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                          fontSize: 'clamp(13px, 1.3vw, 15px)',
                          fontWeight: 400,
                          lineHeight: '1.4',
                          letterSpacing: '0px',
                          margin: 0,
                          maxWidth: 'clamp(400px, 45vw, 460px)'
                        }}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                {/* PURPOSE Section */}
                <div>
                  <h3
                    className="uppercase text-black mb-3"
                    style={{
                      fontFamily: "'Gilroy-Bold', 'Gilroy', sans-serif",
                      fontSize: 'clamp(16px, 1.6vw, 18px)',
                      fontWeight: 700,
                      letterSpacing: '0px'
                    }}
                  >
                    PURPOSE
                  </h3>
                  <ul className="space-y-2">
                    {purposeItems.map((item, index) => (
                      <li
                        key={`purpose-${index}`}
                        className="text-black"
                        style={{
                          fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                          fontSize: 'clamp(13px, 1.3vw, 15px)',
                          fontWeight: 400,
                          lineHeight: '1.4',
                          letterSpacing: '0px',
                          margin: 0,
                          maxWidth: 'clamp(400px, 45vw, 460px)'
                        }}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Column 2: FEATURES & FIT and MATERIAL & CARE */}
              <div className="space-y-1 border-b border-black pb-6 md:border-b-0 md:pb-0 md:pr-6">
                
                {/* FEATURES & FIT */}
                <div>
                  <h2 
                    className="uppercase text-black mb-3"
                    style={{
                      fontFamily: "'Gilroy-Bold', 'Gilroy', sans-serif",
                      fontSize: 'clamp(16px, 1.6vw, 18px)',
                      fontWeight: 700,
                      letterSpacing: '0px'
                    }}
                  >
                    FEATURES & FIT
                  </h2>
                  <ul className="space-y-2">
                    {featuresItems.map((item, index) => (
                      <li
                        key={`fit-${index}`}
                        className="text-black"
                        style={{
                          fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                          fontSize: 'clamp(13px, 1.3vw, 15px)',
                          fontWeight: 400,
                          lineHeight: '1.4',
                          letterSpacing: '0px',
                          margin: 0,
                          maxWidth: 'clamp(280px, 32vw, 340px)'
                        }}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* MATERIAL & CARE */}
                <div className="pt-6">
                  <h2 
                    className="uppercase text-black mb-3"
                    style={{
                      fontFamily: "'Gilroy-Bold', 'Gilroy', sans-serif",
                      fontSize: 'clamp(16px, 1.6vw, 18px)',
                      fontWeight: 700,
                      letterSpacing: '0px'
                    }}
                  >
                    MATERIAL & CARE
                  </h2>
                  <div className="space-y-4">
                    {materialsItems.length > 0 && (
                      <ul className="space-y-2">
                        {materialsItems.map((item, index) => (
                          <li
                            key={`material-${index}`}
                            className="text-black"
                            style={{
                              fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                              fontSize: 'clamp(13px, 1.3vw, 15px)',
                              fontWeight: 400,
                              lineHeight: '1.4',
                              letterSpacing: '0px',
                              margin: 0,
                              maxWidth: 'clamp(400px, 45vw, 460px)'
                            }}
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {careItems.length > 0 && (
                      <div>
                        <h4
                          className="uppercase text-black mb-2"
                          style={{
                            fontFamily: "'Gilroy-Bold', 'Gilroy', sans-serif",
                            fontSize: 'clamp(13px, 1.3vw, 15px)',
                            fontWeight: 700,
                            letterSpacing: '0.5px'
                          }}
                        >
                          CARE
                        </h4>
                        <ul className="space-y-2">
                          {careItems.map((item, index) => (
                            <li
                              key={`care-${index}`}
                              className="text-black"
                              style={{
                                fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                                fontSize: 'clamp(13px, 1.3vw, 15px)',
                                fontWeight: 400,
                                lineHeight: '1.4',
                                letterSpacing: '0px',
                                margin: 0,
                                maxWidth: 'clamp(400px, 45vw, 460px)'
                              }}
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Column 3: REVIEWS */}
              <div className="space-y-3">
                <h2
                  className="uppercase text-black"
                  style={{
                    fontFamily: "'Gilroy-Bold', 'Gilroy', sans-serif",
                    fontSize: 'clamp(16px, 1.6vw, 18px)',
                    fontWeight: 700,
                    letterSpacing: '0px'
                  }}
                >
                  REVIEWS
                </h2>
                <div className="flex items-center" style={{ gap: 'clamp(6px, 0.7vw, 8px)' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className="h-3 w-3"
                      style={{
                        fill: i < Math.round(bundle.ratingValue || 0) ? '#c9ff4a' : 'transparent',
                        stroke: '#000000',
                        strokeWidth: 1
                      }}
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <p
                  className="text-black"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: 'clamp(13px, 1.3vw, 15px)',
                    fontWeight: 400,
                    lineHeight: '1.4',
                    letterSpacing: '0px',
                    margin: 0,
                    maxWidth: 'clamp(240px, 28vw, 280px)'
                  }}
                >
                  {bundle.ratingValue 
                    ? `${bundle.ratingValue.toFixed(1)} out of 5 based on ${bundle.reviewsCount || 0} review${bundle.reviewsCount === 1 ? '' : 's'}.`
                    : "No reviews yet. Be the first to share your experience with this bundle."
                  }
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const reviewSection = document.getElementById("bundle-reviews");
                    if (reviewSection) {
                      reviewSection.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  className="uppercase text-black underline underline-offset-4"
                  style={{
                    fontFamily: "'Gilroy-Medium', 'Gilroy', sans-serif",
                    fontSize: 'clamp(12px, 1.2vw, 14px)',
                    fontWeight: 600,
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer'
                  }}
                >
                  {bundle.reviewsCount ? 'Read all reviews' : 'Write a Review'}
                </button>
              </div>
            </div>
            
            {/* Bottom Horizontal Line */}
            <div className="border-t border-black mt-4"></div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl">What's inside the bundle</h2>
            <p className="text-sm text-muted-foreground">
              Every product is curated to complement each other—mix and match effortlessly.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bundle.products?.map((product) => {
              const productImage = getProductPrimaryImage(product)
              const href = `/product/${product.slug || (product as any)._id || (product as any).id || ""}`

              return (
                <Link
                  key={product._id || (product as any).id}
                  href={href}
                  className="group flex h-full flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-lg"
                >
                  <div className="relative h-48 overflow-hidden rounded-t-2xl bg-zinc-100">
                    <img
                      src={getFullImageUrl(productImage) || "/placeholder.svg"}
                      alt={product.title || product.name || "Bundle product"}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col space-y-2 p-4">
                    <h3 className="text-base font-semibold text-zinc-900 line-clamp-2">
                      {product.title || product.name || "Bundle product"}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description || "Premium performance wear designed to move with you."}
                    </p>
                    <div className="text-sm font-semibold text-zinc-900">
                      {formatCurrency(getProductPrice(product))}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {bundle.guarantees && bundle.guarantees.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-zinc-900">Guaranteed</h3>
              <div className="flex flex-wrap gap-3">
                {bundle.guarantees.map((item, index) => (
                  <div
                    key={`${item.title}-${index}`}
                    className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm shadow-sm"
                  >
                    <div className="font-semibold text-zinc-900">{item.title}</div>
                    {item.description && (
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    )}
                    {item.icon && <div className="text-xs text-muted-foreground">{item.icon}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Reviews Section Placeholder */}
        <div id="bundle-reviews" className="py-8">
          <div className="container mx-auto px-4 max-w-[1250px] text-center">
            <h3 className="text-2xl font-bold mb-4">Bundle Reviews</h3>
            <p className="text-gray-600">Reviews section will be implemented here.</p>
          </div>
        </div>
      </div>
    </div>
  )
}