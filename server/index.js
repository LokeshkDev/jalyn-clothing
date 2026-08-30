import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { testConnection } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cmsRoutes from './routes/cmsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import barcodeRoutes from './routes/barcodeRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import filterOptionRoutes from './routes/filterOptionRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import rackRoutes from './routes/rackRoutes.js';
import godownRoutes from './routes/godownRoutes.js';
import consentRoutes from './routes/consentRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy headers (Nginx, Cloudflare, Vercel, Railway, etc.)
app.set('trust proxy', true);

// ─── 1. UNIVERSAL PRE-ROUTING CORS & PREFLIGHT MIDDLEWARE ───
// Guarantees CORS headers are attached on EVERY request, response, and OPTIONS preflight
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, x-no-compression, Pragma, Expires'
  );
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Content-Disposition, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Immediately respond 200 OK to browser preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Safely enable Gzip response compression if package exists
try {
  const { default: compression } = await import('compression');
  if (compression) {
    app.use(
      compression({
        level: 6,
        threshold: 1024,
        filter: (req, res) => {
          if (req.headers['x-no-compression']) return false;
          return compression.filter(req, res);
        },
      })
    );
  }
} catch (e) {
  console.log('ℹ️ Running without compression package');
}

// ─── 2. CORS PACKAGE MIDDLEWARE ───
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  'https://jalyn.vercel.app',
  'https://www.jalyn.vercel.app',
  'https://jalyn-admin.vercel.app',
  'https://www.jalyn-admin.vercel.app',
  'https://admin.jalyn.in',
  'https://www.admin.jalyn.in',
  'https://jalyn.in',
  'https://www.jalyn.in',
  'https://api.jalyn.in',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:4173',
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow matching origins, vercel domains, jalyn.in subdomains, or server-to-server (no origin)
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('jalyn.in') ||
      origin.endsWith('vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Cache-Control', 'x-no-compression', 'Pragma', 'Expires'],
  exposedHeaders: ['Content-Length', 'Content-Range', 'Content-Disposition', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Cache-Control middleware for idempotent read-only catalog API endpoints
app.use('/api', (req, res, next) => {
  if (req.method === 'GET') {
    const url = req.path;
    if (
      url.startsWith('/products') ||
      url.startsWith('/categories') ||
      url.startsWith('/cms') ||
      url.startsWith('/filter-options')
    ) {
      // Cache for 3 minutes in browser, serve stale while revalidating for 5 minutes
      res.set('Cache-Control', 'public, max-age=180, stale-while-revalidate=300');
    }
  }
  next();
});

// Body Parsing Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static directory for uploaded images with 1-year immutable caching
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '365d',
  immutable: true,
}));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Jalyn E-Commerce Backend Server',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/barcodes', barcodeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/filter-options', filterOptionRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/racks', rackRoutes);
app.use('/api/godowns', godownRoutes);
app.use('/api/consent', consentRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler - returns JSON so CORS headers are always applied
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Start Server & Test Database Connection
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Uploaded files served at http://localhost:${PORT}/uploads/`);
  await testConnection();
});
