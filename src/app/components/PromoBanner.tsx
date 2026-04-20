import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useHomepageContent } from '../context/HomepageContentContext';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function useCountdown(endHour: number) {
  function calc() {
    const now = new Date();
    const end = new Date();
    end.setHours(endHour, 0, 0, 0);
    if (now >= end) end.setDate(end.getDate() + 1);
    const diff = Math.max(0, end.getTime() - now.getTime());
    return {
      hours: Math.floor(diff / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  }
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endHour]);
  return time;
}

function TimerBox({ val, label }: { val: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="tabular-nums font-bold text-[#1a1a2e] rounded-lg flex items-center justify-center"
        style={{
          background: '#fff',
          fontSize: 'clamp(1.2rem, 2.5vw, 1.7rem)',
          minWidth: 'clamp(2.6rem, 5vw, 3.4rem)',
          padding: '6px 10px',
          lineHeight: 1,
          boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
        }}
      >
        {val}
      </div>
      <span className="text-[8px] tracking-[0.1em] uppercase text-white/60">{label}</span>
    </div>
  );
}

export function PromoBanner() {
  const { content } = useHomepageContent();
  const { title, endHour, discount } = content.offer;
  const { hours, minutes, seconds } = useCountdown(endHour);
  const [dismissed, setDismissed] = useState(false);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ overflow: 'hidden' }}
        >
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            exit={{ y: -20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: '#0d1117',
              borderBottom: '1px solid rgba(0,188,212,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 'clamp(8px, 2vw, 20px)',
              padding: '9px clamp(16px, 4vw, 48px)',
              position: 'relative',
              fontFamily: 'Nunito Sans, sans-serif',
              overflow: 'hidden',
            }}
          >
            {/* Animated shimmer line */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
              style={{
                position: 'absolute',
                inset: 0,
                width: '30%',
                background: 'linear-gradient(90deg, transparent, rgba(0,188,212,0.07), transparent)',
                pointerEvents: 'none',
              }}
            />

            {/* Offer text — staggered fade-in */}
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              style={{ fontSize: 'clamp(10px, 1.5vw, 12px)', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.04em' }}
            >
              <span className="promo-fire" aria-hidden="true" style={{ display: 'inline-block', position: 'relative', width: 20, height: 24, marginRight: 4, verticalAlign: 'middle', flexShrink: 0 }}>
                <span className="fire-p fire-p1" />
                <span className="fire-p fire-p2" />
                <span className="fire-p fire-p3" />
                <span className="fire-p fire-p4" />
                <span className="fire-p fire-p5" />
                <span className="fire-p fire-p6" />
                <span className="fire-glow" />
              </span>
              <motion.span
                animate={{ color: ['#00bcd4', '#26c6da', '#00bcd4'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{ fontWeight: 700, display: 'inline' }}
              >
                UP TO {discount}% OFF
              </motion.span>
              {' — '}{title}
            </motion.span>

            {/* Divider */}
            <span className="hidden sm:inline" style={{ color: 'rgba(255,255,255,0.12)', fontSize: 14 }}>|</span>

            {/* Timer — each digit animates on change */}
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              style={{ fontSize: 'clamp(10px, 1.5vw, 12px)', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', fontVariantNumeric: 'tabular-nums' }}
            >
              Ends in&nbsp;
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={`${hours}${minutes}${seconds}`}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.2 }}
                  style={{ color: '#fff', fontWeight: 600, display: 'inline-block' }}
                >
                  {pad(hours)}h {pad(minutes)}m {pad(seconds)}s
                </motion.span>
              </AnimatePresence>
            </motion.span>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                to="/sale"
                className="hidden sm:inline-block"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#0d1117',
                  background: '#00bcd4',
                  padding: '4px 14px',
                  textDecoration: 'none',
                  flexShrink: 0,
                  display: 'inline-block',
                }}
              >
                Shop Now
              </Link>
            </motion.div>

            {/* Dismiss */}
            <motion.button
              onClick={() => setDismissed(true)}
              aria-label="Close"
              whileHover={{ scale: 1.2, color: 'rgba(255,255,255,0.8)' }}
              whileTap={{ scale: 0.9 }}
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                padding: 4,
              }}
            >
              <X size={13} />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

