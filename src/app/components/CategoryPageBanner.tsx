

interface CategoryPageBannerProps {
  categoryName: string;
}

const CATEGORY_LABEL_MAP: Record<string, string> = {
  tshirt: 'T-Shirts',
  shirt: 'Shirts',
  hoodies: 'Hoodies',
  coord: 'Co-ord Sets',
  jeans: 'Jeans',
  trackpants: 'Track Pants',
  shorts: 'Shorts',
  trousers: 'Trousers',
  casual: 'Casual',
  formal: 'Formal',
  streetwear: 'Streetwear',
  all: 'All Products',
  shop: 'All Products',
  'new-arrivals': 'New Arrivals',
  'best-sellers': 'Best Sellers',
  sale: 'Sale',
};

export function CategoryPageBanner({ categoryName }: CategoryPageBannerProps) {
  const label = CATEGORY_LABEL_MAP[categoryName] ?? categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

  return (
    <div style={{
      width: '100%',
      background: '#fff',
      borderBottom: '1px solid #e8e8e8',
      userSelect: 'none',
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '0 48px',
        height: 52,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        {/* Brand prefix label */}
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 10,
          letterSpacing: '0.13em',
          textTransform: 'uppercase',
          color: '#aaa',
          whiteSpace: 'nowrap',
        }}>
          Inout Fashion
        </span>

        {/* Separator slash */}
        <span style={{ color: '#ddd', fontSize: 14, fontWeight: 300 }}>/</span>

        {/* Active category — styled like an active filter-pill */}
        <span style={{
          display: 'inline-block',
          padding: '6px 18px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 10,
          letterSpacing: '0.13em',
          textTransform: 'uppercase',
          background: '#0A0A0A',
          color: '#fff',
          border: '1px solid #0A0A0A',
          whiteSpace: 'nowrap',
        }}>
          {label}
        </span>
      </div>
    </div>
  );
}
