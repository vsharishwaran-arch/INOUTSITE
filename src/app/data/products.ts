export interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number | null;
  sku?: string;
  tags?: string[];
  category: string;
  image: string;
  images?: string[];          // multi-image gallery
  description: string;
  sizes: string[];
  sizeStock?: Record<string, number>;
  stock: number;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isOnOffer?: boolean;
  isCarousel?: boolean;
  // Product detail fields
  washCare?: string;
  sleeve?: string;
  pattern?: string;
  packageContents?: string;
  netQuantity?: number;
  material?: string;
  fitType?: string;
  shippingInfo?: string;
  returnPolicy?: string;
  // Social proof
  socialProofCount?: number;
  socialProof24hrs?: number;
  isTrending?: boolean;
  // Stats
  statsCustomers?: string;
  statsOrders?: string;
  statsStores?: string;
}

export const products: Product[] = [
  // Casual
  {
    id: '1',
    name: 'Classic White Oxford Shirt',
    price: 89,
    category: 'tshirt',
    image: 'https://images.unsplash.com/photo-1617724757497-79b54c5444d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjBjYXN1YWwlMjB3ZWFyJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzc2MTg3OTQyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Essential white Oxford button-down for the modern man. Premium cotton construction with a tailored fit for versatile styling.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 15,
    isBestSeller: true
  },
  {
    id: '2',
    name: 'Essential Crew Neck Tee',
    price: 45,
    category: 'tshirt',
    image: 'https://images.unsplash.com/photo-1617724748068-691efeeaf542?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxmYXNoaW9uJTIwbW9kZWwlMjBjYXN1YWwlMjB3ZWFyJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzc2MTg3OTQyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Wardrobe staple in premium cotton. Clean lines, perfect fit, built to last. The foundation of every man\'s casual style.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 8,
    isBestSeller: true,
    isNewArrival: true
  },
  {
    id: '3',
    name: 'Olive Field Jacket',
    price: 195,
    category: 'tshirt',
    image: 'https://images.unsplash.com/photo-1761891873744-eb181eb1334a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw4fHxmYXNoaW9uJTIwbW9kZWwlMjBjYXN1YWwlMjB3ZWFyJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzc2MTg3OTQyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Military-inspired utility jacket in rich olive. Functional pockets, durable construction, timeless American style.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 12,
    isNewArrival: true
  },
  {
    id: '4',
    name: 'Denim Work Shirt',
    price: 98,
    category: 'tshirt',
    image: 'https://images.unsplash.com/photo-1642597610928-0c483ca2824e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxmYXNoaW9uJTIwbW9kZWwlMjBjYXN1YWwlMjB3ZWFyJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzc2MTg3OTQyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Rugged denim shirt built for the modern workweek. Classic Western-inspired design with contemporary fit.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 20,
    isBestSeller: true
  },
  {
    id: '5',
    name: 'Henley Long Sleeve',
    price: 68,
    category: 'tshirt',
    image: 'https://images.unsplash.com/photo-1763499389959-f9e8d93f99ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxmYXNoaW9uJTIwbW9kZWwlMjBjYXN1YWwlMjB3ZWFyJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzc2MTg3OTQyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Classic henley in heavyweight cotton. Casual sophistication with a button placket and comfortable fit.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 3,
    isNewArrival: true
  },
  {
    id: '6',
    name: 'Varsity Bomber Jacket',
    price: 185,
    category: 'tshirt',
    image: 'https://images.unsplash.com/photo-1774413768880-ab6ac8eb5d43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw5fHxmYXNoaW9uJTIwbW9kZWwlMjBjYXN1YWwlMjB3ZWFyJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzc2MTg3OTQyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Heritage-inspired bomber with modern updates. Premium wool blend with leather sleeves for authentic varsity style.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 0
  },

  // Formal
  {
    id: '7',
    name: 'Executive Double-Breasted Suit',
    price: 599,
    category: 'shirt',
    image: 'https://images.unsplash.com/photo-1768696082783-4313d98341ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3JtYWwlMjBzdWl0JTIwbWVuc3dlYXIlMjBmYXNoaW9ufGVufDF8fHx8MTc3NjE4Nzk0M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Power dressing redefined. Double-breasted silhouette in pure wool with peak lapels. Command attention in the boardroom.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 6,
    isBestSeller: true
  },
  {
    id: '8',
    name: 'Emerald Occasion Suit',
    price: 645,
    category: 'shirt',
    image: 'https://images.unsplash.com/photo-1768489038903-b9f420a81b8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxmb3JtYWwlMjBzdWl0JTIwbWVuc3dlYXIlMjBmYXNoaW9ufGVufDF8fHx8MTc3NjE4Nzk0M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Bold emerald tailoring for the confident man. Italian-inspired cut with contemporary attitude. Make your statement.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 4,
    isNewArrival: true
  },
  {
    id: '9',
    name: 'Navy Worsted Wool Suit',
    price: 525,
    category: 'shirt',
    image: 'https://images.unsplash.com/photo-1775831726606-3d98ebefb57a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxmb3JtYWwlMjBzdWl0JTIwbWVuc3dlYXIlMjBmYXNoaW9ufGVufDF8fHx8MTc3NjE4Nzk0M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'The essential navy suit every man needs. Timeless elegance meets modern fit. From meetings to weddings.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 10,
    isBestSeller: true
  },
  {
    id: '10',
    name: 'Charcoal Slim Fit Suit',
    price: 565,
    category: 'shirt',
    image: 'https://images.unsplash.com/photo-1754577060025-9b0831bdc554?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxmb3JtYWwlMjBzdWl0JTIwbWVuc3dlYXIlMjBmYXNoaW9ufGVufDF8fHx8MTc3NjE4Nzk0M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Modern slim fit in versatile charcoal. Italian Super 120s wool with clean lines. Professional excellence.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 7,
    isNewArrival: true
  },
  {
    id: '11',
    name: 'Heritage Windowpane Suit',
    price: 685,
    category: 'shirt',
    image: 'https://images.unsplash.com/photo-1775257796082-b04722efcc4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw4fHxmb3JtYWwlMjBzdWl0JTIwbWVuc3dlYXIlMjBmYXNoaW9ufGVufDF8fHx8MTc3NjE4Nzk0M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Distinguished windowpane check for the discerning gentleman. Classic British tailoring with refined details.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 5
  },

  // Streetwear
  {
    id: '12',
    name: 'Tech Urban Bomber',
    price: 225,
    category: 'hoodies',
    image: 'https://images.unsplash.com/photo-1660486044177-45cd45bb5e99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJlZXR3ZWFyJTIwdXJiYW4lMjBmYXNoaW9uJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzc2MTg3OTQzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Contemporary bomber in technical fabric. Water-resistant, packable, street-ready. Modern utility meets urban style.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 11,
    isBestSeller: true
  },
  {
    id: '13',
    name: 'Raw Denim Joggers',
    price: 145,
    category: 'hoodies',
    image: 'https://images.unsplash.com/photo-1593369758024-00212a1a928f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxzdHJlZXR3ZWFyJTIwdXJiYW4lMjBmYXNoaW9uJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzc2MTg3OTQzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Selvedge denim reimagined as joggers. Japanese fabric with modern athletic cut. Street meets craft.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 14,
    isNewArrival: true
  },
  {
    id: '14',
    name: 'Oversized Drop Shoulder Hoodie',
    price: 165,
    category: 'hoodies',
    image: 'https://images.unsplash.com/photo-1760126130338-4e6c9043ee2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxzdHJlZXR3ZWFyJTIwdXJiYW4lMjBmYXNoaW9uJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzc2MTg3OTQzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Statement piece in heavyweight cotton. Relaxed oversized fit with dropped shoulders. Essential streetwear staple.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 9,
    isBestSeller: true,
    isNewArrival: true
  },
  {
    id: '15',
    name: 'Urban Layering Set',
    price: 215,
    category: 'hoodies',
    image: 'https://images.unsplash.com/photo-1771736824768-ad662e6e0672?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxzdHJlZXR3ZWFyJTIwdXJiYW4lMjBmYXNoaW9uJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzc2MTg3OTQzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Complete coordinated outfit for the urban explorer. Layered pieces designed to work together. Street culture elevated.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 6
  },
  {
    id: '16',
    name: 'Tactical Cargo System',
    price: 185,
    category: 'hoodies',
    image: 'https://images.unsplash.com/photo-1698601413112-7d9733b2df49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw3fHxzdHJlZXR3ZWFyJTIwdXJiYW4lMjBmYXNoaW9uJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzc2MTg3OTQzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Military-inspired cargo pants with modern updates. Reinforced ripstop fabric, multi-pocket design. Form follows function.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 8
  },

  // Track Pants
  {
    id: '17',
    name: 'Essential Jogger Track Pants',
    price: 999,
    category: 'trackpants',
    image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    description: 'Slim-fit track pants in soft fleece with elasticated waist and ankles. Perfect for gym sessions or casual wear.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 18,
    isBestSeller: true,
  },
  {
    id: '18',
    name: 'Dry-Fit Tapered Track Pants',
    price: 1199,
    category: 'trackpants',
    image: 'https://images.unsplash.com/photo-1506902167-3eaf57e58491?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    description: 'Moisture-wicking dry-fit track pants with tapered leg and side pockets. Built for performance and everyday comfort.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 12,
    isNewArrival: true,
  },
  {
    id: '19',
    name: 'Cargo Track Pants',
    price: 1399,
    category: 'trackpants',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    description: 'Utility-inspired track pants with cargo pockets and adjustable drawstring. Street-ready comfort for the modern man.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 9,
    isBestSeller: true,
  },

  // Shorts
  {
    id: '20',
    name: 'Classic Chino Shorts',
    price: 799,
    category: 'shorts',
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    description: 'Versatile chino shorts in stretch cotton. Smart enough for brunches, relaxed enough for the beach.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 20,
    isBestSeller: true,
  },
  {
    id: '21',
    name: 'Cargo Utility Shorts',
    price: 999,
    category: 'shorts',
    image: 'https://images.unsplash.com/photo-1624378515195-8951c6f0f27e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    description: 'Multi-pocket cargo shorts in rugged ripstop fabric. Practical and stylish for outdoor adventures.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 14,
    isNewArrival: true,
  },
  {
    id: '22',
    name: 'Athletic Running Shorts',
    price: 649,
    category: 'shorts',
    image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    description: 'Lightweight running shorts with built-in liner and reflective accents. Engineered for speed and comfort.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 22,
    isBestSeller: true,
  },

  // Trousers
  {
    id: '23',
    name: 'Slim Fit Formal Trousers',
    price: 1499,
    category: 'trousers',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    description: 'Sharp slim-fit trousers in premium poly-viscose blend. A boardroom staple that pairs with any shirt or blazer.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 11,
    isBestSeller: true,
  },
  {
    id: '24',
    name: 'Relaxed Linen Trousers',
    price: 1299,
    category: 'trousers',
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    description: 'Breathable linen trousers with a relaxed fit and elasticated waistband. Summer sophistication made effortless.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 8,
    isNewArrival: true,
  },
  {
    id: '25',
    name: 'Straight Fit Chino Trousers',
    price: 1199,
    category: 'trousers',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    description: 'Classic straight-cut chino trousers in stretch cotton. Smart casual perfection from desk to dinner.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 16,
    isBestSeller: true,
  },

  // Jeans
  {
    id: '26',
    name: 'Slim Fit Dark Wash Jeans',
    price: 1599,
    category: 'jeans',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    description: 'Premium dark-wash slim jeans in stretch denim. A wardrobe essential that transitions effortlessly from day to night.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 25,
    isBestSeller: true,
  },
  {
    id: '27',
    name: 'Straight Leg Raw Denim Jeans',
    price: 1899,
    category: 'jeans',
    image: 'https://images.unsplash.com/photo-1475178626620-a4d074967452?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    description: 'Unprocessed raw selvedge denim with a classic straight leg. Ages beautifully with every wear.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 10,
    isNewArrival: true,
  },
  {
    id: '28',
    name: 'Distressed Skinny Jeans',
    price: 1399,
    category: 'jeans',
    image: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    description: 'Edgy distressed skinny jeans with a modern stretch fit. Bold streetwear energy with everyday wearability.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 13,
    isBestSeller: true,
    isNewArrival: true,
  },
];
