import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { SHOP_PRODUCTS, SHOP_CATEGORIES } from '../constants/shopProducts';

export function normalizeProduct(p) {
  if (!p) return p;

  const id = p.id || p.slug;
  const title = p.title || p.name || 'Untitled Product';
  const slug = p.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const primaryImage =
    p.primary_image ||
    p.images?.primary ||
    p.image ||
    '/images/products/floral-midi-dress.webp';

  const hoverImage =
    p.hover_image ||
    p.images?.hover ||
    p.hoverImage ||
    primaryImage;

  const price = Number(p.price) || 0;
  const originalPrice =
    Number(p.original_price || p.originalPrice || p.compareAt) || price;

  const rating = Number(p.rating) || 4.8;
  const reviews = Number(p.reviews_count || p.reviews) || 12;
  const category = p.category_slug || p.category || 'dresses';

  const variants = Array.isArray(p.variants) && p.variants.length > 0 ? p.variants : null;

  const sizes = variants
    ? [...new Set(variants.map((v) => v.size).filter(Boolean))]
    : Array.isArray(p.sizes)
    ? p.sizes
    : typeof p.sizes === 'string'
    ? JSON.parse(p.sizes)
    : ['XS', 'S', 'M', 'L', 'XL'];

  const colors = variants
    ? [...new Set(variants.map((v) => v.color).filter(Boolean))]
    : Array.isArray(p.colors)
    ? p.colors
    : typeof p.colors === 'string'
    ? JSON.parse(p.colors)
    : ['rose', 'cream', 'black'];

  const colorHexMap = variants
    ? Object.fromEntries(
        variants
          .map((v) => [v.color, v.colorHex])
          .filter(([, hex]) => hex)
      )
    : {};

  const derivedStock = variants
    ? variants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0)
    : p.stock !== undefined
    ? p.stock
    : 15;

  return {
    ...p,
    id,
    title,
    name: title,
    slug,
    href: `/products/${slug}`,
    category,
    category_slug: category,
    price,
    original_price: originalPrice,
    originalPrice,
    compareAt: originalPrice > price ? originalPrice : null,
    discount:
      p.discount ||
      (originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0),
    rating,
    reviews,
    reviews_count: reviews,
    primary_image: primaryImage,
    hover_image: hoverImage,
    image: primaryImage,
    hoverImage: hoverImage,
    images: {
      primary: primaryImage,
      hover: hoverImage,
    },
    sizes,
    colors,
    colorHexMap,
    variants,
    stock: derivedStock,
    description: p.description || 'Thoughtfully designed for elegance and comfort.',
    isNew: p.is_featured || p.isNew || false,
  };
}

async function fetchProductsList(category, search, sort) {
  try {
    const res = await api.get('/products', { params: { category, search, sort } });
    if (res.data?.products) {
      return res.data.products
        .map(normalizeProduct)
        .filter((p) => p.is_online !== 0 && p.is_online !== false);
    }
  } catch (err) {
    console.warn('Failed to load products from API, falling back to static data:', err);
  }
  return SHOP_PRODUCTS.map(normalizeProduct).filter((p) => p.is_online !== 0 && p.is_online !== false);
}

async function fetchCategoriesList() {
  try {
    const res = await api.get('/categories');
    if (res.data?.categories) {
      return res.data.categories
        .filter((c) => c.slug !== 'all')
        .map((c) => ({
          ...c,
          id: c.id || c.slug,
          title: c.name || c.title,
          image: c.image_url || c.image || '/images/home/categories/dresses.webp',
          subtitle: `${c.item_count || 12}+ Items`,
        }));
    }
  } catch (err) {
    console.warn('Failed to load categories from API, falling back to static data:', err);
  }
  return SHOP_CATEGORIES;
}

export function useProductsApi(category = 'all', search = '', sort = '') {
  const { data: products = SHOP_PRODUCTS.map(normalizeProduct), isLoading: prodLoading, error: prodError } = useQuery({
    queryKey: ['products', category, search, sort],
    queryFn: () => fetchProductsList(category, search, sort),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: categories = SHOP_CATEGORIES, isLoading: catLoading, error: catError } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategoriesList,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    products,
    categories,
    loading: prodLoading || catLoading,
    error: prodError?.message || catError?.message || null,
  };
}
