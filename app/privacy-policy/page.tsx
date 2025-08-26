// src/pages/privacy-policy.tsx or src/app/privacy-policy/page.tsx

import Link from "next/link"
import Header from "@/components/layout/header" // Updated path

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header /> 
      <div className="min-h-screen bg-[#0f1013] flex items-center justify-center px-4 pt-20 pb-12">
        <div className="w-full max-w-2xl text-white">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white uppercase mb-2">
              Privacy Policy
            </h1>
            <p className="text-[#d9d9d9] text-sm">
              Effective Date: 26th of August 2025
            </p>
          </div>

          <div className="prose prose-sm prose-invert text-[#d9d9d9]">
            <p className="mb-4">
              At Athlekt, we respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website, interact with our services, or make a purchase from us.
            </p>
            <h2 className="text-xl font-bold text-white mb-2 mt-6">
              1. Information We Collect
            </h2>
            <p>
              We may collect the following types of information when you use our website or services:
            </p>
            <ul className="list-disc list-inside">
              <li><strong>Personal Information:</strong> Name, email address, phone number, billing/shipping address, payment details.</li>
              <li><strong>Account Information:</strong> Login credentials, order history, saved preferences.</li>
              <li><strong>Technical Information:</strong> IP address, browser type, operating system, and browsing behavior.</li>
              <li><strong>Marketing Data:</strong> Preferences for receiving promotional communications.</li>
            </ul>

            <h2 className="text-xl font-bold text-white mb-2 mt-6">
              2. How We Use Your Information
            </h2>
            <p>
              Athlekt uses the information we collect to:
            </p>
            <ul className="list-disc list-inside">
              <li>Process and fulfill your orders.</li>
              <li>Provide customer support and manage your account.</li>
              <li>Improve our products, services, and website experience.</li>
              <li>Send promotional emails, offers, and updates (only if you have opted in).</li>
              <li>Detect, prevent, and address fraud, unauthorized access, or other harmful activity.</li>
            </ul>
            
            <h2 className="text-xl font-bold text-white mb-2 mt-6">
              3. Sharing of Information
            </h2>
            <p>
              We do not sell your personal data. However, we may share your information with trusted third parties, including:
            </p>
            <ul className="list-disc list-inside">
              <li>Payment processors and financial institutions.</li>
              <li>Shipping and logistics partners.</li>
              <li>IT service providers, analytics, and marketing platforms (for website functionality and campaigns).</li>
              <li>Legal authorities, if required by law.</li>
            </ul>
            
            <h2 className="text-xl font-bold text-white mb-2 mt-6">
              4. Cookies & Tracking
            </h2>
            <p>
              Athlekt uses cookies and similar tracking technologies to enhance your browsing experience. These help us remember preferences, understand how our site is used, and improve our marketing efforts. You can manage or disable cookies through your browser settings.
            </p>

            <h2 className="text-xl font-bold text-white mb-2 mt-6">
              5. Data Security
            </h2>
            <p>
              We implement appropriate technical and organizational measures to safeguard your personal information. While we take reasonable steps to protect your data, please note that no method of transmission over the internet is completely secure.
            </p>

            <h2 className="text-xl font-bold text-white mb-2 mt-6">
              6. Your Rights
            </h2>
            <p>
              Depending on your jurisdiction, you may have the right to:
            </p>
            <ul className="list-disc list-inside">
              <li>Access, update, or correct your personal data.</li>
              <li>Request deletion of your personal information.</li>
              <li>Opt out of marketing communications at any time.</li>
              <li>Restrict or object to certain data processing activities.</li>
            </ul>
            <p>
              Requests can be made by contacting us at <strong>info@athlekt.com</strong>.
            </p>

            <h2 className="text-xl font-bold text-white mb-2 mt-6">
              7. Third-Party Links
            </h2>
            <p>
              Our website may contain links to external websites. Athlekt is not responsible for the privacy practices or content of these third-party sites.
            </p>

            <h2 className="text-xl font-bold text-white mb-2 mt-6">
              8. Children’s Privacy
            </h2>
            <p>
              Athlekt does not knowingly collect or solicit personal information from children under the age of 16. If we learn that we have collected such information, we will take steps to delete it promptly.
            </p>

            <h2 className="text-xl font-bold text-white mb-2 mt-6">
              9. Updates to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal obligations. The updated version will be posted on this page with a revised “Effective Date.”
            </p>

            <h2 className="text-xl font-bold text-white mb-2 mt-6">
              10. Contact Us
            </h2>
            <p>
              If you have any questions or concerns about this Privacy Policy, you may contact us at:
            </p>
            <p className="font-bold">
              📧 info@athlekt.com
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