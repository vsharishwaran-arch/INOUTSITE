export type DropdownItem = { label: string; to: string; highlight?: boolean };
export type NavItem = { label: string; to: string; dropdown?: DropdownItem[] };

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', to: '/' },
  {
    label: 'Top Wear',
    to: '/topwear',
    dropdown: [
      { label: 'T-Shirts', to: '/tshirt' },
      { label: 'Shirts', to: '/shirt' },
      { label: 'Co-Ord Sets', to: '/coord' },
      { label: 'Hoodies', to: '/hoodies', highlight: true },
    ],
  },
  {
    label: 'Bottom Wear',
    to: '/bottomwear',
    dropdown: [
      { label: 'Jeans', to: '/jeans' },
      { label: 'Trousers', to: '/trousers' },
      { label: 'Shorts', to: '/shorts' },
      { label: 'Track Pants', to: '/trackpants', highlight: true },
    ],
  },
  {
    label: 'Sale',
    to: '/sale',
    dropdown: [
      { label: 'New Arrivals', to: '/new-arrivals' },
      { label: 'Best Sellers', to: '/best-sellers' },
      { label: 'Offer Zone', to: '/sale', highlight: true },
    ],
  },
];