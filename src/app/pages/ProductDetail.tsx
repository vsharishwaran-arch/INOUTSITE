import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useProductCatalog } from '../context/ProductCatalogContext';
import { ProductCard } from '../components/ProductCard';
import { fetchProductById } from '../lib/api';
import { getOptimizedImageUrl } from '../../lib/imageOptimization';
import type { Product } from '../data/products';

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────
const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconTruck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const IconRefresh = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
  </svg>
);
const IconCheckSvg = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconTrending = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const IconZoomIn = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);
const IconChevLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
);
const IconChevRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
);
const IconHeart = ({ filled }: { filled: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#e00000' : 'none'} stroke={filled ? '#e00000' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function PDPSkeleton() {
  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px clamp(16px, 3.5vw, 56px) 80px' }}>
      <style>{`
        @keyframes pdpPulse{0%,100%{opacity:1}50%{opacity:.45}}
        @media (max-width: 900px) {
          .pdp-skel-grid { grid-template-columns: 1fr !important; }
          .pdp-skel-thumbs { flex-direction: row !important; }
          .pdp-skel-thumbs > div { width: 56px !important; height: 70px !important; }
        }
      `}</style>
      <div className="pdp-skel-grid" style={{ display: 'grid', gridTemplateColumns: '42% 1fr', gap: 40 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="pdp-skel-thumbs" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 72, height: 90, background: '#f0f0f0', borderRadius: 6, animation: 'pdpPulse 1.5s ease-in-out infinite' }} />)}
          </div>
          <div style={{ flex: 1, background: '#f0f0f0', aspectRatio: '3/4', borderRadius: 6, animation: 'pdpPulse 1.5s ease-in-out infinite' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 8 }}>
          {[280, 220, 160, 90, 130].map((w, i) => (
            <div key={i} style={{ height: i === 0 ? 28 : 18, width: Math.min(w, 280), maxWidth: '100%', background: '#f0f0f0', borderRadius: 4, animation: 'pdpPulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  tshirt: 'T-Shirts', shirt: 'Shirts', hoodies: 'Hoodies', coord: 'Co-ord Sets',
  jeans: 'Jeans', trackpants: 'Track Pants', shorts: 'Shorts', trousers: 'Trousers',
  casual: 'Casual Wear', formal: 'Formal Wear', streetwear: 'Streetwear',
};
const CATEGORY_PARENT: Record<string, string> = {
  tshirt: 'Top Wear', shirt: 'Top Wear', hoodies: 'Top Wear', coord: 'Top Wear',
  jeans: 'Bottom Wear', trackpants: 'Bottom Wear', shorts: 'Bottom Wear', trousers: 'Bottom Wear',
};

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { products: catalogProducts } = useProductCatalog();

  const [product, setProduct] = useState<Product | null>(null);
  const [pdpLoading, setPdpLoading] = useState(true);
  const [pdpError, setPdpError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [zoomVisible, setZoomVisible] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'shipping' | 'return'>('description');
  const [showStickyBar, setShowStickyBar] = useState(false);

  const addToCartBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!id) return;
    setPdpLoading(true);
    setPdpError('');
    fetchProductById(id)
      .then(p => { setProduct(p); setActiveImage(0); setSelectedSize(''); setQty(1); })
      .catch(() => setPdpError('not-found'))
      .finally(() => setPdpLoading(false));
  }, [id]);

  // Sticky bar via IntersectionObserver
  useEffect(() => {
    const btn = addToCartBtnRef.current;
    if (!btn) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(btn);
    return () => observer.disconnect();
  }, [product]);

  // Arrow-key gallery nav
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!product?.images) return;
    if (e.key === 'ArrowLeft') setActiveImage(i => Math.max(0, i - 1));
    if (e.key === 'ArrowRight') setActiveImage(i => Math.min((product.images!.length) - 1, i + 1));
  }, [product]);
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Compute images array (must be before early returns for hooks)
  const images = useMemo(() => {
    if (!product) return ['/placeholder.png'];
    const imgs = (product.images && product.images.length > 0)
      ? product.images.filter(img => img && img.trim())
      : (product.image && product.image.trim() ? [product.image] : ['/placeholder.png']);
    return imgs.length > 0 ? imgs : ['/placeholder.png'];
  }, [product]);

  // Optimize images for display (must be before early returns)
  const optimizedImages = useMemo(() =>
    images.map(img => getOptimizedImageUrl(img, { width: 600 })),
    [images]
  );

  const optimizedThumbImages = useMemo(() =>
    images.map(img => getOptimizedImageUrl(img, { width: 200 })),
    [images]
  );

  if (pdpLoading) return <PDPSkeleton />;

  if (pdpError || !product) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, fontFamily: 'DM Sans, sans-serif' }}>
        <h2 style={{ fontWeight: 800, fontSize: 22, color: '#111', margin: 0 }}>Product not found</h2>
        <p style={{ color: '#888', fontFamily: 'Nunito Sans, sans-serif', fontSize: 14, margin: 0 }}>This product doesn't exist or has been removed.</p>
        <button onClick={() => navigate(-1)} style={{ marginTop: 8, padding: '10px 24px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, fontFamily: 'Nunito Sans, sans-serif', fontWeight: 700, fontSize: 12, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          GO BACK
        </button>
      </div>
    );
  }

  // DEBUG: Log image fallback chain
  if (!product.images || product.images.length === 0) {
    console.warn(`ProductDetail: Using fallback image | product.id=${product.id} | product.image="${product.image}" | product.images=${JSON.stringify(product.images)}`);
  } else {
    console.info(`ProductDetail: Using product.images array | count=${images.length}`);
  }
  const discountPct = product.discountPrice ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : null;
  const getSizeStock = (size: string) => product.sizeStock?.[size] ?? product.stock;
  const selectedSizeStock = selectedSize ? getSizeStock(selectedSize) : product.stock;
  const isOOS = product.stock === 0 || (selectedSize ? getSizeStock(selectedSize) === 0 : false);
  const maxQty = Math.max(1, selectedSize ? getSizeStock(selectedSize) : product.stock);

  const handleAddToCart = () => {
    if (!selectedSize) { alert('Please select a size'); return; }
    if (isOOS) return;
    for (let i = 0; i < qty; i++) addToCart(product, selectedSize);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };
  const handleBuyNow = () => {
    if (!selectedSize) { alert('Please select a size'); return; }
    if (isOOS) return;
    addToCart(product, selectedSize);
    navigate('/checkout');
  };

  const relatedProducts = catalogProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const breadcrumbParent = CATEGORY_PARENT[product.category];
  const breadcrumbLabel = CATEGORY_LABELS[product.category] || product.category;

  const detailRows: [string, string | number][] = ([
    ['Material', product.material],
    ['Fit Type', product.fitType],
    ['Sleeve', product.sleeve],
    ['Pattern', product.pattern],
    ['Wash Care', product.washCare],
    ['Package Contents', product.packageContents],
    ['Net Quantity', product.netQuantity],
  ] as [string, string | number | undefined][]).filter(([, v]) => v !== undefined && v !== '') as [string, string | number][];

  const S = {
    dmSans: { fontFamily: 'DM Sans, sans-serif' },
    nunito: { fontFamily: 'Nunito Sans, sans-serif' },
  };

  return (
    <>
      <title>{product.name} — INOUT Fashion</title>
      <style>{`
        @keyframes pdpFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @media (max-width: 900px) {
          .pdp-grid { grid-template-columns: 1fr !important; padding: 12px 16px 48px !important; gap: 20px !important; }
          .pdp-thumbs-col { flex-direction: row !important; overflow-x: auto; gap: 6px !important; }
          .pdp-thumbs-col button { width: 56px !important; height: 70px !important; }
          .pdp-related-grid { grid-template-columns: repeat(2,1fr) !important; gap: 12px !important; }
          .pdp-tabs-wrap { padding: 0 16px 48px !important; }
          .pdp-related-wrap { padding: 40px 16px !important; }
          .pdp-sticky-bar { display: flex !important; }
          .pdp-tab-content { padding: 24px 16px !important; }
        }
        .pdp-size-btn:hover:not(:disabled) { border: 2px solid #111 !important; }
      `}</style>

      <div style={{ fontFamily: 'Nunito Sans, sans-serif', background: '#fff', minHeight: '100vh' }}>

        {/* Breadcrumb */}
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '20px clamp(24px, 3.5vw, 56px) 0' }}>
          <nav style={{ fontSize: 12, color: '#999', ...S.nunito }}>
            <Link to="/" style={{ color: '#999', textDecoration: 'none' }}>Home</Link>
            {breadcrumbParent && <><span style={{ margin: '0 6px' }}>›</span><span>{breadcrumbParent}</span></>}
            <span style={{ margin: '0 6px' }}>›</span><span>{breadcrumbLabel}</span>
            <span style={{ margin: '0 6px' }}>›</span><span style={{ color: '#555' }}>{product.name}</span>
          </nav>
        </div>

        {/* ── Two-column grid ── */}
        <div className="pdp-grid" style={{ maxWidth: 1400, margin: '0 auto', padding: '24px clamp(24px, 3.5vw, 56px) 80px', display: 'grid', gridTemplateColumns: '42% 1fr', gap: 40 }}>

          {/* ════ LEFT: Image gallery ════ */}
          <div style={{ display: 'flex', gap: 12 }}>
            {/* Vertical thumbnail strip */}
            {images.length > 1 && (
              <div className="pdp-thumbs-col" style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                {optimizedThumbImages.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    style={{ width: 72, height: 90, padding: 0, border: `2px solid ${activeImage === i ? '#111' : '#e0e0e0'}`, borderRadius: 6, background: '#f5f5f3', cursor: 'pointer', overflow: 'hidden', flexShrink: 0, transition: 'border-color 0.2s' }}>
                    <img src={img} alt={`thumb ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
            {/* Main image */}
            <div
              style={{ position: 'relative', flex: 1, aspectRatio: '4/5', background: '#f5f5f3', overflow: 'hidden', cursor: 'zoom-in', borderRadius: 6 }}
              onMouseEnter={() => setZoomVisible(true)}
              onMouseLeave={() => setZoomVisible(false)}
            >
              <img src={optimizedImages[activeImage]} alt={`${product.name} view ${activeImage + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', opacity: zoomVisible ? 1 : 0, transition: 'opacity 0.25s', pointerEvents: 'none' }}>
                <IconZoomIn />
              </div>
              {product.discountPrice && <div style={{ position: 'absolute', top: 12, left: 12, background: '#8B0000', color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', padding: '4px 8px', textTransform: 'uppercase', borderRadius: 4, ...S.nunito }}>SALE</div>}
              {product.isNewArrival && <div style={{ position: 'absolute', top: product.discountPrice ? 38 : 12, left: 12, background: '#111', color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', padding: '4px 8px', textTransform: 'uppercase', borderRadius: 4, ...S.nunito }}>NEW</div>}
              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveImage(i => Math.max(0, i - 1))} disabled={activeImage === 0}
                    style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.88)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: activeImage === 0 ? 0.3 : 1 }}>
                    <IconChevLeft />
                  </button>
                  <button onClick={() => setActiveImage(i => Math.min(images.length - 1, i + 1))} disabled={activeImage === images.length - 1}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.88)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: activeImage === images.length - 1 ? 0.3 : 1 }}>
                    <IconChevRight />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ════ RIGHT: Info panel ════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

            {/* Section 1: Header */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <h1 style={{ ...S.dmSans, fontWeight: 700, fontSize: 24, lineHeight: 1.3, color: '#111', margin: 0 }}>
                  {product.name}
                </h1>
                <button onClick={() => toggleWishlist(product)} aria-label="Wishlist" style={{ flexShrink: 0, padding: 6, background: 'none', border: 'none', cursor: 'pointer', marginTop: 2 }}>
                  <IconHeart filled={isInWishlist(product.id)} />
                </button>
              </div>

            </div>

            {/* Section 2: Pricing */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ ...S.dmSans, fontWeight: 800, fontSize: 28, color: '#e00000', lineHeight: 1 }}>
                  Rs. {(product.discountPrice ?? product.price).toFixed(2)}
                </span>
                {product.discountPrice && (
                  <>
                    <span style={{ ...S.dmSans, fontWeight: 400, fontSize: 16, color: '#999', textDecoration: 'line-through' }}>
                      Rs. {product.price.toFixed(2)}
                    </span>
                    <span style={{ background: '#fff0f0', color: '#e00000', ...S.nunito, fontWeight: 600, fontSize: 11, padding: '3px 10px', borderRadius: 4 }}>
                      {discountPct}% OFF
                    </span>
                  </>
                )}
              </div>
              <p style={{ ...S.nunito, fontSize: 12, color: '#888', marginTop: 6, marginBottom: 0 }}>
                Tax included. Shipping calculated at checkout.
              </p>
            </div>

            {/* Section 3: Stock */}
            <div style={{ marginBottom: 16 }}>
              {isOOS ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#e00000', ...S.nunito }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#e00000" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Out of stock{selectedSize ? ` in size ${selectedSize}` : ''}
                </div>
              ) : selectedSizeStock <= 5 && selectedSize ? (
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e00000', ...S.nunito }}>Only {selectedSizeStock} left in stock!</div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#16a34a', ...S.nunito }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                  In Stock
                </div>
              )}
            </div>

            {/* Section 4: Size Selector */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ ...S.nunito, fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', color: '#111', textTransform: 'uppercase' }}>
                  SIZE{selectedSize ? `: ${selectedSize}` : ''}
                </span>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', ...S.nunito, fontSize: 12, color: '#00bcd4', fontWeight: 600, letterSpacing: '0.05em', padding: 0 }}>
                  SIZE GUIDE
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {product.sizes.map(size => {
                  const ss = getSizeStock(size);
                  const oos = ss === 0;
                  const sel = selectedSize === size;
                  return (
                    <div key={size} style={{ position: 'relative' }}>
                      <button className="pdp-size-btn" onClick={() => !oos && setSelectedSize(size)} disabled={oos}
                        style={{ width: 52, height: 52, border: sel ? '2px solid #111' : '1px solid #ddd', borderRadius: 6, background: oos ? '#fafafa' : '#fff', color: oos ? '#ccc' : '#111', ...S.nunito, fontWeight: 600, fontSize: 14, cursor: oos ? 'not-allowed' : 'pointer', position: 'relative', overflow: 'hidden', transition: 'border-color 0.15s' }}>
                        {oos && (
                          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                            <line x1="0" y1="0" x2="100%" y2="100%" stroke="#e0e0e0" strokeWidth="1.5" />
                          </svg>
                        )}
                        {size}
                        {sel && <span style={{ position: 'absolute', top: 3, right: 4, fontSize: 9, color: '#111' }}>✓</span>}
                      </button>
                      {oos && <div style={{ textAlign: 'center', marginTop: 3, fontSize: 9, color: '#e00000', ...S.nunito, fontWeight: 600 }}>Out</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 5: Quantity */}
            <div style={{ marginBottom: 20 }}>
              <span style={{ ...S.nunito, fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', color: '#111', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>QTY</span>
              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: 6, overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}
                  style={{ width: 40, height: 40, border: 'none', background: '#fff', cursor: qty <= 1 ? 'not-allowed' : 'pointer', fontSize: 20, color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: qty <= 1 ? 0.4 : 1 }}>−</button>
                <span style={{ width: 44, textAlign: 'center', ...S.dmSans, fontWeight: 700, fontSize: 16, color: '#111', userSelect: 'none' }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(maxQty, q + 1))} disabled={qty >= maxQty}
                  style={{ width: 40, height: 40, border: 'none', background: '#fff', cursor: qty >= maxQty ? 'not-allowed' : 'pointer', fontSize: 20, color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: qty >= maxQty ? 0.4 : 1 }}>+</button>
              </div>
            </div>

            {/* Section 6: Action Buttons */}
            <div style={{ marginBottom: 20 }}>
              <button ref={addToCartBtnRef} onClick={handleAddToCart} disabled={isOOS}
                style={{ width: '100%', height: 52, border: 'none', background: isOOS ? '#9a9a9a' : '#111', color: '#fff', ...S.nunito, fontWeight: 700, fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: 6, cursor: isOOS ? 'not-allowed' : 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                onMouseEnter={e => { if (!isOOS) (e.currentTarget as HTMLButtonElement).style.background = '#333'; }}
                onMouseLeave={e => { if (!isOOS) (e.currentTarget as HTMLButtonElement).style.background = '#111'; }}>
                {addedToCart ? <><IconCheckSvg /> ADDED TO CART</> : isOOS ? 'OUT OF STOCK' : 'ADD TO CART'}
              </button>
              <button onClick={handleBuyNow} disabled={isOOS}
                style={{ width: '100%', height: 52, marginTop: 10, background: '#fff', color: '#111', border: '1.5px solid #111', ...S.nunito, fontWeight: 700, fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: 6, cursor: isOOS ? 'not-allowed' : 'pointer', transition: 'background 0.2s', opacity: isOOS ? 0.5 : 1 }}
                onMouseEnter={e => { if (!isOOS) (e.currentTarget as HTMLButtonElement).style.background = '#f5f5f5'; }}
                onMouseLeave={e => { if (!isOOS) (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}>
                BUY IT NOW
              </button>
            </div>

            {/* Section 7: Trust Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 20 }}>
              {[
                { icon: <IconLock />, label: 'SECURE PAYMENT' },
                { icon: <IconTruck />, label: '2–4 DAY DELIVERY' },
                { icon: <IconRefresh />, label: '7-DAY RETURNS' },
                { icon: <IconCheckSvg />, label: '100% GENUINE' },
              ].map(({ icon, label }) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, border: '1px solid #eee', padding: '12px 8px', borderRadius: 8 }}>
                  <span style={{ color: '#555' }}>{icon}</span>
                  <span style={{ ...S.nunito, fontWeight: 600, fontSize: 9, letterSpacing: '0.1em', color: '#555', textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Section 8: Payment Methods */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ ...S.nunito, fontWeight: 600, fontSize: 10, color: '#999', letterSpacing: '0.15em', textAlign: 'center', marginBottom: 10, textTransform: 'uppercase' }}>WE ACCEPT</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                {['UPI', 'Visa', 'Mastercard', 'RuPay', 'Net Banking'].map(m => (
                  <span key={m} style={{ border: '1px solid #e0e0e0', borderRadius: 4, padding: '4px 12px', ...S.nunito, fontWeight: 500, fontSize: 12, color: '#555' }}>{m}</span>
                ))}
              </div>
            </div>


          </div>
        </div>

        {/* ════ Description / Shipping / Return Tabs ════ */}
        <div className="pdp-tabs-wrap" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 clamp(24px, 3.5vw, 56px) 80px' }}>
          <div style={{ borderBottom: '1px solid #e0e0e0', display: 'flex' }}>
            {(['description', 'shipping', 'return'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ padding: '14px 28px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: activeTab === tab ? 'DM Sans, sans-serif' : 'Nunito Sans, sans-serif', fontWeight: activeTab === tab ? 600 : 400, fontSize: 15, color: activeTab === tab ? '#111' : '#999', borderBottom: activeTab === tab ? '2px solid #00bcd4' : '2px solid transparent', marginBottom: -1, textTransform: 'capitalize', transition: 'color 0.15s' }}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="pdp-tab-content" style={{ background: '#f8f8f6', padding: '32px clamp(24px, 3.5vw, 56px)', animation: 'pdpFadeIn 0.2s ease' }}>
            {activeTab === 'description' && (
              <div>
                <p style={{ ...S.nunito, fontWeight: 400, fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: detailRows.length ? 24 : 0 }}>{product.description}</p>
                {detailRows.length > 0 && (
                  <table style={{ borderCollapse: 'collapse', maxWidth: 480, width: '100%' }}>
                    <tbody>
                      {detailRows.map(([label, value]) => (
                        <tr key={label} style={{ borderBottom: '1px solid #ebebeb' }}>
                          <td style={{ padding: '10px 0', ...S.nunito, fontWeight: 600, fontSize: 12, color: '#888', width: 160, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</td>
                          <td style={{ padding: '10px 0', ...S.nunito, fontWeight: 400, fontSize: 14, color: '#555' }}>{String(value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
            {activeTab === 'shipping' && (
              <div style={{ ...S.nunito, fontWeight: 400, fontSize: 14, color: '#555', lineHeight: 1.8 }}>
                {product.shippingInfo
                  ? <div dangerouslySetInnerHTML={{ __html: product.shippingInfo }} />
                  : <><p><strong style={{ color: '#111' }}>Delivery:</strong> 2–4 business days across India.</p><p><strong style={{ color: '#111' }}>Free Shipping:</strong> On all orders above ₹999.</p><p><strong style={{ color: '#111' }}>Tracking:</strong> Order tracking link sent via SMS and email after dispatch.</p></>}
              </div>
            )}
            {activeTab === 'return' && (
              <div style={{ ...S.nunito, fontWeight: 400, fontSize: 14, color: '#555', lineHeight: 1.8 }}>
                {product.returnPolicy
                  ? <div dangerouslySetInnerHTML={{ __html: product.returnPolicy }} />
                  : <><p><strong style={{ color: '#111' }}>7-Day Returns:</strong> Return any unworn, unwashed item within 7 days of delivery.</p><p><strong style={{ color: '#111' }}>Condition:</strong> Original condition with tags intact.</p><p><strong style={{ color: '#111' }}>Refund:</strong> Processed within 5–7 business days after receipt.</p></>}
              </div>
            )}
          </div>
        </div>

        {/* ════ Related Products ════ */}
        {relatedProducts.length > 0 && (
          <div className="pdp-related-wrap" style={{ background: '#f8f8f6', padding: '64px 40px' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto' }}>
              <div style={{ marginBottom: 32 }}>
                <span style={{ ...S.nunito, fontWeight: 600, fontSize: 10, color: '#8B0000', letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>MORE LIKE THIS</span>
                <h2 style={{ ...S.dmSans, fontWeight: 800, fontSize: 28, color: '#111', margin: 0, letterSpacing: '-0.01em' }}>
                  You May Also <span style={{ color: '#e00000' }}>Like</span>
                </h2>
              </div>
              <div className="pdp-related-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
                {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

