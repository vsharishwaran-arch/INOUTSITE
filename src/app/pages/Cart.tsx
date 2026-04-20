import { Link, useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import { Minus, Plus, X, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

export function Cart() {
  const { items, updateQuantity, removeFromCart, getTotalPrice } = useCart();
  const navigate = useNavigate();
  const subtotal = getTotalPrice();
  const shipping = subtotal > 0 ? (subtotal > 200 ? 0 : 15) : 0;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-10 lg:px-14">
        <div className="text-center max-w-md">
          <ShoppingBag size={64} className="mx-auto mb-6 text-muted-foreground" />
          <h2
            style={{ fontFamily: 'var(--font-display)' }}
            className="text-3xl sm:text-4xl mb-5 tracking-tight"
          >
            Your Cart is Empty
          </h2>
          <p className="text-muted-foreground mb-10 tracking-wide font-light">
            Discover premium pieces to elevate your wardrobe
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 hover:bg-foreground/90 transition-colors btn-primary"
          >
            <span>Continue Shopping</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 sm:py-16 px-4 sm:px-10 lg:px-14">
      <div className="max-w-[1400px] mx-auto">
        <h1
          style={{ fontFamily: 'var(--font-display)' }}
          className="text-4xl sm:text-[3.2rem] mb-14 tracking-tight"
        >
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-14">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item, index) => (
              <motion.div
                key={`${item.id}-${item.selectedSize}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex gap-3 sm:gap-6 pb-6 border-b border-border"
              >
                {/* Product Image */}
                <Link to={`/product/${item.id}`} className="shrink-0">
                  <div className="w-24 h-32 sm:w-32 sm:h-40 bg-muted overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>

                {/* Product Details */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between gap-4 mb-2">
                    <div>
                      <Link
                        to={`/product/${item.id}`}
                        className="hover:text-muted-foreground transition-colors"
                      >
                        <h3 className="tracking-wide mb-1">{item.name}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground tracking-wide">
                        Size: {item.selectedSize}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id, item.selectedSize)}
                      className="text-muted-foreground hover:text-foreground transition-colors h-fit"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 sm:gap-4">
                      <button
                        onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                        className="w-9 h-9 sm:w-8 sm:h-8 border border-border hover:border-foreground transition-colors flex items-center justify-center"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                        className="w-9 h-9 sm:w-8 sm:h-8 border border-border hover:border-foreground transition-colors flex items-center justify-center"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Price */}
                    <p className="tracking-wide">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-[#f9f9f9] border border-gray-100 p-5 sm:p-8 sticky top-32"
            >
              <h2
                style={{ fontFamily: 'var(--font-display)' }}
                className="text-2xl mb-6 tracking-tight"
              >
                Order Summary
              </h2>

              <div className="space-y-4 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground tracking-wide">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground tracking-wide">Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
                </div>
                {subtotal > 0 && subtotal <= 200 && (
                  <p className="text-xs text-muted-foreground">
                    Add ₹{(200 - subtotal).toFixed(2)} more for free shipping
                  </p>
                )}
              </div>

              <div className="flex justify-between mb-8">
                <span className="tracking-wide">Total</span>
                <span className="text-xl">₹{total.toFixed(2)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full btn-primary justify-center mb-4"
              >
                Proceed to Checkout
                <ArrowRight size={14} />
              </button>

              <Link
                to="/"
                className="block text-center text-[11px] tracking-[0.1em] text-gray-400 hover:text-[#0A0A0A] transition-colors uppercase"
              >
                Continue Shopping
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
