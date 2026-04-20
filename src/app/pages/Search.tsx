import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { ProductCard } from '../components/ProductCard';
import { useProductCatalog } from '../context/ProductCatalogContext';
import { Search as SearchIcon } from 'lucide-react';

export function Search() {
  const { products, loading } = useProductCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(query);

  const filteredProducts = products.filter(product => {
    const searchLower = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower)
    );
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
    }
  };

  return (
    <div className="min-h-screen py-10 sm:py-16 px-4 sm:px-6 lg:px-14">
      <div className="max-w-[1400px] mx-auto">
        {/* Search Header */}
        <div className="mb-14">
          <p className="text-[11px] tracking-[0.22em] text-[#8B7355] uppercase font-medium mb-4">Find Your Style</p>
          <h1
            style={{ fontFamily: 'var(--font-display)' }}
            className="text-4xl sm:text-[3.2rem] mb-10 tracking-tight"
          >
            Search
          </h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative max-w-2xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, styles, categories…"
              className="w-full px-5 py-4 border border-gray-200 bg-white focus:outline-none focus:border-[#0A0A0A] transition-colors pr-14 text-sm"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0A0A0A] transition-colors"
            >
              <SearchIcon size={18} strokeWidth={1.8} />
            </button>
          </form>
        </div>

        {/* Results */}
        {searchQuery && (
          <div className="mb-8">
            <p className="text-muted-foreground tracking-wide">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'} for "{searchQuery}"
            </p>
          </div>
        )}

        {/* Products Grid */}
        {searchQuery ? (
          loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="aspect-[3/4] bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground tracking-wide mb-4">
                No products found for "{searchQuery}"
              </p>
              <p className="text-sm text-muted-foreground">
                Try searching with different keywords
              </p>
            </div>
          )
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground tracking-wide">
              Start typing to search for products
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
