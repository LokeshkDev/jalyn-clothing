export const NAV_LINKS = [
  {
    label: 'New Arrivals',
    href: '/new-arrivals',
    hasDropdown: true,
    children: [
      { label: 'Ethnic Wear', href: '/shop?category=ethnic' },
      { label: 'Casuals', href: '/shop?category=casuals' },
      { label: 'Formals', href: '/shop?category=formals' },
    ],
  },
  {
    label: 'Sale',
    href: '/sale',
  },
  {
    label: 'Women',
    href: '/shop?category=women',
    hasDropdown: true,
    isMega: true,
    groups: [
      {
        title: 'Indian and Fusion Wear',
        items: [
          { label: 'Kurtis & Tunics', href: '/shop?category=kurtis-tunic' },
          { label: 'Co-Ord Sets', href: '/shop?category=coords' },
          { label: 'Salwar & Chudidars Set', href: '/shop?category=salwar-chudidar' },
          { label: 'Sharara & Lehenga', href: '/shop?category=sharara-lehenga' },
          { label: 'Short Kurtis', href: '/shop?category=short-kurti' },
          { label: 'Ethnic Wear', href: '/shop?category=ethnic-wear' },
          { label: 'Unstitched Material', href: '/shop?category=unstitched' },
          { label: 'Leggings, Patiyala & Kurtipants', href: '/shop?category=leggings-kurtipants' },
          { label: 'Dupattas & Shawls', href: '/shop?category=dupattas-shawls' },
        ],
      },
      {
        title: 'Western Wear',
        items: [
          { label: 'Dresses & Gowns', href: '/shop?category=dresses-gown' },
          { label: 'Shirts & Crop Tops', href: '/shop?category=shirt-croptops' },
          { label: 'T-Shirts', href: '/shop?category=tshirts' },
          { label: 'Jeans', href: '/shop?category=jeans' },
          { label: 'Short Tops', href: '/shop?category=short-tops' },
          { label: 'Co-ords', href: '/shop?category=western-coords' },
          { label: 'Palazzos', href: '/shop?category=palazzos' },
        ],
      },
      {
        title: 'Maternity Wear',
        items: [
          { label: 'Ethnic Tops', href: '/shop?category=maternity-ethnic-tops' },
          { label: 'Dresses & Gowns', href: '/shop?category=maternity-dresses' },
          { label: 'Nightwear Feeding', href: '/shop?category=nightwear-feeding' },
        ],
      },
      {
        title: 'Nightwear & Loungewear',
        items: [
          { label: 'PJs', href: '/shop?category=pjs' },
          { label: 'Shirts', href: '/shop?category=lounge-shirts' },
          { label: 'Nighties & Night Gowns', href: '/shop?category=nighties-nightgowns' },
        ],
      },
    ],
  },
  {
    label: 'Kids',
    href: '/shop?category=kids',
    hasDropdown: true,
    isMega: true,
    groups: [
      {
        title: 'Girls Clothing',
        items: [
          { label: 'Dresses', href: '/shop?category=girls-dress' },
          { label: 'T-Shirts', href: '/shop?category=girls-tshirt' },
          { label: 'Clothing Sets', href: '/shop?category=girls-clothing-set' },
          { label: 'Ethnic Wear', href: '/shop?category=girls-ethnic-wear' },
          { label: 'Sharara & Lehenga', href: '/shop?category=girls-sharara-lehenga' },
        ],
      },
      {
        title: 'Nightwear & Loungewear',
        items: [
          { label: 'Shirts', href: '/shop?category=kids-lounge-shirts' },
          { label: 'Pants', href: '/shop?category=kids-pants' },
          { label: 'Girls Frocks', href: '/shop?category=girls-frocks' },
          { label: 'Nightwear & Lounges', href: '/shop?category=kids-nightwear-lounges' },
        ],
      },
      {
        title: 'Toddlers',
        items: [
          { label: 'Clothing Sets', href: '/shop?category=toddlers-clothing-set' },
          { label: 'Frocks', href: '/shop?category=toddlers-frocks' },
          { label: 'Nightwear & Loungewear', href: '/shop?category=toddlers-nightwear' },
          { label: 'Western Wear Girls', href: '/shop?category=toddlers-western-girls' },
          { label: 'Western Wear Boys', href: '/shop?category=toddlers-western-boys' },
        ],
      },
      {
        title: 'Infants',
        items: [
          { label: 'Ethnic Wear', href: '/shop?category=infants-ethnic-wear' },
          { label: 'Western Wear', href: '/shop?category=infants-western-wear' },
          { label: 'Regular Wear', href: '/shop?category=infants-regular-wear' },
          { label: 'Nightwear', href: '/shop?category=infants-nightwear' },
        ],
      },
    ],
  },
  {
    label: 'Plus Curve',
    href: '/shop?category=plus-curve',
    hasDropdown: true,
    children: [
      { label: 'Maxis', href: '/shop?category=maxis' },
      { label: 'Chudi Sets', href: '/shop?category=chudi-sets' },
      { label: 'Tops', href: '/shop?category=plus-tops' },
      { label: 'Nightwear & Loungewear', href: '/shop?category=plus-nightwear' },
      { label: 'Nighties', href: '/shop?category=plus-nighties' },
    ],
  },
  {
    label: 'Combo',
    href: '/shop?category=combo',
    hasDropdown: true,
    children: [
      { label: 'Western Combo Women', href: '/shop?category=combo-western-women' },
      { label: 'Western Combo Kids', href: '/shop?category=combo-western-kids' },
      { label: 'College Combo', href: '/shop?category=combo-college' },
      { label: 'Formal Combo', href: '/shop?category=combo-formal' },
      { label: 'Nightwear Combo', href: '/shop?category=combo-nightwear' },
    ],
  },
  { label: 'Track Your Order', href: '/track-order' },
  { label: 'About Us', href: '/about' },
]

export const SERVICES = [
  {
    icon: 'truck',
    title: 'Free Shipping',
    description: 'On all orders above ₹1999',
  },
  {
    icon: 'refresh',
    title: 'Easy 7-Day Returns',
    description: 'Hassle-free return policy',
  },
  {
    icon: 'shield',
    title: 'Secure Payments',
    description: '100% encrypted & safe',
  },
  {
    icon: 'sparkles',
    title: 'Premium Quality',
    description: 'Thoughtfully crafted fabrics',
  },
]

export const HERO_SLIDES = [
  {
    id: 1,
    eyebrow: 'New Collection',
    title: 'Style Meets',
    highlight: 'Comfort',
    subtitle:
      'Elevate your everyday wardrobe with our luxury silhouettes designed for breathability and grace.',
    image:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1080&q=70&fm=webp',
    alt: 'Woman wearing pastel luxury dress',
    cta: 'Explore Collection',
    href: '/shop',
  },
  {
    id: 2,
    eyebrow: 'Festive Grace',
    title: 'Timeless',
    highlight: 'Ethnic Wear',
    subtitle:
      'Artisanal ethnic wear featuring intricate embroidery, royal silk blends, and contemporary drapes.',
    image:
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1080&q=70&fm=webp',
    alt: 'Ethnic wear showcase',
    cta: 'Shop Ethnic',
    href: '/shop?category=ethnic',
  },
  {
    id: 3,
    eyebrow: 'Effortless Living',
    title: 'Modern',
    highlight: 'Co-ords & Tops',
    subtitle:
      'Discover versatile two-piece co-ords and statement tops tailored for effortless daily elegance.',
    image:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1080&q=70&fm=webp',
    alt: 'Model in stylish co-ord set',
    cta: 'View Co-ords',
    href: '/shop?category=coords',
  },
]

export const COLLECTIONS = [
  {
    id: 'dresses',
    title: 'Dresses & Gowns',
    subtitle: '28+ Items',
    image:
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    slug: 'dresses',
  },
  {
    id: 'ethnic',
    title: 'Ethnic Wear',
    subtitle: '22+ Items',
    image:
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    slug: 'ethnic',
  },
  {
    id: 'coords',
    title: 'Co-ord Sets',
    subtitle: '18+ Items',
    image:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    slug: 'coords',
  },
  {
    id: 'tops',
    title: 'Tops & Blouses',
    subtitle: '20+ Items',
    image:
      'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=800&q=80',
    slug: 'tops',
  },
  {
    id: 'loungewear',
    title: 'Lounge & Sleepwear',
    subtitle: '10+ Items',
    image:
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    slug: 'loungewear',
  },
  {
    id: 'sarees',
    title: 'Designer Sarees',
    subtitle: '20+ Items',
    image:
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    slug: 'sarees',
  },
]

export const PRODUCTS = [
  {
    id: 'jalyn-1',
    title: 'Rose Floral Silk Maxi Dress',
    price: 3499,
    originalPrice: 4999,
    discount: 30,
    rating: 4.9,
    reviews: 48,
    badges: ['best-seller', 'new'],
    category: 'dresses',
    image:
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    images: {
      primary:
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      ],
    },
    slug: 'rose-floral-silk-maxi-dress',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['rose', 'cream'],
  },
]

export const INSTAGRAM_POSTS = [
  {
    id: 1,
    image:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    likes: '1.2k',
    comments: '42',
    link: 'https://www.instagram.com/jalyn.apparels/',
  },
  {
    id: 2,
    image:
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80',
    likes: '2.4k',
    comments: '89',
    link: 'https://www.instagram.com/jalyn.apparels/',
  },
  {
    id: 3,
    image:
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
    likes: '1.8k',
    comments: '63',
    link: 'https://www.instagram.com/jalyn.apparels/',
  },
  {
    id: 4,
    image:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
    likes: '3.1k',
    comments: '112',
    link: 'https://www.instagram.com/jalyn.apparels/',
  },
  {
    id: 5,
    image:
      'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=600&q=80',
    likes: '1.5k',
    comments: '37',
    link: 'https://www.instagram.com/jalyn.apparels/',
  },
  {
    id: 6,
    image:
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
    likes: '2.9k',
    comments: '95',
    link: 'https://www.instagram.com/jalyn.apparels/',
  },
]

export const FOOTER_LINKS = {
  column1: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'Shipping & Delivery', href: '/shipping-delivery' },
    { label: 'Returns & Exchanges', href: '/returns-exchanges' },
    { label: 'Track Order', href: '/track-order' },
    { label: 'Size Guide', href: '/size-guide' },
  ],
  column2: [
    { label: 'Our Story', href: '/about' },
    { label: 'Craftsmanship', href: '/craftsmanship' },
    { label: 'Sustainability', href: '/sustainability' },
    { label: 'Press & Media', href: '/press-media' },
    { label: 'Careers', href: '/careers' },
  ],
  column3: [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms-of-service' },
    { label: 'Refund Policy', href: '/refund-policy' },
  ],
}
