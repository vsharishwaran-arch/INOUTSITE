import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useCart } from '../context/CartContext';
import { createOrder, createPaymentIntent, openRazorpayCheckout, validateCoupon } from '../lib/api';
import { useProfile } from '../context/ProfileContext';
import { Check, AlertCircle, Tag } from 'lucide-react';
import { motion } from 'motion/react';

export function Checkout() {
  const { items, getTotalPrice, clearCart } = useCart();
  const { profileData, isProfileComplete } = useProfile();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod'>('cod');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showProfileWarning, setShowProfileWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    if (!isProfileComplete()) {
      setShowProfileWarning(true);
    }
  }, [isProfileComplete]);

  const subtotal = getTotalPrice();
  const shipping = subtotal > 200 ? 0 : 15;
  const total = subtotal + shipping - couponDiscount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const result = await validateCoupon(couponCode.trim(), subtotal);
      setCouponDiscount(result.discount);
      setCouponApplied(result.code);
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : 'Invalid coupon');
      setCouponDiscount(0);
      setCouponApplied('');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponApplied('');
    setCouponError('');
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    upiId: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if profile is complete
    if (!isProfileComplete()) {
      setShowProfileWarning(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setIsSubmitting(true);
      setCheckoutError('');

      const shippingDetails = {
        firstName: formData.firstName || profileData.firstName,
        lastName: formData.lastName || profileData.lastName,
        email: formData.email || profileData.email,
        phone: formData.phone || profileData.phone,
        address: formData.address || profileData.address,
        city: formData.city || profileData.city,
        state: formData.state || profileData.state,
        zipCode: formData.zipCode || profileData.zipCode,
      };

      let paymentProvider = 'cod';
      let paymentOrderId = 'COD-' + Date.now();
      let paymentReference = paymentOrderId;
      let paymentSignature = '';

      if (paymentMethod === 'upi') {
        const paymentIntent = await createPaymentIntent({
          amount: total,
          paymentMethod,
          customerEmail: shippingDetails.email,
        });

        paymentProvider = paymentIntent.provider;
        paymentOrderId = paymentIntent.orderId;
        paymentReference = paymentIntent.orderId;

        if (paymentIntent.provider === 'razorpay') {
          const paymentResult = await openRazorpayCheckout(paymentIntent, shippingDetails);
          paymentReference = paymentResult.paymentId;
          paymentSignature = paymentResult.signature;
        }
      }

      await createOrder({
        paymentMethod,
        paymentProvider,
        paymentOrderId,
        paymentReference,
        paymentSignature,
        couponCode: couponApplied || undefined,
        items: items.map((item) => ({
          productId: Number(item.id),
          quantity: item.quantity,
          size: item.selectedSize,
        })),
        shipping: shippingDetails,
      });

      setOrderPlaced(true);
      clearCart();
      setTimeout(() => {
        navigate('/');
      }, 2500);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Checkout failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !orderPlaced) {
    navigate('/cart');
    return null;
  }

  if (orderPlaced) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-10 lg:px-14">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-foreground text-background rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} />
          </div>
          <h2
            style={{ fontFamily: 'var(--font-display)' }}
            className="text-4xl mb-4 tracking-tight"
          >
            Order Confirmed
          </h2>
          <p className="text-muted-foreground mb-8 tracking-wide">
            Your order is confirmed. A confirmation email is on its way.
          </p>
          <p className="text-sm text-muted-foreground">Redirecting to home...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 sm:py-16 px-4 sm:px-10 lg:px-14">
      <div className="max-w-[1200px] mx-auto">
        <h1
          style={{ fontFamily: 'var(--font-display)' }}
          className="text-4xl sm:text-[3.2rem] mb-14 tracking-tight"
        >
          Checkout
        </h1>

        {/* Profile Completion Warning */}
        {showProfileWarning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-400 rounded-lg p-6 mb-8"
          >
            <div className="flex items-start gap-4">
              <AlertCircle className="text-yellow-600 mt-0.5 flex-shrink-0" size={24} />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-900 mb-2">Complete Your Profile to Checkout</h3>
                <p className="text-sm text-yellow-800 mb-4">
                  To proceed with your order, please complete your profile information including your full name, email, phone, and address details. This ensures smooth delivery of your order.
                </p>
                <div className="flex gap-3">
                  <Link
                    to="/profile"
                    className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white hover:bg-yellow-700 transition-colors text-sm tracking-wide"
                  >
                    COMPLETE PROFILE NOW
                  </Link>
                  <button
                    onClick={() => setShowProfileWarning(false)}
                    className="inline-flex items-center px-4 py-2 border border-yellow-600 text-yellow-800 hover:bg-yellow-100 transition-colors text-sm tracking-wide"
                  >
                    DISMISS
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {checkoutError && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {checkoutError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-12">
              {/* Shipping Information */}
              <div>
                <h2 className="text-xl mb-7 tracking-wide">Shipping Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="form-input sm:col-span-2"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="form-input sm:col-span-2"
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="Street Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="form-input sm:col-span-2"
                  />
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="ZIP Code"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                    className="form-input sm:col-span-2"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="text-xl mb-7 tracking-wide">Payment</h2>
                <p className="text-sm text-muted-foreground mb-4">All transactions are secure and encrypted.</p>
                <div className="border border-border rounded-lg overflow-hidden">
                  {/* Razorpay Option */}
                  <div
                    className={`cursor-pointer transition-colors ${
                      paymentMethod === 'upi' ? 'bg-orange-50/60 border-orange-400' : ''
                    }`}
                    onClick={() => setPaymentMethod('upi')}
                  >
                    <div className="flex items-center gap-3 p-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        paymentMethod === 'upi' ? 'border-orange-500' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'upi' && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold">Razorpay Secure</span>
                        <span className="text-xs text-muted-foreground ml-1">(UPI, Cards, Int'l Cards, Wallets)</span>
                      </div>
                    </div>
                    {paymentMethod === 'upi' && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="bg-gray-100 rounded p-4 text-center">
                          <p className="text-sm text-muted-foreground">
                            You'll be redirected to Razorpay Secure (UPI, Cards, Int'l Cards, Wallets) to complete your purchase.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* COD Option */}
                  <div
                    className={`cursor-pointer border-t border-border transition-colors ${
                      paymentMethod === 'cod' ? 'bg-orange-50/60' : ''
                    }`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <div className="flex items-center gap-3 p-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        paymentMethod === 'cod' ? 'border-orange-500' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                      </div>
                      <span className="text-sm font-semibold">Cash on Delivery (COD)</span>
                    </div>
                    {paymentMethod === 'cod' && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="bg-gray-100 rounded p-4 text-center">
                          <p className="text-sm text-muted-foreground">
                            Pay with cash when your order is delivered to your doorstep.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-muted/30 p-5 sm:p-8 sticky top-32">
                <h2
                  style={{ fontFamily: 'var(--font-display)' }}
                  className="text-2xl mb-6 tracking-tight"
                >
                  Order Summary
                </h2>

                {/* Products */}
                <div className="space-y-4 mb-6 pb-6 border-b border-border">
                  {items.map(item => (
                    <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4">
                      <div className="w-16 h-20 bg-muted overflow-hidden shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="mb-1">{item.name}</p>
                        <p className="text-muted-foreground">
                          Size: {item.selectedSize} × {item.quantity}
                        </p>
                        <p className="mt-2">₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Code */}
                <div className="mb-6 pb-6 border-b border-border">
                  {couponApplied ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-green-600" />
                        <span className="text-sm font-medium text-green-800">{couponApplied}</span>
                        <span className="text-xs text-green-600">-₹{couponDiscount.toFixed(2)}</span>
                      </div>
                      <button onClick={handleRemoveCoupon} className="text-xs text-green-600 hover:text-green-800 font-medium">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Coupon code"
                          className="flex-1 px-3 py-2.5 border border-border bg-background text-sm focus:outline-none focus:border-foreground transition-colors"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="px-4 py-2.5 bg-foreground text-background text-xs font-semibold uppercase tracking-wide hover:opacity-90 disabled:opacity-50"
                        >
                          {couponLoading ? '...' : 'Apply'}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-xs text-red-600 mt-1.5">{couponError}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-4 mb-6 pb-6 border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground tracking-wide">Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground tracking-wide">Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="tracking-wide">Discount</span>
                      <span>-₹{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between mb-8">
                  <span className="tracking-wide">Total</span>
                  <span className="text-xl">₹{total.toFixed(2)}</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
