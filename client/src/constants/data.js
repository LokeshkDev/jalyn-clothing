export const NAV_LINKS = [
  { label: 'New Arrivals', href: '/collections/new-arrivals' },
  {
    label: 'Clothing',
    href: '/shop',
    hasDropdown: true,
    children: [
      { label: 'Dresses & Gowns', href: '/shop?category=dresses', subtitle: 'Flattering silhouettes' },
      { label: 'Tops & Blouses', href: '/shop?category=tops', subtitle: 'Everyday chic' },
      { label: 'Co-ord Sets', href: '/shop?category=coords', subtitle: 'Matching essentials' },
      { label: 'Lounge & Sleepwear', href: '/shop?category=loungewear', subtitle: 'Relaxed luxury' },
      { label: 'Jackets & Shrugs', href: '/shop?category=jackets', subtitle: 'Layering pieces' },
    ],
  },
  {
    label: 'Categories',
    href: '/shop',
    hasDropdown: true,
    children: [
      { label: 'Ethnic Wear', href: '/shop?category=ethnic', subtitle: 'Traditional elegance' },
      { label: 'Designer Sarees', href: '/shop?category=sarees', subtitle: 'Timeless classics' },
      { label: 'Anarkali & Kurtis', href: '/shop?category=kurtis', subtitle: 'Festive favorites' },
      { label: 'Aesthetic Activewear', href: '/shop?category=activewear', subtitle: 'Comfort & motion' },
      { label: 'Artisanal Footwear', href: '/shop?category=footwear', subtitle: 'Handcrafted style' },
    ],
  },
  { label: 'Shop All', href: '/shop' },
  { label: 'Sale', href: '/collections/sale', accent: true },
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
  shop: [
    { label: 'New Arrivals', href: '/collections/new-arrivals' },
    { label: 'Dresses', href: '/shop?category=dresses' },
    { label: 'Tops & Blouses', href: '/shop?category=tops' },
    { label: 'Co-ord Sets', href: '/shop?category=coords' },
    { label: 'Ethnic Wear', href: '/shop?category=ethnic' },
    { label: 'Sale', href: '/collections/sale' },
  ],
  care: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'Shipping & Delivery', href: '/shipping-policy' },
    { label: 'Returns & Exchanges', href: '/return-policy' },
    { label: 'Track Order', href: '/track-order' },
    { label: 'Size Guide', href: '/size-guide' },
  ],
  about: [
    { label: 'Our Story', href: '/about' },
    { label: 'Craftsmanship', href: '/craftsmanship' },
    { label: 'Sustainability', href: '/sustainability' },
    { label: 'Press & Media', href: '/press' },
    { label: 'Careers', href: '/careers' },
  ],
  policies: [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms-and-conditions' },
    { label: 'Refund Policy', href: '/refund-policy' },
  ],
}
