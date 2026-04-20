import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { ProductCard } from '../components/ProductCard';
import { useProductCatalog } from '../context/ProductCatalogContext';
import { SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CategoryPageBanner } from '../components/CategoryPageBanner';
import { CATEGORY_CONFIG } from '../data/categories';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'tshirt',     label: 'T-Shirts' },
  { value: 'shirt',      label: 'Shirts' },
  { value: 'coord',      label: 'Co-ord Sets' },
  { value: 'hoodies',    label: 'Hoodies' },
  { value: 'jeans',      label: 'Jeans' },
  { value: 'trousers',   label: 'Trousers' },
  { value: 'shorts',     label: 'Shorts' },
  { value: 'trackpants', label: 'Track Pants' },
];

const SIZES = ['all', 'S', 'M', 'L', 'XL'];

const PRICES = [
  { value: 'all', label: 'All Prices' },
  { value: 'under100', label: 'Under ₹100' },
  { value: '100-200', label: '₹100–₹200' },
  { value: 'over200', label: 'Over ₹200' },
];

// All valid leaf-category slugs
const VALID_CATEGORIES = new Set(CATEGORIES.map(c => c.value));

export function ProductListing() {
  const { products, loading } = useProductCatalog();
  const location = useLocation();
  const pathCategory = location.pathname.slice(1);
  // Treat unknown/legacy paths (casual, formal, streetwear) as 'all'
  const initialCat = pathCategory === 'shop' || !VALID_CATEGORIES.has(pathCategory)
    ? 'all'
    : pathCategory;

  const [selectedCategory, setSelectedCategory] = useState(initialCat || 'all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const cat = pathCategory === 'shop' || !VALID_CATEGORIES.has(pathCategory)
      ? 'all'
      : pathCategory;
    setSelectedCategory(cat);
  }, [pathCategory]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
  };

  const filteredProducts = products.filter(p => {
    const catMatch = selectedCategory === 'all' || p.category === selectedCategory;
    const sizeMatch = selectedSize === 'all' || (p.sizeStock?.[selectedSize] ?? 0) > 0;
    let priceMatch = true;
    if (priceRange === 'under100') priceMatch = p.price < 100;
    else if (priceRange === '100-200') priceMatch = p.price >= 100 && p.price <= 200;
    else if (priceRange === 'over200') priceMatch = p.price > 200;
    return catMatch && sizeMatch && priceMatch;
  });

  const activeFilterCount = [
    selectedCategory !== 'all',
    selectedSize !== 'all',
    priceRange !== 'all',
  ].filter(Boolean).length;

  const resetFilters = () => {
    handleCategoryChange('all');
    setSelectedSize('all');
    setPriceRange('all');
  };

  return (
    <div className="min-h-screen">

      {/* ── Category Page Banner ── */}
      <CategoryPageBanner categoryName={selectedCategory} />

      {/* ── Toolbar ── */}
      <div className="border-b border-gray-100 bg-white sticky top-[114px] z-30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-14 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-[12px] text-gray-400 tabular-nums whitespace-nowrap">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
            </span>
            {/* Filters toggle */}
            <button
              onClick={() => setFiltersOpen(v => !v)}
              className="flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase font-medium text-[#0A0A0A] hover:opacity-60 transition-opacity"
            >
              <SlidersHorizontal size={15} strokeWidth={1.8} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-[#0A0A0A] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Filter Drawer (slide-down panel) ── */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden bg-white border-b border-gray-100 shadow-sm z-20 relative"
          >
            <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-14 py-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">

                {/* Category */}
                <div className="sm:col-span-3">
                  <p className="text-[10px] tracking-[0.18em] uppercase font-semibold text-gray-400 mb-3">Category</p>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(c => (
                      <button
                        key={c.value}
                        onClick={() => handleCategoryChange(c.value)}
                        className={`filter-pill${selectedCategory === c.value ? ' active' : ''}`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <p className="text-[10px] tracking-[0.18em] uppercase font-semibold text-gray-400 mb-3">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`filter-pill${selectedSize === s ? ' active' : ''}`}
                      >
                        {s === 'all' ? 'All Sizes' : s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <p className="text-[10px] tracking-[0.18em] uppercase font-semibold text-gray-400 mb-3">Price</p>
                  <div className="flex flex-wrap gap-2">
                    {PRICES.map(p => (
                      <button
                        key={p.value}
                        onClick={() => setPriceRange(p.value)}
                        className={`filter-pill${priceRange === p.value ? ' active' : ''}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset */}
                {activeFilterCount > 0 && (
                  <div className="sm:col-span-3 pt-2 flex items-center">
                    <button
                      onClick={resetFilters}
                      className="flex items-center gap-1.5 text-[11px] tracking-wide text-gray-400 hover:text-[#0A0A0A] transition-colors"
                    >
                      <X size={13} />
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Product Grid ── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-14 py-14 lg:py-20">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} style={{ borderRadius: '12px', background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <div className="skeleton" style={{ aspectRatio: '4/5' }} />
                <div style={{ padding: '12px' }}>
                  <div className="skeleton" style={{ height: '8px', width: '40%', borderRadius: '4px', marginBottom: '8px' }} />
                  <div className="skeleton" style={{ height: '13px', width: '85%', borderRadius: '4px', marginBottom: '5px' }} />
                  <div className="skeleton" style={{ height: '13px', width: '60%', borderRadius: '4px', marginBottom: '12px' }} />
                  <div className="skeleton" style={{ height: '15px', width: '30%', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min((i % 8) * 0.04, 0.32), ease: [0.22, 1, 0.36, 1] }}
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
    </div>
  );
}
