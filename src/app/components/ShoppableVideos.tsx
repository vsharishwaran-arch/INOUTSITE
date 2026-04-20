import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { fetchVideos, videoIncrementViews, type ShoppableVideo } from '../lib/api';

/* ─── URL type detection ─────────────────────────────────────────── */
function detectType(url: string): 'youtube' | 'video' {
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
  return 'video';
}

function youtubeEmbedUrl(url: string) {
  let id = '';
  try {
    const u = new URL(url);
    id = u.hostname.includes('youtu.be')
      ? u.pathname.slice(1)
      : (u.searchParams.get('v') || '');
  } catch {
    id = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)?.[1] || '';
  }
  return id
    ? `https://www.youtube.com/embed/${id}?autoplay=0&rel=0&modestbranding=1`
    : null;
}

/* ─── Main section ───────────────────────────────────────────────── */
export function ShoppableVideos() {
  const [videos, setVideos] = useState<ShoppableVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos()
      .then(setVideos)
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && videos.length === 0) return null;

  return (
    <section className="py-10 lg:py-14 bg-[#0A0A0A]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-14">

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="aspect-[9/16] bg-white/10 animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {videos.slice(0, 5).map((video, i) => (
              <VideoItem key={video.id} video={video} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Individual inline video item ──────────────────────────────── */
function VideoItem({ video, index }: { video: ShoppableVideo; index: number }) {
  const type = detectType(video.videoUrl);
  const embedUrl = type === 'youtube' ? youtubeEmbedUrl(video.videoUrl) : null;
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);
  const [viewCounted, setViewCounted] = useState(false);

  /* Auto-play muted when in viewport, pause when out */
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else {
          el.pause();
          el.muted = true;
          setMuted(true);
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  function handleToggleSound() {
    const el = videoRef.current;
    if (!el) return;
    const next = !muted;
    el.muted = next;
    setMuted(next);
    if (!next && !viewCounted) {
      videoIncrementViews(video.id).catch(() => {});
      setViewCounted(true);
    }
  }

  const displayPrice = video.discountPrice ?? video.price;
  const originalPrice = video.discountPrice != null ? video.price : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="flex flex-col"
    >
      {/* ── Player area (9:16 portrait) ── */}
      <div ref={containerRef} className="relative aspect-[9/16] bg-[#111] overflow-hidden group">

        {/* YouTube iframe — plays fully inline */}
        {type === 'youtube' && embedUrl && (
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.title}
          />
        )}

        {/* Direct video file (MP4 / WebM) — autoplay muted, tap to unmute */}
        {type === 'video' && (
          <>
            <video
              ref={videoRef}
              src={video.videoUrl}
              className="absolute inset-0 w-full h-full object-cover cursor-pointer"
              muted
              loop
              playsInline
              preload="metadata"
              poster={video.thumbnailUrl || undefined}
              onClick={handleToggleSound}
            />
            {/* Sound indicator */}
            <button
              onClick={handleToggleSound}
              className="absolute top-2.5 right-2.5 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/15 hover:bg-black/70 transition-colors"
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="white" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="white" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              )}
            </button>
          </>
        )}

        {/* Price + shop overlay — bottom of video */}
        <div className="absolute bottom-0 inset-x-0 z-10 px-2.5 pb-2.5 pt-8 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {displayPrice != null && (
            <div className="flex items-baseline gap-1.5">
              <span className="text-white text-[13px] font-bold">₹{displayPrice.toLocaleString()}</span>
              {originalPrice != null && (
                <span className="line-through text-white/45 text-[10px]">₹{originalPrice.toLocaleString()}</span>
              )}
            </div>
          )}
          {video.productLink && (
            <a
              href={video.productLink}
              className="text-[9px] font-bold tracking-[0.1em] uppercase text-white bg-[#E31E24] px-3 py-1.5 hover:bg-[#c0171c] transition-colors"
            >
              Shop
            </a>
          )}
        </div>
      </div>

      {/* ── Minimal info below ── */}
      {(video.title || video.overlayText) && (
        <div className="mt-1.5 px-0.5">
          <p className="text-white/80 text-[11px] font-medium leading-snug truncate">{video.overlayText || video.title}</p>
        </div>
      )}
    </motion.div>
  );
}
