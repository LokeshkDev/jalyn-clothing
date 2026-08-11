import { useState, useEffect } from 'react';
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
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80';

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

  const sizes = Array.isArray(p.sizes)
    ? p.sizes
    : typeof p.sizes === 'string'
    ? JSON.parse(p.sizes)
    : ['XS', 'S', 'M', 'L', 'XL'];

  const colors = Array.isArray(p.colors)
    ? p.colors
    : typeof p.colors === 'string'
    ? JSON.parse(p.colors)
    : ['rose', 'cream', 'black'];

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
    stock: p.stock !== undefined ? p.stock : 15,
    description: p.description || 'Thoughtfully designed for elegance and comfort.',
    isNew: p.is_featured || p.isNew || false,
  };
}

export function useProductsApi(category = 'all', search = '', sort = '') {
  const [products, setProducts] = useState(() => SHOP_PRODUCTS.map(normalizeProduct));
  const [categories, setCategories] = useState(SHOP_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.allSettled([
          api.get('/products', { params: { category, search, sort } }),
          api.get('/categories'),
        ]);

        if (isMounted) {
          if (prodRes.status === 'fulfilled' && prodRes.value.data?.products) {
            const normalized = prodRes.value.data.products
              .map(normalizeProduct)
              .filter((p) => p.is_online !== 0 && p.is_online !== false);
            setProducts(normalized);
          } else {
            const normalized = SHOP_PRODUCTS
              .map(normalizeProduct)
              .filter((p) => p.is_online !== 0 && p.is_online !== false);
            setProducts(normalized);
          }

          if (catRes.status === 'fulfilled' && catRes.value.data?.categories) {
            const normCats = catRes.value.data.categories
              .filter((c) => c.slug !== 'all')
              .map((c) => ({
                ...c,
                id: c.id || c.slug,
                title: c.name || c.title,
                image: c.image_url || c.image || 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
                subtitle: `${c.item_count || 12}+ Items`,
              }));
            setCategories(normCats);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setProducts(SHOP_PRODUCTS.map(normalizeProduct));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [category, search, sort]);

  return { products, categories, loading, error };
}
