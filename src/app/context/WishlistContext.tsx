import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product } from '../data/products';

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const STORAGE_KEY = 'inout_wishlist';
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function loadWishlist(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>(loadWishlist);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToWishlist = (product: Product) => {
    setItems(prev => {
      if (prev.some(item => item.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  };

  const toggleWishlist = (product: Product) => {
    setItems(prev => {
      if (prev.some(item => item.id === product.id)) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const isInWishlist = (productId: string) => items.some(item => item.id === productId);

  const clearWishlist = () => setItems([]);

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
}
