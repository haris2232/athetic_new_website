"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { CheckCircle, Package, Mail } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [orderStatus, setOrderStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { clearCart } = useCart();

  useEffect(() => {
    const checkOrderStatus = async () => {
      try {
        // Get order ID from URL params or localStorage
        const orderId = searchParams.get('orderId') || localStorage.getItem('lastOrderId');
        
        console.log('🔍 Payment Success Page - Order ID:', orderId);
        console.log('🔍 URL search params:', searchParams.toString());
        console.log('🔍 localStorage lastOrderId:', localStorage.getItem('lastOrderId'));
        
        // Clear cart immediately when payment success page loads
        console.log('🛒 Clearing cart immediately on payment success page load');
        clearCart();
        
        if (orderId) {
          console.log('🔍 Calling payment status API for order:', orderId);
          const response = await fetch(`https://athlekt.com/backendnew/api/payments/status/${orderId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Payment status response:', data);
            setOrderStatus(data.data);
            
            // Clear cart again after successful API response (double safety)
            if (data.data && (data.data.paymentStatus === 'paid' || data.data.paymentStatus === 'pending')) {
              console.log('🛒 Clearing cart again after successful API response');
              clearCart();
            }
          } else {
            console.error('❌ Payment status API failed:', response.status);
            console.error('❌ Response text:', await response.text());
          }
        } else {
          console.error('❌ No order ID found in URL params or localStorage');
        }
      } catch (error) {
        console.error('❌ Error checking order status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkOrderStatus();
  }, [searchParams, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Payment Successful!
            </h1>
            
            <p className="text-gray-600 mb-6">
              Thank you for your order. Your payment has been processed successfully.
            </p>

            {orderStatus && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Order Details</h2>
                <div className="space-y-2 text-sm">
                  <p><strong>Order Number:</strong> {orderStatus.orderNumber}</p>
                  <p><strong>Amount:</strong> AED {orderStatus.total}</p>
                  <p><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      orderStatus.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {orderStatus.paymentStatus === 'paid' ? 'Paid' : 'Processing'}
                    </span>
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center space-x-4 mb-6">
              <Package className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                You will receive a confirmation email shortly
              </span>
            </div>

            <div className="space-y-4">
              <Link 
                href="/"
                className="inline-block bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
              >
                Continue Shopping
              </Link>
              
              <div>
                <Link 
                  href="/profile"
                  className="text-gray-600 hover:text-gray-900 underline"
                >
                  View Order History
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
