// src/pages/terms.tsx OR src/app/terms/page.tsx

import Link from "next/link"
import Header from "@/components/layout/header"

export default function TermsPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#0f1013] flex items-center justify-center px-4 pt-20 pb-12">
        <div className="w-full max-w-2xl text-white">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white uppercase mb-2">
              Terms &amp; Conditions
            </h1>
            <p className="text-[#d9d9d9] text-sm">
              Effective Date: 26th of August 2025
            </p>
          </div>

          <div className="prose prose-sm prose-invert text-[#d9d9d9]">
            <p className="mb-4">
              Welcome to Athlekt.com. By accessing or using our website, purchasing products, or interacting
              with our services, you agree to be bound by these Terms and Conditions (“Terms”). Please read
              them carefully. If you do not agree, you must not use this website.
            </p>

            <h2 className="text-xl font-bold text-white mb-2 mt-6">
              1. General Use of Website
            </h2>
            <ul className="list-disc list-inside">
              <li>Athlekt.com provides sportswear, apparel, and related products (“Products”) for online purchase.</li>
              <li>You must be at least 18 years old to place an order.</li>
              <li>You agree not to misuse the website, interfere with its operation, or attempt unauthorized access.</li>
            </ul>

            <h2 className="text-xl font-bold text-white mb-2 mt-6">
              2. Orders &amp; Payments
            </h2>
            <ul className="list-disc list-inside">
              <li>All orders placed on Athlekt.com are subject to acceptance and availability.</li>
              <li>Prices are displayed in AED or USD and may include or exclude applicable taxes depending on your region.</li>
              <li>Payments must be made using the payment methods available at checkout.</li>
              <li>We reserve the right to refuse or cancel any order at our discretion (e.g., suspected fraud or stock unavailability).</li>
            </ul>

            <h2 className="text-xl font-bold text-white mb-2 mt-6">
              3. Shipping &amp; Delivery
            </h2>
            <ul className="list-disc list-inside">
              <li>Orders will be processed and shipped to the address provided by you.</li>
              <li>Delivery times are estimates and may vary due to external factors (customs, courier delays, etc.).</li>
              <li>Risk of loss or damage passes to you once the order is delivered.</li>
            </ul>

            <h2 className="text-xl font-bold text-white mb-2 mt-6">
              4. Returns &amp; Exchanges
            </h2>
            <ul className="list-disc list-inside">
              <li>You may return or exchange eligible products within 14 days of receipt, provided they are unused, unworn, and in original packaging with tags attached.</li>
              <li>Items such as undergarments, final sale, or customized products may not be eligible for return.</li>
              <li>Refunds will be issued to the original payment method, less any shipping fees (unless the product was faulty or incorrect).</li>
            </ul>

            <h2 className="text-xl font-bold text-white mb-2 mt-6">
              5. Intellectual Property
            </h2>
            <ul className="list-disc list-inside">
              <li>All content on Athlekt.com, including logos, designs, images, and text, is the property of Athlekt and protected by copyright, trademark, and intellectual property laws.</li>
              <li>You may not reproduce, distribute, or exploit any material without our written permission.</li>
            </ul>

            <h2 className="text-xl font-bold text-white mb-2 mt-6">
              6. Limitation of Liability
            </h2>
            <ul className="list-disc list-inside">
              <li>Athlekt is not responsible for any indirect, incidental, or consequential damages arising from the use of our products or website.</li>
              <li>Product use is at your own risk. Always consult with a fitness professional before beginning any training program while using Athlekt products.</li>
            </ul>

            <h2 className="text-xl font-bold text-white mb-2 mt-6">
              7. Privacy
            </h2>
            <p>
              Use of our website is also governed by our{" "}
              <Link href="/privacy-policy" className="text-white font-bold hover:text-[#cbf26c]">
                Privacy Policy
              </Link>
              , which explains how we collect, use, and protect your personal information.
            </p>

            <h2 className="text-xl font-bold text-white mb-2 mt-6">
              8. Changes to Terms
            </h2>
            <p>
              Athlekt reserves the right to update or change these Terms at any time. Updated versions
              will be posted on this page with the revised effective date.
            </p>

            <h2 className="text-xl font-bold text-white mb-2 mt-6">
              9. Governing Law
            </h2>
            <ul className="list-disc list-inside">
              <li>These Terms shall be governed by the laws of United Arab Emirates, without regard to its conflict of law principles.</li>
              <li>Any disputes shall be subject to the exclusive jurisdiction of the courts in UAE.</li>
            </ul>

            <h2 className="text-xl font-bold text-white mb-2 mt-6">
              10. Contact Us
            </h2>
            <p>
              For questions regarding these Terms, please contact us at:
            </p>
            <p className="font-bold">
              📧 info@athlekt.com <br />
              📍 Office 43-44, Owned by Dubai Municipality, Al Fahidi, Bur Dubai
            </p>
          </div>

          <div className="text-center mt-8">
            <p className="text-[#d9d9d9] text-sm">
              Back to{" "}
              <Link href="/login" className="font-bold text-white hover:text-[#cbf26c]">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
