import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import type { Product } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { useProductCatalog } from '../context/ProductCatalogContext';
import { ArrowRight, Package, RefreshCw, ShieldCheck, Truck, type LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { HeroCarousel } from '../components/HeroCarousel';
import { useHomepageContent } from '../context/HomepageContentContext';
import { HomeReviews } from '../components/HomeReviews';
import { ShoppableVideos } from '../components/ShoppableVideos';
import { fetchCarouselItems, resolveAssetUrl } from '../lib/api';
import type { CarouselItem } from '../lib/api';

const ICON_MAP: Record<string, LucideIcon> = {
  Truck,
  RefreshCw,
  ShieldCheck,
  Package,
};

export function Home() {
  const { products, loading } = useProductCatalog();
  const { content } = useHomepageContent();
  const uspItems = content.usp.items;
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 8);
  const newArrivals = products.filter(p => p.isNewArrival).slice(0, 8);

  const [activeTab, setActiveTab] = useState<'all' | 'top' | 'bottom'>('all');
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchCarouselItems().then(setCarouselItems).catch(() => {});
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Static meta (name, type, path) merged with admin-editable image/count from context
  const CATEGORY_META: Record<string, { name: string; type: 'top' | 'bottom'; path: string }> = {
    tshirt:     { name: 'T-Shirts',    type: 'top',    path: '/tshirt' },
    shirt:      { name: 'Shirts',      type: 'top',    path: '/shirt' },
    hoodies:    { name: 'Hoodies',     type: 'top',    path: '/hoodies' },
    coord:      { name: 'Co-ord Sets', type: 'top',    path: '/coord' },
    jeans:      { name: 'Jeans',       type: 'bottom', path: '/jeans' },
    trackpants: { name: 'Track Pants', type: 'bottom', path: '/trackpants' },
    shorts:     { name: 'Shorts',      type: 'bottom', path: '/shorts' },
    trousers:   { name: 'Trousers',    type: 'bottom', path: '/trousers' },
  };

  const categories = content.categories.items
    .filter(it => CATEGORY_META[it.slug])
    .map(it => ({ ...CATEGORY_META[it.slug], image: it.image, count: it.count }));

  const filteredCategories = activeTab === 'all'
    ? categories
    : categories.filter(c => c.type === activeTab);

  return (
    <div className="min-h-screen">

      {/* ══════════════════════════════════════
          HERO CAROUSEL
      ══════════════════════════════════════ */}
      <HeroCarousel />

      {/* ══════════════════════════════════════
          WHOLESALE ENQUIRY BUTTON
      ══════════════════════════════════════ */}
      <div className="bg-white border-b border-gray-100 py-4 sm:py-6">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-14 text-center">
          <motion.a
            href="https://inoutcatalogue.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-white border-2 border-[#111] text-[#111] font-semibold text-[12px] sm:text-[13px] tracking-[0.08em] uppercase rounded-full transition-all duration-300 hover:bg-[#111] hover:text-white"
          >
            Wholesale Enquiry
            <ArrowRight size={14} />
          </motion.a>
        </div>
      </div>

      {/* ══════════════════════════════════════
          BRAND PROMISE STRIP
      ══════════════════════════════════════ */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {uspItems.map(({ iconName, label, sub }, i) => {
              const Icon = ICON_MAP[iconName] ?? Package;
              return (
                <motion.div
                  key={label}
                  className="flex items-center gap-3 py-5 sm:py-7 px-4 sm:px-8"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(139,0,0,0.07)' }}>
                    <Icon size={18} strokeWidth={1.5} className="text-[#8B0000]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-[11px] font-semibold tracking-[0.06em] text-[#0A0A0A] uppercase truncate">{label}</p>
                    <p className="text-[11px] sm:text-[12px] text-gray-500 mt-0.5 leading-snug truncate">{sub}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          3D ROTATING CAROUSEL
      ══════════════════════════════════════ */}
      <section className="carousel-section relative py-8 lg:py-12 overflow-hidden">
        {/* Cinematic animated background */}
        <div className="absolute inset-0 carousel-bg" />
        {/* Floating fabric-like particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="carousel-particle carousel-particle-1" />
          <div className="carousel-particle carousel-particle-2" />
          <div className="carousel-particle carousel-particle-3" />
          <div className="carousel-particle carousel-particle-4" />
          <div className="carousel-particle carousel-particle-5" />
        </div>
        {/* Vignette overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
        }} />

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 text-center">
          <motion.div
            className="text-center mb-2"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#ff4444] font-semibold mb-2 block">
              Popular Picks
            </span>
            <h2
              className="text-[26px] sm:text-[34px] font-extrabold text-white mt-1 leading-[1.1] tracking-[-0.02em]"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              Trending <span className="text-[#ff4444]">Now</span>
            </h2>
            <p className="text-[13px] text-white/50 mt-2" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
              The styles everyone's talking about
            </p>
          </motion.div>

          {carouselItems.length > 0 && (
            <div className="flex items-center justify-center">
              <div className="card-3d">
                {carouselItems.slice(0, 6).map((ci, i) => {
                  const count = Math.min(carouselItems.length, 6);
                  const angle = 360 / count;
                  const desktopRadius = { 1: 0, 2: 120, 3: 140, 4: 160, 5: 180, 6: 200 }[count] ?? 180;
                  const mobileRadius = { 1: 0, 2: 80, 3: 90, 4: 100, 5: 110, 6: 120 }[count] ?? 100;
                  const radius = isMobile ? mobileRadius : desktopRadius;
                  const duration = 25;
                  const wrapper = ci.linkUrl
                    ? (children: React.ReactNode) => <Link to={ci.linkUrl}>{children}</Link>
                    : (children: React.ReactNode) => <>{children}</>;

                  return (
                    <div
                      key={ci.id}
                      className="card-3d-item"
                      style={{
                        transform: `translate(-50%, -50%) rotateY(${angle * i}deg) translateZ(${radius}px)`,
                        animationDelay: `${-(duration / count) * i}s`,
                      }}
                    >
                      {wrapper(
                        <>
                          {ci.type === 'video' && ci.mediaUrl ? (
                            <video
                              src={ci.mediaUrl}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-full object-cover"
                              draggable={false}
                            />
                          ) : ci.image && ci.image.trim() ? (
                            <img src={ci.image} alt={ci.title} draggable={false} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', background: '#f5f5f3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 12 }}>
                              No image
                            </div>
                          )}
                          {(ci.title || ci.subtitle) && (
                            <div className="carousel-card-label">
                              {ci.title && <span className="carousel-card-name">{ci.title}</span>}
                              {ci.subtitle && <span className="carousel-card-price">{ci.subtitle}</span>}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════
          SHOP BY CATEGORY
      ══════════════════════════════════════ */}
      <section className="py-10 sm:py-16 lg:py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-14">
          <motion.div
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-10"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div>
              <span className="heading-accent text-[10px] tracking-[0.25em] uppercase text-[#8B0000] font-semibold mb-2 block">Collections</span>
              <h2
                className="text-[26px] sm:text-[34px] font-extrabold text-[#111] mt-1 leading-[1.1] tracking-[-0.02em]"
                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
              >
                Shop by <span style={{ color: '#e00000' }}>Category</span>
              </h2>
              <p className="text-[13px] text-[#999] mt-2" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>New styles added weekly across all categories</p>
            </div>
            <Link
              to="/all-products"
              className="cta-arrow group inline-flex items-center text-[11px] tracking-[0.14em] uppercase text-[#111] font-semibold self-start sm:self-auto pb-px border-b border-[#111] hover:text-[#e00000] hover:border-[#e00000] transition-colors duration-200"
            >
              View all <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          {/* Animated segmented tab switcher */}
          <div className="flex items-center gap-0 bg-[#f0f0f0] rounded-full p-1 mb-8 w-fit max-w-full overflow-x-auto no-scrollbar">
            {(
              [
                { key: 'all', label: 'All', icon: '✦' },
                { key: 'top', label: 'Top Wear', icon: '👕' },
                { key: 'bottom', label: 'Bottom Wear', icon: '👖' },
              ] as const
            ).map(tab => (
              <motion.button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                whileTap={{ scale: 0.93 }}
                className="relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full cursor-pointer select-none z-0 flex-shrink-0"
                style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontWeight: 600,
                  fontSize: 'clamp(11px, 1.5vw, 13px)',
                  color: activeTab === tab.key ? '#111' : '#777',
                  transition: 'color 0.2s',
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                }}
              >
                {/* Sliding white pill behind active tab */}
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="cat-pill"
                    className="absolute inset-0 rounded-full bg-white"
                    style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.10)', zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                {/* Pulsing red dot for active */}
                {activeTab === tab.key && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-1.5 h-1.5 rounded-full bg-[#e00000] flex-shrink-0"
                    style={{ boxShadow: '0 0 0 0 rgba(224,0,0,0.4)' }}
                  />
                )}
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Category grid — 4 columns, square cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredCategories.map((category, index) => (
              <motion.div
                key={`${activeTab}-${category.name}`}
                className="group"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <Link to={category.path} className="block">
                  <div
                    className="relative bg-[#f5f5f7] overflow-hidden rounded-2xl transition-all duration-300"
                    style={{ boxShadow: '0 2px 14px rgba(0,0,0,0.07)' }}
                  >
                    {/* Image */}
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.05]"
                      />
                    </div>
                    {/* frosted count badge — top right */}
                    <div className="absolute top-3 right-3 bg-white/85 backdrop-blur-sm text-[#1d1d1f] text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                      {category.count}
                    </div>
                    {/* Dark info strip */}
                    <div className="bg-[#1d1d1f] px-4 pt-3 pb-4">
                      <h3 style={{ color: '#ffffff', fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 600, fontSize: '14px', letterSpacing: '-0.01em', lineHeight: 1.3 }}>{category.name}</h3>
                      <p style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 400, fontSize: '12px', marginTop: '4px' }}>{category.count}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          BEST SELLERS
      ══════════════════════════════════════ */}
      <section className="py-10 sm:py-16 lg:py-24 bg-[#f8f8f6]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
            <div>
              <span className="heading-accent text-[10px] tracking-[0.2em] uppercase text-[#8B0000] font-semibold">Most Loved</span>
              <h2
                className="text-[24px] sm:text-[32px] font-extrabold text-[#111] mt-1 leading-[1.15] tracking-[-0.01em]"
                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
              >
                Best <span style={{ color: '#e00000' }}>Sellers</span>
              </h2>
              <p className="text-[14px] text-[#888] mt-1" style={{ fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 400 }}>Our most popular pieces, trusted by thousands</p>
            </div>
            <Link
              to="/best-sellers"
              className="cta-arrow group inline-flex items-center gap-2 text-[12px] tracking-[0.1em] uppercase text-[#111] font-medium self-start sm:self-auto pb-px border-b border-transparent hover:border-[#111] transition-all duration-200"
            >
              View all <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 overflow-visible py-4 px-0 sm:px-2">
            {(loading ? (Array.from({ length: 8 }) as Array<Product | undefined>) : bestSellers).map((product, i) => (
              <motion.div
                key={product?.id ?? `bs-skeleton-${i}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: (i % 4) * 0.07 }}
              >
                {product ? <ProductCard product={product} /> : <div className="aspect-[3/4] bg-gray-200 animate-pulse rounded-lg" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          NEW ARRIVALS
      ══════════════════════════════════════ */}
      <section className="py-10 sm:py-16 lg:py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
            <div>
              <span className="heading-accent text-[10px] tracking-[0.2em] uppercase text-[#8B0000] font-semibold">Just In</span>
              <h2
                className="text-[24px] sm:text-[32px] font-extrabold text-[#111] mt-1 leading-[1.15] tracking-[-0.01em]"
                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
              >
                New <span style={{ color: '#e00000' }}>Arrivals</span>
              </h2>
              <p className="text-[14px] text-[#888] mt-1" style={{ fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 400 }}>Fresh styles, just added to the store</p>
            </div>
            <Link
              to="/new-arrivals"
              className="cta-arrow group inline-flex items-center gap-2 text-[12px] tracking-[0.1em] uppercase text-[#111] font-medium self-start sm:self-auto pb-px border-b border-transparent hover:border-[#111] transition-all duration-200"
            >
              View all <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 overflow-visible py-4 px-0 sm:px-2">
            {(loading ? (Array.from({ length: 8 }) as Array<Product | undefined>) : newArrivals).map((product, i) => (
              <motion.div
                key={product?.id ?? `na-skeleton-${i}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: (i % 4) * 0.07 }}
              >
                {product ? <ProductCard product={product} /> : <div className="aspect-[3/4] bg-gray-200 animate-pulse rounded-lg" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SHOPPABLE VIDEOS
      ══════════════════════════════════════ */}
      <ShoppableVideos />

      {/* ══════════════════════════════════════
          CUSTOMER REVIEWS
      ══════════════════════════════════════ */}
      <HomeReviews />

    </div>
  );
}
