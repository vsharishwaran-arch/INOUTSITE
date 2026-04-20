import { X, Plus } from 'lucide-react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [productsExpanded, setProductsExpanded] = useState(false);

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed left-0 top-0 h-full w-[85vw] max-w-[380px] bg-white z-50 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
              <h2 className="text-sm tracking-[0.3em] text-black">MENU</h2>
              <button
                onClick={onClose}
                className="text-black hover:opacity-70 transition-opacity"
              >
                <X size={24} />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="px-8 py-8">
              <ul className="space-y-1">
                <li className="border-b border-gray-200">
                  <Link
                    to="/"
                    onClick={handleLinkClick}
                    className="block py-4 text-sm tracking-[0.2em] text-black hover:opacity-70 transition-opacity"
                  >
                    HOME
                  </Link>
                </li>

                <li className="border-b border-gray-200">
                  <button
                    onClick={() => setProductsExpanded(!productsExpanded)}
                    className="w-full flex items-center justify-between py-4 text-sm tracking-[0.2em] text-black hover:opacity-70 transition-opacity"
                  >
                    <span>PRODUCTS</span>
                    <Plus
                      size={20}
                      className={`transition-transform ${productsExpanded ? 'rotate-45' : ''}`}
                    />
                  </button>
                  
                  {productsExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <ul className="space-y-1 pb-4 pl-4">
                        <li>
                          <Link
                            to="/shop"
                            onClick={handleLinkClick}
                            className="block py-2 text-sm tracking-[0.15em] text-gray-600 hover:text-black transition-colors"
                          >
                            All Products
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/casual"
                            onClick={handleLinkClick}
                            className="block py-2 text-sm tracking-[0.15em] text-gray-600 hover:text-black transition-colors"
                          >
                            Casual
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/formal"
                            onClick={handleLinkClick}
                            className="block py-2 text-sm tracking-[0.15em] text-gray-600 hover:text-black transition-colors"
                          >
                            Formal Wear
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/streetwear"
                            onClick={handleLinkClick}
                            className="block py-2 text-sm tracking-[0.15em] text-gray-600 hover:text-black transition-colors"
                          >
                            Streetwear
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/new-arrivals"
                            onClick={handleLinkClick}
                            className="block py-2 text-sm tracking-[0.15em] text-gray-600 hover:text-black transition-colors"
                          >
                            New Arrivals
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/best-sellers"
                            onClick={handleLinkClick}
                            className="block py-2 text-sm tracking-[0.15em] text-gray-600 hover:text-black transition-colors"
                          >
                            Best Sellers
                          </Link>
                        </li>
                      </ul>
                    </motion.div>
                  )}
                </li>

                <li className="border-b border-gray-200">
                  <Link
                    to="/casual"
                    onClick={handleLinkClick}
                    className="block py-4 text-sm tracking-[0.2em] text-black hover:opacity-70 transition-opacity"
                  >
                    ABOUT US
                  </Link>
                </li>

                <li className="border-b border-gray-200">
                  <Link
                    to="/casual"
                    onClick={handleLinkClick}
                    className="block py-4 text-sm tracking-[0.2em] text-black hover:opacity-70 transition-opacity"
                  >
                    CONTACT US
                  </Link>
                </li>

                <li className="border-b border-gray-200">
                  <Link
                    to="/shop"
                    onClick={handleLinkClick}
                    className="block py-4 text-sm tracking-[0.2em] text-black hover:opacity-70 transition-opacity"
                  >
                    OUR STORE
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 px-8 py-8 border-t border-gray-200">
              <Link
                to="/profile"
                onClick={handleLinkClick}
                className="block text-sm tracking-wide text-black hover:opacity-70 transition-opacity mb-4"
              >
                Log in
              </Link>
              <div className="flex items-center gap-2 text-sm tracking-wide text-black">
                <span>INR</span>
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
