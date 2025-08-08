"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useCart } from "@/lib/cart-context";
import { useCurrency } from "@/lib/currency-context";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal } = useCart();
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
      country: "United States",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // Calculate totals based on actual cart items
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Shipping calculation states
  const [shippingInfo, setShippingInfo] = useState<any>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  
  // Calculate discount
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  
  // Calculate shipping when cart items change
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
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subtotal: subtotal,
            region: 'US',
            weight: 0
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Shipping calculation response:', data);
          setShippingInfo(data);
        } else {
          console.error('Shipping calculation failed:', response.status);
          // Don't set fallback - let the backend handle it
          setShippingInfo(null);
        }
      } catch (error) {
        console.error('Error calculating shipping:', error);
        // Don't set fallback - let the backend handle it
        setShippingInfo(null);
      } finally {
        setShippingLoading(false);
      }
    };

    calculateShipping();
  }, [cartItems, subtotal]);

  // Calculate totals like cart page
  const shipping = shippingInfo?.isFreeShipping ? 0 : (shippingInfo?.shippingCost || 0);
  const total = subtotal + shipping - discountAmount;
  const freeShippingThreshold = shippingInfo?.rule?.freeShippingAt || 0;
  const remainingForFreeShipping = shippingInfo?.remainingForFreeShipping || 0;

  // Apply coupon function
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
        body: JSON.stringify({
          code: couponCode,
          cartTotal: subtotal,
          items: cartItems
        }),
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

  // Remove coupon function
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!customer.name || !customer.email || !customer.phone) {
      alert("Please fill in all required fields: name, email, and phone number");
      return;
    }
    
    if (!customer.address.street || !customer.address.city || !customer.address.state || !customer.address.zipCode) {
      alert("Please fill in all address fields");
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Validate cart items
      if (!cartItems || cartItems.length === 0) {
        alert("Your cart is empty. Please add items before checkout.");
        return;
      }

      // Map cart items to the expected backend format
      const mappedItems = cartItems.map(item => ({
        productId: item.id,
        productName: item.name || "Unknown Product",
        size: item.size || "Standard",
        color: item.color || "Default",
        sku: item.id,
        quantity: item.quantity || 1,
        price: item.price || 0
      }));
      
      console.log("Mapped cart items:", JSON.stringify(mappedItems, null, 2));
      console.log("Cart total:", cartTotal);
      console.log("Subtotal:", subtotal);

      const orderData = {
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address
        },
        items: mappedItems,
        couponCode: appliedCoupon ? appliedCoupon.coupon.code : null,
        discountAmount: discountAmount,
        subtotal: subtotal,
        shippingCost: shipping,
        total: total,
        currency: currency
      };

      console.log("Sending order to backend...");
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      

      const response = await fetch("https://athlekt.com/backendnew/api/orders/public/create", {

        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(orderData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setOrderSuccess(true);
        setEmailSent(data.emailSent || false);
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { message: "Failed to parse error response" };
        }
        
        console.error("Order creation failed:", errorData);
        console.error("Request data sent:", orderData);
        console.error("Response status:", response.status);
        console.error("Response headers:", Object.fromEntries(response.headers.entries()));
        
        // Handle different error types
        if (response.status === 400) {
          const errorMessage = errorData.message || errorData.error || "Invalid order data. Please check your information and try again.";
          alert("Validation Error: " + errorMessage);
        } else if (response.status === 401) {
          alert("Please login to complete your order.");
          router.push("/login");
        } else if (response.status === 500) {
          alert("Server error. Please try again later or contact support.");
        } else {
          const errorMessage = errorData.message || errorData.error || "Unknown error occurred";
          alert("Failed to create order: " + errorMessage);
        }
      }
    } catch (error: any) {
      console.error("Error:", error);
      
      if (error.name === 'AbortError') {
        alert("Request timed out. Please check if the backend server is running and try again.");
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert("Cannot connect to server. Please check if the backend server is running on localhost:5000");
      } else {
        alert("Network error. Please check your connection and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show empty cart message if no items
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to your cart before checkout.</p>
          <a 
            href="/sale/men" 
            className="bg-black text-white py-3 px-6 rounded-md font-medium hover:bg-gray-800"
          >
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
          <p className="text-gray-600">Your order has been successfully placed.</p>
          {emailSent ? (
            <p className="text-sm text-gray-500 mt-2">
              We've sent a confirmation email to {customer.email}
            </p>
          ) : (
            <p className="text-sm text-yellow-600 mt-2">
              Order placed successfully, but we couldn't send a confirmation email. Please check your order details.
            </p>
          )}
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
            {/* Left Column - Checkout Form */}
            <div className="space-y-8">
              {/* Express Checkout */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Express checkout</h2>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button className="bg-purple-600 text-white py-3 px-4 rounded-md font-medium">
                    Shop Pay
                  </button>
                  <button className="bg-yellow-400 text-black py-3 px-4 rounded-md font-medium">
                    PayPal
                  </button>
                  <button className="bg-black text-white py-3 px-4 rounded-md font-medium">
                    G Pay
                  </button>
                  <button className="bg-blue-600 text-white py-3 px-4 rounded-md font-medium">
                    Venmo
                  </button>
                </div>
                <div className="text-center text-gray-600">Or</div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Contact</h2>
                  <a href="#" className="text-blue-600 hover:underline">Log in</a>
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={customer.email}
                  onChange={(e) => setCustomer({...customer, email: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Delivery Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Delivery</h2>
                <div className="space-y-4">
                  <select className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>United States</option>
                  </select>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First name"
                      required
                      value={customer.name.split(' ')[0] || ''}
                      onChange={(e) => {
                        const lastName = customer.name.split(' ').slice(1).join(' ') || '';
                        setCustomer({...customer, name: e.target.value + ' ' + lastName});
                      }}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      required
                      value={customer.name.split(' ').slice(1).join(' ') || ''}
                      onChange={(e) => {
                        const firstName = customer.name.split(' ')[0] || '';
                        setCustomer({...customer, name: firstName + ' ' + e.target.value});
                      }}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Address"
                    required
                    value={customer.address.street}
                    onChange={(e) => setCustomer({
                      ...customer, 
                      address: {...customer.address, street: e.target.value}
                    })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="City"
                      required
                      value={customer.address.city}
                      onChange={(e) => setCustomer({
                        ...customer, 
                        address: {...customer.address, city: e.target.value}
                      })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      required
                      value={customer.address.state}
                      onChange={(e) => setCustomer({
                        ...customer, 
                        address: {...customer.address, state: e.target.value}
                      })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <input
                    type="text"
                    placeholder="ZIP code"
                    required
                    value={customer.address.zipCode}
                    onChange={(e) => setCustomer({
                      ...customer, 
                      address: {...customer.address, zipCode: e.target.value}
                    })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Payment</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input type="radio" name="payment" id="card" defaultChecked className="text-blue-600" />
                    <label htmlFor="card" className="font-medium">Credit card</label>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">V</span>
                      </div>
                      <div className="w-8 h-5 bg-red-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">M</span>
                      </div>
                      <div className="w-8 h-5 bg-yellow-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">A</span>
                      </div>
                      <div className="w-8 h-5 bg-blue-800 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">D</span>
                      </div>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Card number"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Expiration date (MM/YY)"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Security code"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Name on card"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  <div className="flex items-center space-x-3">
                    <input type="checkbox" id="billing" defaultChecked className="text-blue-600" />
                    <label htmlFor="billing" className="text-sm">Use shipping address as billing address</label>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center space-x-3">
                    <input type="radio" name="payment" id="paypal" className="text-blue-600" />
                    <label htmlFor="paypal" className="font-medium">PayPal</label>
                    <button className="bg-yellow-400 text-black py-2 px-4 rounded ml-auto">PayPal</button>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input type="radio" name="payment" id="afterpay" className="text-blue-600" />
                    <label htmlFor="afterpay" className="font-medium">Afterpay</label>
                    <button className="bg-green-600 text-white py-2 px-4 rounded ml-auto">Afterpay</button>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input type="radio" name="payment" id="klarna" className="text-blue-600" />
                    <label htmlFor="klarna" className="font-medium">Klarna - Flexible payments</label>
                    <button className="bg-pink-600 text-white py-2 px-4 rounded ml-auto">Klarna</button>
                  </div>
                </div>
              </div>

              {/* Remember Me */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <input type="checkbox" id="remember" className="text-blue-600" />
                  <label htmlFor="remember" className="text-sm">Save my information for a faster checkout with a Shop account</label>
                </div>

                <input
                  type="tel"
                  placeholder="+1 Mobile phone number"
                  value={customer.phone}
                  onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <div className="flex items-center space-x-2 mt-4">
                  <span className="text-sm text-gray-600">Secure and encrypted</span>
                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">S</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  By continuing, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>, 
                  <a href="#" className="text-blue-600 hover:underline"> Privacy Notice</a>, and 
                  <a href="#" className="text-blue-600 hover:underline"> Cookie Policy</a>.
                </p>
              </div>

              {/* Pay Now Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-black text-white py-4 px-6 rounded-md font-semibold text-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Processing..." : "PAY NOW"}
              </button>
              
              <p className="text-xs text-gray-500 text-center">
                By continuing, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and 
                <a href="#" className="text-blue-600 hover:underline"> Privacy Policy</a>.
              </p>
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6">Order summary</h2>
                
                <div className="space-y-4">
                  {/* Products */}
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.fit} • {item.color} • {item.size}
                        </p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}

                  {/* Discount Code */}
                  <div className="border-t pt-4">
                    {appliedCoupon ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-green-50 p-3 rounded-md">
                          <div>
                            <p className="font-medium text-green-800">Coupon Applied: {appliedCoupon.coupon.code}</p>
                            <p className="text-sm text-green-600">-{formatPrice(appliedCoupon.discountAmount)}</p>
                          </div>
                          <button 
                            onClick={removeCoupon}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Discount code or gift card"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button 
                            onClick={applyCoupon}
                            disabled={couponLoading}
                            className="bg-gray-200 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-300 disabled:opacity-50"
                          >
                            {couponLoading ? "..." : "APPLY"}
                          </button>
                        </div>
                        {couponError && (
                          <p className="text-red-600 text-sm">{couponError}</p>
                        )}
                        <a href="#" className="text-blue-600 hover:underline text-sm">Been referred by a friend?</a>
                      </div>
                    )}
                  </div>

                  {/* Cost Breakdown */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                        {shipping === 0 ? "FREE" : formatPrice(shipping)}
                      </span>
                    </div>
                    {subtotal < freeShippingThreshold && !shippingLoading && freeShippingThreshold > 0 && (
                      <div className="text-sm text-gray-600">
                        Add {formatPrice(freeShippingThreshold - subtotal)} more for free shipping!
                      </div>
                    )}
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

                  {/* Shipping Promotion */}
                  <div className="bg-blue-50 p-4 rounded-md">
                    <p className="text-sm text-blue-800">{formatPrice(1)} To Get Free Shipping</p>
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
