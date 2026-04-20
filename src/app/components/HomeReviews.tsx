import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchFeaturedReviews, type PublicReview } from '../lib/api';

const StarSVG = ({ filled }: { filled: boolean }) => (
  <svg fill="currentColor" viewBox="0 0 20 20" className={`h-4 w-4 ${filled ? 'text-amber-400' : 'text-white/20'}`} xmlns="http://www.w3.org/2000/svg">
    <path d="M9.049 2.927c.3-.916 1.603-.916 1.902 0l1.286 3.953a1.5 1.5 0 001.421 1.033h4.171c.949 0 1.341 1.154.577 1.715l-3.38 2.458a1.5 1.5 0 00-.54 1.659l1.286 3.953c.3.916-.757 1.67-1.539 1.145l-3.38-2.458a1.5 1.5 0 00-1.76 0l-3.38 2.458c-.782.525-1.838-.229-1.539-1.145l1.286-3.953a1.5 1.5 0 00-.54-1.659l-3.38-2.458c-.764-.561-.372-1.715.577-1.715h4.171a1.5 1.5 0 001.421-1.033l1.286-3.953z" />
  </svg>
);

const PLACEHOLDER_REVIEWS: PublicReview[] = [
  { id: '1', customerName: 'Arjun Mehta', rating: 5, comment: 'Absolutely love the quality! The fabric is super soft and the fit is perfect. Will definitely order again.', productName: 'Premium Oversized Hoodie', createdAt: '' },
  { id: '2', customerName: 'Rahul Sharma', rating: 5, comment: "Best men's fashion brand I've found online. Fast delivery, great packaging, and the clothes look exactly like the photos.", productName: 'Classic Slim Fit Shirt', createdAt: '' },
  { id: '3', customerName: 'Karthik Nair', rating: 4, comment: 'Really happy with my purchase. The co-ord set gets so many compliments. Sizing guide was accurate too.', productName: 'Co-Ord Set', createdAt: '' },
  { id: '4', customerName: 'Pradeep Iyer', rating: 5, comment: "Genuine quality at a fair price. I've bought from many brands but INOUT's attention to detail stands out.", productName: 'Streetwear Track Pants', createdAt: '' },
];

function ReviewCard({ review, index }: { review: PublicReview; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="flex flex-col w-full p-6 rounded-xl flex-shrink-0"
      style={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.07)', minWidth: 0 }}
    >
      {/* Decorative quote mark */}
      <div
        style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontSize: '56px',
          lineHeight: 1,
          color: 'rgba(255,255,255,0.10)',
          marginBottom: '-8px',
          userSelect: 'none',
        }}
      >
        &#8220;
      </div>

      {/* Comment */}
      <p
        className="text-[14px] leading-[1.75] flex-1 mb-4"
        style={{ fontFamily: 'DM Sans, Inter, sans-serif', color: 'rgba(255,255,255,0.82)' }}
      >
        {review.comment}
      </p>

      {/* Stars */}
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: 5 }).map((_, si) => (
          <StarSVG key={si} filled={si < review.rating} />
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', marginBottom: '14px' }} />

      {/* Footer: name + product + verified */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[13px] font-semibold text-white">{review.customerName}</p>
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{review.productName || 'INOUT Fashion'}</p>
        </div>
        <span
          className="text-[10px] font-bold tracking-wide px-2 py-1 rounded-full"
          style={{ color: '#4ade80', backgroundColor: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}
        >
          ✓ Verified
        </span>
      </div>
    </motion.div>
  );
}

export function HomeReviews() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchFeaturedReviews(4)
      .then(data => setReviews(data.length > 0 ? data : PLACEHOLDER_REVIEWS))
      .catch(() => setReviews(PLACEHOLDER_REVIEWS))
      .finally(() => setLoading(false));
  }, []);

  const displayReviews = loading ? PLACEHOLDER_REVIEWS : reviews;

  const prev = () => setCurrent(i => (i - 1 + displayReviews.length) % displayReviews.length);
  const next = () => setCurrent(i => (i + 1) % displayReviews.length);

  // Auto-advance on mobile
  useEffect(() => {
    timerRef.current = setInterval(next, 4500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [displayReviews.length]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 4500);
  };

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-14">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div className="text-center sm:text-center w-full">
            <p className="text-[10px] tracking-[0.25em] uppercase font-semibold mb-3" style={{ color: '#8B0000' }}>
              What our customers say
            </p>
            <h2
              style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#111' }}
              className="text-[2rem] sm:text-[2.6rem] font-semibold tracking-tight leading-tight"
            >
              Loved by thousands
            </h2>
          </div>
          {/* Arrows — desktop */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => { prev(); resetTimer(); }}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-800 hover:bg-gray-800 hover:text-white transition-all duration-200"
              aria-label="Previous review"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => { next(); resetTimer(); }}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-800 hover:bg-gray-800 hover:text-white transition-all duration-200"
              aria-label="Next review"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Desktop grid */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-5">
          {displayReviews.map((review, i) => (
            <ReviewCard key={review.id} review={review} index={i} />
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="sm:hidden relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <ReviewCard review={displayReviews[current]} index={0} />
            </motion.div>
          </AnimatePresence>
          {/* Dots */}
          <div className="flex justify-center gap-1.5 mt-5">
            {displayReviews.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); resetTimer(); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-gray-800' : 'w-1.5 bg-gray-300'}`}
                aria-label={`Go to review ${i + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

