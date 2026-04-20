const SIZE_ORDER = ['S', 'M', 'L', 'XL', 'XXL'];

function sortSizes(sizes) {
  return [...sizes].sort((left, right) => SIZE_ORDER.indexOf(left) - SIZE_ORDER.indexOf(right));
}

function parseJsonField(value) {
  if (!value) return null;
  if (Array.isArray(value)) return value;
  try { return JSON.parse(value); } catch { return null; }
}

export function mapProductRows(rows) {
  const productMap = new Map();

  for (const row of rows) {
    if (!productMap.has(row.id)) {
      const images = parseJsonField(row.images_json);
      const primaryImage = row.image_path || '';

      productMap.set(row.id, {
        id: String(row.id),
        name: row.name,
        price: Number(row.price),
        discountPrice: row.discount_price ? Number(row.discount_price) : null,
        sku: row.sku || '',
        tags: row.tags ? row.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        category: row.category,
        description: row.description,
        image: primaryImage,
        images: images && images.length ? images : [primaryImage].filter(Boolean),
        sizes: [],
        sizeStock: {},
        stock: 0,
        isNewArrival: Boolean(row.is_new_arrival),
        isBestSeller: Boolean(row.is_best_seller),
        isOnOffer: Boolean(row.is_on_offer),
        isCarousel: Boolean(row.is_carousel),
        // Product details
        washCare: row.wash_care || '',
        sleeve: row.sleeve || '',
        pattern: row.pattern || '',
        packageContents: row.package_contents || '',
        netQuantity: row.net_quantity ? Number(row.net_quantity) : null,
        material: row.material || '',
        fitType: row.fit_type || '',
        shippingInfo: row.shipping_info || '',
        returnPolicy: row.return_policy || '',
        // Social proof
        socialProofCount: row.social_proof_count ? Number(row.social_proof_count) : 855,
        socialProof24hrs: row.social_proof_24hrs ? Number(row.social_proof_24hrs) : 9,
        isTrending: Boolean(row.is_trending),
        // Stats
        statsCustomers: row.stats_customers || '3M+',
        statsOrders: row.stats_orders || '2L+',
        statsStores: row.stats_stores || '5+',
        createdAt: row.created_at,
      });
    }

    const product = productMap.get(row.id);
    if (row.size) {
      product.sizeStock[row.size] = Number(row.stock || 0);
    }
  }

  return Array.from(productMap.values()).map((product) => {
    const sizes = Object.keys(product.sizeStock).filter((size) => product.sizeStock[size] >= 0);
    product.sizes = sortSizes(sizes);
    product.stock = product.sizes.reduce((sum, size) => sum + Number(product.sizeStock[size] || 0), 0);
    return product;
  });
}