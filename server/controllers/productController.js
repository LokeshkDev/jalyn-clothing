import pool from '../config/db.js';
import { processAndStoreImage } from '../services/imageService.js';
import { generateUniqueBarcodeNumber } from './barcodeController.js';

// Rich seed product catalog used across server DB seeding & in-memory fallbacks
export const SEED_PRODUCTS = [
  {
    id: 1, slug: 'floral-midi-dress', title: 'Floral Midi Dress', category_slug: 'dresses',
    price: 1899, original_price: 2499, discount: 24, rating: 4.8, reviews_count: 124, stock: 18,
    is_featured: 1, is_active: 1, is_new_arrival: 1, is_online: 1, is_offline: 1, brand: 'JALYN',
    description: 'Charming floral print midi dress crafted with soft, breathable crepe fabric and tiered ruffled hem.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['rose', 'cream', 'black'],
    primary_image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    hover_image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2, slug: 'satin-wrap-blouse', title: 'Satin Wrap Blouse', category_slug: 'tops',
    price: 1299, original_price: 1799, discount: 28, rating: 4.6, reviews_count: 86, stock: 25,
    is_featured: 1, is_active: 1, is_new_arrival: 1, is_online: 1, is_offline: 1, brand: 'JALYN',
    description: 'Luxurious silk-satin blend wrap blouse featuring elegant bishop sleeves and side waist tie.',
    sizes: ['S', 'M', 'L', 'XL'], colors: ['mauve', 'cream'],
    primary_image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
    hover_image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3, slug: 'linen-coord-set', title: 'Linen Casual Co-ord Set', category_slug: 'coords',
    price: 2499, original_price: 3299, discount: 24, rating: 4.9, reviews_count: 142, stock: 12,
    is_featured: 1, is_active: 1, is_new_arrival: 1, is_online: 1, is_offline: 1, brand: 'JALYN',
    description: 'Relaxed fit 100% pure linen top and high-waisted wide leg trousers set for effortless summer elegance.',
    sizes: ['S', 'M', 'L', 'XXL'], colors: ['beige', 'sage'],
    primary_image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    hover_image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 4, slug: 'embroidered-chanderi-kurta-set', title: 'Embroidered Chanderi Kurta Set', category_slug: 'ethnic',
    price: 3899, original_price: 4999, discount: 22, rating: 4.9, reviews_count: 98, stock: 15,
    is_featured: 1, is_active: 1, is_new_arrival: 1, is_online: 1, is_offline: 1, brand: 'JALYN',
    description: 'Festive hand-embroidered Chanderi silk kurta with matching pants and organza sheer dupatta.',
    sizes: ['S', 'M', 'L', 'XL'], colors: ['wine', 'rose'],
    primary_image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    hover_image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 5, slug: 'tiered-maxi-dress', title: 'Boho Tiered Sun Maxi Dress', category_slug: 'dresses',
    price: 2199, original_price: 2899, discount: 24, rating: 4.7, reviews_count: 65, stock: 20,
    is_featured: 0, is_active: 1, is_new_arrival: 0, is_online: 1, is_offline: 1, brand: 'JALYN',
    description: 'Flowy tiered maxi dress with adjustable tie shoulders and smocked back panel.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['blush', 'cream'],
    primary_image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
    hover_image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 6, slug: 'sequin-evening-gown', title: 'Sequin Shimmer Evening Gown', category_slug: 'dresses',
    price: 4999, original_price: 6499, discount: 23, rating: 5.0, reviews_count: 210, stock: 6,
    is_featured: 1, is_active: 1, is_new_arrival: 1, is_online: 1, is_offline: 1, brand: 'JALYN',
    description: 'Showstopper full-sequin evening gown with deep V neckline and dramatic train.',
    sizes: ['S', 'M', 'L'], colors: ['rose', 'black', 'wine'],
    primary_image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80',
    hover_image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 7, slug: 'smocked-crop-top', title: 'Smocked Puff-Sleeve Crop Top', category_slug: 'tops',
    price: 899, original_price: 1299, discount: 30, rating: 4.5, reviews_count: 42, stock: 30,
    is_featured: 0, is_active: 1, is_new_arrival: 0, is_online: 1, is_offline: 1, brand: 'JALYN',
    description: 'On-trend smocked crop top with puff sleeves and elastic shirred bodice.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['cream', 'sage', 'mauve'],
    primary_image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=800&q=80',
    hover_image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 8, slug: 'palazzo-coord-set', title: 'Printed Palazzo Co-ord Set', category_slug: 'coords',
    price: 2299, original_price: 2999, discount: 23, rating: 4.8, reviews_count: 90, stock: 18,
    is_featured: 0, is_active: 1, is_new_arrival: 0, is_online: 1, is_offline: 1, brand: 'JALYN',
    description: 'Abstract printed peplum top and palazzo pants set with matching belt.',
    sizes: ['S', 'M', 'L', 'XL'], colors: ['beige', 'rose', 'black'],
    primary_image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    hover_image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 9, slug: 'velvet-lounge-set', title: 'Velvet Touch Lounge Set', category_slug: 'lounge',
    price: 1799, original_price: 2199, discount: 18, rating: 4.7, reviews_count: 55, stock: 14,
    is_featured: 0, is_active: 1, is_new_arrival: 0, is_online: 1, is_offline: 1, brand: 'JALYN',
    description: 'Buttery-soft stretch velvet lounge top and jogger set for cozy evenings.',
    sizes: ['S', 'M', 'L', 'XL'], colors: ['mauve', 'sage', 'cream'],
    primary_image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    hover_image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 10, slug: 'anarkali-festive-kurta', title: 'Festive Anarkali Kurta Set', category_slug: 'kurtis',
    price: 3499, original_price: 4499, discount: 22, rating: 4.9, reviews_count: 130, stock: 10,
    is_featured: 1, is_active: 1, is_new_arrival: 1, is_online: 1, is_offline: 1, brand: 'JALYN',
    description: 'Floor-length Anarkali kurta with heavy zari work and matching churidar pants.',
    sizes: ['S', 'M', 'L', 'XL'], colors: ['wine', 'black', 'rose'],
    primary_image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    hover_image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 11, slug: 'tailored-linen-shrug', title: 'Tailored Linen Blazer Shrug', category_slug: 'outerwear',
    price: 2799, original_price: 3499, discount: 20, rating: 4.7, reviews_count: 45, stock: 12,
    is_featured: 0, is_active: 1, is_new_arrival: 0, is_online: 1, is_offline: 1, brand: 'JALYN',
    description: 'Lightweight open-front linen blazer shrug tailored for modern workwear layering.',
    sizes: ['S', 'M', 'L'], colors: ['cream', 'beige', 'black'],
    primary_image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
    hover_image: 'https://images.unsplash.com/photo-1551163943-3f6fa0d40dc1?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 12, slug: 'sculpting-active-set', title: 'Sculpting Seamless Active Set', category_slug: 'activewear',
    price: 2199, original_price: 2799, discount: 21, rating: 4.9, reviews_count: 112, stock: 22,
    is_featured: 0, is_active: 1, is_new_arrival: 0, is_online: 1, is_offline: 1, brand: 'JALYN',
    description: 'Ultra-stretch seamless sports bra and high-rise workout leggings set.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['mauve', 'sage', 'black'],
    primary_image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
    hover_image: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 13, slug: 'handcrafted-leather-jutti', title: 'Handcrafted Leather Juttis', category_slug: 'footwear',
    price: 1899, original_price: 2299, discount: 17, rating: 4.8, reviews_count: 74, stock: 16,
    is_featured: 0, is_active: 1, is_new_arrival: 0, is_online: 1, is_offline: 1, brand: 'JALYN',
    description: 'Traditional Punjabi juttis handcrafted with genuine leather and dabka embroidery.',
    sizes: ['36', '37', '38', '39', '40'], colors: ['rose', 'cream', 'beige'],
    primary_image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    hover_image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 14, slug: 'satin-cowl-slip-dress', title: 'Satin Bias Cut Slip Dress', category_slug: 'dresses',
    price: 2299, original_price: 2899, discount: 20, rating: 4.9, reviews_count: 88, stock: 10,
    is_featured: 1, is_active: 1, is_new_arrival: 1, is_online: 1, is_offline: 1, brand: 'JALYN',
    description: 'Minimalist cowl-neck satin slip dress with adjustable straps and midi length.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['mauve', 'cream', 'black'],
    primary_image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
    hover_image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 15, slug: 'handloom-chanderi-suit', title: 'Handloom Chanderi Kurta Set', category_slug: 'ethnic',
    price: 3699, original_price: 4499, discount: 17, rating: 4.9, reviews_count: 92, stock: 14,
    is_featured: 1, is_active: 1, is_new_arrival: 1, is_online: 1, is_offline: 1, brand: 'JALYN',
    description: 'Handwoven Chanderi silk kurta with gota patti detailing and matching chiffon dupatta.',
    sizes: ['S', 'M', 'L', 'XL'], colors: ['cream', 'sage', 'rose'],
    primary_image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    hover_image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 16, slug: 'boho-printed-coord-set', title: 'Bohemian Printed Co-ord Set', category_slug: 'coords',
    price: 2599, original_price: 3199, discount: 18, rating: 4.8, reviews_count: 78, stock: 16,
    is_featured: 0, is_active: 1, is_new_arrival: 0, is_online: 1, is_offline: 1, brand: 'JALYN',
    description: 'Vibrant Bohemian motif crop top and flared palazzo pants co-ord set.',
    sizes: ['S', 'M', 'L'], colors: ['rose', 'mauve', 'beige'],
    primary_image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
    hover_image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 17, slug: 'banarasi-zari-saree', title: 'Silk Zari Border Banarasi Saree', category_slug: 'sarees',
    price: 5499, original_price: 6999, discount: 21, rating: 5.0, reviews_count: 140, stock: 8,
    is_featured: 1, is_active: 1, is_new_arrival: 1, is_online: 1, is_offline: 1, brand: 'JALYN',
    description: 'Traditional pure silk Banarasi saree woven with gold zari kadwa motifs.',
    sizes: ['Free Size'], colors: ['wine', 'rose', 'cream'],
    primary_image: 'https://images.unsplash.com/photo-1610030469668-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    hover_image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 18, slug: 'chikankari-straight-kurti', title: 'Lucknowi Chikankari Cotton Kurti', category_slug: 'kurtis',
    price: 1799, original_price: 2299, discount: 21, rating: 4.8, reviews_count: 165, stock: 24,
    is_featured: 0, is_active: 1, is_new_arrival: 0, is_online: 1, is_offline: 1, brand: 'JALYN',
    description: 'Authentic hand-embroidered Lucknowi Chikankari pure cotton straight kurti.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['cream', 'blush', 'sage'],
    primary_image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    hover_image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  },
];

let inMemoryProductsStore = [...SEED_PRODUCTS];

// Helper to safely parse JSON fields from DB rows
function parseJsonFields(product) {
  return {
    ...product,
    sizes: typeof product.sizes === 'string' ? JSON.parse(product.sizes) : (product.sizes || []),
    colors: typeof product.colors === 'string' ? JSON.parse(product.colors) : (product.colors || []),
    variants: typeof product.variants === 'string' ? JSON.parse(product.variants) : (product.variants || []),
    color_images: typeof product.color_images === 'string' ? JSON.parse(product.color_images) : (product.color_images || {}),
    size_guide: typeof product.size_guide === 'string' ? JSON.parse(product.size_guide) : (product.size_guide || null),
  };
}

// Auto seed table in MySQL if connected
export const ensureProductsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        image_url VARCHAR(500),
        item_count INT DEFAULT 0,
        is_active TINYINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        product_code VARCHAR(100),
        base_sku VARCHAR(100),
        brand VARCHAR(100) DEFAULT 'JALYN',
        category_slug VARCHAR(100) DEFAULT 'dresses',
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2) DEFAULT NULL,
        discount INT DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 4.8,
        reviews_count INT DEFAULT 12,
        stock INT DEFAULT 15,
        is_featured TINYINT DEFAULT 0,
        is_active TINYINT DEFAULT 1,
        is_new_arrival TINYINT DEFAULT 1,
        is_online TINYINT DEFAULT 1,
        is_offline TINYINT DEFAULT 1,
        low_stock_threshold INT DEFAULT 5,
        description TEXT,
        short_description TEXT,
        sizes JSON,
        colors JSON,
        variants JSON,
        color_images JSON,
        size_guide JSON,
        primary_image VARCHAR(500),
        hover_image VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Add new columns to existing tables (safe - will not error if they exist)
    const newColumns = [
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS product_code VARCHAR(100)",
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS base_sku VARCHAR(100)",
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR(100) DEFAULT 'JALYN'",
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new_arrival TINYINT DEFAULT 1",
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS new_arrival_order INT DEFAULT 0",
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS new_arrival_published TINYINT DEFAULT 1",
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS is_sale TINYINT DEFAULT 0",
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_order INT DEFAULT 0",
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_published TINYINT DEFAULT 1",
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS is_online TINYINT DEFAULT 1",
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS is_offline TINYINT DEFAULT 1",
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INT DEFAULT 5",
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description TEXT",
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS variants JSON",
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS color_images JSON",
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS size_guide JSON",
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
    ];
    for (const sql of newColumns) {
      try { await pool.query(sql); } catch (_) { /* column may already exist */ }
    }

    // Create inventory_transactions audit log table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        variant_sku VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        change_qty INT NOT NULL,
        balance_after INT NOT NULL,
        reference VARCHAR(100),
        notes VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [rows] = await pool.query('SELECT COUNT(*) as count FROM products');
    if (rows[0].count === 0) {
      for (const prod of SEED_PRODUCTS) {
        await pool.query(
          `INSERT INTO products 
          (title, slug, category_slug, price, original_price, discount, rating, reviews_count, stock, is_featured, is_active, is_new_arrival, is_online, is_offline, brand, description, sizes, colors, primary_image, hover_image)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            prod.title, prod.slug, prod.category_slug, prod.price,
            prod.original_price || prod.price, prod.discount || 0,
            prod.rating || 4.8, prod.reviews_count || 12, prod.stock || 15,
            prod.is_featured || 0, 1, prod.is_new_arrival || 0,
            prod.is_online ?? 1, prod.is_offline ?? 1, prod.brand || 'JALYN',
            prod.description || '',
            JSON.stringify(prod.sizes || ['S', 'M', 'L']),
            JSON.stringify(prod.colors || ['rose', 'cream']),
            prod.primary_image, prod.hover_image || prod.primary_image,
          ]
        );
      }
      console.log('✅ MySQL products table seeded with 18 products!');
    }
  } catch (err) {
    console.log('ℹ️ MySQL database products table check:', err.message);
  }
};

// Immediately invoke table check
ensureProductsTable();

function filterAndSortMockProducts(list, category, search, sort, includeOffline = false) {
  let filtered = list.filter((p) => includeOffline || (p.is_online !== 0 && p.is_online !== false));
  if (category && category !== 'all') {
    filtered = filtered.filter((p) => p.category_slug === category || p.category === category);
  }
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (p) => p.title.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s)
    );
  }
  if (sort === 'price-low') filtered.sort((a, b) => a.price - b.price);
  else if (sort === 'price-high') filtered.sort((a, b) => b.price - a.price);
  else filtered.sort((a, b) => b.id - a.id);
  return filtered;
}

// ─── GET /products ───
export const getProducts = async (req, res) => {
  const { category, search, sort, new_arrivals, sales, sale, include_offline } = req.query;
  const isIncludeOffline = include_offline === '1' || include_offline === 'true';

  try {
    let query = 'SELECT * FROM products WHERE is_active = 1';
    const params = [];

    // Filter out products turned OFF for online website unless admin explicitly passes include_offline=1
    if (!isIncludeOffline) {
      query += ' AND (is_online = 1 OR is_online IS NULL)';
    }

    if (new_arrivals === '1') {
      query += ' AND is_new_arrival = 1 AND new_arrival_published = 1';
    }
    if (sales === '1' || sale === '1') {
      query += ' AND is_sale = 1 AND sale_published = 1';
    }
    if (category && category !== 'all') {
      query += ' AND category_slug = ?';
      params.push(category);
    }
    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (sort === 'price-low' || sort === 'price_asc') query += ' ORDER BY price ASC';
    else if (sort === 'price-high' || sort === 'price_desc') query += ' ORDER BY price DESC';
    else if (sort === 'top-rated' || sort === 'rating') query += ' ORDER BY rating DESC';
    else if (sort === 'popularity' || sort === 'reviews') query += ' ORDER BY reviews_count DESC';
    else if (sort === 'discount') query += ' ORDER BY discount DESC';
    else if (new_arrivals === '1') query += ' ORDER BY new_arrival_order ASC, created_at DESC';
    else if (sales === '1' || sale === '1') query += ' ORDER BY sale_order ASC, created_at DESC';
    else query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);
    if (!rows || rows.length === 0) {
      return res.json({
        success: true,
        products: filterAndSortMockProducts(inMemoryProductsStore, category, search, sort, isIncludeOffline),
      });
    }
    const products = rows.map(parseJsonFields);
    return res.json({ success: true, products });
  } catch (error) {
    return res.json({
      success: true,
      products: filterAndSortMockProducts(inMemoryProductsStore, category, search, sort, isIncludeOffline),
      isFallback: true,
    });
  }
};

// ─── GET /products/:slug ───
export const getProductBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE (slug = ? OR id = ?) AND is_active = 1', [slug, slug]);
    if (rows && rows.length > 0) {
      const prod = parseJsonFields(rows[0]);
      if (prod.is_online === 0 || prod.is_online === false) {
        return res.status(404).json({ success: false, message: 'Product is currently not available online.' });
      }
      return res.json({ success: true, product: prod });
    }
    const mock = inMemoryProductsStore.find((p) => p.slug === slug || String(p.id) === String(slug));
    if (mock) {
      if (mock.is_online === 0 || mock.is_online === false) {
        return res.status(404).json({ success: false, message: 'Product is currently not available online.' });
      }
      return res.json({ success: true, product: mock });
    }
    return res.status(404).json({ success: false, message: 'Product not found' });
  } catch (error) {
    const mock = inMemoryProductsStore.find((p) => p.slug === slug || String(p.id) === String(slug));
    if (mock) return res.json({ success: true, product: mock });
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /products ───
export const createProduct = async (req, res) => {
  const {
    title, slug, category_slug, price, original_price, description, short_description,
    sizes, colors, stock, brand, product_code, base_sku,
    is_featured, is_new_arrival, is_online, is_offline, low_stock_threshold,
    variants, color_images, size_guide,
  } = req.body;

  let primary_image = req.body.primary_image;
  let hover_image = req.body.hover_image;

  if (req.files) {
    const serverUrl = `${req.protocol}://${req.get('host')}`;
    if (req.files.primary_image?.[0]) {
      const { url, storage } = await processAndStoreImage(req.files.primary_image[0]);
      primary_image = storage === 'local_multer' ? `${serverUrl}${url}` : url;
    }
    if (req.files.hover_image?.[0]) {
      const { url, storage } = await processAndStoreImage(req.files.hover_image[0]);
      hover_image = storage === 'local_multer' ? `${serverUrl}${url}` : url;
    }
  }

  const productSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const primaryImg = primary_image || 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80';
  const hoverImg = hover_image || primaryImg;

  const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes || ['S', 'M', 'L'];
  const parsedColors = typeof colors === 'string' ? JSON.parse(colors) : colors || ['rose', 'cream'];
  const parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants || [];
  const parsedColorImages = typeof color_images === 'string' ? JSON.parse(color_images) : color_images || {};
  const parsedSizeGuide = typeof size_guide === 'string' ? JSON.parse(size_guide) : size_guide || null;

  const disc = original_price > price ? Math.round(((original_price - price) / original_price) * 100) : 0;

  // Compute total stock from variants if present
  const totalStock = parsedVariants.length > 0
    ? parsedVariants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0)
    : parseInt(stock, 10) || 10;

  const newProd = {
    id: Date.now(), title, slug: productSlug,
    category_slug: category_slug || 'dresses',
    price: parseFloat(price) || 0,
    original_price: parseFloat(original_price) || parseFloat(price) || 0,
    discount: disc, rating: 4.8, reviews_count: 0,
    stock: totalStock,
    is_featured: is_featured ? 1 : 0,
    is_active: 1,
    is_new_arrival: is_new_arrival ? 1 : 0,
    is_online: is_online !== undefined ? (is_online ? 1 : 0) : 1,
    is_offline: is_offline !== undefined ? (is_offline ? 1 : 0) : 1,
    low_stock_threshold: parseInt(low_stock_threshold, 10) || 5,
    brand: brand || 'JALYN',
    product_code: product_code || '',
    base_sku: base_sku || '',
    description: description || '',
    short_description: short_description || '',
    sizes: parsedSizes, colors: parsedColors,
    variants: parsedVariants,
    color_images: parsedColorImages,
    size_guide: parsedSizeGuide,
    primary_image: primaryImg, hover_image: hoverImg,
  };

  inMemoryProductsStore.unshift(newProd);

  try {
    const [result] = await pool.query(
      `INSERT INTO products 
      (title, slug, category_slug, price, original_price, discount, description, short_description,
       sizes, colors, primary_image, hover_image, stock, brand, product_code, base_sku,
       is_featured, is_new_arrival, is_online, is_offline, low_stock_threshold,
       variants, color_images, size_guide)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, productSlug, category_slug || 'dresses',
        price, original_price || price, disc,
        description || '', short_description || '',
        JSON.stringify(parsedSizes), JSON.stringify(parsedColors),
        primaryImg, hoverImg, totalStock,
        brand || 'JALYN', product_code || '', base_sku || '',
        is_featured ? 1 : 0, is_new_arrival ? 1 : 0,
        is_online !== undefined ? (is_online ? 1 : 0) : 1,
        is_offline !== undefined ? (is_offline ? 1 : 0) : 1,
        parseInt(low_stock_threshold, 10) || 5,
        JSON.stringify(parsedVariants),
        JSON.stringify(parsedColorImages),
        parsedSizeGuide ? JSON.stringify(parsedSizeGuide) : null,
      ]
    );

    // Auto-generate barcodes for new product
    try {
      const productId = result.insertId;
      // Generate primary barcode
      const primaryBarcode = await generateUniqueBarcodeNumber();
      await pool.query(
        'INSERT INTO product_barcodes (product_id, barcode, is_primary, created_by) VALUES (?, ?, 1, ?)',
        [productId, primaryBarcode, req.user?.id || null]
      );
      // Generate variant barcodes
      if (parsedVariants && parsedVariants.length > 0) {
        for (const variant of parsedVariants) {
          const variantBarcode = await generateUniqueBarcodeNumber();
          await pool.query(
            'INSERT INTO product_barcodes (product_id, size, color, barcode, is_primary, created_by) VALUES (?, ?, ?, ?, 0, ?)',
            [productId, variant.size || null, variant.color || null, variantBarcode, req.user?.id || null]
          );
        }
      }
    } catch (barcodeError) {
      console.warn('⚠️ Auto-barcode generation failed:', barcodeError.message);
      // Don't block product creation
    }

    return res.status(201).json({
      success: true, message: 'Product created successfully!',
      productId: result.insertId, product: { ...newProd, id: result.insertId },
    });
  } catch (error) {
    return res.status(201).json({
      success: true, message: 'Product created in memory store!', product: newProd,
    });
  }
};

// ─── PUT /products/:id ───
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Process newly uploaded image if present
  if (req.file) {
    const { url, storage } = await processAndStoreImage(req.file);
    updates.primary_image = storage === 'local_multer'
      ? `${req.protocol}://${req.get('host')}${url}`
      : url;
  }

  // Parse JSON fields if they come as strings
  if (typeof updates.sizes === 'string') updates.sizes = JSON.parse(updates.sizes);
  if (typeof updates.colors === 'string') updates.colors = JSON.parse(updates.colors);
  if (typeof updates.variants === 'string') updates.variants = JSON.parse(updates.variants);
  if (typeof updates.color_images === 'string') updates.color_images = JSON.parse(updates.color_images);
  if (typeof updates.size_guide === 'string') updates.size_guide = JSON.parse(updates.size_guide);

  // Recompute total stock from variants if provided
  if (updates.variants && updates.variants.length > 0) {
    updates.stock = updates.variants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0);
  }

  // Recompute discount
  if (updates.original_price && updates.price && updates.original_price > updates.price) {
    updates.discount = Math.round(((updates.original_price - updates.price) / updates.original_price) * 100);
  }

  const idx = inMemoryProductsStore.findIndex((p) => String(p.id) === String(id) || p.slug === id);
  if (idx !== -1) {
    inMemoryProductsStore[idx] = { ...inMemoryProductsStore[idx], ...updates };
  }

  try {
    const setClauses = [];
    const params = [];
    const fieldMap = {
      title: 'title', price: 'price', original_price: 'original_price',
      discount: 'discount', stock: 'stock', category_slug: 'category_slug',
      brand: 'brand', product_code: 'product_code', base_sku: 'base_sku',
      description: 'description', short_description: 'short_description',
      is_featured: 'is_featured', is_new_arrival: 'is_new_arrival',
      is_online: 'is_online', is_offline: 'is_offline', is_active: 'is_active',
      low_stock_threshold: 'low_stock_threshold',
      primary_image: 'primary_image', hover_image: 'hover_image',
    };

    for (const [key, col] of Object.entries(fieldMap)) {
      if (updates[key] !== undefined) {
        setClauses.push(`${col} = ?`);
        params.push(updates[key]);
      }
    }

    // JSON fields
    const jsonFields = { sizes: 'sizes', colors: 'colors', variants: 'variants', color_images: 'color_images', size_guide: 'size_guide' };
    for (const [key, col] of Object.entries(jsonFields)) {
      if (updates[key] !== undefined) {
        setClauses.push(`${col} = ?`);
        params.push(JSON.stringify(updates[key]));
      }
    }

    if (setClauses.length > 0) {
      params.push(id, id);
      await pool.query(`UPDATE products SET ${setClauses.join(', ')} WHERE id = ? OR slug = ?`, params);
    }

    return res.json({ success: true, message: 'Product updated successfully.' });
  } catch (error) {
    return res.json({ success: true, message: 'Product updated in memory store.' });
  }
};

// ─── DELETE /products/:id ───
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  inMemoryProductsStore = inMemoryProductsStore.filter((p) => String(p.id) !== String(id) && p.slug !== id);
  try {
    await pool.query('DELETE FROM products WHERE id = ? OR slug = ?', [id, id]);
    return res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    return res.json({ success: true, message: 'Product deleted from memory store.' });
  }
};

// ─── POST /products/:id/offline-sale ─── Record offline sale and deduct stock
export const recordOfflineSale = async (req, res) => {
  const { id } = req.params;
  const { variant_sku, quantity, reference } = req.body;
  const qty = parseInt(quantity, 10);

  if (!variant_sku || !qty || qty <= 0) {
    return res.status(400).json({ success: false, message: 'variant_sku and positive quantity required.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ? OR slug = ?', [id, id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const product = parseJsonFields(rows[0]);
    const variants = product.variants || [];
    const vIdx = variants.findIndex((v) => v.sku === variant_sku);

    if (vIdx === -1) {
      return res.status(404).json({ success: false, message: `Variant SKU '${variant_sku}' not found.` });
    }

    const currentStock = parseInt(variants[vIdx].stock, 10) || 0;
    if (currentStock < qty) {
      return res.status(400).json({ success: false, message: `Insufficient stock. Available: ${currentStock}` });
    }

    variants[vIdx].stock = currentStock - qty;
    const totalStock = variants.reduce((s, v) => s + (parseInt(v.stock, 10) || 0), 0);

    await pool.query('UPDATE products SET variants = ?, stock = ? WHERE id = ?', [
      JSON.stringify(variants), totalStock, product.id,
    ]);

    // Record inventory transaction
    await pool.query(
      'INSERT INTO inventory_transactions (product_id, variant_sku, type, change_qty, balance_after, reference, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [product.id, variant_sku, 'Offline Sale', -qty, variants[vIdx].stock, reference || `OFF-${Date.now()}`, `Offline sale of ${qty} units`]
    );

    return res.json({
      success: true,
      message: `Offline sale recorded. ${variant_sku}: ${currentStock} → ${variants[vIdx].stock}`,
      newStock: variants[vIdx].stock,
      totalStock,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /products/:id/adjust-stock ─── Manual stock adjustment
export const adjustStock = async (req, res) => {
  const { id } = req.params;
  const { variant_sku, new_quantity, reason, reference } = req.body;

  if (!variant_sku || new_quantity === undefined) {
    return res.status(400).json({ success: false, message: 'variant_sku and new_quantity required.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ? OR slug = ?', [id, id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const product = parseJsonFields(rows[0]);
    const variants = product.variants || [];
    const vIdx = variants.findIndex((v) => v.sku === variant_sku);

    if (vIdx === -1) {
      return res.status(404).json({ success: false, message: `Variant SKU '${variant_sku}' not found.` });
    }

    const oldStock = parseInt(variants[vIdx].stock, 10) || 0;
    const newStock = parseInt(new_quantity, 10);
    if (newStock < 0) {
      return res.status(400).json({ success: false, message: 'Stock cannot be negative.' });
    }

    variants[vIdx].stock = newStock;
    const totalStock = variants.reduce((s, v) => s + (parseInt(v.stock, 10) || 0), 0);

    await pool.query('UPDATE products SET variants = ?, stock = ? WHERE id = ?', [
      JSON.stringify(variants), totalStock, product.id,
    ]);

    const changeQty = newStock - oldStock;
    const type = changeQty > 0 ? 'Stock Added' : 'Adjustment';

    await pool.query(
      'INSERT INTO inventory_transactions (product_id, variant_sku, type, change_qty, balance_after, reference, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [product.id, variant_sku, type, changeQty, newStock, reference || `ADJ-${Date.now()}`, reason || 'Manual adjustment']
    );

    return res.json({
      success: true,
      message: `Stock adjusted. ${variant_sku}: ${oldStock} → ${newStock}`,
      newStock, totalStock,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /inventory/transactions ─── Fetch inventory audit trail
export const getInventoryTransactions = async (req, res) => {
  const { product_id, limit } = req.query;
  try {
    let query = 'SELECT * FROM inventory_transactions';
    const params = [];
    if (product_id) {
      query += ' WHERE product_id = ?';
      params.push(product_id);
    }
    query += ' ORDER BY created_at DESC';
    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit, 10));
    }
    const [rows] = await pool.query(query, params);
    return res.json({ success: true, transactions: rows || [] });
  } catch (error) {
    return res.json({ success: true, transactions: [] });
  }
};

export const updateNewArrivalStatus = async (req, res) => {
  const { id } = req.params;
  const { is_new_arrival, new_arrival_order, new_arrival_published } = req.body;

  try {
    const updates = [];
    const params = [];

    if (is_new_arrival !== undefined) {
      updates.push('is_new_arrival = ?');
      params.push(is_new_arrival ? 1 : 0);
    }
    if (new_arrival_order !== undefined) {
      updates.push('new_arrival_order = ?');
      params.push(new_arrival_order);
    }
    if (new_arrival_published !== undefined) {
      updates.push('new_arrival_published = ?');
      params.push(new_arrival_published ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    params.push(id);
    await pool.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, params);

    return res.json({ success: true, message: 'Product new arrival status updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateNewArrivalsBulk = async (req, res) => {
  const { productIds, isNewArrival, newArrivalPublished } = req.body;

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid productIds array.' });
  }

  try {
    const params = [];
    let setClause = [];
    
    if (isNewArrival !== undefined) {
      setClause.push('is_new_arrival = ?');
      params.push(isNewArrival ? 1 : 0);
    }
    if (newArrivalPublished !== undefined) {
      setClause.push('new_arrival_published = ?');
      params.push(newArrivalPublished ? 1 : 0);
    }

    if (setClause.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    params.push(productIds);

    const query = `UPDATE products SET ${setClause.join(', ')} WHERE id IN (?)`;
    await pool.query(query, params);

    return res.json({
      success: true,
      message: `Bulk updated new arrivals status for ${productIds.length} products.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const reorderNewArrivals = async (req, res) => {
  const { orders } = req.body; // array of { id, new_arrival_order }

  if (!Array.isArray(orders)) {
    return res.status(400).json({ success: false, message: 'Invalid orders array.' });
  }

  try {
    for (const item of orders) {
      await pool.query('UPDATE products SET new_arrival_order = ? WHERE id = ?', [item.new_arrival_order, item.id]);
    }
    return res.json({ success: true, message: 'New arrivals order updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSaleStatus = async (req, res) => {
  const { id } = req.params;
  const { is_sale, sale_order, sale_published } = req.body;

  try {
    const updates = [];
    const params = [];

    if (is_sale !== undefined) {
      updates.push('is_sale = ?');
      params.push(is_sale ? 1 : 0);
    }
    if (sale_order !== undefined) {
      updates.push('sale_order = ?');
      params.push(sale_order);
    }
    if (sale_published !== undefined) {
      updates.push('sale_published = ?');
      params.push(sale_published ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    params.push(id);
    await pool.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, params);

    return res.json({ success: true, message: 'Product sale status updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSalesBulk = async (req, res) => {
  const { productIds, isSale, salePublished } = req.body;

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid productIds array.' });
  }

  try {
    const params = [];
    let setClause = [];
    
    if (isSale !== undefined) {
      setClause.push('is_sale = ?');
      params.push(isSale ? 1 : 0);
    }
    if (salePublished !== undefined) {
      setClause.push('sale_published = ?');
      params.push(salePublished ? 1 : 0);
    }

    if (setClause.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    params.push(productIds);

    const query = `UPDATE products SET ${setClause.join(', ')} WHERE id IN (?)`;
    await pool.query(query, params);

    return res.json({
      success: true,
      message: `Bulk updated sale status for ${productIds.length} products.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const reorderSales = async (req, res) => {
  const { orders } = req.body; // array of { id, sale_order }

  if (!Array.isArray(orders)) {
    return res.status(400).json({ success: false, message: 'Invalid orders array.' });
  }

  try {
    for (const item of orders) {
      await pool.query('UPDATE products SET sale_order = ? WHERE id = ?', [item.sale_order, item.id]);
    }
    return res.json({ success: true, message: 'Sales order updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
