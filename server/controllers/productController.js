import pool from '../config/db.js';
import { processAndStoreImage } from '../services/imageService.js';
import { generateUniqueBarcodeNumber } from './barcodeController.js';

// Helper to safely parse JSON fields from DB rows
function safeJsonParse(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value !== 'string') return value;
  try {
    const parsed = JSON.parse(value);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch (err) {
    return fallback;
  }
}

// Helper to parse all JSON fields on a product object
function parseJsonFields(product) {
  if (!product) return null;
  return {
    ...product,
    sizes: safeJsonParse(product.sizes, []),
    colors: safeJsonParse(product.colors, []),
    variants: safeJsonParse(product.variants, []),
    color_images: safeJsonParse(product.color_images, {}),
    size_guide: safeJsonParse(product.size_guide, null),
  };
}

// Dynamic effective stock resolution live at read time from richest available source:
// 1. Godown distribution sum (product_godown_stock) — authoritative when present
// 2. Variant matrix sum — authoritative when variants carry stock
// 3. Fallback: stored products.stock value
function computeEffectiveStock(product) {
  const godownTotal = parseInt(product.godown_total, 10) || 0;
  if (godownTotal > 0) return godownTotal;

  const variants = Array.isArray(product.variants) ? product.variants : [];
  if (variants.length > 0) {
    const variantTotal = variants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0);
    if (variantTotal > 0) return variantTotal;
  }

  return parseInt(product.stock, 10) || 0;
}

// Apply parseJsonFields and computeEffectiveStock to a raw DB row
function withEffectiveStock(row) {
  const product = parseJsonFields(row);
  if (!product) return null;
  product.godown_total = parseInt(row.godown_total, 10) || 0;
  product.godown_count = parseInt(row.godown_count, 10) || 0;
  product.effective_stock = computeEffectiveStock(product);
  product.stock = product.effective_stock;
  return product;
}

// Ensure products and categories schema tables/columns exist in MySQL
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
        barcode_short_name VARCHAR(150) NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        product_code VARCHAR(100),
        base_sku VARCHAR(100),
        brand VARCHAR(100) DEFAULT 'JALYN',
        category_slug VARCHAR(100) DEFAULT 'dresses',
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2) DEFAULT NULL,
        base_price DECIMAL(10,2) NULL,
        hsn_code VARCHAR(50) DEFAULT '6204',
        discount INT DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 4.8,
        reviews_count INT DEFAULT 0,
        stock INT DEFAULT 0,
        is_featured TINYINT DEFAULT 0,
        is_active TINYINT DEFAULT 1,
        is_new_arrival TINYINT DEFAULT 1,
        new_arrival_order INT DEFAULT 0,
        new_arrival_published TINYINT DEFAULT 1,
        is_sale TINYINT DEFAULT 0,
        sale_order INT DEFAULT 0,
        sale_published TINYINT DEFAULT 1,
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
        fabric VARCHAR(100),
        sleeve VARCHAR(100),
        occasion VARCHAR(100),
        fit VARCHAR(100),
        pattern VARCHAR(100),
        season VARCHAR(100),
        primary_image VARCHAR(500),
        hover_image VARCHAR(500),
        vendor_id INT NULL,
        rack_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Ensure columns exist on products table (MySQL-safe check)
    const ensureColumn = async (columnName, columnSql) => {
      const [cols] = await pool.query(
        `SELECT COUNT(*) as count FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = ?`,
        [columnName]
      );
      if (cols[0].count === 0) {
        try { await pool.query(columnSql); } catch (_) {}
      }
    };

    await ensureColumn('barcode_short_name', 'ALTER TABLE products ADD COLUMN barcode_short_name VARCHAR(150) NULL');
    await ensureColumn('base_price', 'ALTER TABLE products ADD COLUMN base_price DECIMAL(10,2) NULL');
    await ensureColumn('hsn_code', "ALTER TABLE products ADD COLUMN hsn_code VARCHAR(50) DEFAULT '6204'");
    await ensureColumn('product_code', 'ALTER TABLE products ADD COLUMN product_code VARCHAR(100)');
    await ensureColumn('base_sku', 'ALTER TABLE products ADD COLUMN base_sku VARCHAR(100)');
    await ensureColumn('brand', "ALTER TABLE products ADD COLUMN brand VARCHAR(100) DEFAULT 'JALYN'");
    await ensureColumn('is_new_arrival', 'ALTER TABLE products ADD COLUMN is_new_arrival TINYINT DEFAULT 1');
    await ensureColumn('new_arrival_order', 'ALTER TABLE products ADD COLUMN new_arrival_order INT DEFAULT 0');
    await ensureColumn('new_arrival_published', 'ALTER TABLE products ADD COLUMN new_arrival_published TINYINT DEFAULT 1');
    await ensureColumn('is_sale', 'ALTER TABLE products ADD COLUMN is_sale TINYINT DEFAULT 0');
    await ensureColumn('sale_order', 'ALTER TABLE products ADD COLUMN sale_order INT DEFAULT 0');
    await ensureColumn('sale_published', 'ALTER TABLE products ADD COLUMN sale_published TINYINT DEFAULT 1');
    await ensureColumn('is_online', 'ALTER TABLE products ADD COLUMN is_online TINYINT DEFAULT 1');
    await ensureColumn('is_offline', 'ALTER TABLE products ADD COLUMN is_offline TINYINT DEFAULT 1');
    await ensureColumn('low_stock_threshold', 'ALTER TABLE products ADD COLUMN low_stock_threshold INT DEFAULT 5');
    await ensureColumn('short_description', 'ALTER TABLE products ADD COLUMN short_description TEXT');
    await ensureColumn('variants', 'ALTER TABLE products ADD COLUMN variants JSON');
    await ensureColumn('color_images', 'ALTER TABLE products ADD COLUMN color_images JSON');
    await ensureColumn('size_guide', 'ALTER TABLE products ADD COLUMN size_guide JSON');
    await ensureColumn('fabric', 'ALTER TABLE products ADD COLUMN fabric VARCHAR(100)');
    await ensureColumn('sleeve', 'ALTER TABLE products ADD COLUMN sleeve VARCHAR(100)');
    await ensureColumn('occasion', 'ALTER TABLE products ADD COLUMN occasion VARCHAR(100)');
    await ensureColumn('fit', 'ALTER TABLE products ADD COLUMN fit VARCHAR(100)');
    await ensureColumn('pattern', 'ALTER TABLE products ADD COLUMN pattern VARCHAR(100)');
    await ensureColumn('season', 'ALTER TABLE products ADD COLUMN season VARCHAR(100)');
    await ensureColumn('updated_at', 'ALTER TABLE products ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

    // Create inventory_transactions table if not exists
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
  } catch (err) {
    console.warn('ℹ️ MySQL database products table check:', err.message);
  }
};

// Immediately initialize schema tables
ensureProductsTable();

// ─── GET /products ───
export const getProducts = async (req, res) => {
  const { category, search, sort, new_arrivals, sales, sale, include_offline } = req.query;
  const isIncludeOffline = include_offline === '1' || include_offline === 'true';

  try {
    let query = 'SELECT p.*, '
      + '(SELECT COALESCE(SUM(stock), 0) FROM product_godown_stock WHERE product_id = p.id) as godown_total, '
      + '(SELECT COUNT(*) FROM product_godown_stock WHERE product_id = p.id) as godown_count '
      + 'FROM products p WHERE 1=1';
    const params = [];

    // For public online store, only show active products that have online publishing turned ON
    if (!isIncludeOffline) {
      query += ' AND p.is_active = 1 AND (p.is_online = 1 OR p.is_online IS NULL)';
    }

    if (new_arrivals === '1') {
      query += ' AND p.is_new_arrival = 1 AND p.new_arrival_published = 1';
    }
    if (sales === '1' || sale === '1') {
      query += ' AND p.is_sale = 1 AND p.sale_published = 1';
    }
    if (category && category !== 'all') {
      query += ' AND p.category_slug = ?';
      params.push(category);
    }
    if (search) {
      query += ' AND (p.title LIKE ? OR p.description LIKE ? OR p.base_sku LIKE ? OR p.barcode_short_name LIKE ? OR p.product_code LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s, s);
    }

    // Dynamic sorting
    if (sort === 'price-low' || sort === 'price_asc') query += ' ORDER BY p.price ASC';
    else if (sort === 'price-high' || sort === 'price_desc') query += ' ORDER BY p.price DESC';
    else if (sort === 'top-rated' || sort === 'rating') query += ' ORDER BY p.rating DESC';
    else if (sort === 'popularity' || sort === 'reviews') query += ' ORDER BY p.reviews_count DESC';
    else if (sort === 'discount') query += ' ORDER BY p.discount DESC';
    else if (new_arrivals === '1') query += ' ORDER BY p.new_arrival_order ASC, p.created_at DESC';
    else if (sales === '1' || sale === '1') query += ' ORDER BY p.sale_order ASC, p.created_at DESC';
    else query += ' ORDER BY p.created_at DESC';

    const [rows] = await pool.query(query, params);
    const products = rows && rows.length > 0 ? rows.map(withEffectiveStock).filter(Boolean) : [];
    return res.json({ success: true, products });
  } catch (error) {
    console.error('getProducts query error:', error);
    return res.status(500).json({ success: false, message: error.message, products: [] });
  }
};

// ─── GET /products/:slug ───
export const getProductBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT p.*,
        (SELECT COALESCE(SUM(stock), 0) FROM product_godown_stock WHERE product_id = p.id) as godown_total,
        (SELECT COUNT(*) FROM product_godown_stock WHERE product_id = p.id) as godown_count
       FROM products p WHERE p.slug = ? OR p.id = ?`,
      [slug, slug]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const prod = withEffectiveStock(rows[0]);
    return res.json({ success: true, product: prod });
  } catch (error) {
    console.error('getProductBySlug error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /products ───
export const createProduct = async (req, res) => {
  const {
    title, barcode_short_name, slug, category_slug, price, original_price, base_price, hsn_code, description, short_description,
    sizes, colors, stock, brand, product_code, base_sku,
    is_featured, is_new_arrival, is_online, is_offline, low_stock_threshold,
    variants, color_images, size_guide,
    fabric, sleeve, occasion, fit, pattern, season,
    vendor_id, rack_id, godown_stock,
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

  let productSlug = slug ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') : (title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `product-${Date.now()}`);

  // Guarantee slug uniqueness in MySQL
  try {
    const [existing] = await pool.query('SELECT id FROM products WHERE slug = ?', [productSlug]);
    if (existing && existing.length > 0) {
      productSlug = `${productSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
  } catch (e) {}

  const primaryImg = primary_image || '';
  const hoverImg = hover_image || primaryImg;

  const parsedSizes = safeJsonParse(sizes, ['S', 'M', 'L']);
  const parsedColors = safeJsonParse(colors, ['Rose', 'Cream']);
  const parsedVariants = safeJsonParse(variants, []);
  const parsedColorImages = safeJsonParse(color_images, {});
  const parsedSizeGuide = safeJsonParse(size_guide, null);

  const origPrice = original_price !== undefined && original_price !== null && original_price !== '' ? parseFloat(original_price) : null;
  const sellPrice = parseFloat(price) || 0;
  const disc = origPrice && origPrice > sellPrice ? Math.round(((origPrice - sellPrice) / origPrice) * 100) : 0;

  // Compute total stock from variants if present
  let totalStock = parsedVariants.length > 0
    ? parsedVariants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0)
    : parseInt(stock, 10) || 0;

  // Parse godown stock (array of { godown_id, stock })
  const parsedGodownStock = Array.isArray(godown_stock)
    ? godown_stock
        .map((g) => ({ godown_id: parseInt(g.godown_id, 10), stock: Math.max(0, parseInt(g.stock, 10) || 0) }))
        .filter((g) => g.godown_id && g.stock > 0)
    : [];
  if (parsedGodownStock.length > 0) {
    totalStock = parsedGodownStock.reduce((sum, g) => sum + g.stock, 0);
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO products 
      (title, barcode_short_name, slug, category_slug, price, original_price, base_price, hsn_code, discount, description, short_description,
       sizes, colors, primary_image, hover_image, stock, brand, product_code, base_sku,
       is_featured, is_new_arrival, is_online, is_offline, low_stock_threshold,
       variants, color_images, size_guide, fabric, sleeve, occasion, fit, pattern, season,
       vendor_id, rack_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title || 'Untitled Product',
        barcode_short_name || null,
        productSlug,
        category_slug || 'dresses',
        sellPrice,
        origPrice || sellPrice,
        base_price !== undefined && base_price !== null && base_price !== '' ? parseFloat(base_price) : null,
        hsn_code || '6204',
        disc,
        description || '',
        short_description || '',
        JSON.stringify(parsedSizes),
        JSON.stringify(parsedColors),
        primaryImg,
        hoverImg,
        totalStock,
        brand || 'JALYN',
        product_code || '',
        base_sku || '',
        is_featured ? 1 : 0,
        is_new_arrival !== undefined ? (is_new_arrival ? 1 : 0) : 1,
        is_online !== undefined ? (is_online ? 1 : 0) : 1,
        is_offline !== undefined ? (is_offline ? 1 : 0) : 1,
        parseInt(low_stock_threshold, 10) || 5,
        JSON.stringify(parsedVariants),
        JSON.stringify(parsedColorImages),
        parsedSizeGuide ? JSON.stringify(parsedSizeGuide) : null,
        fabric || '',
        sleeve || '',
        occasion || '',
        fit || '',
        pattern || '',
        season || '',
        vendor_id ? parseInt(vendor_id, 10) : null,
        rack_id ? parseInt(rack_id, 10) : null,
      ]
    );

    const productId = result.insertId;

    // Persist godown stock distribution
    if (parsedGodownStock.length > 0) {
      for (const g of parsedGodownStock) {
        await pool.query(
          'INSERT INTO product_godown_stock (product_id, godown_id, stock) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE stock = VALUES(stock)',
          [productId, g.godown_id, g.stock]
        );
      }
    }

    // Auto-generate barcodes for new product
    try {
      const primaryBarcode = await generateUniqueBarcodeNumber();
      await pool.query(
        'INSERT INTO product_barcodes (product_id, barcode, is_primary, created_by) VALUES (?, ?, 1, ?)',
        [productId, primaryBarcode, req.user?.id || null]
      );
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
      console.warn('⚠️ Auto-barcode generation note:', barcodeError.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      productId,
      product: {
        id: productId,
        title,
        barcode_short_name,
        slug: productSlug,
        price: sellPrice,
        original_price: origPrice,
        stock: totalStock,
      },
    });
  } catch (error) {
    console.error('Create product MySQL error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create product in database.',
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
  if (typeof updates.sizes === 'string') updates.sizes = safeJsonParse(updates.sizes, []);
  if (typeof updates.colors === 'string') updates.colors = safeJsonParse(updates.colors, []);
  if (typeof updates.variants === 'string') updates.variants = safeJsonParse(updates.variants, []);
  if (typeof updates.color_images === 'string') updates.color_images = safeJsonParse(updates.color_images, {});
  if (typeof updates.size_guide === 'string') updates.size_guide = safeJsonParse(updates.size_guide, null);
  if (updates.size_guide && typeof updates.size_guide !== 'object') updates.size_guide = null;

  // Recompute total stock from variants if provided
  if (updates.variants && updates.variants.length > 0) {
    updates.stock = updates.variants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0);
  }

  // Recompute discount
  if (updates.original_price && updates.price && Number(updates.original_price) > Number(updates.price)) {
    updates.discount = Math.round(((Number(updates.original_price) - Number(updates.price)) / Number(updates.original_price)) * 100);
  }

  try {
    const setClauses = [];
    const params = [];
    const fieldMap = {
      title: 'title',
      barcode_short_name: 'barcode_short_name',
      price: 'price',
      original_price: 'original_price',
      base_price: 'base_price',
      hsn_code: 'hsn_code',
      discount: 'discount',
      stock: 'stock',
      category_slug: 'category_slug',
      brand: 'brand',
      product_code: 'product_code',
      base_sku: 'base_sku',
      description: 'description',
      short_description: 'short_description',
      is_featured: 'is_featured',
      is_new_arrival: 'is_new_arrival',
      is_online: 'is_online',
      is_offline: 'is_offline',
      is_active: 'is_active',
      low_stock_threshold: 'low_stock_threshold',
      primary_image: 'primary_image',
      hover_image: 'hover_image',
      fabric: 'fabric',
      sleeve: 'sleeve',
      occasion: 'occasion',
      fit: 'fit',
      pattern: 'pattern',
      season: 'season',
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

    // Vendor & Rack relationships
    if (updates.vendor_id !== undefined) {
      setClauses.push('vendor_id = ?');
      params.push(updates.vendor_id ? parseInt(updates.vendor_id, 10) : null);
    }
    if (updates.rack_id !== undefined) {
      setClauses.push('rack_id = ?');
      params.push(updates.rack_id ? parseInt(updates.rack_id, 10) : null);
    }

    if (setClauses.length > 0) {
      params.push(id, id);
      await pool.query(`UPDATE products SET ${setClauses.join(', ')} WHERE id = ? OR slug = ?`, params);
    }

    // Persist godown stock distribution
    if (updates.godown_stock !== undefined && Array.isArray(updates.godown_stock)) {
      const parsedGodownStock = updates.godown_stock
        .map((g) => ({ godown_id: parseInt(g.godown_id, 10), stock: Math.max(0, parseInt(g.stock, 10) || 0) }))
        .filter((g) => g.godown_id);

      const hasPositiveStock = parsedGodownStock.some((g) => g.stock > 0);

      if (hasPositiveStock) {
        const [productRows] = await pool.query('SELECT id FROM products WHERE id = ? OR slug = ?', [id, id]);
        const realId = productRows[0]?.id || id;

        await pool.query('DELETE FROM product_godown_stock WHERE product_id = ?', [realId]);
        for (const g of parsedGodownStock) {
          if (g.stock > 0) {
            await pool.query(
              'INSERT INTO product_godown_stock (product_id, godown_id, stock) VALUES (?, ?, ?)',
              [realId, g.godown_id, g.stock]
            );
          }
        }

        const [totals] = await pool.query(
          'SELECT COALESCE(SUM(stock), 0) as total FROM product_godown_stock WHERE product_id = ?',
          [realId]
        );
        const godownTotal = parseInt(totals[0]?.total, 10) || 0;
        await pool.query('UPDATE products SET stock = ? WHERE id = ?', [godownTotal, realId]);
      }
    }

    return res.json({ success: true, message: 'Product updated successfully.' });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to update product.' });
  }
};

// ─── DELETE /products/:id ───
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Resolve numeric ID and slug from DB
    const [rows] = await pool.query('SELECT id, slug FROM products WHERE id = ? OR slug = ?', [id, id]);
    if (!rows || rows.length === 0) {
      // Idempotent: Product is already gone from MySQL
      try {
        await pool.query('DELETE FROM product_barcodes WHERE product_id = ?', [id]);
        await pool.query('DELETE FROM product_godown_stock WHERE product_id = ?', [id]);
      } catch (e) {}
      return res.json({
        success: true,
        message: 'Product deleted from database.',
        deletedId: id,
      });
    }

    const targetId = rows[0].id;
    const targetSlug = rows[0].slug;

    // 2. Cascade delete all child foreign key records in order
    try { await pool.query('DELETE FROM product_barcodes WHERE product_id = ?', [targetId]); } catch (e) {}
    try { await pool.query('DELETE FROM product_godown_stock WHERE product_id = ?', [targetId]); } catch (e) {}
    try { await pool.query('DELETE FROM product_images WHERE product_id = ?', [targetId]); } catch (e) {}
    try { await pool.query('DELETE FROM inventory_transactions WHERE product_id = ?', [targetId]); } catch (e) {}
    try { await pool.query('UPDATE order_items SET product_id = NULL WHERE product_id = ?', [targetId]); } catch (e) {}

    // 3. Delete master product record
    await pool.query('DELETE FROM products WHERE id = ?', [targetId]);

    return res.json({
      success: true,
      message: 'Product and associated records permanently deleted from database.',
      deletedId: targetId,
      deletedSlug: targetSlug,
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete product from database.',
    });
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
    return res.status(500).json({ success: false, message: error.message, transactions: [] });
  }
};

// ─── PATCH /products/:id/new-arrival ───
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

// ─── PATCH /products/new-arrivals/bulk ───
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
    await pool.query(`UPDATE products SET ${setClause.join(', ')} WHERE id IN (?)`, params);

    return res.json({
      success: true,
      message: `Bulk updated new arrivals status for ${productIds.length} products.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PATCH /products/new-arrivals/reorder ───
export const reorderNewArrivals = async (req, res) => {
  const { orders } = req.body;

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

// ─── PATCH /products/:id/sale ───
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

// ─── PATCH /products/sales/bulk ───
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
    await pool.query(`UPDATE products SET ${setClause.join(', ')} WHERE id IN (?)`, params);

    return res.json({
      success: true,
      message: `Bulk updated sale status for ${productIds.length} products.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PATCH /products/sales/reorder ───
export const reorderSales = async (req, res) => {
  const { orders } = req.body;

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
