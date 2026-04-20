// Single source of truth for all categories across the app.
// Used by: CategoryPage, AdminProducts form, Navigation, Home, routes.

export interface CategoryConfig {
  slug: string;
  label: string;
  shortLabel: string;
  parent: string | null;       // null = top-level
  children: string[];          // sub-category slugs (empty for leaves)
  banner: string;
  description: string;
}

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  // ── Top Wear (parent) ──────────────────────────────────────────────────
  topwear: {
    slug: 'topwear',
    label: 'Top Wear',
    shortLabel: 'Top Wear',
    parent: null,
    children: ['tshirt', 'shirt', 'coord', 'hoodies'],
    banner: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920',
    description: 'Premium tops for the modern gentleman — tees, shirts, hoodies and co-ords.',
  },
  tshirt: {
    slug: 'tshirt',
    label: 'T-Shirts',
    shortLabel: 'T-Shirts',
    parent: 'topwear',
    children: [],
    banner: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920',
    description: 'Classic and graphic tees crafted for everyday comfort and style.',
  },
  shirt: {
    slug: 'shirt',
    label: 'Shirts',
    shortLabel: 'Shirts',
    parent: 'topwear',
    children: [],
    banner: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920',
    description: 'Formal and casual shirts — from crisp Oxford weaves to relaxed linens.',
  },
  coord: {
    slug: 'coord',
    label: 'Co-ord Sets',
    shortLabel: 'Co-ords',
    parent: 'topwear',
    children: [],
    banner: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920',
    description: 'Matching sets that take the guesswork out of dressing sharp.',
  },
  hoodies: {
    slug: 'hoodies',
    label: 'Hoodies',
    shortLabel: 'Hoodies',
    parent: 'topwear',
    children: [],
    banner: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920',
    description: 'Oversized and fitted hoodies built for comfort with a streetwear edge.',
  },

  // ── Bottom Wear (parent) ───────────────────────────────────────────────
  bottomwear: {
    slug: 'bottomwear',
    label: 'Bottom Wear',
    shortLabel: 'Bottom Wear',
    parent: null,
    children: ['jeans', 'trousers', 'shorts', 'trackpants'],
    banner: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920',
    description: 'Bottoms for every occasion — from sharp trousers to relaxed track pants.',
  },
  jeans: {
    slug: 'jeans',
    label: 'Jeans',
    shortLabel: 'Jeans',
    parent: 'bottomwear',
    children: [],
    banner: 'https://images.unsplash.com/photo-1542272604-787c3835535d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920',
    description: 'Slim, straight and relaxed fits in premium denim.',
  },
  trousers: {
    slug: 'trousers',
    label: 'Trousers',
    shortLabel: 'Trousers',
    parent: 'bottomwear',
    children: [],
    banner: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920',
    description: 'Formal and smart-casual trousers cut for a sharp silhouette.',
  },
  shorts: {
    slug: 'shorts',
    label: 'Shorts',
    shortLabel: 'Shorts',
    parent: 'bottomwear',
    children: [],
    banner: 'https://images.unsplash.com/photo-1591195853828-11db59a44f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920',
    description: 'Cargo, chino and athletic shorts for every summer occasion.',
  },
  trackpants: {
    slug: 'trackpants',
    label: 'Track Pants',
    shortLabel: 'Track Pants',
    parent: 'bottomwear',
    children: [],
    banner: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920',
    description: 'Comfortable track pants for the gym, the street and everywhere between.',
  },
};

// Flat list of all category slugs (for validation, dropdowns, routes)
export const ALL_CATEGORY_SLUGS = Object.keys(CATEGORY_CONFIG);

// Admin dropdown groups
export const ADMIN_CATEGORY_GROUPS = [
  {
    group: 'Top Wear',
    options: [
      { value: 'tshirt', label: 'T-Shirts' },
      { value: 'shirt', label: 'Shirts' },
      { value: 'coord', label: 'Co-ord Sets' },
      { value: 'hoodies', label: 'Hoodies' },
    ],
  },
  {
    group: 'Bottom Wear',
    options: [
      { value: 'jeans', label: 'Jeans' },
      { value: 'trousers', label: 'Trousers' },
      { value: 'shorts', label: 'Shorts' },
      { value: 'trackpants', label: 'Track Pants' },
    ],
  },
];

// Thumbnail images for sub-category cards inside parent pages
export const CATEGORY_CARD_IMAGES: Record<string, string> = {
  tshirt:     'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  shirt:      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  coord:      'https://images.unsplash.com/photo-1523381294911-8d3cead13475?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  hoodies:    'https://images.unsplash.com/photo-1509631179647-0177331693ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  jeans:      'https://images.unsplash.com/photo-1542272604-787c3835535d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  trousers:   'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  shorts:     'https://images.unsplash.com/photo-1591195853828-11db59a44f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  trackpants: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
};
