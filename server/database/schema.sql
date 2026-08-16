-- Jalyn E-Commerce Database Schema
-- Compatible with MySQL 5.7+ & MySQL 8.0+

CREATE DATABASE IF NOT EXISTS `jalyn_ecommerce` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `jalyn_ecommerce`;

-- --------------------------------------------------------
-- 1. Users Table (Admin & Customers)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(20) NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'customer') DEFAULT 'customer',
  `avatar` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 1b. Addresses Table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `addresses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `address_line1` TEXT NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `pincode` VARCHAR(20) NOT NULL,
  `type` VARCHAR(50) DEFAULT 'Home',
  `is_default` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 2. Categories Table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `image_url` VARCHAR(255) NULL,
  `item_count` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 3. Products Table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(150) NOT NULL UNIQUE,
  `title` VARCHAR(200) NOT NULL,
  `category_slug` VARCHAR(100) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `original_price` DECIMAL(10,2) NULL,
  `discount` INT DEFAULT 0,
  `rating` DECIMAL(3,2) DEFAULT 4.5,
  `reviews_count` INT DEFAULT 0,
  `stock` INT DEFAULT 10,
  `is_featured` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `description` TEXT NULL,
  `sizes` JSON NULL,
  `colors` JSON NULL,
  `primary_image` VARCHAR(255) NULL,
  `hover_image` VARCHAR(255) NULL,
  `is_new_arrival` TINYINT(1) DEFAULT 0,
  `new_arrival_order` INT DEFAULT 0,
  `new_arrival_published` TINYINT(1) DEFAULT 1,
  `is_sale` TINYINT(1) DEFAULT 0,
  `sale_order` INT DEFAULT 0,
  `sale_published` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 4. Product Additional Images
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `product_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `display_order` INT DEFAULT 0,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 5. Orders Table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` INT NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `customer_email` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(20) NULL,
  `shipping_address` TEXT NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `payment_method` VARCHAR(50) NULL,
  `payment_status` ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  `order_status` ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 6. Order Items Table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` INT NULL,
  `product_name` VARCHAR(200) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `size` VARCHAR(20) NULL,
  `color` VARCHAR(50) NULL,
  `image_url` VARCHAR(255) NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 7. CMS Homepage Sections Table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cms_homepage_sections` (
  `section_key` VARCHAR(100) PRIMARY KEY,
  `section_name` VARCHAR(100) NOT NULL,
  `content` JSON NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 6b. Coupons Table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(40) NOT NULL UNIQUE,
  `title` VARCHAR(120) NOT NULL,
  `description` VARCHAR(255) NULL,
  `discount_type` ENUM('percent', 'flat') DEFAULT 'percent',
  `discount_value` DECIMAL(10,2) NOT NULL,
  `min_amount` DECIMAL(10,2) DEFAULT 0,
  `max_discount` DECIMAL(10,2) NULL,
  `expires_at` DATE NULL,
  `usage_limit` INT DEFAULT 0,
  `used_count` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Default Coupons
INSERT INTO `coupons` (`code`, `title`, `description`, `discount_type`, `discount_value`, `min_amount`, `max_discount`, `expires_at`, `usage_limit`, `is_active`) VALUES
('WELCOME10', 'Welcome Special 10% OFF', 'Special 10% OFF for new Jalyn customers', 'percent', 10, 999, NULL, '2026-12-31', 0, 1),
('JALYN10', 'Festive Offer 10% OFF', 'Instant 10% OFF on orders above ₹1499', 'percent', 10, 1499, NULL, '2026-12-31', 0, 1),
('LUXE15', 'Luxury Edit 15% OFF', '15% OFF on orders above ₹3999', 'percent', 15, 3999, 500, '2026-12-31', 0, 1),
('FLAT200', 'Flat ₹200 OFF', 'Flat ₹200 off on orders above ₹1499', 'flat', 200, 1499, NULL, '2026-12-31', 0, 1)
ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;

-- --------------------------------------------------------
-- 7. CMS Homepage Sections Table (original placement marker)
-- --------------------------------------------------------

-- --------------------------------------------------------
-- Seed Sample CMS Homepage Sections
-- --------------------------------------------------------
INSERT INTO `cms_homepage_sections` (`section_key`, `section_name`, `content`) VALUES
('announcement_bar', 'Announcement Bar', '{
  "enabled": true,
  "text": "✨ FREE SHIPPING ON ORDERS OVER ₹1999 | USE CODE JALYN10 FOR 10% OFF ✨",
  "link": "/shop",
  "bg_color": "#2A1A22",
  "text_color": "#FFFFFF"
}'),
('hero_banner', 'Hero Banner Section', '{
  "heading": "Elegance Redefined For Every Occasion",
  "subheading": "Discover our handpicked aesthetic collection crafted with premium fabrics and timeless silhouettes.",
  "cta_text": "Explore Collection",
  "cta_link": "/shop",
  "banner_image": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
  "secondary_image": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"
}'),
('category_grid', 'Category Showcase Grid', '{
  "title": "Shop By Category",
  "subtitle": "Curated selections crafted to suit your style",
  "categories": [
    { "slug": "dresses", "title": "Dresses", "image": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80" },
    { "slug": "tops", "title": "Tops & Blouses", "image": "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80" },
    { "slug": "coords", "title": "Co-ord Sets", "image": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80" },
    { "slug": "ethnic", "title": "Ethnic Wear", "image": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80" }
  ]
}'),
('promo_banner', 'Promotional Banner', '{
  "badge": "LIMITED TIME OFFER",
  "title": "Unveil Your Chic Signature Style",
  "subtitle": "Get up to 40% Off on our exclusive Festive Collection",
  "cta_text": "Shop Sale Now",
  "cta_link": "/shop",
  "bg_image": "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80"
}')
ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;

-- --------------------------------------------------------
-- Seed Default Admin User (Password: admin123)
-- Hash generated via bcrypt
-- --------------------------------------------------------
INSERT INTO `users` (`name`, `email`, `password`, `role`) VALUES
('Admin User', 'admin@jalyn.com', '$2a$10$VjcdeZGOavcnOmZNxCRVu.0iTnc7GXUl2qiiT0ROvObI3pWYI3pRy', 'admin')
ON DUPLICATE KEY UPDATE `id` = `id`;
