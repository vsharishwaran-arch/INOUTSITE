import { Outlet, NavLink, useNavigate, Navigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Package, ShoppingCart, LogOut, Warehouse,
  Users, BarChart3, Star, Settings, Menu, X, ChevronRight, Globe, Tag, Video, RotateCw,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package, end: false },
  { to: '/admin/sale-products', label: 'Sale / Offers', icon: Tag, end: false },
  { to: '/admin/videos', label: 'Shoppable Videos', icon: Video, end: false },
  { to: '/admin/carousel', label: '3D Carousel', icon: RotateCw, end: false },
  { to: '/admin/inventory', label: 'Inventory', icon: Warehouse, end: false },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart, end: false },
  { to: '/admin/customers', label: 'Customers', icon: Users, end: false },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3, end: false },
  { to: '/admin/reviews', label: 'Reviews', icon: Star, end: false },
  { to: '/admin/homepage', label: 'Homepage', icon: Globe, end: false },
  { to: '/admin/settings', label: 'Settings', icon: Settings, end: false },
];

const ANNOUNCEMENT_ITEMS = [
  'ADMIN PANEL',
  'INOUT FASHION',
  'MANAGE YOUR STORE',
  'ADMIN PANEL',
  'INOUT FASHION',
];

export function AdminLayout() {
  const { isAdmin, logout, user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">

      {/* ── Announcement Marquee Bar (matching user side) ── */}
      <div className="bg-[#0A0A0A] text-white overflow-hidden h-7 flex items-center marquee-wrapper sticky top-0 z-50">
        <div className="marquee-track select-none">
          {[1, 2].map(n => (
            <span key={n} className="flex items-center">
              {ANNOUNCEMENT_ITEMS.map((item, i) => (
                <span key={i} className="text-[9px] tracking-[0.12em] font-medium uppercase px-5 opacity-90 whitespace-nowrap">
                  {item}
                  <span className="mx-5 opacity-40">·</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── Premium Top Header ── */}
      <header className="sticky top-7 z-40 bg-white/97 backdrop-blur-md border-b border-gray-100 shadow-[0_1px_12px_rgba(0,0,0,0.06)]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px]">

            {/* Left: Hamburger (mobile) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-foreground hover:opacity-60 transition-opacity"
              aria-label="Toggle menu"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>

            {/* Center: Brand */}
            <div className="absolute left-1/2 -translate-x-1/2">
              <NavLink to="/admin">
                <motion.span
                  style={{ fontFamily: 'var(--font-display)' }}
                  className="text-[1.4rem] sm:text-[1.7rem] lg:text-[2rem] tracking-[0.15em] font-semibold leading-[0.96] select-none whitespace-nowrap text-foreground"
                  initial={{ opacity: 0, filter: 'blur(6px)', letterSpacing: '0.28em' }}
                  animate={{ opacity: 1, filter: 'blur(0px)', letterSpacing: '0.15em' }}
                  transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.span
                    className="inline-block"
                    animate={{
                      y: [0, -1.2, 0],
                      scale: [1, 1.015, 1],
                      filter: ['brightness(1)', 'brightness(1.1)', 'brightness(1)'],
                      textShadow: [
                        '0 0 0 rgba(0,0,0,0)',
                        '0 2px 10px rgba(178,132,44,0.3), 0 0 24px rgba(178,132,44,0.2)',
                        '0 0 0 rgba(0,0,0,0)',
                      ],
                    }}
                    transition={{ duration: 3.4, delay: 0.95, repeat: Infinity, ease: 'easeInOut' }}
                    whileHover={{
                      scale: 1.06,
                      letterSpacing: '0.19em',
                      textShadow: '0 2px 12px rgba(178,132,44,0.38), 0 0 30px rgba(178,132,44,0.25)',
                    }}
                  >
                    INOUT ADMIN
                  </motion.span>
                </motion.span>
              </NavLink>
            </div>

            {/* Right: User info + Logout */}
            <div className="flex items-center gap-3 ml-auto">
              <span className="hidden sm:block text-[11px] tracking-[0.04em] text-muted-foreground font-medium">
                {user?.email}
              </span>
              <button
                onClick={() => { logout(); navigate('/admin/login'); }}
                className="flex items-center gap-1.5 text-xs tracking-[0.06em] font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut size={15} strokeWidth={1.5} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* ── Desktop Sidebar ── */}
        <aside className="w-[220px] bg-white border-r border-gray-100 min-h-[calc(100vh-95px)] sticky top-[95px] hidden md:flex flex-col shadow-[1px_0_8px_rgba(0,0,0,0.03)]">
          <nav className="py-5 flex-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-5 py-3 text-[13px] tracking-[0.02em] transition-all duration-200 ${
                    isActive
                      ? 'bg-foreground text-background font-medium mx-3 rounded-md shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03] hover:pl-6'
                  }`
                }
              >
                <item.icon size={17} strokeWidth={1.5} />
                {item.label}
                <ChevronRight size={13} className="ml-auto opacity-0 group-hover:opacity-50 transition-opacity" />
              </NavLink>
            ))}
          </nav>

          {/* Sidebar footer / branding */}
          <div className="p-5 border-t border-gray-50">
            <p className="text-[9px] tracking-[0.15em] text-muted-foreground/50 uppercase font-medium">
              INOUT FASHION © 2026
            </p>
          </div>
        </aside>

        {/* ── Mobile Slide-out Menu ── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-40 md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed top-0 left-0 bottom-0 w-[260px] bg-white z-50 md:hidden shadow-2xl"
              >
                <div className="flex items-center justify-between px-5 h-[60px] border-b border-gray-100">
                  <span
                    style={{ fontFamily: 'var(--font-display)' }}
                    className="text-[1.1rem] tracking-[0.12em] font-semibold text-foreground"
                  >
                    INOUT ADMIN
                  </span>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-foreground">
                    <X size={20} strokeWidth={1.5} />
                  </button>
                </div>
                <nav className="py-3">
                  {NAV_ITEMS.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-5 py-3.5 text-[13px] tracking-[0.02em] transition-all ${
                          isActive
                            ? 'bg-foreground text-background font-medium mx-3 rounded-md'
                            : 'text-muted-foreground hover:text-foreground'
                        }`
                      }
                    >
                      <item.icon size={17} strokeWidth={1.5} />
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
                <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-gray-50">
                  <p className="text-[10px] text-muted-foreground/60 mb-2">{user?.email}</p>
                  <button
                    onClick={() => { logout(); navigate('/admin/login'); setMobileMenuOpen(false); }}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ── Main Content ── */}
        <main className="flex-1 p-5 md:p-8 pb-8 max-w-[1200px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
