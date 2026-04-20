import { useEffect, useState } from 'react';
import { fetchProducts } from '../../lib/api';
import type { Product } from '../../data/products';
import { AlertTriangle, Package, Search } from 'lucide-react';

export function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  useEffect(() => {
    fetchProducts({ includeInactive: 'true' })
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    if (filter === 'low') return p.stock > 0 && p.stock <= 10;
    if (filter === 'out') return p.stock === 0;
    return true;
  }).filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-white rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Inventory</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-5 border border-border">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-blue-50 text-blue-600">
            <Package size={20} />
          </div>
          <p className="text-2xl font-semibold">{totalStock}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total Units</p>
        </div>
        <div className="bg-white rounded-lg p-5 border border-border">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-amber-50 text-amber-600">
            <AlertTriangle size={20} />
          </div>
          <p className="text-2xl font-semibold">{lowStockCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Low Stock</p>
        </div>
        <div className="bg-white rounded-lg p-5 border border-border">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-red-50 text-red-600">
            <Package size={20} />
          </div>
          <p className="text-2xl font-semibold">{outOfStockCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Out of Stock</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-border bg-white text-sm rounded focus:outline-none focus:border-foreground"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'low', 'out'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-xs font-medium rounded transition-colors ${
                filter === f
                  ? 'bg-foreground text-background'
                  : 'bg-white border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {f === 'all' ? 'All' : f === 'low' ? 'Low Stock' : 'Out of Stock'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-[#fafafa]">
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Product</th>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">SKU</th>
                <th className="text-center px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">S</th>
                <th className="text-center px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">M</th>
                <th className="text-center px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">L</th>
                <th className="text-center px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">XL</th>
                <th className="text-right px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Total</th>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((product) => {
                const statusColor =
                  product.stock === 0
                    ? 'text-red-600 bg-red-50'
                    : product.stock <= 5
                    ? 'text-amber-600 bg-amber-50'
                    : product.stock <= 10
                    ? 'text-yellow-600 bg-yellow-50'
                    : 'text-green-600 bg-green-50';
                const statusLabel =
                  product.stock === 0
                    ? 'Out of Stock'
                    : product.stock <= 5
                    ? 'Critical'
                    : product.stock <= 10
                    ? 'Low'
                    : 'In Stock';

                return (
                  <tr key={product.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt="" className="w-10 h-10 rounded object-cover" />
                        <span className="font-medium truncate max-w-[200px]">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs font-mono">{product.sku || '—'}</td>
                    {(['S', 'M', 'L', 'XL'] as const).map((size) => {
                      const qty = product.sizeStock?.[size] ?? 0;
                      return (
                        <td key={size} className={`px-4 py-3 text-center font-medium ${qty === 0 ? 'text-red-500' : qty <= 3 ? 'text-amber-500' : ''}`}>
                          {qty}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-right font-semibold">{product.stock}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    No products match your filters
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
