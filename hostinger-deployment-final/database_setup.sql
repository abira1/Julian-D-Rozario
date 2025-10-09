-- =====================================================
-- JULIAN D'ROZARIO PORTFOLIO - MySQL DATABASE SETUP
-- For Hostinger: drozario.blog
-- Database: u691568332_toiraldbhub
-- User: u691568332_Juliandrozario
-- Password: Toiral185#4
-- =====================================================

-- Use the database
USE u691568332_toiraldbhub;

-- Set character set
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
    image_url VARCHAR(500) NULL,
    featured_image VARCHAR(500) NULL,
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
    INDEX idx_slug (slug),
    INDEX idx_image_url (image_url)
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
-- 3. USER PROFILES TABLE
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
    INDEX idx_parent (parent_comment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Sample Blog Post
INSERT INTO blogs (title, excerpt, content, date, category, author, slug, meta_title, meta_description) 
VALUES (
    'Welcome to Julian D''Rozario''s Portfolio',
    'Discover insights on business strategy, digital transformation, and leadership from an experienced business consultant.',
    '<h2>Welcome to My Portfolio</h2><p>I''m Julian D''Rozario, a business consultant specializing in digital transformation and strategic planning. This platform serves as a hub for my thoughts, insights, and professional journey.</p><p>Explore my blog for articles on business strategy, leadership, and industry trends.</p>',
    CURDATE(),
    'Business Strategy',
    'Julian D''Rozario',
    'welcome-to-julian-drozario-portfolio',
    'Welcome to Julian D''Rozario''s Portfolio',
    'Professional portfolio and blog of Julian D''Rozario, business consultant'
);

-- Sample Contact Information
INSERT INTO contact_info (label, value, contact_type, icon, is_visible, display_order) VALUES
('Email', 'juliandrozario@gmail.com', 'email', 'mail', TRUE, 1),
('Phone', '+971 55 386 8045', 'phone', 'phone', TRUE, 2),
('LinkedIn', 'linkedin.com/in/julian-d-rozario', 'social', 'linkedin', TRUE, 3),
('Location', 'Dubai, UAE', 'location', 'map-pin', TRUE, 4);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check tables created
SELECT 
    TABLE_NAME, 
    TABLE_ROWS 
FROM 
    information_schema.TABLES 
WHERE 
    TABLE_SCHEMA = 'u691568332_toiraldbhub' 
    AND TABLE_NAME IN ('blogs', 'contact_info', 'user_profiles', 'blog_likes', 'blog_saves', 'blog_comments');

-- Check sample data
SELECT COUNT(*) as blog_count FROM blogs;
SELECT COUNT(*) as contact_count FROM contact_info;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- Database is ready for use!
-- Access the API at: https://drozario.blog/api/health