import { Link, useLocation } from 'react-router';
import { Search, ShoppingBag, User, Menu, ChevronDown, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState, useEffect, useRef } from 'react';
import { MobileMenu } from './MobileMenu';
import { motion, AnimatePresence } from 'motion/react';
import { useWishlist } from '../context/WishlistContext';
import { useHomepageContent } from '../context/HomepageContentContext';

type DropdownItem = { label: string; to: string; highlight?: boolean };
type NavItem = { label: string; to: string; dropdown?: DropdownItem[] };

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', to: '/' },
  {
    label: 'Top Wear',
    to: '/topwear',
    dropdown: [
      { label: 'T-Shirts', to: '/tshirt' },
      { label: 'Shirts', to: '/shirt' },
      { label: 'Co-Ord Sets', to: '/coord' },
      { label: 'Hoodies', to: '/hoodies', highlight: true },
    ],
  },
  {
    label: 'Bottom Wear',
    to: '/bottomwear',
    dropdown: [
      { label: 'Jeans', to: '/jeans' },
      { label: 'Trousers', to: '/trousers' },
      { label: 'Shorts', to: '/shorts' },
      { label: 'Track Pants', to: '/trackpants', highlight: true },
    ],
  },
  {
    label: 'Sale',
    to: '/sale',
    dropdown: [
      { label: 'New Arrivals', to: '/new-arrivals' },
      { label: 'Best Sellers', to: '/best-sellers' },
      { label: 'Offer Zone', to: '/sale', highlight: true },
    ],
  },
];

export function Navigation() {
  const location = useLocation();
  const { getTotalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { content } = useHomepageContent();
  const announcementItems = content.announcement.items;
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const totalItems = getTotalItems();
  const wishlistCount = wishlistItems.length;

  // Frosted glass on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to.split('?')[0]);

  return (
    <>
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="sticky top-0 z-50">

        {/* ── Announcement Bar ── */}
        <div className="bg-[#0A0A0A] text-white overflow-hidden h-8 sm:h-10 flex items-center marquee-wrapper">
          <div className="marquee-track select-none">
            {[1, 2].map(n => (
              <span key={n} className="flex items-center">
                {announcementItems.map((item, i) => (
                  <span key={i} className="text-[10px] sm:text-[11px] tracking-[0.14em] font-medium uppercase px-4 sm:px-6 opacity-90 whitespace-nowrap">
                    {item}
                    <span className="mx-3 sm:mx-5 opacity-40">◆</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/* ── Main Navigation ── */}
        <nav
          className="border-b transition-all duration-300"
          style={{
            background: scrolled ? 'rgba(255,255,255,0.98)' : '#ffffff',
            backdropFilter: scrolled ? 'blur(12px)' : 'none',
            WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
            borderColor: scrolled ? '#eeeeee' : '#f0f0f0',
            boxShadow: scrolled ? '0 1px 16px rgba(0,0,0,0.07)' : '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-10">
            <div className="flex items-center h-[52px] sm:h-[60px]">
              {/* ── Left: Logo ── */}
              <div className="flex-shrink-0 flex items-center gap-3">
                {/* Mobile hamburger */}
                <button
                  onClick={() => setMenuOpen(true)}
                  className="text-foreground hover:opacity-60 transition-opacity lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu size={20} strokeWidth={1.5} />
                </button>

                <Link to="/" className="flex items-center select-none">
                  <motion.img
                    src="/logo2.jpeg"
                    alt="INOUT Fashion"
                    className="h-[44px] sm:h-[52px] lg:h-[60px] w-auto object-contain"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  />
                </Link>
              </div>

              {/* ── Center: Nav Links ── */}
              <div
                ref={dropdownRef}
                className="hidden lg:flex flex-1 items-center justify-center"
                style={{ gap: '32px' }}
              >
                {NAV_ITEMS.map(({ label, to, dropdown }) =>
                  dropdown ? (
                    <div key={label} className="relative">
                      <button
                        onMouseEnter={() => setOpenDropdown(label)}
                        onMouseLeave={() => setOpenDropdown(null)}
                        style={{ fontFamily: 'var(--font-nav)', fontWeight: 700, fontSize: '15px', letterSpacing: '0em', transition: 'color 0.2s ease' }}
                        className={`flex items-center gap-1 py-2 whitespace-nowrap ${
                          isActive(to)
                            ? 'text-[#3498db]'
                            : 'text-[#222] hover:text-[#3498db]'
                        }`}
                      >
                        {label}
                        <ChevronDown
                          size={12}
                          strokeWidth={2.5}
                          className={`transition-transform duration-200 ${openDropdown === label ? 'rotate-180' : ''}`}
                        />
                      </button>
                      <AnimatePresence>
                        {openDropdown === label && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            onMouseEnter={() => setOpenDropdown(label)}
                            onMouseLeave={() => setOpenDropdown(null)}
                            className="absolute top-full left-0 mt-0 w-44 bg-white border border-gray-100 shadow-lg z-50 py-2"
                          >
                            {dropdown.map((item) => (
                              <Link
                                key={item.to}
                                to={item.to}
                                onClick={() => setOpenDropdown(null)}
                            className={`flex items-center justify-between px-5 py-2.5 text-[14px] font-semibold transition-colors ${
                                  item.highlight
                                    ? 'text-[#3498db] hover:bg-[#f8f8f6]'
                                    : 'text-[#222] hover:bg-[#f8f8f6] hover:text-[#3498db]'
                                }`}
                                style={{ fontFamily: 'var(--font-nav)', fontWeight: 600 }}
                              >
                                {item.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      key={to}
                      to={to}
                      style={{ fontFamily: 'var(--font-nav)', fontWeight: 700, fontSize: '15px', letterSpacing: '0em', transition: 'color 0.2s ease' }}
                      className={`py-2 whitespace-nowrap ${
                        isActive(to)
                          ? 'text-[#3498db]'
                          : 'text-[#222] hover:text-[#3498db]'
                      }`}
                    >
                      {label}
                    </Link>
                  ),
                )}
              </div>

              {/* ── Right: Icons ── */}
              <div className="flex-shrink-0 flex items-center gap-3 sm:gap-4 lg:gap-5 ml-auto lg:ml-0">
                <Link
                  to="/search"
                  className="text-[#333] hover:text-[#3498db] transition-colors"
                  aria-label="Search"
                >
                  <Search size={19} strokeWidth={1.7} />
                </Link>
                <Link
                  to="/profile"
                  className="text-[#333] hover:text-[#3498db] transition-colors hidden md:block"
                  aria-label="Profile"
                >
                  <User size={19} strokeWidth={1.7} />
                </Link>
                {/* Wishlist */}
                <Link
                  to="/profile"
                  className="relative text-[#333] hover:text-[#3498db] transition-colors hidden md:block"
                  aria-label="Wishlist"
                >
                  <Heart size={19} strokeWidth={1.7} />
                  <span className="absolute -top-2 -right-2 text-[10px] w-[17px] h-[17px] rounded-full bg-[#111] text-white flex items-center justify-center font-semibold leading-none">
                    {wishlistCount}
                  </span>
                </Link>
                {/* Cart */}
                <Link
                  to="/cart"
                  className="relative text-[#333] hover:text-[#3498db] transition-colors"
                  aria-label="Cart"
                >
                  <ShoppingBag size={19} strokeWidth={1.7} />
                  <span className="absolute -top-2 -right-2 text-[10px] w-[17px] h-[17px] rounded-full bg-[#111] text-white flex items-center justify-center font-semibold leading-none">
                    {totalItems}
                  </span>
                </Link>
              </div>

            </div>
          </div>
        </nav>
      </div>
    </>
  );
}