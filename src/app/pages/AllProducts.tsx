import { useMemo } from 'react';
import { Link } from 'react-router';
import { useProductCatalog } from '../context/ProductCatalogContext';
import { ProductCard } from '../components/ProductCard';
import { CategoryPageBanner } from '../components/CategoryPageBanner';
import type { Product } from '../data/products';

const CATEGORY_ORDER: { key: string; label: string; path: string }[] = [
  { key: 'tshirt',      label: 'T-Shirts',      path: '/tshirt' },
  { key: 'shirt',       label: 'Shirts',         path: '/shirt' },
  { key: 'hoodies',     label: 'Hoodies',        path: '/hoodies' },
  { key: 'coord',       label: 'Co-ord Sets',    path: '/coord' },
  { key: 'jeans',       label: 'Jeans',          path: '/jeans' },
  { key: 'trackpants',  label: 'Track Pants',    path: '/trackpants' },
  { key: 'shorts',      label: 'Shorts',         path: '/shorts' },
  { key: 'trousers',    label: 'Trousers',       path: '/trousers' },
];

export function AllProducts() {
  const { products, loading } = useProductCatalog();

  // Group products by category, preserving CATEGORY_ORDER sequence
  const sections = useMemo(() => {
    const map: Record<string, Product[]> = {};
    for (const p of products) {
      if (!map[p.category]) map[p.category] = [];
      map[p.category].push(p);
    }

    // First, show categories in the defined order
    const ordered = CATEGORY_ORDER.filter(c => map[c.key]?.length).map(c => ({
      ...c,
      products: map[c.key],
    }));

    // Then append any categories not in CATEGORY_ORDER (future-proofing)
    const knownKeys = new Set(CATEGORY_ORDER.map(c => c.key));
    const extra = Object.entries(map)
      .filter(([key]) => !knownKeys.has(key))
      .map(([key, prods]) => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        path: `/${key}`,
        products: prods,
      }));

    return [...ordered, ...extra];
  }, [products]);

  return (
    <div className="min-h-screen bg-white">
      <CategoryPageBanner categoryName="all" />

      {/* ── Page header ── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-14 pt-12 pb-4">
        <span
          className="text-[10px] tracking-[0.2em] uppercase font-semibold"
          style={{ color: '#8B0000' }}
        >
          Collections
        </span>
        <h1
          className="text-[28px] sm:text-[36px] font-extrabold text-[#111] mt-1 leading-[1.15] tracking-[-0.01em]"
          style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
        >
          All Products
        </h1>
        {!loading && (
          <p
            className="text-[13px] text-[#888] mt-1"
            style={{ fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 400 }}
          >
            {products.length} {products.length === 1 ? 'item' : 'items'} across {sections.length} {sections.length === 1 ? 'category' : 'categories'}
          </p>
        )}
      </div>

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-14 py-16 text-center">
          <p className="text-[12px] tracking-[0.16em] uppercase text-[#aaa]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Loading products…
          </p>
        </div>
      )}

      {/* ── Category sections ── */}
      {!loading && sections.map((section, idx) => (
        <section
          key={section.key}
          className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-14 py-10"
          style={{ borderTop: idx === 0 ? 'none' : '1px solid #f0f0f0' }}
        >
          {/* Section header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* Active-pill style label */}
              <span style={{
                display: 'inline-block',
                padding: '6px 18px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 10,
                letterSpacing: '0.13em',
                textTransform: 'uppercase',
                background: '#0A0A0A',
                color: '#fff',
                border: '1px solid #0A0A0A',
                whiteSpace: 'nowrap',
              }}>
                {section.label}
              </span>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 11,
                color: '#bbb',
                letterSpacing: '0.08em',
              }}>
                {section.products.length} {section.products.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            <Link
              to={section.path}
              className="group inline-flex items-center gap-1.5 text-[11px] tracking-[0.1em] uppercase font-medium text-[#111] pb-px border-b border-transparent hover:border-[#111] transition-all duration-200"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              View all
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="transition-transform duration-200 group-hover:translate-x-0.5">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-x-6 sm:gap-y-10 overflow-visible py-4 px-0 sm:px-2">
            {section.products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ))}

      {/* ── Empty state ── */}
      {!loading && sections.length === 0 && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-14 py-24 text-center">
          <p className="text-[12px] tracking-[0.16em] uppercase text-[#aaa]" style={{ fontFamily: 'Inter, sans-serif' }}>
            No products available yet
          </p>
        </div>
      )}
    </div>
  );
}
