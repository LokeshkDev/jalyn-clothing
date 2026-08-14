import pool from '../config/db.js';
import { processAndStoreImage } from '../services/imageService.js';

export const MOCK_CATEGORIES = [
  { id: 1, slug: 'all', name: 'All Categories', item_count: 120 },
  { id: 2, slug: 'dresses', name: 'Dresses', item_count: 28, image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80' },
  { id: 3, slug: 'tops', name: 'Tops', item_count: 20, image_url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80' },
  { id: 4, slug: 'coords', name: 'Co-ord Sets', item_count: 18, image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80' },
  { id: 5, slug: 'ethnic', name: 'Ethnic Wear', item_count: 22, image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80' },
  { id: 6, slug: 'lounge', name: 'Lounge Wear', item_count: 10, image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80' },
  { id: 7, slug: 'nightwear', name: 'Nightwear', item_count: 8, image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80' },
  { id: 8, slug: 'sarees', name: 'Designer Sarees', item_count: 20, image_url: 'https://images.unsplash.com/photo-1610030469668-98e550d6193c?auto=format&fit=crop&w=800&q=80' },
  { id: 9, slug: 'kurtis', name: 'Anarkali & Kurtis', item_count: 22, image_url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80' },
  { id: 10, slug: 'outerwear', name: 'Jackets & Shrugs', item_count: 12, image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80' },
  { id: 11, slug: 'activewear', name: 'Aesthetic Activewear', item_count: 15, image_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80' },
  { id: 12, slug: 'footwear', name: 'Artisanal Footwear', item_count: 18, image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80' },
];

export const ensureCategoriesTable = async () => {
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

    const [rows] = await pool.query('SELECT COUNT(*) as count FROM categories');
    if (rows[0].count === 0) {
      for (const cat of MOCK_CATEGORIES) {
        if (cat.slug !== 'all') {
          await pool.query(
            `INSERT INTO categories (name, slug, description, image_url, item_count, is_active)
            VALUES (?, ?, ?, ?, ?, 1)`,
            [cat.name, cat.slug, cat.name, cat.image_url || '', cat.item_count || 10]
          );
        }
      }
      console.log('✅ MySQL categories table seeded with 12 categories!');
    }
  } catch (err) {
    console.log('ℹ️ MySQL categories table check:', err.message);
  }
};

ensureCategoriesTable();

export const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.image_url,
        c.is_active,
        c.created_at,
        (
          SELECT COUNT(*) 
          FROM products p 
          WHERE (
            p.category_slug = c.slug 
            OR LOWER(TRIM(p.category)) = LOWER(TRIM(c.name))
            OR LOWER(TRIM(p.category)) = LOWER(TRIM(c.slug))
            OR p.category_id = c.id
          )
          AND (p.is_active = 1 OR p.is_active IS NULL)
        ) AS item_count
      FROM categories c
      WHERE c.is_active = 1
      ORDER BY c.id ASC
    `);

    if (!rows || rows.length === 0) {
      return res.json({ success: true, categories: MOCK_CATEGORIES, isFallback: true });
    }
    return res.json({ success: true, categories: rows });
  } catch (error) {
    try {
      const [basicRows] = await pool.query('SELECT * FROM categories WHERE is_active = 1 ORDER BY id ASC');
      return res.json({ success: true, categories: basicRows });
    } catch (err) {
      return res.json({ success: true, categories: MOCK_CATEGORIES, isFallback: true });
    }
  }
};

export const createCategory = async (req, res) => {
  const { name, slug, description } = req.body;
  let image_url = req.body.image_url;

  if (req.file) {
    const serverUrl = `${req.protocol}://${req.get('host')}`;
    const { url, storage } = await processAndStoreImage(req.file);
    image_url = storage === 'local_multer' ? `${serverUrl}${url}` : url;
  }

  const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  try {
    const [result] = await pool.query(
      'INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)',
      [name, categorySlug, description || '', image_url || '']
    );

    return res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      categoryId: result.insertId,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, slug, description } = req.body;
  let image_url = req.body.image_url;

  if (req.file) {
    const serverUrl = `${req.protocol}://${req.get('host')}`;
    const { url, storage } = await processAndStoreImage(req.file);
    image_url = storage === 'local_multer' ? `${serverUrl}${url}` : url;
  }

  const categorySlug = slug || (name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined);

  try {
    const [existing] = await pool.query('SELECT * FROM categories WHERE id = ? OR slug = ?', [id, id]);
    if (!existing || existing.length === 0) {
      const mock = MOCK_CATEGORIES.find((c) => c.id == id || c.slug === id);
      if (mock) {
        const [insertRes] = await pool.query(
          'INSERT INTO categories (name, slug, description, image_url, item_count, is_active) VALUES (?, ?, ?, ?, ?, 1)',
          [name || mock.name, categorySlug || mock.slug, description !== undefined ? description : mock.name, image_url !== undefined ? image_url : (mock.image_url || ''), mock.item_count || 10]
        );
        return res.json({
          success: true,
          message: 'Category updated successfully.',
          categoryId: insertRes.insertId,
        });
      }
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const targetId = existing[0].id;
    const updateName = name !== undefined ? name : existing[0].name;
    const updateSlug = categorySlug !== undefined ? categorySlug : existing[0].slug;
    const updateDesc = description !== undefined ? description : existing[0].description;
    const updateImage = image_url !== undefined ? image_url : existing[0].image_url;

    await pool.query(
      'UPDATE categories SET name = ?, slug = ?, description = ?, image_url = ? WHERE id = ?',
      [updateName, updateSlug, updateDesc, updateImage, targetId]
    );

    return res.json({ success: true, message: 'Category updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM categories WHERE id = ? OR slug = ?', [id, id]);
    return res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

