import pool from '../config/db.js';

const parseJsonFields = (row) => {
  const fields = ['sizes', 'colors', 'variants', 'color_images', 'size_guide'];
  const parsed = { ...row };
  fields.forEach((f) => {
    if (parsed[f] && typeof parsed[f] === 'string') {
      try { parsed[f] = JSON.parse(parsed[f]); } catch { parsed[f] = []; }
    }
  });
  return parsed;
};

export const generateUniqueBarcodeNumber = async () => {
  let unique = false;
  let barcode = '';
  let attempts = 0;

  while (!unique && attempts < 30) {
    const random5Digits = String(Math.floor(10000 + Math.random() * 90000)).padStart(5, '0');
    barcode = `JN-${random5Digits}`;
    try {
      const [existing] = await pool.query('SELECT id FROM product_barcodes WHERE barcode = ?', [barcode]);
      if (existing.length === 0) {
        unique = true;
      }
    } catch (e) {
      unique = true;
    }
    attempts++;
  }

  if (!unique) {
    barcode = `JN-${Date.now().toString().slice(-5)}`;
  }

  return barcode;
};

export const generateProductBarcodes = async (req, res) => {
  const { productId } = req.params;

  try {
    const [productRows] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (productRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = parseJsonFields(productRows[0]);
    const variants = product.variants || [];
    const generated = [];

    // Generate primary barcode
    const [primaryExist] = await pool.query(
      'SELECT * FROM product_barcodes WHERE product_id = ? AND is_primary = 1 AND status = "active"',
      [productId]
    );

    if (primaryExist.length === 0) {
      const primaryBarcode = await generateUniqueBarcodeNumber();
      await pool.query(
        'INSERT INTO product_barcodes (product_id, barcode, is_primary, created_by) VALUES (?, ?, 1, ?)',
        [productId, primaryBarcode, req.user?.id || null]
      );
      generated.push({ type: 'primary', barcode: primaryBarcode });
    }

    // Generate variant barcodes
    for (const variant of variants) {
      const [variantExist] = await pool.query(
        'SELECT * FROM product_barcodes WHERE product_id = ? AND size = ? AND color = ? AND is_primary = 0 AND status = "active"',
        [productId, variant.size || null, variant.color || null]
      );

      if (variantExist.length === 0) {
        const variantBarcode = await generateUniqueBarcodeNumber();
        await pool.query(
          'INSERT INTO product_barcodes (product_id, size, color, barcode, is_primary, created_by) VALUES (?, ?, ?, ?, 0, ?)',
          [productId, variant.size || null, variant.color || null, variantBarcode, req.user?.id || null]
        );
        generated.push({ type: 'variant', size: variant.size, color: variant.color, barcode: variantBarcode });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Generated ${generated.length} barcodes`,
      data: generated
    });
  } catch (error) {
    console.error('generateProductBarcodes error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate barcodes' });
  }
};

export const regenerateBarcode = async (req, res) => {
  const { barcodeId } = req.params;

  try {
    const [existingRows] = await pool.query('SELECT * FROM product_barcodes WHERE id = ?', [barcodeId]);
    if (existingRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Barcode not found' });
    }

    const oldBarcode = existingRows[0];

    await pool.query('UPDATE product_barcodes SET status = "inactive" WHERE id = ?', [barcodeId]);

    const newBarcodeNum = await generateUniqueBarcodeNumber();

    const [insertResult] = await pool.query(
      'INSERT INTO product_barcodes (product_id, size, color, barcode, is_primary, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [oldBarcode.product_id, oldBarcode.size, oldBarcode.color, newBarcodeNum, oldBarcode.is_primary, req.user?.id || null]
    );

    return res.status(200).json({
      success: true,
      message: 'Barcode regenerated successfully',
      data: {
        oldBarcode: oldBarcode.barcode,
        newBarcode: newBarcodeNum,
        id: insertResult.insertId
      }
    });
  } catch (error) {
    console.error('regenerateBarcode error:', error);
    return res.status(500).json({ success: false, message: 'Failed to regenerate barcode' });
  }
};

export const scanBarcode = async (req, res) => {
  const { barcode } = req.body;

  if (!barcode) {
    return res.status(400).json({ success: false, message: 'Barcode is required' });
  }

  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    // 1. Find active barcode
    const [barcodeRows] = await connection.query(
      'SELECT * FROM product_barcodes WHERE barcode = ? AND status = ? FOR UPDATE',
      [barcode, 'active']
    );

    if (barcodeRows.length === 0) {
      const [inactiveRows] = await connection.query(
        'SELECT * FROM product_barcodes WHERE barcode = ? AND status = ?',
        [barcode, 'inactive']
      );
      if (inactiveRows.length > 0) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'BARCODE_INACTIVE' });
      }
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'BARCODE_NOT_FOUND' });
    }

    const barcodeRow = barcodeRows[0];

    // 4. Get product
    const [productRows] = await connection.query(
      'SELECT * FROM products WHERE id = ? FOR UPDATE',
      [barcodeRow.product_id]
    );

    if (productRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = parseJsonFields(productRows[0]);
    let variants = product.variants || [];
    let deductedVariant = null;
    let isExactMatch = false;
    let stockBefore = 0;
    let stockAfter = 0;

    // 6. Determine variant
    if (variants.length > 0) {
      if (barcodeRow.size && barcodeRow.color) {
        deductedVariant = variants.find(v => v.size === barcodeRow.size && v.color === barcodeRow.color);
        if (deductedVariant) isExactMatch = true;
      }

      if (!deductedVariant && barcodeRow.is_primary === 1) {
        deductedVariant = variants.reduce((prev, current) => 
          ((parseInt(prev.stock, 10) || 0) > (parseInt(current.stock, 10) || 0)) ? prev : current
        , variants[0]);
      }

      if (!deductedVariant) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Matching variant not found' });
      }

      stockBefore = parseInt(deductedVariant.stock, 10) || 0;
      if (stockBefore <= 0) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'OUT_OF_STOCK' });
      }

      deductedVariant.stock = stockBefore - 1;
      stockAfter = deductedVariant.stock;

      const totalStock = variants.reduce((s, v) => s + (parseInt(v.stock, 10) || 0), 0);

      await connection.query(
        'UPDATE products SET variants = ?, stock = ? WHERE id = ?',
        [JSON.stringify(variants), totalStock, product.id]
      );
      
      const [txResult] = await connection.query(
        `INSERT INTO inventory_transactions 
         (product_id, variant_sku, type, change_qty, balance_after, reference, notes, size, color, barcode, quantity_before, source, user_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product.id, deductedVariant.sku || 'UNKNOWN', 'stock_deduction', -1, stockAfter, barcode,
          'Barcode scan deduction', deductedVariant.size || null, deductedVariant.color || null,
          barcode, stockBefore, 'barcode_scan', req.user?.id || null
        ]
      );

      await connection.commit();
      
      return res.json({
        success: true,
        data: {
          transactionId: txResult.insertId,
          timestamp: new Date().toISOString(),
          barcode: barcode,
          product: {
            id: product.id,
            name: product.title,
            image: product.primary_image,
            brand: product.brand,
            category: product.category_slug,
            price: product.price,
            colors: product.colors
          },
          variant: {
            size: deductedVariant.size,
            color: deductedVariant.color,
            hasVariant: true,
            exactMatch: isExactMatch
          },
          quantityBefore: stockBefore,
          quantityChange: -1,
          quantityAfter: stockAfter,
          lowStock: stockAfter <= (product.low_stock_threshold || 5),
          lowStockThreshold: product.low_stock_threshold || 5,
          outOfStock: stockAfter === 0
        }
      });
      
    } else {
      stockBefore = parseInt(product.stock, 10) || 0;
      if (stockBefore <= 0) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'OUT_OF_STOCK' });
      }

      stockAfter = stockBefore - 1;

      await connection.query(
        'UPDATE products SET stock = ? WHERE id = ?',
        [stockAfter, product.id]
      );

      const [txResult] = await connection.query(
        `INSERT INTO inventory_transactions 
         (product_id, variant_sku, type, change_qty, balance_after, reference, notes, size, color, barcode, quantity_before, source, user_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product.id, 'PRIMARY', 'stock_deduction', -1, stockAfter, barcode,
          'Barcode scan deduction', null, null,
          barcode, stockBefore, 'barcode_scan', req.user?.id || null
        ]
      );

      await connection.commit();

      return res.json({
        success: true,
        data: {
          transactionId: txResult.insertId,
          timestamp: new Date().toISOString(),
          barcode: barcode,
          product: {
            id: product.id,
            name: product.title,
            image: product.primary_image,
            brand: product.brand,
            category: product.category_slug,
            price: product.price,
            colors: product.colors
          },
          variant: {
            size: null,
            color: null,
            hasVariant: false,
            exactMatch: true
          },
          quantityBefore: stockBefore,
          quantityChange: -1,
          quantityAfter: stockAfter,
          lowStock: stockAfter <= (product.low_stock_threshold || 5),
          lowStockThreshold: product.low_stock_threshold || 5,
          outOfStock: stockAfter === 0
        }
      });
    }
  } catch (error) {
    await connection.rollback();
    console.error('scanBarcode error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during scan' });
  } finally {
    connection.release();
  }
};

export const getBarcodes = async (req, res) => {
  const { search, status, product_id, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT pb.*, p.title as product_title, p.barcode_short_name, p.primary_image, p.price as product_price, p.original_price, COALESCE(p.original_price, p.price) as mrp 
      FROM product_barcodes pb 
      JOIN products p ON pb.product_id = p.id 
      WHERE 1=1
    `;
    const queryParams = [];

    if (search) {
      query += ` AND (pb.barcode LIKE ? OR p.title LIKE ? OR p.barcode_short_name LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      query += ` AND pb.status = ?`;
      queryParams.push(status);
    }
    if (product_id) {
      query += ` AND pb.product_id = ?`;
      queryParams.push(product_id);
    }

    const countQuery = query.replace('SELECT pb.*, p.title as product_title, p.barcode_short_name, p.primary_image, p.price as product_price, p.original_price, COALESCE(p.original_price, p.price) as mrp', 'SELECT COUNT(*) as total');
    
    query += ` ORDER BY pb.generated_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(Number(limit), Number(offset));

    const [rows] = await pool.query(query, queryParams);
    
    // For count query, we exclude the LIMIT and OFFSET parameters
    const [countRows] = await pool.query(countQuery, queryParams.slice(0, -2));

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: countRows[0].total,
        page: Number(page),
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('getBarcodes error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch barcodes' });
  }
};

export const getBarcodesByProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT pb.*, p.title as product_title, p.barcode_short_name, p.primary_image, p.price as product_price, p.original_price, COALESCE(p.original_price, p.price) as mrp 
       FROM product_barcodes pb 
       JOIN products p ON pb.product_id = p.id 
       WHERE pb.product_id = ? 
       ORDER BY pb.is_primary DESC, pb.color ASC, pb.size ASC`,
      [productId]
    );

    return res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('getBarcodesByProduct error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch product barcodes' });
  }
};

export const getStockHistory = async (req, res) => {
  const { product_id, source, type, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT it.*, p.title as product_title, p.primary_image 
      FROM inventory_transactions it 
      JOIN products p ON it.product_id = p.id 
      WHERE 1=1
    `;
    const queryParams = [];

    if (product_id) {
      query += ` AND it.product_id = ?`;
      queryParams.push(product_id);
    }
    if (source) {
      query += ` AND it.source = ?`;
      queryParams.push(source);
    }
    if (type) {
      query += ` AND it.type = ?`;
      queryParams.push(type);
    }

    const countQuery = query.replace('SELECT it.*, p.title as product_title, p.primary_image', 'SELECT COUNT(*) as total');

    query += ` ORDER BY it.created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(Number(limit), Number(offset));

    const [rows] = await pool.query(query, queryParams);
    const [countRows] = await pool.query(countQuery, queryParams.slice(0, -2));

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: countRows[0].total,
        page: Number(page),
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('getStockHistory error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch stock history' });
  }
};

export const deleteBarcode = async (req, res) => {
  const { barcodeId } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM product_barcodes WHERE id = ?', [barcodeId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Barcode not found' });
    }
    return res.status(200).json({ success: true, message: 'Barcode deleted successfully' });
  } catch (error) {
    console.error('deleteBarcode error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete barcode' });
  }
};

export const bulkDeleteBarcodes = async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'Please provide an array of barcode IDs to delete' });
  }

  try {
    const [result] = await pool.query('DELETE FROM product_barcodes WHERE id IN (?)', [ids]);
    return res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.affectedRows} barcode(s)`,
      deletedCount: result.affectedRows,
    });
  } catch (error) {
    console.error('bulkDeleteBarcodes error:', error);
    return res.status(500).json({ success: false, message: 'Failed to bulk delete barcodes' });
  }
};

