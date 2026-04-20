import { useEffect, useState } from 'react';
import { Tag } from 'lucide-react';
import { motion } from 'motion/react';
import { fetchOfferProducts } from '../lib/api';
import type { Product } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { CategoryPageBanner } from '../components/CategoryPageBanner';

export function Sale() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOfferProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <CategoryPageBanner categoryName="sale" />

      {/* Products grid header filler */}
      <div style={{ display: 'none' }}>
          <div>
          </div>
      </div>

      {/* Products grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-14 py-14">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 overflow-visible py-4 px-0 sm:px-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ borderRadius: '12px', background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <div className="skeleton" style={{ aspectRatio: '4/5' }} />
                <div style={{ padding: '12px' }}>
                  <div className="skeleton" style={{ height: '8px', width: '40%', borderRadius: '4px', marginBottom: '8px' }} />
                  <div className="skeleton" style={{ height: '13px', width: '85%', borderRadius: '4px', marginBottom: '5px' }} />
                  <div className="skeleton" style={{ height: '15px', width: '30%', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-14 h-14 bg-[#E31E24]/10 flex items-center justify-center mb-5">
              <Tag size={22} className="text-[#E31E24]" />
            </div>
            <h2 className="text-[1.2rem] font-semibold text-[#0A0A0A] mb-2">No offers right now</h2>
            <p className="text-gray-400 text-[13px] max-w-xs">
              Check back soon — our team updates this section regularly with special deals.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#E31E24] font-medium">Deals</span>
                <h2 className="text-[1.75rem] font-light tracking-tight text-[#0A0A0A] mt-0.5">
                  All <em className="not-italic font-semibold">Offers</em>
                </h2>
              </div>
              <p className="text-[12px] text-gray-400">{products.length} item{products.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 overflow-visible py-4 px-0 sm:px-2">
              {products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: (i % 4) * 0.07 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
