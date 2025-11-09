import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import FloatingCartButton from "@/components/ui/floating-cart-button"
import CartSidebar from "@/components/ui/cart-sidebar"
import { CartProvider } from "@/lib/cart-context"
import { CurrencyProvider } from "@/lib/currency-context"
import { WishlistProvider } from "@/lib/wishlist-context"
import OrderCompletionChecker from "@/components/order-completion-checker"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Akhlekt",
  description: "Created with v0",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Red+Wing:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.cdnfonts.com/css/gilroy"
          rel="stylesheet"
        />
        {/* Google tag (gtag.js) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-DJCTNGZ690"
        />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-DJCTNGZ690');
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <CurrencyProvider>
        <CartProvider>
          <WishlistProvider>
            <OrderCompletionChecker />
            <CartSidebar />
            {children}
            <FloatingCartButton />
          </WishlistProvider>
        </CartProvider>
        </CurrencyProvider>
       
      </body>
    </html>
  )
}
