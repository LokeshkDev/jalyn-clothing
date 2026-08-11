# Jalyn E-Commerce & CMS Platform

A complete full-stack monorepo featuring an aesthetic client storefront, an Express backend server with MySQL database & Multer image upload support, and a modern Admin Panel with JWT Authentication and CMS Homepage management.

---

## 📁 Repository Directory Structure

```text
e-com/
├── client/                 # Storefront Frontend (React + Vite + Tailwind CSS)
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── .env & .env.example
│   └── package.json
│
├── server/                 # Express Backend Server (Node.js + MySQL + Multer + JWT)
│   ├── config/             # DB Connection (db.js)
│   ├── database/           # MySQL Schema & Seed Data (schema.sql)
│   ├── middleware/         # Multer Upload & JWT Auth Middleware
│   ├── controllers/        # CMS, Products, Categories, Auth, Orders Controllers
│   ├── routes/             # API Endpoints
│   ├── uploads/            # Multer Uploaded File Storage Directory
│   ├── .env & .env.example # MySQL & JWT Config Variables
│   └── index.js            # Express Server Entry Point
│
├── admin/                  # CMS Admin Panel (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/     # ImageUploader, Sidebar, Header
│   │   ├── pages/          # CMS Homepage Editor, Products, Categories, Orders, Login
│   │   └── services/       # Axios API Client with JWT Bearer Token
│   ├── .env & .env.example
│   └── package.json
│
└── package.json            # Monorepo Master Commands
```

---

## ⚡ Quick Start Guide

### 1. Install Dependencies

Install dependencies for all 3 applications (`client`, `server`, and `admin`):

```bash
# Install root & workspace dependencies
npm run install:all
```

Or install individually:
```bash
cd client && npm install
cd ../server && npm install
cd ../admin && npm install
```

---

### 2. Configure Environment Variables (.env)

#### Backend (`server/.env`):
Set your MySQL database credentials in [server/.env](file:///c:/Users/Lokesh/Desktop/E-commerce/jalyn/e-com/server/.env):
```env
PORT=5000
NODE_ENV=development

# MySQL Database Connection
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=jalyn_ecommerce
DB_PORT=3306

# JWT Secret Key
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
```

#### Client Storefront (`client/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SERVER_URL=http://localhost:5000
```

#### Admin Panel (`admin/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SERVER_URL=http://localhost:5000
```

---

### 3. Initialize MySQL Database

Run the provided SQL script to initialize tables (`users`, `categories`, `products`, `orders`, `cms_homepage_sections`):

```bash
mysql -u root -p jalyn_ecommerce < server/database/schema.sql
```

*(Note: The server also provides automatic mock data fallback if MySQL is not yet connected).*

---

### 4. Running the Development Servers

You can launch all 3 applications simultaneously or individually:

#### Option A: Run All Simultaneously
```bash
npm run dev:all
```

#### Option B: Run Individually

- **Backend Express Server** (Port 5000):
  ```bash
  npm run dev:server
  ```
- **Client Website** (Port 5173):
  ```bash
  npm run dev:client
  ```
- **Admin CMS Panel** (Port 5174):
  ```bash
  npm run dev:admin
  ```

---

## 🔐 Default Admin Credentials

- **URL**: `http://localhost:5174`
- **Email**: `admin@jalyn.com`
- **Password**: `admin123`

---

## 🖼️ Multer Image Upload Features

- Images uploaded via the Admin Panel (in Products or CMS Homepage Editor) are uploaded directly to the backend Express server using **Multer**.
- Uploaded files are assigned unique timestamps and stored in `server/uploads/`.
- Served statically over HTTP at `http://localhost:5000/uploads/<filename>`.
