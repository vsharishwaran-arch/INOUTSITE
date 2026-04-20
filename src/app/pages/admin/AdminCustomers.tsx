import { useEffect, useState } from 'react';
import { fetchCustomers, fetchCustomerOrders, type CustomerSummary } from '../../lib/api';
import { StatusBadge } from './AdminDashboard';
import { Users, Search, X, Loader2 } from 'lucide-react';

export function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    fetchCustomers()
      .then((r) => setCustomers(r.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleViewOrders = async (email: string) => {
    setSelectedEmail(email);
    setOrdersLoading(true);
    try {
      const res = await fetchCustomerOrders(email);
      setOrders(res.items);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const filtered = customers.filter(
    (c) =>
      !search ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-white rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Customers</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users size={16} />
          {customers.length} customers
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-xs mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-border bg-white text-sm rounded focus:outline-none focus:border-foreground"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-[#fafafa]">
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Email</th>
                <th className="text-right px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Orders</th>
                <th className="text-right px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Total Spent</th>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Last Order</th>
                <th className="text-right px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((customer) => (
                <tr key={customer.email} className="hover:bg-[#fafafa] transition-colors">
                  <td className="px-4 py-3 font-medium">{customer.firstName} {customer.lastName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{customer.email}</td>
                  <td className="px-4 py-3 text-right">{customer.totalOrders}</td>
                  <td className="px-4 py-3 text-right font-medium">₹{customer.totalSpent.toFixed(2)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(customer.lastOrderDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleViewOrders(customer.email)}
                      className="text-xs font-medium text-foreground underline underline-offset-2 hover:opacity-70"
                    >
                      View Orders
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer orders modal */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedEmail(null)}>
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-sm">Orders for {selectedEmail}</h2>
              <button onClick={() => setSelectedEmail(null)} className="p-1 hover:bg-gray-100 rounded">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-4">
              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-muted-foreground" size={24} />
                </div>
              ) : orders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No orders found</p>
              ) : (
                <div className="space-y-2">
                  {orders.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">#{order.id}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">₹{order.totalAmount.toFixed(2)}</p>
                        <StatusBadge status={order.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
