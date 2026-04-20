import { useState, useEffect, type FormEvent } from 'react';
import { fetchProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct } from '../../lib/api';
import type { Product } from '../../data/products';
import { ADMIN_CATEGORY_GROUPS } from '../../data/categories';
import { Plus, Pencil, Trash2, X, Upload, Loader2 } from 'lucide-react';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const;

interface ProductForm {
  name: string;
  price: string;
  discountPrice: string;
  sku: string;
  tags: string;
  category: string;
  description: string;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isOnOffer: boolean;
  isTrending: boolean;
  sizeStock: Record<string, string>;
  imageFiles: File[];
  // Product details
  material: string;
  fitType: string;
  sleeve: string;
  pattern: string;
  washCare: string;
  packageContents: string;
  netQuantity: string;
  // Shipping & Return
  shippingInfo: string;
  returnPolicy: string;
}

const emptyForm: ProductForm = {
  name: '',
  price: '',
  discountPrice: '',
  sku: '',
  tags: '',
  category: 'tshirt',
  description: '',
  isNewArrival: false,
  isBestSeller: false,
  isOnOffer: false,
  isTrending: false,
  sizeStock: { S: '0', M: '0', L: '0', XL: '0', XXL: '0' },
  imageFiles: [],
  material: '',
  fitType: '',
  sleeve: '',
  pattern: '',
  washCare: '',
  packageContents: '',
  netQuantity: '',
  shippingInfo: '',
  returnPolicy: '',
};

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const loadProducts = async () => {
    try {
      const items = await fetchProducts();
      setProducts(items);
    } catch {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openCreate = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setExistingImages([]);
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      price: String(product.price),
      discountPrice: product.discountPrice ? String(product.discountPrice) : '',
      sku: product.sku || '',
      tags: product.tags?.join(', ') || '',
      category: product.category,
      description: product.description,
      isNewArrival: !!product.isNewArrival,
      isBestSeller: !!product.isBestSeller,
      isOnOffer: !!product.isOnOffer,
      isTrending: !!product.isTrending,
      sizeStock: Object.fromEntries(SIZES.map((s) => [s, String(product.sizeStock?.[s] ?? 0)])),
      imageFiles: [],
      material: product.material || '',
      fitType: product.fitType || '',
      sleeve: product.sleeve || '',
      pattern: product.pattern || '',
      washCare: product.washCare || '',
      packageContents: product.packageContents || '',
      netQuantity: product.netQuantity ? String(product.netQuantity) : '',
      shippingInfo: product.shippingInfo || '',
      returnPolicy: product.returnPolicy || '',
    });
    setExistingImages(product.images && product.images.length > 0 ? product.images : [product.image].filter(Boolean));
    setShowForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setForm((prev) => ({ ...prev, imageFiles: [...prev.imageFiles, ...files] }));
    }
    e.target.value = '';
  };

  const removeExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
  };

  const removeNewImage = (index: number) => {
    setForm((prev) => ({ ...prev, imageFiles: prev.imageFiles.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('price', form.price);
      formData.append('category', form.category);
      formData.append('description', form.description);
      formData.append('isNewArrival', String(form.isNewArrival));
      formData.append('isBestSeller', String(form.isBestSeller));
      formData.append('isOnOffer', String(form.isOnOffer));
      formData.append('sku', form.sku);
      formData.append('tags', form.tags);
      if (form.discountPrice) formData.append('discountPrice', form.discountPrice);
      formData.append('sizeStock', JSON.stringify(
        Object.fromEntries(SIZES.map((s) => [s, Number(form.sizeStock[s] || 0)])),
      ));
      for (const file of form.imageFiles) {
        formData.append('images', file);
      }
      formData.append('existingImages', JSON.stringify(existingImages));
      // Product details
      formData.append('material', form.material);
      formData.append('fitType', form.fitType);
      formData.append('sleeve', form.sleeve);
      formData.append('pattern', form.pattern);
      formData.append('washCare', form.washCare);
      formData.append('packageContents', form.packageContents);
      if (form.netQuantity) formData.append('netQuantity', form.netQuantity);
      formData.append('shippingInfo', form.shippingInfo);
      formData.append('returnPolicy', form.returnPolicy);
      formData.append('isTrending', String(form.isTrending));

      if (editingProduct) {
        await adminUpdateProduct(editingProduct.id, formData);
      } else {
        await adminCreateProduct(formData);
      }

      setShowForm(false);
      setEditingProduct(null);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product permanently? Existing orders will keep the product info.')) return;
    setDeletingId(id);
    try {
      await adminDeleteProduct(id);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };



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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Products</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-xs font-semibold tracking-wide uppercase rounded hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
          {error}
          <button onClick={() => setError('')} className="float-right font-bold">&times;</button>
        </div>
      )}

      {/* Product list */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-[#fafafa]">
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Product</th>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Category</th>
                <th className="text-right px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Price</th>
                <th className="text-right px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Stock</th>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Tags</th>
                <th className="text-right px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-[#fafafa] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt="" className="w-10 h-10 rounded object-cover" />
                      <span className="font-medium truncate max-w-[200px] block">{product.name}</span>
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
                  <td className="px-4 py-3 text-right">
                    <span className={product.stock === 0 ? 'text-red-600 font-medium' : product.stock <= 5 ? 'text-amber-600 font-medium' : ''}>
                      {product.stock}
                    </span>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {SIZES.map((s) => `${s}:${product.sizeStock?.[s] ?? 0}`).join(' · ')}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {product.isNewArrival && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded">New</span>}
                      {product.isBestSeller && <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-medium rounded">Best</span>}
                      {product.isOnOffer && <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[10px] font-medium rounded">Offer</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(product)}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        className="p-2 hover:bg-red-50 text-red-600 rounded transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === product.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No products. Click "Add Product" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => !submitting && setShowForm(false)}>
          <div className="bg-white rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Images */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide mb-1.5">
                  Images <span className="text-muted-foreground normal-case font-normal">(up to 5 total)</span>
                </label>
                {/* Existing + new preview thumbnails */}
                {(existingImages.length > 0 || form.imageFiles.length > 0) && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {existingImages.map((url) => (
                      <div key={url} className="relative group">
                        <img src={url} alt="" className="w-16 h-16 rounded object-cover border border-border" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(url)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {form.imageFiles.map((file, idx) => (
                      <div key={idx} className="relative group">
                        <img src={URL.createObjectURL(file)} alt="" className="w-16 h-16 rounded object-cover border-2 border-blue-400" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-border rounded cursor-pointer hover:bg-gray-50 transition-colors text-xs w-fit">
                  <Upload size={14} />
                  Add Images
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                </label>
                {editingProduct && existingImages.length === 0 && form.imageFiles.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">⚠ At least one image required</p>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide mb-1.5">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm"
                />
              </div>

              {/* Price + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide mb-1.5">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm"
                  >
                    {ADMIN_CATEGORY_GROUPS.map(group => (
                      <optgroup key={group.group} label={`── ${group.group} ──`}>
                        {group.options.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              {/* SKU + Discount Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide mb-1.5">SKU</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                    placeholder="e.g. SHIRT-001"
                    className="w-full px-4 py-2.5 border border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide mb-1.5">Sale Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.discountPrice}
                    onChange={(e) => setForm((f) => ({ ...f, discountPrice: e.target.value }))}
                    placeholder="Leave empty for no discount"
                    className="w-full px-4 py-2.5 border border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide mb-1.5">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  placeholder="e.g. summer, sale, cotton"
                  className="w-full px-4 py-2.5 border border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide mb-1.5">Description</label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm resize-none"
                />
              </div>

              {/* Size stock */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide mb-1.5">Stock per Size</label>
                <div className="grid grid-cols-4 gap-3">
                  {SIZES.map((size) => (
                    <div key={size}>
                      <label className="block text-xs text-center text-muted-foreground mb-1">{size}</label>
                      <input
                        type="number"
                        min="0"
                        value={form.sizeStock[size]}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            sizeStock: { ...f.sizeStock, [size]: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-border bg-background text-center text-sm focus:outline-none focus:border-foreground transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Flags */}
              <div className="flex gap-6 flex-wrap">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.isNewArrival} onChange={(e) => setForm((f) => ({ ...f, isNewArrival: e.target.checked }))} className="accent-foreground" />
                  New Arrival
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.isBestSeller} onChange={(e) => setForm((f) => ({ ...f, isBestSeller: e.target.checked }))} className="accent-foreground" />
                  Best Seller
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.isOnOffer} onChange={(e) => setForm((f) => ({ ...f, isOnOffer: e.target.checked }))} className="accent-red-600" />
                  <span className="flex items-center gap-1">On Offer <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[9px] font-semibold rounded">SALE</span></span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.isTrending} onChange={(e) => setForm((f) => ({ ...f, isTrending: e.target.checked }))} className="accent-green-600" />
                  Trending
                </label>
              </div>

              {/* Product Details */}
              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Product Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wide mb-1.5">Material</label>
                    <input type="text" value={form.material} onChange={(e) => setForm((f) => ({ ...f, material: e.target.value }))} placeholder="e.g. 100% Cotton" className="w-full px-3 py-2 border border-border bg-background text-sm focus:outline-none focus:border-foreground transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wide mb-1.5">Fit Type</label>
                    <input type="text" value={form.fitType} onChange={(e) => setForm((f) => ({ ...f, fitType: e.target.value }))} placeholder="e.g. Regular, Slim" className="w-full px-3 py-2 border border-border bg-background text-sm focus:outline-none focus:border-foreground transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wide mb-1.5">Sleeve</label>
                    <input type="text" value={form.sleeve} onChange={(e) => setForm((f) => ({ ...f, sleeve: e.target.value }))} placeholder="e.g. Half, Full" className="w-full px-3 py-2 border border-border bg-background text-sm focus:outline-none focus:border-foreground transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wide mb-1.5">Pattern</label>
                    <input type="text" value={form.pattern} onChange={(e) => setForm((f) => ({ ...f, pattern: e.target.value }))} placeholder="e.g. Solid, Striped" className="w-full px-3 py-2 border border-border bg-background text-sm focus:outline-none focus:border-foreground transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wide mb-1.5">Wash Care</label>
                    <input type="text" value={form.washCare} onChange={(e) => setForm((f) => ({ ...f, washCare: e.target.value }))} placeholder="e.g. Machine wash cold" className="w-full px-3 py-2 border border-border bg-background text-sm focus:outline-none focus:border-foreground transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wide mb-1.5">Net Quantity</label>
                    <input type="number" min="1" value={form.netQuantity} onChange={(e) => setForm((f) => ({ ...f, netQuantity: e.target.value }))} placeholder="1" className="w-full px-3 py-2 border border-border bg-background text-sm focus:outline-none focus:border-foreground transition-colors" />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-medium uppercase tracking-wide mb-1.5">Package Contents</label>
                  <input type="text" value={form.packageContents} onChange={(e) => setForm((f) => ({ ...f, packageContents: e.target.value }))} placeholder="e.g. 1 T-Shirt" className="w-full px-3 py-2 border border-border bg-background text-sm focus:outline-none focus:border-foreground transition-colors" />
                </div>
              </div>

              {/* Shipping & Return */}
              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Shipping &amp; Returns (leave blank for defaults)</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wide mb-1.5">Shipping Info</label>
                    <textarea rows={2} value={form.shippingInfo} onChange={(e) => setForm((f) => ({ ...f, shippingInfo: e.target.value }))} placeholder="Custom shipping info..." className="w-full px-3 py-2 border border-border bg-background text-sm focus:outline-none focus:border-foreground transition-colors resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wide mb-1.5">Return Policy</label>
                    <textarea rows={2} value={form.returnPolicy} onChange={(e) => setForm((f) => ({ ...f, returnPolicy: e.target.value }))} placeholder="Custom return policy..." className="w-full px-3 py-2 border border-border bg-background text-sm focus:outline-none focus:border-foreground transition-colors resize-none" />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                  className="flex-1 py-2.5 border border-border text-xs font-medium uppercase tracking-wide rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-foreground text-background text-xs font-semibold uppercase tracking-wide rounded hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
