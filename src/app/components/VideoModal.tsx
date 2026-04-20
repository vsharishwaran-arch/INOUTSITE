import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ShoppableVideo } from '../lib/api';
import { X, ShoppingBag, Eye, Heart } from 'lucide-react';
import { Link } from 'react-router';

interface Props {
  video: ShoppableVideo | null;
  onClose: () => void;
}

function isYouTube(url: string) {
  return /youtube\.com|youtu\.be/.test(url);
}

function isInstagram(url: string) {
  return /instagram\.com/.test(url);
}

function getInstagramEmbedUrl(url: string): string {
  const match = url.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
  if (!match) return url;
  const shortcode = match[1];
  if (/\/reel\//.test(url)) return `https://www.instagram.com/reel/${shortcode}/embed/`;
  if (/\/tv\//.test(url)) return `https://www.instagram.com/tv/${shortcode}/embed/`;
  return `https://www.instagram.com/p/${shortcode}/embed/`;
}

function getYouTubeEmbedUrl(url: string) {
  let id = '';
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      id = u.pathname.slice(1);
    } else {
      id = u.searchParams.get('v') || '';
    }
  } catch {
    const m = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    id = m?.[1] || '';
  }
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1&mute=0&rel=0` : url;
}

export function VideoModal({ video, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Lock scroll when open
  useEffect(() => {
    if (video) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [video]);

  // Pause native video on close
  useEffect(() => {
    if (!video && videoRef.current) {
      videoRef.current.pause();
    }
  }, [video]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const displayPrice = video?.discountPrice ?? video?.price;
  const originalPrice = video?.discountPrice != null ? video.price : null;

  return (
    <AnimatePresence>
      {video && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal box */}
          <motion.div
            className="relative z-10 bg-white w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col lg:flex-row shadow-2xl"
            initial={{ scale: 0.93, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 24 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center bg-black/60 text-white hover:bg-black transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            {/* ── Video panel ── */}
            <div className="relative w-full lg:w-[55%] bg-black flex-shrink-0" style={{ aspectRatio: '9/16', maxHeight: '92vh' }}>
              {isYouTube(video.videoUrl) ? (
                <iframe
                  src={getYouTubeEmbedUrl(video.videoUrl)}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={video.title}
                />
              ) : isInstagram(video.videoUrl) ? (
                <iframe
                  src={getInstagramEmbedUrl(video.videoUrl)}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  scrolling="no"
                  title={video.title}
                />
              ) : (
                <video
                  ref={videoRef}
                  src={video.videoUrl}
                  className="absolute inset-0 w-full h-full object-cover"
                  controls
                  autoPlay
                  playsInline
                />
              )}

              {/* Stats overlay — bottom of video */}
              <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/70 to-transparent flex items-center gap-4 pointer-events-none">
                <span className="flex items-center gap-1 text-white/80 text-[11px]">
                  <Eye size={12} /> {video.views.toLocaleString()}
                </span>
                <span className="flex items-center gap-1 text-white/80 text-[11px]">
                  <Heart size={12} /> {video.likes.toLocaleString()}
                </span>
              </div>
            </div>

            {/* ── Product details panel ── */}
            <div className="flex flex-col flex-1 overflow-y-auto p-6">
              {/* Title */}
              <h2
                style={{ fontFamily: 'var(--font-display)' }}
                className="text-2xl font-semibold text-[#0A0A0A] leading-snug mb-2"
              >
                {video.title}
              </h2>

              {/* Overlay badge */}
              {video.overlayText && (
                <span className="inline-block text-[10px] tracking-[0.14em] uppercase font-semibold text-[#E31E24] border border-[#E31E24] px-2 py-0.5 mb-4 self-start">
                  {video.overlayText}
                </span>
              )}

              {/* Description */}
              {video.description && (
                <p className="text-[13px] text-gray-500 leading-relaxed mb-5">
                  {video.description}
                </p>
              )}

              {/* Price */}
              {displayPrice != null && (
                <div className="flex items-baseline gap-3 mb-5">
                  <span className="text-2xl font-bold text-[#0A0A0A]">
                    ₹{displayPrice.toLocaleString()}
                  </span>
                  {originalPrice != null && (
                    <span className="text-[14px] text-gray-400 line-through">
                      ₹{originalPrice.toLocaleString()}
                    </span>
                  )}
                  {originalPrice != null && displayPrice != null && (
                    <span className="text-[11px] font-semibold text-green-600 bg-green-50 px-2 py-0.5">
                      {Math.round(((originalPrice - displayPrice) / originalPrice) * 100)}% OFF
                    </span>
                  )}
                </div>
              )}

              {/* Sizes */}
              {video.sizes.length > 0 && (
                <div className="mb-6">
                  <p
                    style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
                    className="text-[13px] text-gray-500 mb-2"
                  >
                    Available Sizes
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {video.sizes.map(s => (
                      <span
                        key={s}
                        className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 text-[12px] font-semibold text-gray-700 tracking-wide"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="h-px bg-gray-100 mb-5" />

              {/* CTA */}
              {video.productLink ? (
                <Link
                  to={video.productLink}
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 bg-[#E31E24] text-white text-[13px] font-semibold tracking-[0.06em] uppercase py-3.5 px-6 hover:bg-[#c0171c] transition-colors duration-200"
                >
                  <ShoppingBag size={16} />
                  Shop Now
                </Link>
              ) : (
                <Link
                  to="/shop"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 bg-[#0A0A0A] text-white text-[13px] font-semibold tracking-[0.06em] uppercase py-3.5 px-6 hover:bg-[#333] transition-colors duration-200"
                >
                  <ShoppingBag size={16} />
                  Browse Collection
                </Link>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
