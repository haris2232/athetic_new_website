"use client";

import { useEffect } from 'react';
import { useCart } from '@/lib/cart-context';

export default function OrderCompletionChecker() {
  const { clearCart } = useCart();

  useEffect(() => {
    const checkForCompletedOrders = async () => {
      try {
        // Check if there's a recent order in localStorage
        const lastOrderId = localStorage.getItem('lastOrderId');
        if (!lastOrderId) return;

        console.log('🔍 Checking for completed order:', lastOrderId);

        // Check payment status
        const response = await fetch(`https://athlekt.com/backendnew/api/payments/status/${lastOrderId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('🔍 Order status check result:', data);

          if (data.data && data.data.paymentStatus === 'paid') {
            console.log('🛒 Order completed, clearing cart');
            clearCart();
            
            // Send email if not already sent (trigger backend email sending)
            try {
              await fetch(`https://athlekt.com/backendnew/api/payments/status/${lastOrderId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
              });
              console.log('📧 Email sending triggered for completed order');
            } catch (emailError) {
              console.error('❌ Error triggering email:', emailError);
            }
            
            // Clear the lastOrderId to prevent repeated checks
            localStorage.removeItem('lastOrderId');
          }
        }
      } catch (error) {
        console.error('❌ Error checking order completion:', error);
      }
    };

    // Check immediately when component mounts
    checkForCompletedOrders();

    // Also check when user returns to the page (focus event)
    const handleFocus = () => {
      checkForCompletedOrders();
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [clearCart]);

  return null; // This component doesn't render anything
}
