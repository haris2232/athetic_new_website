"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // For product images
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useCart } from "@/lib/cart-context";
import { useCurrency } from "@/lib/currency-context";

// Data array for credit card logos
const cardLogos = [
  { name: 'Visa', src: 'https://img.icons8.com/color/48/visa.png', alt: 'Visa' },
  { name: 'Mastercard', src: 'https://img.icons8.com/color/48/mastercard-logo.png', alt: 'Mastercard' },
  { name: 'American Express', src: 'https://img.icons8.com/color/48/amex.png', alt: 'American Express' },
  { name: 'Discover', src: 'https://img.icons8.com/color/48/discover.png', alt: 'Discover' },
];

// Venmo replaced with Klarna using local public path
const expressCheckoutOptions = [
    { name: 'Shop Pay', bgColor: 'bg-purple-600', logoSrc: 'https://img.icons8.com/ios-filled/50/ffffff/shopify.png', alt: 'Shop Pay' },
    { name: 'PayPal', bgColor: 'bg-yellow-400', logoSrc: 'https://img.icons8.com/color/96/paypal.png', alt: 'PayPal' },
    { name: 'G Pay', bgColor: 'bg-black', logoSrc: 'https://img.icons8.com/color/96/google-pay.png', alt: 'G Pay' },
    { name: 'Klarna', bgColor: 'bg-pink-500', logoSrc: '/Klarna_Payment_Badge.svg.png', alt: 'Klarna' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems } = useCart();
  const { formatPrice, currency } = useCurrency();
  
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United Arab Emirates",
    },
  });

  // No need for payment details state since N-Genius will collect them

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const [shippingInfo, setShippingInfo] = useState<any>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  
  useEffect(() => {
    const calculateShipping = async () => {
      if (cartItems.length === 0) {
        setShippingInfo(null);
        return;
      }
      setShippingLoading(true);
      try {
        const response = await fetch('/api/shipping/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subtotal, region: 'US', weight: 0 }),
        });
        if (response.ok) {
          const data = await response.json();
          setShippingInfo(data);
        } else {
          setShippingInfo(null);
        }
      } catch (error) {
        console.error('Error calculating shipping:', error);
        setShippingInfo(null);
      } finally {
        setShippingLoading(false);
      }
    };
    calculateShipping();
  }, [cartItems, subtotal]);

  const shipping = shippingInfo?.isFreeShipping ? 0 : (shippingInfo?.shippingCost || 0);
  const total = subtotal + shipping - discountAmount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    setCouponLoading(true);
    setCouponError("");
    try {
      const response = await fetch("https://athlekt.com/backendnew/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, cartTotal: subtotal, items: cartItems }),
      });
      const data = await response.json();
      if (response.ok) {
        setAppliedCoupon(data.data);
        setCouponError("");
        alert(`Coupon applied! You saved ${formatPrice(data.data.discountAmount)}`);
      } else {
        setCouponError(data.message || "Invalid coupon code");
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      setCouponError("Failed to apply coupon. Please try again.");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  // Form validation function
  const isFormValid = () => {
    // Check customer details only - N-Genius will handle payment details
    return customer.name && customer.email && customer.phone && 
           customer.address.street && customer.address.city && 
           customer.address.state && customer.address.zipCode;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate customer details only - N-Genius will handle payment details
    if (!customer.name || !customer.email || !customer.phone || 
        !customer.address.street || !customer.address.city || 
        !customer.address.state || !customer.address.zipCode) {
      alert("Please fill in all required customer fields.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (!cartItems || cartItems.length === 0) {
        alert("Your cart is empty.");
        return;
      }

      const mappedItems = cartItems.map(item => ({
        productId: item.id,
        productName: item.name || "Unknown Product",
        size: item.size || "Standard",
        color: item.color || "Default",
        sku: item.id,
        quantity: item.quantity || 1,
        price: item.price || 0
      }));

      const orderData = {
        customer,
        items: mappedItems,
        couponCode: appliedCoupon ? appliedCoupon.coupon.code : null,
        discountAmount,
        subtotal,
        shippingCost: shipping,
        total,
        currency
      };

      // Step 1: Create order in your database
      const orderResponse = await fetch("https://athlekt.com/backendnew/api/orders/public/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        alert(`Failed to create order: ${errorData.message || "Unknown error"}`);
        return;
      }

      const orderResult = await orderResponse.json();
      const orderId = orderResult.data._id;

      // Store order ID in localStorage for payment success page
      localStorage.setItem('lastOrderId', orderId);

      // Step 2: Create N-Genius payment
      const paymentResponse = await fetch(`https://athlekt.com/backendnew/api/payments/ngenius/create/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        alert(`Failed to create payment: ${errorData.message || "Unknown error"}`);
        return;
      }

      const paymentData = await paymentResponse.json();
      
      // Step 3: Redirect to N-Genius payment page
      window.location.href = paymentData.data.paymentUrl;

    } catch (error) {
      console.error('Checkout error:', error);
      alert("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to your cart before checkout.</p>
          <a href="https://athlekt.com/" className="bg-black text-white py-3 px-6 rounded-md font-medium hover:bg-gray-800">
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Order Confirmed!</h2>
          <p className="text-gray-600 mb-6">Your order has been successfully placed.</p>
          {emailSent ? (
            <p className="text-sm text-gray-500 mt-2 mb-6">
              We've sent a confirmation email to {customer.email}
            </p>
          ) : (
            <p className="text-sm text-yellow-600 mt-2 mb-6">
              Order placed successfully, but we couldn't send a confirmation email.
            </p>
          )}
          <a
            href="https://athlekt.com/"
            className="bg-black text-white py-3 px-6 rounded-md font-medium hover:bg-gray-800"
          >
            Back to Homepage
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Express checkout</h2>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {expressCheckoutOptions.map((option) => (
                        <button key={option.name} className={`${option.bgColor} py-3 px-4 rounded-md font-medium flex justify-center items-center h-14`}>
                          <img
                            src={option.logoSrc}
                            alt={option.alt}
                            className="h-10 object-contain"
                            loading="lazy"
                          />
                        </button>
                    ))}
                  </div>
                  <div className="text-center text-gray-600">Or</div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Contact</h2>
                    <a href="https://athlekt.com/login" className="text-blue-600 hover:underline">Log in</a>
                  </div>
                  <input type="email" placeholder="Email" required value={customer.email} onChange={(e) => setCustomer({...customer, email: e.target.value})} className="w-full p-3 border border-gray-300 rounded-md"/>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Delivery</h2>
                  <div className="space-y-4">
                    <select className="w-full p-3 border border-gray-300 rounded-md"><option>United Arab Emirates</option></select>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="First name" required value={customer.name.split(' ')[0] || ''} onChange={(e) => { const lastName = customer.name.split(' ').slice(1).join(' ') || ''; setCustomer({...customer, name: e.target.value + ' ' + lastName}); }} className="w-full p-3 border border-gray-300 rounded-md"/>
                      <input type="text" placeholder="Last name" required value={customer.name.split(' ').slice(1).join(' ') || ''} onChange={(e) => { const firstName = customer.name.split(' ')[0] || ''; setCustomer({...customer, name: firstName + ' ' + e.target.value}); }} className="w-full p-3 border border-gray-300 rounded-md"/>
                    </div>
                    <input type="text" placeholder="Address" required value={customer.address.street} onChange={(e) => setCustomer({...customer, address: {...customer.address, street: e.target.value}})} className="w-full p-3 border border-gray-300 rounded-md"/>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="City" required value={customer.address.city} onChange={(e) => setCustomer({...customer, address: {...customer.address, city: e.target.value}})} className="w-full p-3 border border-gray-300 rounded-md"/>
                      <input type="text" placeholder="State" required value={customer.address.state} onChange={(e) => setCustomer({...customer, address: {...customer.address, state: e.target.value}})} className="w-full p-3 border border-gray-300 rounded-md"/>
                    </div>
                    <input type="text" placeholder="ZIP code" required value={customer.address.zipCode} onChange={(e) => setCustomer({...customer, address: {...customer.address, zipCode: e.target.value}})} className="w-full p-3 border border-gray-300 rounded-md"/>
                  </div>
                </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Payment</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 border border-gray-300 rounded-md bg-blue-50">
                    <div className="flex items-center space-x-2">
                      {cardLogos.map((card) => (
                        <div key={card.name} className="relative w-10 h-6">
                          <img
                            src={card.src}
                            alt={card.alt}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-700">Credit Card Payment</span>
                      <p className="text-sm text-gray-500 mt-1">You will be redirected to our secure payment page to enter your card details</p>
                    </div>
                  </div>
                </div>
              </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <input type="checkbox" id="remember" className="text-blue-600" />
                    <label htmlFor="remember" className="text-sm">Save my information for a faster checkout</label>
                  </div>
                  <input type="tel" placeholder="+1 Mobile phone number" value={customer.phone} onChange={(e) => setCustomer({...customer, phone: e.target.value})} className="w-full p-3 border border-gray-300 rounded-md"/>
                </div>

                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || !isFormValid()} 
                  className={`w-full py-4 px-6 rounded-md font-semibold text-lg ${
                    isFormValid() && !isSubmitting 
                      ? "bg-black text-white hover:bg-gray-800" 
                      : "bg-gray-400 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? "Processing..." : "PAY NOW"}
                </button>
            </div>

            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-6">Order summary</h2>
                  <div className="space-y-4">
                    {cartItems.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden">
                          <Image src={item.image} alt={item.name} width={64} height={64} className="w-full h-full object-cover"/>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.fit} • {item.color} • {item.size}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                    <div className="border-t pt-4">
                      {appliedCoupon ? (
                        <div className="flex items-center justify-between bg-green-50 p-3 rounded-md">
                          <div>
                            <p className="font-medium text-green-800">Coupon: {appliedCoupon.coupon.code}</p>
                            <p className="text-sm text-green-600">-{formatPrice(appliedCoupon.discountAmount)}</p>
                          </div>
                          <button onClick={removeCoupon} className="text-red-600 hover:text-red-800 text-sm font-medium">Remove</button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex space-x-2">
                            <input type="text" placeholder="Discount code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="flex-1 p-3 border border-gray-300 rounded-md"/>
                            <button onClick={applyCoupon} disabled={couponLoading} className="bg-gray-200 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-300 disabled:opacity-50">
                              {couponLoading ? "..." : "APPLY"}
                            </button>
                          </div>
                          {couponError && <p className="text-red-600 text-sm">{couponError}</p>}
                        </div>
                      )}
                    </div>
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                      {discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(discountAmount)}</span></div>}
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">Total</span>
                          <div className="text-right">
                            <span className="text-sm text-gray-500 mr-2">{currency}</span>
                            <span className="text-xl font-bold">{formatPrice(total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}