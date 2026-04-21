import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useHomepageContent } from '../context/HomepageContentContext';
import { PromoBanner } from './PromoBanner';

// SVG noise texture data URI for left-panel grain effect
const GRAIN_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

export function HeroCarousel() {
  const { content } = useHomepageContent();
  const slides = content.hero.slides;
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback((index: number, dir: number) => {
    setDirection(dir);
    setCurrent(index);
  }, []);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length, -1);
  }, [current, goTo, slides.length]);

  const next = useCallback(() => {
    goTo((current + 1) % slides.length, 1);
  }, [current, goTo, slides.length]);

  // Reset to first slide if slides list shrinks below current index
  useEffect(() => {
    if (current >= slides.length && slides.length > 0) setCurrent(0);
  }, [slides.length, current]);

  // Autoplay — pauses on hover
  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(next, 3500);
    return () => clearInterval(id);
  }, [next, slides.length]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next]);

  if (slides.length === 0) return null;
  const slide = slides[current] ?? slides[0];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  return (
    <section
      className="relative bg-[#0f0f0f] overflow-hidden flex flex-col min-h-[620px] sm:min-h-[500px]"
      style={{ height: '100svh', maxHeight: '900px' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Promo banner ── */}
      <PromoBanner />

      {/* ── Main area (flex-1 fills remaining height) ── */}
      <div className="relative flex-1 min-h-0 flex flex-col lg:flex-row">

        {/* ════════════════════════════════════
            MOBILE: image at TOP
            ════════════════════════════════════ */}
        <div className="lg:hidden relative flex-shrink-0" style={{ height: 'clamp(220px, 40svh, 340px)' }}>
          <AnimatePresence mode="sync">
            <motion.img
              key={`mob-img-${current}`}
              src={slide.image}
              alt={slide.title.join(' ')}
              loading="lazy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
          </AnimatePresence>
          {/* bottom fade to dark */}
          <div
            aria-hidden
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{ height: '55%', background: 'linear-gradient(to top, #0f0f0f 0%, transparent 100%)' }}
          />
        </div>

        {/* ════════════════════════════════════
            LEFT PANEL: editorial content
            ════════════════════════════════════ */}
        <div className="relative z-10 w-full lg:w-[45%] flex flex-col justify-center py-6 sm:py-12 lg:py-16">

          {/* ── Brand red accent line (desktop, far left edge) ── */}
          <div
            aria-hidden
            className="hidden lg:block absolute left-0 top-0 bottom-0 pointer-events-none"
            style={{
              width: '3px',
              background: 'linear-gradient(to bottom, transparent 0%, #c0392b 15%, #c0392b 85%, transparent 100%)',
            }}
          />

          {/* ── Grain / noise texture (desktop only) ── */}
          <div
            aria-hidden
            className="hidden lg:block absolute inset-0 pointer-events-none"
            style={{ backgroundImage: GRAIN_BG, backgroundRepeat: 'repeat', opacity: 0.55 }}
          />

          {/* ── Animated glow orb — bottom left ── */}
          <div
            aria-hidden
            className="absolute pointer-events-none"
            style={{
              bottom: '-20%',
              left: '-15%',
              width: '55%',
              paddingBottom: '55%',
              borderRadius: '50%',
              background: 'radial-gradient(circle at center, rgba(192,57,43,0.10) 0%, transparent 70%)',
              animation: 'pulse 5s ease-in-out infinite',
            }}
          />

          {/* ── Slide counter (desktop, top-right of panel) ── */}
          <div
            className="hidden lg:flex absolute items-center gap-2"
            style={{
              top: '2.5rem',
              right: '2.2rem',
              fontFamily: 'Inter, sans-serif',
              fontSize: '11px',
              letterSpacing: '0.14em',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.22)',
              userSelect: 'none',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
              {String(current + 1).padStart(2, '0')}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.18)' }}>/</span>
            <span>{String(slides.length).padStart(2, '0')}</span>
          </div>

          {/* ── Content ── */}
            <div className="px-6 sm:px-12 lg:pl-[68px] xl:pl-24 lg:pr-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${current}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
              >
                {/* ── Badge: fashion-label style ── */}
                <motion.div
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'clamp(16px, 2vw, 30px)' }}
                >
                  <div style={{ width: '26px', height: '1px', background: '#c0392b', flexShrink: 0 }} />
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.28em',
                      textTransform: 'uppercase',
                      color: '#c0392b',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {slide.badge}
                  </span>
                </motion.div>

                {/* ── Heading: editorial mixed-weight typography ── */}
                <h1
                  style={{
                    fontFamily: 'Cormorant Garamond, Playfair Display, Georgia, serif',
                    fontSize: 'clamp(26px, 5.2vw, 88px)',
                    lineHeight: 0.93,
                    letterSpacing: '-0.02em',
                    color: '#ffffff',
                    margin: '0 0 14px 0',
                  }}
                >
                  {slide.title.map((line, i) => (
                    <motion.span
                      key={`${current}-line-${i}`}
                      style={{
                        display: 'block',
                        fontWeight: i === 0 ? 700 : 300,
                        fontStyle: i > 0 ? 'italic' : 'normal',
                      }}
                      initial={{ opacity: 0, y: 34 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.72,
                        delay: 0.18 + i * 0.1,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      {line}
                    </motion.span>
                  ))}
                </h1>

                {/* ── Subtext ── */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.55,
                    delay: 0.3 + slide.title.length * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{
                    fontFamily: 'Inter, DM Sans, sans-serif',
                    fontSize: 'clamp(11px, 1.35vw, 14px)',
                    fontWeight: 300,
                    letterSpacing: '0.03em',
                    lineHeight: 1.78,
                    color: 'rgba(255,255,255,0.50)',
                    maxWidth: '420px',
                    marginBottom: 'clamp(16px, 2.4vw, 32px)',
                  }}
                >
                  {slide.description}
                </motion.p>

                {/* ── CTA + Nav group ── */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.55,
                    delay: 0.45 + slide.title.length * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {/* CTA Button: white fill → outlined on hover */}
                  <Link
                    to={slide.ctaLink}
                    className="inline-flex items-center gap-3 bg-white text-[#0f0f0f] hover:bg-transparent hover:text-white border border-white group transition-all duration-300"
                    style={{
                      borderRadius: 0,
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      padding: 'clamp(12px, 1.5vw, 15px) clamp(20px, 3vw, 32px)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      marginBottom: 'clamp(14px, 2.2vw, 28px)',
                    }}
                  >
                    {slide.cta}
                    <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>

                  {/* ── Line indicators + square nav arrows ── */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Indicators: thin horizontal lines */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {slides.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => goTo(i, i > current ? 1 : -1)}
                          aria-label={`Go to slide ${i + 1}`}
                          style={{
                            height: '2px',
                            width: i === current ? '48px' : '22px',
                            background: i === current ? '#ffffff' : 'rgba(255,255,255,0.22)',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            transition: 'width 0.42s ease, background 0.42s ease',
                            borderRadius: 0,
                            flexShrink: 0,
                          }}
                        />
                      ))}
                    </div>

                    {/* Arrows: minimal outlined squares — hidden on mobile (swipe instead) */}
                    <div className="hidden sm:flex" style={{ gap: '8px' }}>
                      {([
                        { onClick: prev, Icon: ChevronLeft, label: 'Previous slide' },
                        { onClick: next, Icon: ChevronRight, label: 'Next slide' },
                      ] as const).map(({ onClick, Icon, label }) => (
                        <button
                          key={label}
                          onClick={onClick}
                          aria-label={label}
                          style={{
                            width: '48px',
                            height: '48px',
                            border: '1px solid rgba(255,255,255,0.28)',
                            background: 'transparent',
                            color: '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 0,
                            transition: 'border-color 0.2s ease, background 0.2s ease',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)';
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <Icon size={16} strokeWidth={1.5} />
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ════════════════════════════════════
            DESKTOP: Right image panel
            Diagonal clip-path bleeds into left area
            ════════════════════════════════════ */}
        <AnimatePresence mode="sync">
          <motion.div
            key={`desktop-img-${current}`}
            className="hidden lg:block absolute right-0 top-0 bottom-0"
            style={{
              width: '62%',
              height: '100%',
              clipPath: 'polygon(8% 0%, 100% 0%, 100% 100%, 0% 100%)',
              overflow: 'hidden',
            }}
            initial={{ opacity: 0, x: direction > 0 ? 55 : -55 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -38 : 38 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Ken Burns scale on enter */}
            <motion.img
              key={`desktop-photo-${current}`}
              src={slide.image}
              alt={slide.title.join(' ')}
              loading={current === 0 ? 'eager' : 'lazy'}
              initial={{ scale: 1.07 }}
              animate={{ scale: 1.0 }}
              transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top',
                display: 'block',
              }}
            />
            {/* Left-edge gradient: seamless dark merge */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(to right, rgba(15,15,15,0.80) 0%, rgba(15,15,15,0.22) 22%, transparent 52%)',
                pointerEvents: 'none',
              }}
            />
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
