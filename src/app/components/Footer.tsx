import { useState, useEffect } from 'react';
import { Link } from 'react-router';

// ─── Brand Constants ──────────────────────────────────────────────────────────
const BRAND = {
  name: 'INOUT FASHION',
  logo: '/logo2.jpeg',
  about:
    'Where comfort, quality, and style come together effortlessly. We believe fashion should be timeless, easy to wear, and accessible to everyone.',
  email: 'hello@inoutfashion.in',
  phone: '+91 97916 39162',
  whatsapp: 'https://wa.me/919791639162',
  instagram: 'https://www.instagram.com/inout_fashions_showroom/',
  instagramHandle: '@inoutfashion',
  timings: '12PM TO 8PM',
  copyright: '© 2026, INOUT FASHION',
};

const BROWSE_LINKS = [
  { label: 'SHIRTS', to: '/category/shirts' },
  { label: 'T-SHIRTS', to: '/category/tshirt' },
  { label: 'PANTS', to: '/category/pants' },
  { label: 'NEW ARRIVALS', to: '/new-arrivals' },
  { label: 'BEST SELLERS', to: '/best-sellers' },
];

const POLICY_LINKS = [
  { label: 'Privacy Policy', to: '#' },
  { label: 'Refund Policy', to: '#' },
  { label: 'Terms of Service', to: '#' },
  { label: 'Shipping Policy', to: '#' },
  { label: 'Contact Information', to: '#' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ColHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: 'Nunito Sans, sans-serif',
      fontWeight: 700,
      fontSize: 13,
      color: '#fff',
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
      marginBottom: 20,
    }}>
      {children}
    </div>
  );
}

function FooterLink({ label, to }: { label: string; to: string }) {
  const isExternal = to.startsWith('http');
  const style: React.CSSProperties = {
    display: 'block',
    fontFamily: 'Nunito Sans, sans-serif',
    fontWeight: 400,
    fontSize: 13,
    color: '#888',
    textDecoration: 'none',
    marginBottom: 12,
    transition: 'color 0.15s ease',
  };
  const handlers = {
    onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = '#fff'; },
    onMouseLeave: (e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = '#888'; },
  };
  if (isExternal) return <a href={to} style={style} className="footer-link" {...handlers}>{label}</a>;
  return <Link to={to} style={style} className="footer-link" {...handlers}>{label}</Link>;
}

// ─── Main Footer ──────────────────────────────────────────────────────────────
export function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
          gap: 48px;
        }
        @media (max-width: 1024px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
        }
        @media (max-width: 600px) {
          .footer-grid { grid-template-columns: 1fr !important; }
          .footer-main-pad { padding: 32px 16px !important; }
          .footer-bottom-pad { padding: 14px 16px !important; flex-direction: column !important; gap: 10px !important; text-align: center; }
          .footer-policy-links { flex-wrap: wrap !important; justify-content: center !important; }
        }
        /* WhatsApp expanding button */
        .footer-wa-btn {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          width: 45px;
          height: 45px;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition-duration: 0.3s;
          box-shadow: 2px 2px 10px rgba(0,0,0,0.199);
          background-color: #00d757;
          text-decoration: none;
          flex-shrink: 0;
        }
        .footer-wa-btn .wa-sign {
          width: 100%;
          transition-duration: 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .footer-wa-btn .wa-sign svg path { fill: white; }
        .footer-wa-btn .wa-text {
          position: absolute;
          right: 0%;
          width: 0%;
          opacity: 0;
          color: white;
          font-size: 1em;
          font-weight: 600;
          font-family: 'Nunito Sans', sans-serif;
          transition-duration: 0.3s;
          white-space: nowrap;
        }
        .footer-wa-btn:hover { width: 150px; border-radius: 40px; transition-duration: 0.3s; }
        .footer-wa-btn:hover .wa-sign { width: 30%; transition-duration: 0.3s; padding-left: 10px; }
        .footer-wa-btn:hover .wa-text { opacity: 1; width: 70%; transition-duration: 0.3s; padding-right: 10px; }
        .footer-wa-btn:active { transform: translate(2px, 2px); }
        /* Instagram Uiverse button */
        .ig-tooltip-container {
          position: relative;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 17px;
          border-radius: 10px;
          flex-shrink: 0;
        }
        .ig-tooltip {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          padding: 10px;
          opacity: 0;
          pointer-events: none;
          transition: all 0.3s;
          border-radius: 15px;
          z-index: 100;
          box-shadow: inset 5px 5px 5px rgba(0,0,0,0.2), inset -5px -5px 15px rgba(255,255,255,0.1), 5px 5px 15px rgba(0,0,0,0.3), -5px -5px 15px rgba(255,255,255,0.1);
        }
        .ig-profile {
          background: #2a2b2f;
          border-radius: 10px 15px;
          padding: 10px;
          border: 1px solid #52382f;
          min-width: 160px;
        }
        .ig-tooltip-container:hover .ig-tooltip { top: -140px; opacity: 1; visibility: visible; pointer-events: auto; }
        .ig-icon { text-decoration: none; color: #fff; display: block; position: relative; }
        .ig-layer { width: 55px; height: 55px; transition: transform 0.3s; position: relative; }
        .ig-icon:hover .ig-layer { transform: rotate(-35deg) skew(20deg); }
        .ig-layer span {
          position: absolute; top: 0; left: 0; height: 100%; width: 100%;
          border: 1px solid #e6683c; border-radius: 15px; transition: all 0.3s;
        }
        .ig-icon .ig-text {
          position: absolute; left: 50%; bottom: -5px; opacity: 0; font-weight: 500;
          transform: translateX(-50%); transition: bottom 0.3s ease, opacity 0.3s ease;
          color: #e6683c; white-space: nowrap; font-family: 'Nunito Sans', sans-serif; font-size: 13px;
        }
        .ig-icon:hover .ig-text { bottom: -35px; opacity: 1; }
        .ig-icon:hover .ig-layer span:nth-child(1) { opacity: 0.2; }
        .ig-icon:hover .ig-layer span:nth-child(2) { opacity: 0.4; transform: translate(5px, -5px); }
        .ig-icon:hover .ig-layer span:nth-child(3) { opacity: 0.6; transform: translate(10px, -10px); }
        .ig-icon:hover .ig-layer span:nth-child(4) { opacity: 0.8; transform: translate(15px, -15px); }
        .ig-icon:hover .ig-layer span:nth-child(5) { opacity: 1; transform: translate(20px, -20px); }
        .ig-svg {
          display: flex; align-items: center; justify-content: center;
          width: 100%; height: 100%; border-radius: 14px;
          background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
        }
        .ig-user { display: flex; gap: 10px; align-items: center; }
        .ig-img {
          width: 40px; height: 40px; border: 1px solid #e6683c; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          background: #fff; overflow: hidden; flex-shrink: 0;
        }
        .ig-name { font-size: 14px; font-weight: 700; color: #e6683c; white-space: nowrap; }
        .ig-details { display: flex; flex-direction: column; gap: 2px; color: #fff; }
        .ig-about { color: #ccc; font-size: 12px; }
        /* Policy link hover */
        .footer-policy-link { color: #555; text-decoration: none; font-size: 12px; font-family: 'Nunito Sans', sans-serif; transition: color 0.15s; }
        .footer-policy-link:hover { color: #ccc; }
      `}</style>

      <footer style={{ background: '#111', fontFamily: 'Nunito Sans, sans-serif' }}>

        {/* ── Main Grid ── */}
        <div
          className="footer-main-pad"
          style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 48px 48px', borderBottom: '1px solid #222' }}
        >
          <div className="footer-grid">

            {/* Column 1: Brand */}
            <div>
              <div style={{ marginBottom: 16 }}>
                <img
                  src={BRAND.logo}
                  alt={BRAND.name}
                  style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 8 }}
                  onError={e => {
                    const img = e.currentTarget as HTMLImageElement;
                    img.style.display = 'none';
                    const fb = img.nextElementSibling as HTMLElement;
                    if (fb) fb.style.display = 'flex';
                  }}
                />
                <div style={{ display: 'none', alignItems: 'center', background: '#e00000', padding: '8px 16px', borderRadius: 6 }}>
                  <span style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '0.1em' }}>{BRAND.name}</span>
                </div>
              </div>
              <div style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: 700, fontSize: 14, color: '#fff', letterSpacing: '0.06em', marginBottom: 10 }}>
                {BRAND.name} —
              </div>
              <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: 400, fontSize: 13, color: '#777', lineHeight: 1.8, margin: 0 }}>
                {BRAND.about}
              </p>
            </div>

            {/* Column 2: Customer Care */}
            <div>
              <ColHeading>Customer Care</ColHeading>
              <div style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: '#888', marginBottom: 14, lineHeight: 1.7 }}>
                <span style={{ color: '#666', fontWeight: 600 }}>Address:</span>{' '}
                <span style={{ color: '#aaa' }}>Senguthapuram, 2nd cross, Karur, Tamil Nadu 639002</span>
              </div>
              <div style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: '#888', marginBottom: 14, lineHeight: 1.7 }}>
                <span style={{ color: '#666', fontWeight: 600 }}>Timings:</span>{' '}
                <span style={{ color: '#aaa' }}>{BRAND.timings}</span>
              </div>
              {/* WhatsApp expanding button */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: '#555', fontFamily: 'Nunito Sans, sans-serif', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>WhatsApp</div>
                <a
                  href={BRAND.whatsapp}
                  aria-label="WhatsApp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-wa-btn"
                >
                  <span className="wa-sign">
                    <svg width="22" height="22" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </span>
                  <span className="wa-text">WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Column 3: Browse */}
            <div>
              <ColHeading>Browse</ColHeading>
              {BROWSE_LINKS.map(l => <FooterLink key={l.label} label={l.label} to={l.to} />)}
            </div>

            {/* Column 4: Follow Us */}
            <div>
              <ColHeading>Follow Us</ColHeading>
              <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: 400, fontSize: 13, color: '#777', lineHeight: 1.8, marginBottom: 24, marginTop: 0 }}>
                Join us on Instagram to explore new outfit ideas, see our latest collections first, and get a daily dose of fashion energy.
              </p>
              <div className="ig-tooltip-container">
                <span className="ig-tooltip">
                  <div className="ig-profile">
                    <div className="ig-user">
                      <div className="ig-img">
                        <img src="/logo2.jpeg" alt="INOUT FASHION" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                      <div className="ig-details">
                        <div className="ig-name">INOUT FASHION</div>
                        <div className="ig-about">{BRAND.instagramHandle}</div>
                      </div>
                    </div>
                  </div>
                </span>
                <a href={BRAND.instagram} className="ig-icon" target="_blank" rel="noopener noreferrer">
                  <div className="ig-layer">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span className="ig-svg">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                      </svg>
                    </span>
                  </div>
                  <div className="ig-text">Instagram</div>
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div
          className="footer-bottom-pad"
          style={{
            background: '#0d0d0d',
            padding: '16px 48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <span style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: 400, fontSize: 12, color: '#555' }}>
            {BRAND.copyright} · All Rights Reserved.
          </span>
          <div className="footer-policy-links" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {POLICY_LINKS.map((p, i) => (
              <span key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {i > 0 && <span style={{ color: '#333' }}>·</span>}
                <FooterLink label={p.label} to={p.to} />
              </span>
            ))}
          </div>
        </div>

      </footer>

      {/* ── Scroll to Top ── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
        style={{
          position: 'fixed',
          bottom: 92,
          right: 24,
          width: 44,
          height: 44,
          background: '#ffffff',
          border: '1px solid #ddd',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 999,
          opacity: showScrollTop ? 1 : 0,
          visibility: showScrollTop ? 'visible' : 'hidden',
          transition: 'opacity 0.2s ease, visibility 0.2s ease, background 0.15s ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f0f0f0'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#ffffff'; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15"/>
        </svg>
      </button>
    </>
  );
}



