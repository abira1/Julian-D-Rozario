-- ============================================
-- Julian D'Rozario Portfolio Database Schema
-- MySQL Version for Hostinger
-- Database: u691568332_toiraldbhub
-- ============================================

-- Set character set and collation
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- TABLE: blogs
-- ============================================
CREATE TABLE IF NOT EXISTS `blogs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(500) NOT NULL,
  `excerpt` VARCHAR(1000) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `featured_image` VARCHAR(500) DEFAULT NULL,
  `date` DATE NOT NULL,
  `read_time` VARCHAR(20) NOT NULL DEFAULT '5 min read',
  `category` VARCHAR(100) NOT NULL,
  `author` VARCHAR(100) NOT NULL DEFAULT 'Julian D\'Rozario',
  `tags` JSON DEFAULT NULL,
  `views` INT(11) DEFAULT 0,
  `likes` INT(11) DEFAULT 0,
  `is_featured` TINYINT(1) DEFAULT 0,
  `status` VARCHAR(20) DEFAULT 'published',
  `slug` VARCHAR(500) DEFAULT NULL UNIQUE,
  `meta_title` VARCHAR(60) DEFAULT NULL,
  `meta_description` VARCHAR(160) DEFAULT NULL,
  `keywords` VARCHAR(500) DEFAULT NULL,
  `og_image` VARCHAR(500) DEFAULT NULL,
  `canonical_url` VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_category` (`category`),
  INDEX `idx_date` (`date`),
  INDEX `idx_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: user_profiles
-- ============================================
CREATE TABLE IF NOT EXISTS `user_profiles` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `firebase_uid` VARCHAR(255) NOT NULL UNIQUE,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `display_name` VARCHAR(255) DEFAULT NULL,
  `photo_url` VARCHAR(500) DEFAULT NULL,
  `bio` TEXT DEFAULT NULL,
  `is_admin` TINYINT(1) DEFAULT 0,
  `preferences` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_firebase_uid` (`firebase_uid`),
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: contact_info
-- ============================================
CREATE TABLE IF NOT EXISTS `contact_info` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `label` VARCHAR(100) NOT NULL,
  `value` VARCHAR(500) NOT NULL,
  `contact_type` VARCHAR(50) NOT NULL,
  `icon` VARCHAR(50) DEFAULT 'info',
  `is_visible` TINYINT(1) DEFAULT 1,
  `display_order` INT(11) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_visible` (`is_visible`),
  INDEX `idx_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: blog_likes
-- ============================================
CREATE TABLE IF NOT EXISTS `blog_likes` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `blog_id` INT(11) NOT NULL,
  `user_id` INT(11) NOT NULL,
  `firebase_uid` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_blog_user` (`blog_id`, `user_id`),
  FOREIGN KEY (`blog_id`) REFERENCES `blogs`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user_profiles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: blog_saves
-- ============================================
CREATE TABLE IF NOT EXISTS `blog_saves` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `blog_id` INT(11) NOT NULL,
  `user_id` INT(11) NOT NULL,
  `firebase_uid` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_blog_user_save` (`blog_id`, `user_id`),
  FOREIGN KEY (`blog_id`) REFERENCES `blogs`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user_profiles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: blog_comments
-- ============================================
CREATE TABLE IF NOT EXISTS `blog_comments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `blog_id` INT(11) NOT NULL,
  `user_id` INT(11) NOT NULL,
  `firebase_uid` VARCHAR(255) NOT NULL,
  `parent_comment_id` INT(11) DEFAULT NULL,
  `comment_text` TEXT NOT NULL,
  `is_edited` TINYINT(1) DEFAULT 0,
  `is_deleted` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`blog_id`) REFERENCES `blogs`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user_profiles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`parent_comment_id`) REFERENCES `blog_comments`(`id`) ON DELETE CASCADE,
  INDEX `idx_blog_id` (`blog_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT SAMPLE DATA
-- ============================================

-- Insert sample blogs (if table is empty)
INSERT INTO `blogs` (`title`, `excerpt`, `content`, `image_url`, `featured_image`, `date`, `read_time`, `category`, `author`, `is_featured`, `status`, `slug`)
SELECT * FROM (
  SELECT 
    'Complete Guide to Company Formation in Dubai Free Zones 2025' AS title,
    'Everything you need to know about setting up your business in Dubai Free Zones, including license types, costs, and step-by-step procedures.' AS excerpt,
    '<h2>Introduction</h2><p>Dubai has emerged as one of the world\'s leading business hubs. In this comprehensive guide, we\'ll walk you through everything you need to know about company formation in Dubai Free Zones.</p><h2>Why Dubai Free Zones?</h2><p>Dubai Free Zones offer 100% foreign ownership, zero corporate and personal income tax, and complete repatriation of capital and profits.</p>' AS content,
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=400&fit=crop' AS image_url,
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=400&fit=crop' AS featured_image,
    CURDATE() AS date,
    '5 min read' AS read_time,
    'Company Formation' AS category,
    'Julian D\'Rozario' AS author,
    1 AS is_featured,
    'published' AS status,
    'complete-guide-company-formation-dubai-free-zones-2025' AS slug
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `blogs` LIMIT 1);

INSERT INTO `blogs` (`title`, `excerpt`, `content`, `image_url`, `featured_image`, `date`, `read_time`, `category`, `author`, `is_featured`, `status`, `slug`)
SELECT * FROM (
  SELECT 
    'UAE Golden Visa: Complete Guide for Investors and Entrepreneurs' AS title,
    'Comprehensive guide to obtaining UAE Golden Visa, including eligibility criteria, benefits, application process, and investment requirements.' AS excerpt,
    '<h2>What is the UAE Golden Visa?</h2><p>The UAE Golden Visa is a long-term residence visa that allows foreign nationals to live, work, and study in the UAE without the need for a national sponsor.</p><h2>Eligibility Criteria</h2><p>Investors, entrepreneurs, specialized talents, and outstanding students can apply for the Golden Visa.</p>' AS content,
    'https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?w=800&h=400&fit=crop' AS image_url,
    'https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?w=800&h=400&fit=crop' AS featured_image,
    DATE_SUB(CURDATE(), INTERVAL 2 DAY) AS date,
    '7 min read' AS read_time,
    'Immigration' AS category,
    'Julian D\'Rozario' AS author,
    0 AS is_featured,
    'published' AS status,
    'uae-golden-visa-complete-guide-investors-entrepreneurs' AS slug
) AS tmp
WHERE (SELECT COUNT(*) FROM `blogs`) < 2;

INSERT INTO `blogs` (`title`, `excerpt`, `content`, `image_url`, `featured_image`, `date`, `read_time`, `category`, `author`, `is_featured`, `status`, `slug`)
SELECT * FROM (
  SELECT 
    'Meydan Free Zone vs Other Dubai Free Zones: Detailed Comparison' AS title,
    'In-depth comparison of Meydan Free Zone with other popular Dubai free zones including DMCC, JAFZA, and Dubai Silicon Oasis.' AS excerpt,
    '<h2>Introduction</h2><p>Choosing the right free zone is crucial for your business success in Dubai. This article provides a comprehensive comparison.</p><h2>Meydan Free Zone Benefits</h2><p>Strategic location, cost-effective packages, and flexible office solutions.</p>' AS content,
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop' AS image_url,
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop' AS featured_image,
    DATE_SUB(CURDATE(), INTERVAL 5 DAY) AS date,
    '6 min read' AS read_time,
    'Company Formation' AS category,
    'Julian D\'Rozario' AS author,
    0 AS is_featured,
    'published' AS status,
    'meydan-free-zone-vs-other-dubai-free-zones-comparison' AS slug
) AS tmp
WHERE (SELECT COUNT(*) FROM `blogs`) < 3;

-- Insert sample contact info
INSERT INTO `contact_info` (`label`, `value`, `contact_type`, `icon`, `is_visible`, `display_order`)
SELECT * FROM (
  SELECT 'Email' AS label, 'juliandrozario@gmail.com' AS value, 'email' AS contact_type, 'mail' AS icon, 1 AS is_visible, 1 AS display_order
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `contact_info` LIMIT 1);

INSERT INTO `contact_info` (`label`, `value`, `contact_type`, `icon`, `is_visible`, `display_order`)
SELECT * FROM (
  SELECT 'Phone' AS label, '+971 55 386 8045' AS value, 'phone' AS contact_type, 'phone' AS icon, 1 AS is_visible, 2 AS display_order
) AS tmp
WHERE (SELECT COUNT(*) FROM `contact_info`) < 2;

INSERT INTO `contact_info` (`label`, `value`, `contact_type`, `icon`, `is_visible`, `display_order`)
SELECT * FROM (
  SELECT 'LinkedIn' AS label, 'linkedin.com/in/julian-d-rozario' AS value, 'social' AS contact_type, 'linkedin' AS icon, 1 AS is_visible, 3 AS display_order
) AS tmp
WHERE (SELECT COUNT(*) FROM `contact_info`) < 3;

INSERT INTO `contact_info` (`label`, `value`, `contact_type`, `icon`, `is_visible`, `display_order`)
SELECT * FROM (
  SELECT 'Location' AS label, 'Dubai, UAE' AS value, 'location' AS contact_type, 'map-pin' AS icon, 1 AS is_visible, 4 AS display_order
) AS tmp
WHERE (SELECT COUNT(*) FROM `contact_info`) < 4;

-- ============================================
-- ENABLE FOREIGN KEY CHECKS
-- ============================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify installation:
-- SELECT COUNT(*) AS total_blogs FROM blogs;
-- SELECT COUNT(*) AS total_contacts FROM contact_info;
-- SELECT COUNT(*) AS total_users FROM user_profiles;
-- SHOW TABLES;
