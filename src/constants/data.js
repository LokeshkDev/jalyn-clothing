export const NAV_LINKS = [
  { label: 'Shop', href: '/shop' },
  { label: 'New Arrivals', href: '/collections/new-arrivals' },
  {
    label: 'Collections',
    href: '/shop',
    children: [
      { label: 'Workwear', href: '/collections/workwear' },
      { label: 'Casual Wear', href: '/collections/casual-wear' },
      { label: 'Party Wear', href: '/collections/party-wear' },
      { label: 'Lounge & Nightwear', href: '/collections/lounge-nightwear' },
    ],
  },
  {
    label: 'Clothing',
    href: '/collections/clothing',
    children: [
      { label: 'Dresses', href: '/collections/dresses' },
      { label: 'Tops', href: '/collections/tops' },
      { label: 'Bottoms', href: '/collections/bottoms' },
      { label: 'Co-ords', href: '/collections/co-ords' },
    ],
  },
  {
    label: 'Ethnic Wear',
    href: '/collections/ethnic-wear',
    children: [
      { label: 'Kurtas', href: '/collections/kurtas' },
      { label: 'Sets', href: '/collections/ethnic-sets' },
      { label: 'Festive', href: '/collections/festive' },
    ],
  },
  { label: 'Lounge & Nightwear', href: '/collections/lounge-nightwear' },
  { label: 'Sale', href: '/collections/sale', accent: true },
]

export const HERO_SLIDES = [
  {
    id: 1,
    eyebrow: 'New Collection',
    title: 'Style Meets',
    highlight: 'Comfort',
    subtitle:
      'Thoughtfully designed for every woman. Elegance that feels as good as it looks.',
    cta: 'Shop the Collection',
    href: '/collections/new-arrivals',
    image:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=80',
    alt: 'Woman in mauve pleated dress — JALYN new collection',
  },
  {
    id: 2,
    eyebrow: 'Editorial Edit',
    title: 'Soft Power,',
    highlight: 'Every Day',
    subtitle:
      'Fluid silhouettes and refined fabrics crafted for women who move through life with ease.',
    cta: 'Explore Edit',
    href: '/collections/casual-wear',
    image:
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1400&q=80',
    alt: 'Woman in soft floral dress — JALYN editorial',
  },
  {
    id: 3,
    eyebrow: 'Limited Drop',
    title: 'Evening,',
    highlight: 'Elevated',
    subtitle:
      'Statement pieces with a quiet luxury finish — made to feel as good as they look.',
    cta: 'Shop Party Wear',
    href: '/collections/party-wear',
    image:
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=80',
    alt: 'Woman in elegant evening look — JALYN party wear',
  },
]

export const SERVICES = [
  {
    title: 'Premium Quality',
    description: 'Finest fabrics & craftsmanship',
    icon: 'sparkles',
  },
  {
    title: 'Easy Returns',
    description: 'Hassle-free returns within 7 days',
    icon: 'refresh',
  },
  {
    title: 'Secure Payments',
    description: 'Safe & trusted payment options',
    icon: 'shield',
  },
  {
    title: 'Express Delivery',
    description: 'Quick delivery to your doorstep',
    icon: 'truck',
  },
]

export const COLLECTIONS = [
  {
    id: 'workwear',
    title: 'Workwear',
    subtitle: 'Elevate your work look',
    href: '/collections/workwear',
    image:
      'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'casual',
    title: 'Casual Wear',
    subtitle: 'Effortless everyday style',
    href: '/collections/casual-wear',
    image:
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'ethnic',
    title: 'Ethnic Wear',
    subtitle: 'Tradition, reimagined',
    href: '/collections/ethnic-wear',
    image:
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'lounge',
    title: 'Lounge & Nightwear',
    subtitle: 'Soft days & softer nights',
    href: '/collections/lounge-nightwear',
    image:
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'party',
    title: 'Party Wear',
    subtitle: 'Made to celebrate',
    href: '/collections/party-wear',
    image:
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'new',
    title: 'New Arrivals',
    subtitle: 'Just landed this week',
    href: '/collections/new-arrivals',
    image:
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
  },
]

export const PRODUCTS = [
  {
    id: 'p1',
    name: 'Floral Midi Dress',
    price: 1899,
    compareAt: 2499,
    rating: 4.8,
    reviews: 124,
    isNew: true,
    href: '/products/floral-midi-dress',
    image:
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    hoverImage:
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'p2',
    name: 'Satin Slip Dress',
    price: 2199,
    compareAt: 2799,
    rating: 4.7,
    reviews: 89,
    isNew: true,
    href: '/products/satin-slip-dress',
    image:
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
    hoverImage:
      'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'p3',
    name: 'Linen Wrap Top',
    price: 1299,
    compareAt: 1699,
    rating: 4.9,
    reviews: 156,
    isNew: false,
    href: '/products/linen-wrap-top',
    image:
      'https://images.unsplash.com/photo-1551163943-3f6fa0d40dc1?auto=format&fit=crop&w=800&q=80',
    hoverImage:
      'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'p4',
    name: 'Pleated Mauve Dress',
    price: 2499,
    compareAt: 3199,
    rating: 4.8,
    reviews: 203,
    isNew: true,
    href: '/products/pleated-mauve-dress',
    image:
      'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=800&q=80',
    hoverImage:
      'https://images.unsplash.com/photo-1598554747436-c9293d6a477c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'p5',
    name: 'Soft Knit Co-ord',
    price: 2799,
    compareAt: 3499,
    rating: 4.6,
    reviews: 67,
    isNew: true,
    href: '/products/soft-knit-coord',
    image:
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80',
    hoverImage:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
  },
]

export const WHY_JALYN = [
  {
    title: 'Designed for Comfort',
    description: 'Soft, breathable & skin-friendly fabrics',
    icon: 'feather',
  },
  {
    title: 'Made for Every Woman',
    description: 'Styles that celebrate every body type',
    icon: 'heart',
  },
  {
    title: 'Sustainable Choices',
    description: 'Conscious fashion for a better tomorrow',
    icon: 'leaf',
  },
  {
    title: 'Loved by Thousands',
    description: 'Join our growing community of women',
    icon: 'users',
  },
]

export const INSTAGRAM_POSTS = [
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80',
]

export const FOOTER_LINKS = {
  shop: [
    { label: 'New Arrivals', href: '/collections/new-arrivals' },
    { label: 'Clothing', href: '/collections/clothing' },
    { label: 'Ethnic Wear', href: '/collections/ethnic-wear' },
    { label: 'Lounge & Nightwear', href: '/collections/lounge-nightwear' },
    { label: 'Sale', href: '/collections/sale' },
  ],
  care: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'Size Guide', href: '/size-guide' },
    { label: 'Shipping Info', href: '/shipping' },
    { label: 'Track Order', href: '/track-order' },
    { label: 'FAQs', href: '/faqs' },
  ],
  about: [
    { label: 'Our Story', href: '/about' },
    { label: 'Sustainability', href: '/sustainability' },
    { label: 'Lookbook', href: '/lookbook' },
    { label: 'Careers', href: '/careers' },
    { label: 'Store Locator', href: '/stores' },
  ],
  policies: [
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Return Policy', href: '/returns' },
    { label: 'Shipping Policy', href: '/shipping-policy' },
  ],
}
