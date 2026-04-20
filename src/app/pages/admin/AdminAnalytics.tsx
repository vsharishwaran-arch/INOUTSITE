import { useEffect, useState } from 'react';
import {
  fetchDashboardStats,
  fetchRevenueChart,
  fetchBestSellers,
  fetchOrdersByStatus,
  type DashboardStats,
} from '../../lib/api';
import { DollarSign, TrendingUp, ShoppingCart, BarChart3 } from 'lucide-react';

export function AdminAnalytics() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenue, setRevenue] = useState<{ date: string; orders: number; revenue: number }[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      fetchDashboardStats().then(setStats).catch(() => {}),
      fetchRevenueChart(days).then((r) => setRevenue(r.items)).catch(() => {}),
      fetchBestSellers(10).then((r) => setBestSellers(r.items)).catch(() => {}),
      fetchOrdersByStatus().then(setStatusBreakdown).catch(() => {}),
    ]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [days]);

  if (loading || !stats) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-white rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const maxRevenue = Math.max(...revenue.map((r) => r.revenue), 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Analytics & Reports</h1>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="px-3 py-2 border border-border bg-white text-sm rounded focus:outline-none focus:border-foreground"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={DollarSign} label="Total Revenue" value={`₹${stats.totalRevenue.toFixed(2)}`} color="bg-green-50 text-green-600" />
        <StatCard icon={ShoppingCart} label="Total Orders" value={stats.totalOrders} color="bg-blue-50 text-blue-600" />
        <StatCard icon={TrendingUp} label="Customers" value={stats.totalCustomers} color="bg-purple-50 text-purple-600" />
        <StatCard icon={BarChart3} label="Discounts Given" value={`₹${stats.totalDiscounts.toFixed(2)}`} color="bg-amber-50 text-amber-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart (bar chart) */}
        <div className="bg-white rounded-lg border border-border p-5">
          <h2 className="font-medium text-sm mb-4">Revenue Over Time</h2>
          {revenue.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No data for selected period</p>
          ) : (
            <div className="space-y-1.5">
              {revenue.slice(-15).map((day) => (
                <div key={day.date} className="flex items-center gap-3 text-xs">
                  <span className="w-16 text-muted-foreground shrink-0">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full bg-foreground/80 rounded-full flex items-center justify-end px-2"
                      style={{ width: `${Math.max((day.revenue / maxRevenue) * 100, 2)}%` }}
                    >
                      <span className="text-[10px] text-white font-medium whitespace-nowrap">
                        ₹{day.revenue.toFixed(0)}
                      </span>
                    </div>
                  </div>
                  <span className="text-muted-foreground w-8 text-right">{day.orders}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white rounded-lg border border-border p-5">
          <h2 className="font-medium text-sm mb-4">Order Status Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(statusBreakdown).map(([status, count]) => {
              const totalOrders = Object.values(statusBreakdown).reduce((a, b) => a + b, 0);
              const pct = totalOrders > 0 ? ((count / totalOrders) * 100).toFixed(1) : '0';
              const colors: Record<string, string> = {
                pending: 'bg-yellow-400',
                confirmed: 'bg-blue-400',
                processing: 'bg-blue-500',
                shipped: 'bg-indigo-500',
                delivered: 'bg-green-500',
                cancelled: 'bg-red-400',
              };
              return (
                <div key={status}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize font-medium">{status}</span>
                    <span className="text-muted-foreground">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-full rounded-full ${colors[status] || 'bg-gray-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {Object.keys(statusBreakdown).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Best Sellers */}
      <div className="bg-white rounded-lg border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-medium text-sm">Best Selling Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-[#fafafa]">
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">#</th>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Product</th>
                <th className="text-right px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Units Sold</th>
                <th className="text-right px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Revenue</th>
                <th className="text-right px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bestSellers.map((item, idx) => (
                <tr key={item.productId} className="hover:bg-[#fafafa]">
                  <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.image && <img src={item.image} alt="" className="w-8 h-8 rounded object-cover" />}
                      <span className="font-medium">{item.productName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{item.totalSold}</td>
                  <td className="px-4 py-3 text-right font-medium">₹{item.totalRevenue.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{item.orderCount}</td>
                </tr>
              ))}
              {bestSellers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    No sales data yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: any; color: string }) {
  return (
    <div className="bg-white rounded-lg p-5 border border-border">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
