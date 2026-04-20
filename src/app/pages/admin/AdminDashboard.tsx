import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { fetchAllOrders, fetchProducts, fetchDashboardStats, type OrderSummary, type DashboardStats } from '../../lib/api';
import type { Product } from '../../data/products';
import { Package, ShoppingCart, IndianRupee, TrendingUp, Users, AlertTriangle } from 'lucide-react';

export function AdminDashboard() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAllOrders().then((r) => setOrders(r.items)).catch(() => {}),
      fetchProducts().then(setProducts).catch(() => {}),
      fetchDashboardStats().then(setStats).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const totalRevenue = stats?.totalRevenue ?? orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrders = stats?.pendingOrders ?? orders.filter((o) => ['pending', 'processing'].includes(o.status)).length;

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-white rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const statCards = [
    { label: 'Total Products', value: stats?.totalProducts ?? products.length, icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Orders', value: stats?.totalOrders ?? orders.length, icon: ShoppingCart, color: 'bg-purple-50 text-purple-600' },
    { label: 'Revenue', value: `₹${totalRevenue.toFixed(2)}`, icon: IndianRupee, color: 'bg-green-50 text-green-600' },
    { label: 'Pending', value: pendingOrders, icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
    { label: 'Customers', value: stats?.totalCustomers ?? 0, icon: Users, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Low Stock', value: stats?.lowStockSizes ?? 0, icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg p-5 border border-border">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <p className="text-2xl font-semibold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white rounded-lg border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-medium text-sm">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-muted-foreground hover:text-foreground">View all →</Link>
          </div>
          <div className="divide-y divide-border">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">#{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">₹{order.totalAmount.toFixed(2)}</p>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="px-5 py-6 text-sm text-muted-foreground text-center">No orders yet</p>
            )}
          </div>
        </div>

        {/* Low stock */}
        <div className="bg-white rounded-lg border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-medium text-sm">Low Stock Products</h2>
            <Link to="/admin/products" className="text-xs text-muted-foreground hover:text-foreground">View all →</Link>
          </div>
          <div className="divide-y divide-border">
            {products
              .filter((p) => p.stock <= 10)
              .slice(0, 5)
              .map((product) => (
                <div key={product.id} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={product.image} alt="" className="w-10 h-10 rounded object-cover" />
                    <p className="text-sm font-medium">{product.name}</p>
                  </div>
                  <span className={`text-xs font-medium ${product.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                    {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                  </span>
                </div>
              ))}
            {products.filter((p) => p.stock <= 10).length === 0 && (
              <p className="px-5 py-6 text-sm text-muted-foreground text-center">All products are well stocked</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
}
