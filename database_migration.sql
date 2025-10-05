-- =====================================================
-- JULIAN D'ROZARIO PORTFOLIO - MySQL DATABASE SCHEMA
-- =====================================================
-- This script creates all necessary tables for the portfolio website
-- Run this on your Hostinger MySQL database via phpMyAdmin
-- =====================================================

-- Set default charset and collation
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- =====================================================
-- 1. BLOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    excerpt VARCHAR(1000) NOT NULL,
    content LONGTEXT NOT NULL,
    date DATE NOT NULL,
    read_time VARCHAR(20) DEFAULT '5 min read',
    category VARCHAR(100) NOT NULL,
    author VARCHAR(100) DEFAULT 'Julian D''Rozario',
    tags JSON DEFAULT NULL,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'published',
    -- SEO Fields
    slug VARCHAR(500) NULL UNIQUE,
    meta_title VARCHAR(60) NULL,
    meta_description VARCHAR(160) NULL,
    keywords VARCHAR(500) NULL,
    og_image VARCHAR(500) NULL,
    canonical_url VARCHAR(500) NULL,
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_date (date),
    INDEX idx_status (status),
    INDEX idx_featured (is_featured),
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. CONTACT INFO TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS contact_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    value VARCHAR(500) NOT NULL,
    contact_type VARCHAR(50) NOT NULL,
    icon VARCHAR(50) DEFAULT 'info',
    is_visible BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_visible (is_visible),
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. USER PROFILES TABLE (Firebase Users)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    photo_url VARCHAR(500),
    bio TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    preferences JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_firebase_uid (firebase_uid),
    INDEX idx_email (email),
    INDEX idx_admin (is_admin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. BLOG LIKES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    blog_id INT NOT NULL,
    user_id INT NOT NULL,
    firebase_uid VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (blog_id, user_id),
    FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
    INDEX idx_blog_id (blog_id),
    INDEX idx_user_id (user_id),
    INDEX idx_firebase_uid (firebase_uid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. BLOG SAVES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_saves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    blog_id INT NOT NULL,
    user_id INT NOT NULL,
    firebase_uid VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_save (blog_id, user_id),
    FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
    INDEX idx_blog_id (blog_id),
    INDEX idx_user_id (user_id),
    INDEX idx_firebase_uid (firebase_uid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. BLOG COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    blog_id INT NOT NULL,
    user_id INT NOT NULL,
    firebase_uid VARCHAR(255) NOT NULL,
    parent_comment_id INT NULL,
    comment_text TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES blog_comments(id) ON DELETE CASCADE,
    INDEX idx_blog_id (blog_id),
    INDEX idx_user_id (user_id),
    INDEX idx_firebase_uid (firebase_uid),
    INDEX idx_parent (parent_comment_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INSERT SAMPLE DATA (Optional - Remove if not needed)
-- =====================================================

-- Sample blog post
INSERT INTO blogs (title, excerpt, content, date, category, author) VALUES 
(
    'Welcome to Julian D''Rozario''s Portfolio',
    'This is a sample blog post to get you started with the admin dashboard.',
    '<h2>Welcome!</h2><p>This is your portfolio website. You can manage your blog posts and contact information through the admin dashboard.</p><p>Access the admin panel at <strong>/julian_portfolio</strong></p>',
    CURDATE(),
    'General',
    'Julian D''Rozario'
);

-- Sample contact information
INSERT INTO contact_info (label, value, contact_type, icon, is_visible, display_order) VALUES
('Email', 'juliandrozario@gmail.com', 'email', 'mail', TRUE, 1),
('Phone', '+1 (555) 123-4567', 'phone', 'phone', TRUE, 2),
('LinkedIn', 'linkedin.com/in/juliandrozario', 'social', 'linkedin', TRUE, 3),
('Location', 'New York, NY', 'location', 'map-pin', TRUE, 4);

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'Database schema created successfully! All tables are ready.' AS Status;

-- =====================================================
-- VERIFY TABLES CREATED
-- =====================================================
SHOW TABLES;
