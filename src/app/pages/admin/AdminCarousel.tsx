import { useState, useEffect, useRef } from 'react';
import {
  fetchProducts,
  fetchCarouselItems,
  adminAddProductToCarousel,
  adminAddImageToCarousel,
  adminAddVideoToCarousel,
  adminDeleteCarouselItem,
  adminReorderCarousel,
} from '../../lib/api';
import type { Product } from '../../data/products';
import type { CarouselItem } from '../../lib/api';
import {
  RotateCw, Loader2, Trash2, Plus, Image, Film, Package,
  Search, X, ArrowUp, ArrowDown, Upload,
} from 'lucide-react';

type AddMode = null | 'product' | 'image' | 'video';

export function AdminCarousel() {
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Add mode
  const [addMode, setAddMode] = useState<AddMode>(null);

  // Product picker
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Image/Video upload form
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubtitle, setUploadSubtitle] = useState('');
  const [uploadLink, setUploadLink] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadItems = async () => {
    try {
      const data = await fetchCarouselItems();
      setItems(data);
    } catch {
      setError('Failed to load carousel items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadItems(); }, []);

  const openProductPicker = async () => {
    setAddMode('product');
    setProductSearch('');
    if (allProducts.length === 0) {
      setProductsLoading(true);
      try {
        const prods = await fetchProducts();
        setAllProducts(prods);
      } catch {
        setError('Failed to load products');
      } finally {
        setProductsLoading(false);
      }
    }
  };

  const handleAddProduct = async (product: Product) => {
    setSubmitting(true);
    try {
      await adminAddProductToCarousel(product.id, items.length);
      await loadItems();
      setAddMode(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setSubmitting(true);
    try {
      if (addMode === 'image') {
        await adminAddImageToCarousel(uploadFile, uploadTitle, uploadSubtitle, uploadLink);
      } else {
        await adminAddVideoToCarousel(uploadFile, uploadTitle, uploadSubtitle, uploadLink);
      }
      await loadItems();
      resetUploadForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await adminDeleteCarouselItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const swap = direction === 'up' ? index - 1 : index + 1;
    if (swap < 0 || swap >= newItems.length) return;
    [newItems[index], newItems[swap]] = [newItems[swap], newItems[index]];
    setItems(newItems);

    try {
      await adminReorderCarousel(newItems.map((item, i) => ({ id: item.id, sortOrder: i })));
    } catch {
      setError('Reorder failed');
      loadItems();
    }
  };

  const resetUploadForm = () => {
    setAddMode(null);
    setUploadTitle('');
    setUploadSubtitle('');
    setUploadLink('');
    setUploadFile(null);
  };

  const existingProductIds = new Set(items.filter(i => i.type === 'product').map(i => i.productId));
  const filteredProducts = allProducts.filter(p => {
    if (existingProductIds.has(p.id)) return false;
    if (!productSearch) return true;
    return p.name.toLowerCase().includes(productSearch.toLowerCase());
  });

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
            <RotateCw size={18} className="text-[#E31E24]" />
            3D Carousel
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {items.length}/6 items — products, images, or videos displayed in the rotating 3D showcase
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
          {error}
          <button onClick={() => setError('')} className="float-right font-bold">&times;</button>
        </div>
      )}

      {/* Current Items */}
      <div className="bg-white rounded-lg border border-border overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-border bg-[#fafafa]">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Current Carousel Items
          </span>
        </div>
        {items.length === 0 ? (
          <div className="px-4 py-12 text-center text-muted-foreground text-sm">
            No items in carousel yet. Add products, images, or videos below.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item, index) => (
              <div key={item.id} className="flex items-center gap-4 px-4 py-3 hover:bg-[#fafafa] transition-colors">
                {/* Thumbnail */}
                <div className="w-12 h-16 rounded-md overflow-hidden border border-border bg-gray-100 flex-shrink-0">
                  {item.type === 'video' && item.mediaUrl ? (
                    <video src={item.mediaUrl} className="w-full h-full object-cover" muted />
                  ) : item.image ? (
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      {item.type === 'video' ? <Film size={16} /> : <Image size={16} />}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm block truncate">{item.title || 'Untitled'}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`inline-block px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wide ${
                      item.type === 'product' ? 'bg-blue-100 text-blue-600' :
                      item.type === 'video' ? 'bg-purple-100 text-purple-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {item.type}
                    </span>
                    {item.subtitle && (
                      <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
                    title="Move up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === items.length - 1}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
                    title="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors disabled:opacity-50"
                    title="Remove"
                  >
                    {deletingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Buttons */}
      {items.length < 6 && !addMode && (
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={openProductPicker}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-lg text-sm font-medium hover:bg-[#fafafa] transition-colors"
          >
            <Package size={15} className="text-blue-500" /> Add Product
          </button>
          <button
            onClick={() => setAddMode('image')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-lg text-sm font-medium hover:bg-[#fafafa] transition-colors"
          >
            <Image size={15} className="text-green-500" /> Upload Image
          </button>
          <button
            onClick={() => setAddMode('video')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-lg text-sm font-medium hover:bg-[#fafafa] transition-colors"
          >
            <Film size={15} className="text-purple-500" /> Upload Video
          </button>
        </div>
      )}

      {/* Product Picker */}
      {addMode === 'product' && (
        <div className="bg-white rounded-lg border border-border overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-border bg-[#fafafa] flex items-center justify-between">
            <span className="text-sm font-medium">Select a Product</span>
            <button onClick={() => setAddMode(null)} className="p-1 hover:bg-gray-200 rounded"><X size={16} /></button>
          </div>
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#E31E24]"
              />
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto divide-y divide-border">
            {productsLoading ? (
              <div className="p-8 text-center"><Loader2 size={20} className="animate-spin mx-auto text-gray-400" /></div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No products found</div>
            ) : (
              filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => handleAddProduct(product)}
                  disabled={submitting}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50/50 transition-colors text-left disabled:opacity-50"
                >
                  <img src={product.image} alt="" className="w-10 h-10 rounded object-cover border border-border" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm block truncate">{product.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{product.category} · ₹{product.discountPrice || product.price}</span>
                  </div>
                  <Plus size={16} className="text-blue-500 flex-shrink-0" />
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Image / Video Upload Form */}
      {(addMode === 'image' || addMode === 'video') && (
        <div className="bg-white rounded-lg border border-border overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-border bg-[#fafafa] flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              {addMode === 'image' ? <Image size={15} className="text-green-500" /> : <Film size={15} className="text-purple-500" />}
              Upload {addMode === 'image' ? 'Image' : 'Video'}
            </span>
            <button onClick={resetUploadForm} className="p-1 hover:bg-gray-200 rounded"><X size={16} /></button>
          </div>
          <div className="p-4 space-y-4">
            {/* File picker */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                {addMode === 'image' ? 'Image File' : 'Video File'} *
              </label>
              <input
                ref={fileRef}
                type="file"
                accept={addMode === 'image' ? 'image/*' : 'video/*'}
                onChange={e => setUploadFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-lg text-sm text-muted-foreground hover:border-gray-400 transition-colors w-full justify-center"
              >
                <Upload size={15} />
                {uploadFile ? uploadFile.name : `Choose ${addMode === 'image' ? 'image' : 'video'} file`}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Title</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  placeholder="e.g. Summer Collection"
                  className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#E31E24]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Subtitle</label>
                <input
                  type="text"
                  value={uploadSubtitle}
                  onChange={e => setUploadSubtitle(e.target.value)}
                  placeholder="e.g. Starting ₹499"
                  className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#E31E24]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Link URL (optional)</label>
              <input
                type="text"
                value={uploadLink}
                onChange={e => setUploadLink(e.target.value)}
                placeholder="e.g. /sale or /tshirt"
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#E31E24]"
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={!uploadFile || submitting}
              className="px-5 py-2.5 bg-foreground text-background rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              Add to Carousel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
