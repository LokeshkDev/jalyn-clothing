import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jalyn_ecommerce',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const initDatabase = async (connection) => {
  try {
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.warn('⚠️ Database schema file not found at:', schemaPath);
      return;
    }

    console.log('🔄 Initializing database tables and seed data...');
    const sqlContent = fs.readFileSync(schemaPath, 'utf8');
    const rawQueries = sqlContent.split(';');

    for (let query of rawQueries) {
      query = query.trim();
      if (!query) continue;

      // Skip database creation/switching to keep tables in the configured DB_NAME
      const upperQuery = query.toUpperCase();
      if (upperQuery.startsWith('CREATE DATABASE') || upperQuery.startsWith('USE ')) {
        continue;
      }

      // Remove SQL comments (lines starting with --)
      const cleanLines = query
        .split('\n')
        .filter((line) => !line.trim().startsWith('--'));
      const cleanQuery = cleanLines.join('\n').trim();

      if (!cleanQuery) continue;

      try {
        await connection.query(cleanQuery);
      } catch (err) {
        // Suppress errors for duplicate seeds or indexes, but warn for other errors
        if (!err.message.includes('already exists') && !err.message.includes('Duplicate entry')) {
          console.warn(`⚠️ Warning executing statement: ${err.message}`);
        }
      }
    }
    console.log('✅ Database tables verified and initialized successfully.');
  } catch (error) {
    console.error('❌ Failed to initialize database tables:', error.message);
  }
};

export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully.');

    // Run schema initializer to automatically create tables
    await initDatabase(connection);

    // Ensure tracking columns exist on orders table
    try {
      await connection.query("ALTER TABLE orders ADD COLUMN courier VARCHAR(100) DEFAULT 'BlueDart Express'");
    } catch (e) {}
    try {
      await connection.query("ALTER TABLE orders ADD COLUMN tracking_id VARCHAR(100) DEFAULT NULL");
    } catch (e) {}
    try {
      await connection.query("ALTER TABLE orders ADD COLUMN expected_delivery VARCHAR(100) DEFAULT '3 to 5 business days'");
    } catch (e) {}

    // Ensure new arrival columns exist on products table
    try {
      await connection.query("ALTER TABLE products ADD COLUMN is_new_arrival TINYINT(1) DEFAULT 0");
    } catch (e) {}
    try {
      await connection.query("ALTER TABLE products ADD COLUMN new_arrival_order INT DEFAULT 0");
    } catch (e) {}
    try {
      await connection.query("ALTER TABLE products ADD COLUMN new_arrival_published TINYINT(1) DEFAULT 1");
    } catch (e) {}

    // Ensure sale columns exist on products table
    try {
      await connection.query("ALTER TABLE products ADD COLUMN is_sale TINYINT(1) DEFAULT 0");
    } catch (e) {}
    try {
      await connection.query("ALTER TABLE products ADD COLUMN sale_order INT DEFAULT 0");
    } catch (e) {}
    try {
      await connection.query("ALTER TABLE products ADD COLUMN sale_published TINYINT(1) DEFAULT 1");
    } catch (e) {}

    // Ensure product_barcodes table exists
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS product_barcodes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          product_id INT NOT NULL,
          size VARCHAR(30) NULL,
          color VARCHAR(50) NULL,
          barcode VARCHAR(30) NOT NULL UNIQUE,
          barcode_type VARCHAR(20) DEFAULT 'code128',
          status ENUM('active', 'inactive') DEFAULT 'active',
          is_primary TINYINT(1) DEFAULT 0,
          generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_by INT NULL,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
          INDEX idx_barcode_status (barcode, status),
          INDEX idx_product_barcodes (product_id, status)
        )
      `);
    } catch (e) {
      console.warn('⚠️ Warning creating product_barcodes table: ' + e.message);
    }

    // Ensure inventory_transactions new columns exist
    try {
      await connection.query("ALTER TABLE inventory_transactions ADD COLUMN size VARCHAR(30) NULL");
    } catch (e) {}
    try {
      await connection.query("ALTER TABLE inventory_transactions ADD COLUMN color VARCHAR(50) NULL");
    } catch (e) {}
    try {
      await connection.query("ALTER TABLE inventory_transactions ADD COLUMN barcode VARCHAR(30) NULL");
    } catch (e) {}
    try {
      await connection.query("ALTER TABLE inventory_transactions ADD COLUMN quantity_before INT NULL");
    } catch (e) {}
    try {
      await connection.query("ALTER TABLE inventory_transactions ADD COLUMN source VARCHAR(50) NULL");
    } catch (e) {}
    try {
      await connection.query("ALTER TABLE inventory_transactions ADD COLUMN user_id INT NULL");
    } catch (e) {}

    connection.release();
    return true;
  } catch (error) {
    console.warn(
      '⚠️ MySQL Database connection warning: ' +
        error.message +
        '\n👉 Please verify DB credentials in server/.env file.'
    );
    return false;
  }
};

export default pool;

