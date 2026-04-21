import { X, Plus } from 'lucide-react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { NAV_ITEMS } from './navItems';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

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
            className="fixed left-0 top-0 h-full w-[85vw] max-w-[380px] bg-white z-50 shadow-2xl flex flex-col"
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
            <nav className="px-8 py-6 overflow-y-auto flex-1">
              <ul className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <li key={item.label} className="border-b border-gray-200">
                    {item.dropdown ? (
                      <>
                        <button
                          onClick={() => setExpandedSection(expandedSection === item.label ? null : item.label)}
                          className="w-full flex items-center justify-between py-4 text-sm tracking-[0.18em] text-black hover:opacity-70 transition-opacity"
                        >
                          <span>{item.label.toUpperCase()}</span>
                          <Plus
                            size={20}
                            className={`transition-transform ${expandedSection === item.label ? 'rotate-45' : ''}`}
                          />
                        </button>
                        {expandedSection === item.label && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <ul className="space-y-1 pb-4 pl-4">
                              {item.dropdown.map((child) => (
                                <li key={child.to}>
                                  <Link
                                    to={child.to}
                                    onClick={handleLinkClick}
                                    className="block py-2 text-sm tracking-[0.14em] text-gray-600 hover:text-black transition-colors"
                                  >
                                    {child.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </>
                    ) : (
                      <Link
                        to={item.to}
                        onClick={handleLinkClick}
                        className="block py-4 text-sm tracking-[0.18em] text-black hover:opacity-70 transition-opacity"
                      >
                        {item.label.toUpperCase()}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-gray-200">
              <Link
                to="/profile"
                onClick={handleLinkClick}
                className="block text-sm tracking-wide text-black hover:opacity-70 transition-opacity mb-4"
              >
                Log in
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
