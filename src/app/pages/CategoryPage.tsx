import { useState } from 'react';
import { useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCard } from '../components/ProductCard';
import { useProductCatalog } from '../context/ProductCatalogContext';
import { CATEGORY_CONFIG, CATEGORY_CARD_IMAGES } from '../data/categories';
import { Link } from 'react-router';
import { CategoryPageBanner } from '../components/CategoryPageBanner';
import { SlidersHorizontal, X } from 'lucide-react';

const SIZES = ['S', 'M', 'L', 'XL'];
const PRICES = [
  { value: 'all', label: 'All Prices' },
  { value: 'under200', label: 'Under ₹200' },
  { value: '200-500', label: '₹200 – ₹500' },
  { value: 'over500', label: 'Over ₹500' },
];

export function CategoryPage() {
  const { products, loading } = useProductCatalog();
  const location = useLocation();

  // Derive slug from pathname: '/tshirt' → 'tshirt', '/topwear' → 'topwear'
  const slug = location.pathname.replace(/^\//, '').toLowerCase();
  const config = CATEGORY_CONFIG[slug];

  const [selectedSize, setSelectedSize] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const resetFilters = () => { setSelectedSize('all'); setPriceRange('all'); };
  const activeFilters = (selectedSize !== 'all' ? 1 : 0) + (priceRange !== 'all' ? 1 : 0);

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Category not found.</p>
      </div>
    );
  }

  const isParent = config.children.length > 0;

  // For parent categories, include products from all children; for leaves, filter exactly
  const matchingSlugs = isParent ? config.children : [slug];

  const filtered = products.filter(p => {
    const catMatch = matchingSlugs.includes(p.category);
    const sizeMatch = selectedSize === 'all' || (p.sizeStock?.[selectedSize] ?? 0) > 0;
    let priceMatch = true;
    const price = p.discountPrice ?? p.price;
    if (priceRange === 'under200') priceMatch = price < 200;
    else if (priceRange === '200-500') priceMatch = price >= 200 && price <= 500;
    else if (priceRange === 'over500') priceMatch = price > 500;
    return catMatch && sizeMatch && priceMatch;
  });

  const SkeletonCard = () => (
    <div style={{ borderRadius: '12px', background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      <div className="skeleton" style={{ aspectRatio: '4/5' }} />
      <div style={{ padding: '12px' }}>
        <div className="skeleton" style={{ height: '8px', width: '40%', borderRadius: '4px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ height: '13px', width: '85%', borderRadius: '4px', marginBottom: '5px' }} />
        <div className="skeleton" style={{ height: '13px', width: '60%', borderRadius: '4px', marginBottom: '12px' }} />
        <div className="skeleton" style={{ height: '15px', width: '30%', borderRadius: '4px', marginBottom: '10px' }} />
        <div style={{ display: 'flex', gap: '4px' }}>
          {['S','M','L','XL'].map(s => <div key={s} className="skeleton" style={{ width: '28px', height: '22px', borderRadius: '4px' }} />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <CategoryPageBanner categoryName={slug} />

      {/* ── Sticky filter bar ── */}
      <div className="sticky top-[57px] z-30 bg-white" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)', borderBottom: '1px solid #f0f0f0' }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-14">

          {/* Desktop filter row */}
          <div className="hidden sm:flex items-center gap-3 py-3.5">
            {/* Size buttons */}
            <div className="flex items-center gap-1.5">
              {SIZES.map(s => (
                <motion.button
                  key={s}
                  onClick={() => setSelectedSize(prev => prev === s ? 'all' : s)}
                  whileTap={{ scale: 0.92 }}
                  className="w-10 h-10 text-[12px] font-semibold rounded-md border-2 transition-colors duration-200"
                  style={{
                    borderColor: selectedSize === s ? '#111' : '#e0e0e0',
                    background: selectedSize === s ? '#111' : '#fff',
                    color: selectedSize === s ? '#fff' : '#555',
                  }}
                >
                  {s}
                </motion.button>
              ))}
            </div>

            <div className="h-5 w-px bg-gray-200" />

            {/* Price */}
            <div className="relative">
              <select
                value={priceRange}
                onChange={e => setPriceRange(e.target.value)}
                className="appearance-none text-[12px] font-medium border-2 pl-3 pr-8 py-2 rounded-md transition-all cursor-pointer focus:outline-none"
                style={{
                  borderColor: priceRange !== 'all' ? '#111' : '#e0e0e0',
                  background: priceRange !== 'all' ? '#111' : '#fff',
                  color: priceRange !== 'all' ? '#fff' : '#555',
                }}
              >
                {PRICES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
              <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1l4 4 4-4" stroke={priceRange !== 'all' ? '#fff' : '#888'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Clear */}
            <AnimatePresence>
              {activeFilters > 0 && (
                <motion.button
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-[#111] transition-colors px-2 py-1.5"
                >
                  <X size={12} />
                  Clear
                </motion.button>
              )}
            </AnimatePresence>

            {/* Count */}
            <span className="ml-auto text-[12px] text-gray-400 tabular-nums italic">
              {loading ? '…' : `${filtered.length} item${filtered.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          {/* Mobile: horizontal scrollable size chips + filter button */}
          <div className="flex sm:hidden items-center gap-2 py-3 overflow-x-auto no-scrollbar">
            {SIZES.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSize(prev => prev === s ? 'all' : s)}
                className="flex-shrink-0 px-4 py-1.5 text-[12px] font-semibold rounded-full border-2 transition-colors duration-200"
                style={{ borderColor: selectedSize === s ? '#111' : '#e0e0e0', background: selectedSize === s ? '#111' : '#fff', color: selectedSize === s ? '#fff' : '#555' }}
              >
                {s}
              </button>
            ))}
            <div className="h-5 w-px bg-gray-200 flex-shrink-0" />
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-semibold rounded-full border-2 border-gray-200 text-gray-600 whitespace-nowrap"
            >
              <SlidersHorizontal size={12} />
              {activeFilters > 0 ? `Filters (${activeFilters})` : 'Filters'}
            </button>
            <span className="ml-auto flex-shrink-0 text-[12px] text-gray-400 tabular-nums">{loading ? '…' : `${filtered.length}`}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-14 py-8">

        {/* ── Sub-category cards (parent only) ── */}
        {isParent && (
          <section className="mb-12">
            <p className="text-[11px] tracking-[0.18em] uppercase text-[#6e6e73] font-semibold mb-5">
              Browse by Category
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {config.children.map((childSlug, i) => {
                const child = CATEGORY_CONFIG[childSlug];
                if (!child) return null;
                const count = products.filter(p => p.category === childSlug).length;
                return (
                  <motion.div
                    key={childSlug}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.06 }}
                    className="group"
                  >
                    <Link to={`/${childSlug}`} className="block">
                      <div
                        className="relative bg-[#f5f5f7] overflow-hidden rounded-2xl transition-all duration-300"
                        style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.07)' }}
                      >
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={CATEGORY_CARD_IMAGES[childSlug] ?? config.banner}
                            alt={child.label}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.05]"
                          />
                        </div>
                        <div className="absolute top-3 right-3 bg-white/85 backdrop-blur-sm text-[#1d1d1f] text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                          {count} Items
                        </div>
                        <div className="bg-[#1d1d1f] px-4 pt-3 pb-4">
                          <h3 style={{ color: '#ffffff', fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 600, fontSize: '14px', letterSpacing: '-0.01em', lineHeight: 1.3 }}>{child.label}</h3>
                          <p style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 400, fontSize: '12px', marginTop: '4px' }}>{count} products</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Products grid ── */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.32), ease: [0.22, 1, 0.36, 1] }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-28 text-center"
          >
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mb-6" style={{ color: '#e0e0e0' }}>
              <path d="M26 10l-18 12 6 4v28h36V26l6-4-18-12-8 8-4-4-4 4-8-8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none"/>
              <circle cx="32" cy="34" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 3"/>
            </svg>
            <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '20px', fontWeight: 600, color: '#111', marginBottom: '8px' }}>
              Nothing here yet
            </h3>
            <p style={{ color: '#999', fontSize: '13px', marginBottom: '24px', maxWidth: '240px' }}>
              Try a different size or price range
            </p>
            <button
              onClick={resetFilters}
              style={{ background: '#111', color: '#fff', fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '12px 28px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
            >
              Clear All Filters
            </button>
          </motion.div>
        )}
      </div>

      {/* Mobile floating filter button */}
      <div className="sm:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-full text-[13px] font-semibold text-white shadow-xl"
          style={{ background: '#111', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}
        >
          <SlidersHorizontal size={14} />
          Filters{activeFilters > 0 ? ` (${activeFilters})` : ''}
        </button>
      </div>

      {/* Mobile bottom sheet */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-50"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 bg-white pt-4 pb-8 px-6"
              style={{ borderRadius: '20px 20px 0 0', maxHeight: '85vh', overflowY: 'auto' }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            >
              {/* Handle */}
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '20px', fontWeight: 600, color: '#111' }}>Filters</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                  <X size={16} />
                </button>
              </div>
              {/* Size */}
              <p className="text-[10px] tracking-[0.18em] uppercase font-semibold text-gray-400 mb-3">Size</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {SIZES.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(prev => prev === s ? 'all' : s)}
                    className="w-12 h-12 text-[13px] font-semibold border-2 rounded-lg transition-all"
                    style={{ borderColor: selectedSize === s ? '#111' : '#e0e0e0', background: selectedSize === s ? '#111' : '#fff', color: selectedSize === s ? '#fff' : '#555' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {/* Price */}
              <p className="text-[10px] tracking-[0.18em] uppercase font-semibold text-gray-400 mb-3">Price Range</p>
              <div className="flex flex-col gap-2 mb-8">
                {PRICES.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setPriceRange(p.value)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all"
                    style={{ borderColor: priceRange === p.value ? '#111' : '#f0f0f0', background: priceRange === p.value ? '#111' : '#fafafa', color: priceRange === p.value ? '#fff' : '#555' }}
                  >
                    <span className="text-[13px] font-medium">{p.label}</span>
                    {priceRange === p.value && <span className="text-sm">✓</span>}
                  </button>
                ))}
              </div>
              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={resetFilters} className="flex-1 py-3.5 border-2 border-gray-200 rounded-xl text-[13px] font-semibold text-gray-600">
                  Reset
                </button>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 py-3.5 rounded-xl text-[13px] font-semibold text-white"
                  style={{ background: '#111' }}
                >
                  Show {filtered.length} items
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
