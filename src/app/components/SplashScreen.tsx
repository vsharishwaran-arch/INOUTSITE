import { useEffect, useState } from 'react';

export function SplashScreen() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Hide from DOM after animation completes (1.8s)
    const t = setTimeout(() => setHidden(true), 1850);
    return () => clearTimeout(t);
  }, []);

  if (hidden) return null;

  return (
    <div className="splash-screen" aria-hidden="true">
      <img
        src="/logo2.jpeg"
        alt="INOUT Fashion"
        className="splash-logo"
        style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 0 0 1px rgba(255,255,255,0.08)' }}
      />
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontSize: '13px',
          letterSpacing: '0.3em',
          color: 'rgba(255,255,255,0.55)',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}>
          INOUT FASHION
        </p>
        <div className="splash-bar-track">
          <div className="splash-bar-fill" />
        </div>
      </div>
    </div>
  );
}
