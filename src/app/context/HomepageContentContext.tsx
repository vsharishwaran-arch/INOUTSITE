import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { fetchHomepageContent, resolveAssetUrl, type RawHomepageContent } from '../lib/api';

// ── Types ─────────────────────────────────────────────────────────────────

export interface HeroSlide {
  badge: string;
  title: string[];       // 2-line title e.g. ["Hoodies That Hit", "Different"]
  description: string;
  cta: string;
  ctaLink: string;
  image: string;
  saveBadge: string;
  saveSub: string;
}

export interface UspItem {
  iconName: string;
  label: string;
  sub: string;
}

export interface CategoryItem {
  slug: string;         // tshirt | shirt | hoodies | coord | jeans | trackpants | shorts | trousers
  image: string;
  count: string;
}

export interface HomepageContent {
  hero: { slides: HeroSlide[] };
  announcement: { items: string[] };
  usp: { items: UspItem[] };
  offer: { title: string; subtitle: string; endHour: number; discount: string };
  categories: { items: CategoryItem[] };
}

// ── Defaults (mirror existing hardcoded values) ───────────────────────────

const DEFAULT_CONTENT: HomepageContent = {
  hero: {
    slides: [
      {
        badge: '🔥 HOT RIGHT NOW',
        title: ['Hoodies That Hit', 'Different'],
        description: 'Oversized. Premium. Made for the modern gentleman.',
        cta: 'Shop Hoodies',
        ctaLink: '/shop',
        image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
        saveBadge: 'SAVE 65%',
        saveSub: 'Limited sizes left — order now',
      },
      {
        badge: '⭐ NEW ARRIVAL',
        title: ['Fresh Styles', 'Just Dropped'],
        description: 'New arrivals every week. Be the first to wear it.',
        cta: 'Shop New Arrivals',
        ctaLink: '/new-arrivals',
        image: 'https://images.unsplash.com/photo-1617724748068-691efeeaf542?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
        saveBadge: 'NEW IN',
        saveSub: 'Spring / Summer 2026 Collection',
      },
      {
        badge: '🏆 BESTSELLER',
        title: ['Most Loved', 'Picks'],
        description: 'Trusted by thousands. Premium quality at unbeatable prices.',
        cta: 'Shop Best Sellers',
        ctaLink: '/best-sellers',
        image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
        saveBadge: 'TOP RATED',
        saveSub: 'Most purchased this month',
      },
    ],
  },
  announcement: {
    items: [
      'FREE SHIPPING ON ORDERS OVER ₹200',
      'DAILY NEW LAUNCHES',
      '9+ YEARS TRUSTED BRAND',
      '100% GENUINE PRODUCTS',
      '30-DAY EASY RETURNS',
      'EXCLUSIVE MEMBERS OFFER — SIGN UP TODAY',
    ],
  },
  usp: {
    items: [
      { iconName: 'Truck', label: 'Free Shipping', sub: 'Orders over ₹200' },
      { iconName: 'RefreshCw', label: 'Easy Returns', sub: '30-day policy' },
      { iconName: 'ShieldCheck', label: 'Authentic Quality', sub: 'Premium fabrics' },
      { iconName: 'Package', label: 'Secure Packaging', sub: 'Every order' },
    ],
  },
  offer: {
    title: "Today's Offer — Up to 70% Off",
    subtitle: 'Offer ends at 10 PM tonight',
    endHour: 22,
    discount: '75',
  },
  categories: {
    items: [
      { slug: 'tshirt',     image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', count: '30+ Styles' },
      { slug: 'shirt',      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', count: '20+ Styles' },
      { slug: 'hoodies',    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', count: '15+ Styles' },
      { slug: 'coord',      image: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', count: '10+ Styles' },
      { slug: 'jeans',      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', count: '25+ Styles' },
      { slug: 'trackpants', image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', count: '18+ Styles' },
      { slug: 'shorts',     image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', count: '22+ Styles' },
      { slug: 'trousers',   image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', count: '12+ Styles' },
    ],
  },
};

// ── Parser ────────────────────────────────────────────────────────────────

function parseRaw(raw: RawHomepageContent): HomepageContent {
  const content: HomepageContent = JSON.parse(JSON.stringify(DEFAULT_CONTENT));

  try {
    if (raw.hero?.slides) {
      const slides: HeroSlide[] = JSON.parse(raw.hero.slides);
      // Resolve image URLs (handles /uploads/... paths)
      content.hero.slides = slides.map((s) => ({
        ...s,
        image: resolveAssetUrl(s.image),
      }));
    }
  } catch { /* keep default */ }

  try {
    if (raw.announcement?.items) {
      content.announcement.items = JSON.parse(raw.announcement.items);
    }
  } catch { /* keep default */ }

  try {
    if (raw.usp?.items) {
      content.usp.items = JSON.parse(raw.usp.items);
    }
  } catch { /* keep default */ }

  if (raw.offer) {
    content.offer = {
      title: raw.offer.title ?? DEFAULT_CONTENT.offer.title,
      subtitle: raw.offer.subtitle ?? DEFAULT_CONTENT.offer.subtitle,
      endHour: Number(raw.offer.endHour ?? DEFAULT_CONTENT.offer.endHour),
      discount: raw.offer.discount ?? DEFAULT_CONTENT.offer.discount,
    };
  }

  try {
    if ((raw as any).categories?.items) {
      const items: CategoryItem[] = JSON.parse((raw as any).categories.items);
      content.categories.items = items.map(it => ({ ...it, image: resolveAssetUrl(it.image) }));
    }
  } catch { /* keep defaults */ }

  return content;
}

// ── Context ───────────────────────────────────────────────────────────────

interface HomepageContentContextValue {
  content: HomepageContent;
  loading: boolean;
  refresh: () => Promise<void>;
}

const HomepageContentContext = createContext<HomepageContentContextValue | undefined>(undefined);

export function HomepageContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<HomepageContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await fetchHomepageContent();
      setContent(parseRaw(raw));
    } catch {
      // Silent: keep defaults if API is unavailable
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <HomepageContentContext.Provider value={{ content, loading, refresh: load }}>
      {children}
    </HomepageContentContext.Provider>
  );
}

export function useHomepageContent() {
  const ctx = useContext(HomepageContentContext);
  if (!ctx) throw new Error('useHomepageContent must be used within HomepageContentProvider');
  return ctx;
}
