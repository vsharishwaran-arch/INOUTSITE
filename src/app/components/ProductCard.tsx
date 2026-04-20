import { useState } from 'react';
import { Link } from 'react-router';
import { Product } from '../data/products';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const SIZE_ORDER = ['S', 'M', 'L', 'XL', 'XXL'];

interface ProductCardProps {
  product: Product;
  dark?: boolean;
}

// ── Shared overlay elements ──────────────────────────────────────────────────
function Badges({ product, discountPct }: { product: Product; discountPct: number | null }) {
  return (
    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
      {product.discountPrice && discountPct && (
        <span style={{ background: '#111', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '4px', letterSpacing: '0.05em', lineHeight: 1 }}>
          -{discountPct}%
        </span>
      )}
      {product.isNewArrival && (
        <span style={{ background: '#8B0000', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '4px', letterSpacing: '0.05em', lineHeight: 1 }}>
          NEW
        </span>
      )}
      {product.isBestSeller && !product.isNewArrival && (
        <span style={{ background: 'rgba(255,255,255,0.92)', color: '#111', fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '4px', letterSpacing: '0.05em', lineHeight: 1, backdropFilter: 'blur(4px)' }}>
          HOT
        </span>
      )}
      {product.stock > 0 && product.stock <= 5 && (
        <span style={{ background: '#ff9500', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '4px', letterSpacing: '0.05em', lineHeight: 1 }}>
          {product.stock} left
        </span>
      )}
    </div>
  );
}

function WishlistBtn({ product, wishlisted, toggleWishlist }: { product: Product; wishlisted: boolean; toggleWishlist: (p: Product) => void }) {
  return (
    <button
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      onClick={e => { e.preventDefault(); toggleWishlist(product); }}
      className="absolute top-2 right-2 sm:top-3 sm:right-3 w-10 h-10 rounded-full flex items-center justify-center z-20 transition-all duration-200 hover:scale-110 active:scale-95"
      style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
    >
      <Heart
        size={14}
        strokeWidth={2}
        style={{ color: wishlisted ? '#ff3b30' : '#333', fill: wishlisted ? '#ff3b30' : 'none', transition: 'all 0.2s' }}
      />
    </button>
  );
}

function QuickAdd({ product, showSizes, setShowSizes, addedSize, handleQuickAdd }: {
  product: Product;
  showSizes: boolean;
  setShowSizes: (v: boolean) => void;
  addedSize: string | null;
  handleQuickAdd: (e: React.MouseEvent, size: string) => void;
}) {
  if (product.stock === 0) return null;
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
      {!showSizes ? (
        <button
          onClick={e => { e.preventDefault(); setShowSizes(true); }}
          className="w-full flex items-center justify-center gap-2 py-3 text-[11px] font-semibold tracking-[0.1em] uppercase text-white transition-colors"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
        >
          <ShoppingBag size={13} strokeWidth={2} />
          Quick Add
        </button>
      ) : (
        <div className="p-3" style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(4px)' }}>
          <p className="text-[9px] tracking-[0.14em] uppercase text-center mb-2" style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
            Select Size
          </p>
          <div className="flex gap-1.5 justify-center flex-wrap">
            {product.sizes.map(size => (
              <button
                key={size}
                onClick={e => handleQuickAdd(e, size)}
                className="text-[11px] font-semibold rounded-md px-3 py-1.5 transition-all duration-150"
                style={{ background: addedSize === size ? '#34c759' : 'rgba(255,255,255,0.15)', color: '#fff' }}
              >
                {addedSize === size ? '✓' : size}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoSection({ product }: { product: Product }) {
  const discountPct = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;
  const orderedSizes = SIZE_ORDER.filter(s => product.sizeStock && s in product.sizeStock);
  const displaySizes = orderedSizes.length > 0 ? orderedSizes : (product.sizes ?? []);

  return (
    <div style={{ padding: '12px 12px 14px', background: '#fff' }}>
      <p style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#bbb', marginBottom: '3px' }}>
        INOUT FASHION
      </p>
      <h3 style={{
        color: '#111', fontSize: '13px', fontWeight: 600, lineHeight: 1.35,
        overflow: 'hidden', display: '-webkit-box',
        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        marginBottom: '8px',
      } as React.CSSProperties}>
        {product.name}
      </h3>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '7px', marginBottom: '10px', flexWrap: 'wrap' }}>
        {product.discountPrice ? (
          <>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#111' }}>₹{product.discountPrice.toFixed(0)}</span>
            <span style={{ fontSize: '12px', textDecoration: 'line-through', color: '#bbb' }}>₹{product.price.toFixed(0)}</span>
            {discountPct && (
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '1px 6px', borderRadius: '99px' }}>
                {discountPct}% OFF
              </span>
            )}
          </>
        ) : (
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#111' }}>₹{product.price.toFixed(0)}</span>
        )}
      </div>
      {displaySizes.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {displaySizes.slice(0, 5).map(size => {
            const inStock = (product.sizeStock?.[size] ?? (product.sizes?.includes(size) ? 1 : 0)) > 0;
            return (
              <span key={size} style={{
                fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px',
                border: `1px solid ${inStock ? '#e0e0e0' : '#f0f0f0'}`,
                color: inStock ? '#555' : '#ccc',
                textDecoration: inStock ? 'none' : 'line-through',
              }}>
                {size}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export function ProductCard({ product, dark }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const wishlisted = isInWishlist(product.id);
  const [showSizes, setShowSizes] = useState(false);
  const [addedSize, setAddedSize] = useState<string | null>(null);
  const [cardHovered, setCardHovered] = useState(false);

  const discountPct = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  const handleQuickAdd = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    addToCart(product, size);
    setAddedSize(size);
    setTimeout(() => { setAddedSize(null); setShowSizes(false); }, 1400);
  };

  const hasMultipleImages = !!(product.images && product.images.length >= 2);
  const hoverImg = hasMultipleImages ? product.images![1] : null;

  return (
    <div
      className="group relative flex flex-col overflow-hidden cursor-pointer"
      style={{
        borderRadius: '12px',
        background: '#fff',
        boxShadow: cardHovered ? '0 12px 32px rgba(0,0,0,0.12)' : '0 2px 12px rgba(0,0,0,0.06)',
        transform: cardHovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
      }}
      onMouseEnter={() => setCardHovered(true)}
      onMouseLeave={() => { setShowSizes(false); setAddedSize(null); setCardHovered(false); }}
    >
      <Link to={`/product/${product.id}`} className="block">
        {/* Image area — 4:5 portrait ratio */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '4/5', background: '#f5f5f5' }}>
          {/* Primary image */}
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{
              objectPosition: 'center top',
              opacity: hasMultipleImages && cardHovered ? 0 : 1,
              transform: !hasMultipleImages && cardHovered ? 'scale(1.06)' : 'scale(1)',
            }}
          />
          {/* Hover image (second image — crossfade) */}
          {hoverImg && (
            <img
              src={hoverImg}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover absolute inset-0 transition-opacity duration-500"
              style={{ objectPosition: 'center top', opacity: cardHovered ? 1 : 0 }}
            />
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/55 backdrop-blur-[1px] flex items-center justify-center z-10">
              <span style={{ background: 'rgba(255,255,255,0.92)', color: '#6e6e73', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, borderRadius: '99px', padding: '6px 14px' }}>
                Sold Out
              </span>
            </div>
          )}
          <Badges product={product} discountPct={discountPct} />
          <WishlistBtn product={product} wishlisted={wishlisted} toggleWishlist={toggleWishlist} />
          <QuickAdd product={product} showSizes={showSizes} setShowSizes={setShowSizes} addedSize={addedSize} handleQuickAdd={handleQuickAdd} />
        </div>
        <InfoSection product={product} />
      </Link>
    </div>
  );
}

