import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Product } from '../data/products';
import { products as fallbackProducts } from '../data/products';
import { fetchProducts } from '../lib/api';

interface ProductCatalogContextValue {
  products: Product[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
}

const ProductCatalogContext = createContext<ProductCatalogContextValue | undefined>(undefined);

export function ProductCatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = async () => {
    setLoading(true);
    try {
      const items = await fetchProducts();
      if (items.length === 0) {
        setProducts(fallbackProducts);
        setError('API catalog is empty. Using fallback catalog until products are seeded.');
      } else {
        setProducts(items);
        setError('');
      }
    } catch (fetchError) {
      setProducts(fallbackProducts);
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <ProductCatalogContext.Provider value={{ products, loading, error, refresh }}>
      {children}
    </ProductCatalogContext.Provider>
  );
}

export function useProductCatalog() {
  const context = useContext(ProductCatalogContext);
  if (!context) {
    throw new Error('useProductCatalog must be used within ProductCatalogProvider');
  }
  return context;
}