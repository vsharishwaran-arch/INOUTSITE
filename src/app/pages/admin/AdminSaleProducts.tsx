import { useState, useEffect } from 'react';
import { fetchProducts, adminUpdateProduct } from '../../lib/api';
import type { Product } from '../../data/products';
import { Tag, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';

export function AdminSaleProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'offer'>('all');

  const load = async () => {
    try {
      const items = await fetchProducts();
      setProducts(items);
    } catch {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleOffer = async (product: Product) => {
    setTogglingId(product.id);
    try {
      const fd = new FormData();
      fd.append('name', product.name);
      fd.append('price', String(product.price));
      fd.append('category', product.category);
      fd.append('description', product.description);
      fd.append('isNewArrival', String(!!product.isNewArrival));
      fd.append('isBestSeller', String(!!product.isBestSeller));
      fd.append('isOnOffer', String(!product.isOnOffer));
      fd.append('sku', product.sku || '');
      if (product.discountPrice) fd.append('discountPrice', String(product.discountPrice));
      fd.append('tags', product.tags?.join(', ') || '');
      fd.append('sizeStock', JSON.stringify(product.sizeStock || {}));
      // keep existing image (no file upload)
      fd.append('imagePath', product.image);

      await adminUpdateProduct(product.id, fd);
      setProducts(prev =>
        prev.map(p => p.id === product.id ? { ...p, isOnOffer: !p.isOnOffer } : p),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Toggle failed');
    } finally {
      setTogglingId(null);
    }
  };

  const displayed = filter === 'offer' ? products.filter(p => p.isOnOffer) : products;
  const offerCount = products.filter(p => p.isOnOffer).length;

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white rounded-lg animate-pulse" />)}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Tag size={18} className="text-[#E31E24]" />
            Sale / Offers
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {offerCount} product{offerCount !== 1 ? 's' : ''} currently on offer — toggle to add or remove from the Offer Zone page
          </p>
        </div>
        {/* Filter tabs */}
        <div className="flex items-center border border-border rounded overflow-hidden text-xs font-medium">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 transition-colors ${filter === 'all' ? 'bg-foreground text-background' : 'hover:bg-gray-50'}`}
          >
            All ({products.length})
          </button>
          <button
            onClick={() => setFilter('offer')}
            className={`px-4 py-2 transition-colors border-l border-border ${filter === 'offer' ? 'bg-[#E31E24] text-white' : 'hover:bg-gray-50'}`}
          >
            On Offer ({offerCount})
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
          {error}
          <button onClick={() => setError('')} className="float-right font-bold">&times;</button>
        </div>
      )}

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-[#fafafa]">
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Product</th>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Category</th>
                <th className="text-right px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Price</th>
                <th className="text-center px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">On Offer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayed.map(product => (
                <tr key={product.id} className={`transition-colors ${product.isOnOffer ? 'bg-red-50/30' : 'hover:bg-[#fafafa]'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt="" className="w-10 h-10 rounded object-cover border border-border" />
                      <div>
                        <span className="font-medium block truncate max-w-[200px]">{product.name}</span>
                        {product.isOnOffer && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-red-100 text-red-600 text-[9px] font-bold rounded uppercase tracking-wide">
                            Offer Zone
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{product.category}</td>
                  <td className="px-4 py-3 text-right">
                    {product.discountPrice ? (
                      <div>
                        <span className="font-medium text-green-600">₹{product.discountPrice.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground line-through ml-1">₹{product.price.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="font-medium">₹{product.price.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleOffer(product)}
                      disabled={togglingId === product.id}
                      title={product.isOnOffer ? 'Remove from offers' : 'Add to offers'}
                      className="inline-flex items-center justify-center transition-opacity disabled:opacity-50"
                    >
                      {togglingId === product.id ? (
                        <Loader2 size={22} className="animate-spin text-gray-400" />
                      ) : product.isOnOffer ? (
                        <ToggleRight size={28} className="text-[#E31E24]" />
                      ) : (
                        <ToggleLeft size={28} className="text-gray-300 hover:text-gray-500" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {displayed.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    {filter === 'offer' ? 'No products on offer yet. Toggle products above to add them.' : 'No products found.'}
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
