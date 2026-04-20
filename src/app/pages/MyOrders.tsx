import { useState, type FormEvent } from 'react';
import { fetchMyOrders, type MyOrderSummary } from '../lib/api';
import { StatusBadge } from './admin/AdminDashboard';
import { useProfile } from '../context/ProfileContext';
import { Search, Package, ChevronDown, ChevronUp } from 'lucide-react';

export function MyOrders() {
  const { profileData } = useProfile();
  const [email, setEmail] = useState(profileData.email || '');
  const [orders, setOrders] = useState<MyOrderSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await fetchMyOrders(email.trim());
      setOrders(result.items);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-10 lg:px-14 py-12">
      <h1 className="text-2xl font-semibold tracking-tight mb-2">My Orders</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Enter your email to view your order history and track deliveries.
      </p>

      {/* Email search */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <input
          type="email"
          required
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-4 py-3 border border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-foreground text-background text-xs font-semibold tracking-[0.1em] uppercase hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
        >
          <Search size={14} />
          {loading ? 'Searching...' : 'Track Orders'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}

      {/* Results */}
      {searched && orders.length === 0 && !loading && (
        <div className="text-center py-16">
          <Package size={48} className="mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">No orders found for this email address.</p>
        </div>
      )}

      {orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-border rounded-lg bg-white overflow-hidden">
              {/* Order header */}
              <button
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#fafafa] transition-colors"
              >
                <div className="flex items-center gap-4 text-left">
                  <div>
                    <p className="text-sm font-semibold">Order #{order.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={order.status} />
                  <span className="text-sm font-semibold">₹{order.totalAmount.toFixed(2)}</span>
                  {expandedId === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {/* Expanded details */}
              {expandedId === order.id && (
                <div className="border-t border-border px-5 py-4">
                  <div className="grid sm:grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">Status</p>
                      <StatusBadge status={order.status} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">Payment</p>
                      <StatusBadge status={order.paymentStatus} />
                      <span className="ml-1 text-xs text-muted-foreground capitalize">({order.paymentMethod})</span>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">Shipping</p>
                      <p>{order.shippingAmount === 0 ? 'Free' : `₹${order.shippingAmount.toFixed(2)}`}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-[#fafafa] rounded-lg">
                        {item.image && (
                          <img src={item.image} alt="" className="w-14 h-14 rounded-md object-cover" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">Size: {item.size} · Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium">₹{item.lineTotal.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="border-t border-border mt-4 pt-3 text-sm space-y-1">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>₹{order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span>{order.shippingAmount === 0 ? 'Free' : `₹${order.shippingAmount.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-1">
                      <span>Total</span>
                      <span>₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
