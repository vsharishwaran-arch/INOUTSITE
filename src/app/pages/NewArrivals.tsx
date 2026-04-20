import { useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { useProductCatalog } from '../context/ProductCatalogContext';
import { motion } from 'motion/react';
import { CategoryPageBanner } from '../components/CategoryPageBanner';

const SIZES = ['S', 'M', 'L', 'XL'];
const PRICES = [
  { value: 'all', label: 'All Prices' },
  { value: 'under200', label: 'Under ₹200' },
  { value: '200-500', label: '₹200 – ₹500' },
  { value: 'over500', label: 'Over ₹500' },
];

export function NewArrivals() {
  const { products, loading } = useProductCatalog();
  const [selectedSize, setSelectedSize] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  const newArrivals = products.filter(product => {
    if (!product.isNewArrival) return false;
    const sizeMatch = selectedSize === 'all' || (product.sizeStock?.[selectedSize] ?? 0) > 0;
    const price = product.discountPrice ?? product.price;
    let priceMatch = true;
    if (priceRange === 'under200') priceMatch = price < 200;
    else if (priceRange === '200-500') priceMatch = price >= 200 && price <= 500;
    else if (priceRange === 'over500') priceMatch = price > 500;
    return sizeMatch && priceMatch;
  });

  return (
    <div className="min-h-screen">
      {/* ── Category Banner ── */}
      <CategoryPageBanner categoryName="new-arrivals" />

      {/* Products Grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-14 py-12">
        <p className="text-muted-foreground tracking-wide max-w-2xl mx-auto text-center mb-10">
          Discover our latest additions — fresh styles carefully curated to elevate your wardrobe.
        </p>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-8 pb-5 border-b border-gray-200">
          <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', letterSpacing: '0.06em' }} className="text-[15px] text-[#0A0A0A] font-semibold select-none mr-2">Filter</span>
          <div className="h-5 w-px bg-gray-300" />
          <div className="flex gap-2">
            {SIZES.map(s => (
              <motion.button key={s} onClick={() => setSelectedSize(prev => prev === s ? 'all' : s)}
                whileHover={{ scale: 1.1, y: -1 }} whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                style={{ fontFamily: 'var(--font-body)' }}
                className={`w-10 h-10 text-[12px] font-semibold border-2 tracking-widest transition-colors duration-200 ${
                  selectedSize === s ? 'border-[#E31E24] bg-[#E31E24] text-white shadow-md' : 'border-gray-300 text-gray-600 bg-white hover:border-[#0A0A0A] hover:text-[#0A0A0A] hover:bg-gray-50'
                }`}>{s}</motion.button>
            ))}
          </div>
          <div className="h-5 w-px bg-gray-300" />
          <div className="relative">
            <select value={priceRange} onChange={e => setPriceRange(e.target.value)}
              style={{ fontFamily: 'var(--font-body)' }}
              className={`appearance-none text-[12px] font-medium border-2 pl-3 pr-8 py-2.5 tracking-wide transition-all duration-200 cursor-pointer focus:outline-none ${
                priceRange !== 'all' ? 'border-[#E31E24] text-[#E31E24] bg-[#fff5f5]' : 'border-gray-300 text-gray-600 bg-white hover:border-[#0A0A0A] hover:text-[#0A0A0A]'
              }`}>
              {PRICES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d="M1 1l4 4 4-4" stroke={priceRange !== 'all' ? '#E31E24' : '#6B7280'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {(selectedSize !== 'all' || priceRange !== 'all') && (
            <motion.button onClick={() => { setSelectedSize('all'); setPriceRange('all'); }}
              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }} style={{ fontFamily: 'var(--font-body)' }}
              className="text-[11px] font-medium text-[#E31E24] border border-[#E31E24] px-3 py-1.5 tracking-wide hover:bg-[#E31E24] hover:text-white transition-colors duration-200">
              × Clear
            </motion.button>
          )}
          <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }} className="ml-auto text-[14px] text-gray-400">
            {loading ? '…' : `${newArrivals.length} item${newArrivals.length !== 1 ? 's' : ''}`}
          </span>
        </div>

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
        ) : newArrivals.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {newArrivals.map((product, i) => (
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
              Nothing new yet
            </h3>
            <p style={{ color: '#999', fontSize: '13px', maxWidth: '240px' }}>
              Check back soon for fresh styles
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
