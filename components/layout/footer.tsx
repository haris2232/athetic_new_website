import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Footer() {
  return (
    <footer className="bg-[#212121] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Akhlekt</h3>
            <p className="text-[#d9d9d9] max-w-sm">
              Premium athletic wear that combines performance with contemporary design for the modern athlete.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-[#d9d9d9] hover:text-[#cbf26c]">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-[#d9d9d9] hover:text-[#cbf26c]">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-[#d9d9d9] hover:text-[#cbf26c]">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-[#d9d9d9] hover:text-[#cbf26c]">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Shop</h4>
            <nav className="flex flex-col space-y-2">
              <Link href="/men" className="text-[#d9d9d9] hover:text-[#cbf26c] transition-colors">
                Men's Collection
              </Link>
              <Link href="/women" className="text-[#d9d9d9] hover:text-[#cbf26c] transition-colors">
                Women's Collection
              </Link>
              <Link href="/accessories" className="text-[#d9d9d9] hover:text-[#cbf26c] transition-colors">
                Accessories
              </Link>
              <Link href="/sale" className="text-[#d9d9d9] hover:text-[#cbf26c] transition-colors">
                Sale
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Support</h4>
            <nav className="flex flex-col space-y-2">
              <Link href="/contact" className="text-[#d9d9d9] hover:text-[#cbf26c] transition-colors">
                Contact Us
              </Link>
              <Link href="/size-guide" className="text-[#d9d9d9] hover:text-[#cbf26c] transition-colors">
                Size Guide
              </Link>
              <Link href="/shipping" className="text-[#d9d9d9] hover:text-[#cbf26c] transition-colors">
                Shipping Info
              </Link>
              <Link href="/returns" className="text-[#d9d9d9] hover:text-[#cbf26c] transition-colors">
                Returns
              </Link>
            </nav>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Stay Updated</h4>
            <p className="text-[#d9d9d9] text-sm">Subscribe to get special offers, free giveaways, and updates.</p>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-[#141619] border-[#141619] text-white placeholder:text-[#6e6e6e]"
              />
              <Button className="w-full bg-[#cbf26c] text-[#212121] hover:bg-[#9fcc3b] font-semibold">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="border-t border-[#141619] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-[#6e6e6e] text-sm">© {new Date().getFullYear()} Akhlekt. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-[#6e6e6e] hover:text-[#cbf26c] text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-[#6e6e6e] hover:text-[#cbf26c] text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
