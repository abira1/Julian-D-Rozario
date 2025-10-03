-- Julian D'Rozario Portfolio Database Schema
-- Database: u691568332_Dataubius
-- Created for MySQL/MariaDB on Hostinger

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    google_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_google_id (google_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content LONGTEXT NOT NULL,
    category VARCHAR(100),
    author VARCHAR(255) DEFAULT 'Julian D''Rozario',
    read_time INT DEFAULT 5,
    featured BOOLEAN DEFAULT FALSE,
    tags JSON,
    image_url VARCHAR(500),
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_featured (featured),
    INDEX idx_created_at (created_at),
    INDEX idx_is_published (is_published),
    FOREIGN KEY (category) REFERENCES categories(name) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create contact_info table
CREATE TABLE IF NOT EXISTS contact_info (
    id VARCHAR(36) PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    value VARCHAR(255) NOT NULL,
    contact_type VARCHAR(50) NOT NULL,
    icon VARCHAR(50),
    display_order INT DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_contact_type (contact_type),
    INDEX idx_display_order (display_order),
    INDEX idx_is_visible (is_visible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create blog_comments table
CREATE TABLE IF NOT EXISTS blog_comments (
    id VARCHAR(36) PRIMARY KEY,
    blog_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    comment_text TEXT NOT NULL,
    likes INT DEFAULT 0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_blog_id (blog_id),
    INDEX idx_user_id (user_id),
    INDEX idx_timestamp (timestamp),
    FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create blog_likes table
CREATE TABLE IF NOT EXISTS blog_likes (
    id VARCHAR(36) PRIMARY KEY,
    blog_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_blog_user (blog_id, user_id),
    INDEX idx_blog_id (blog_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin users (authorized emails)
INSERT INTO admin_users (id, email, name) VALUES
    (UUID(), 'juliandrozario@gmail.com', 'Julian D''Rozario'),
    (UUID(), 'abirsabirhossain@gmail.com', 'Abir Sabir Hossain')
ON DUPLICATE KEY UPDATE email=email;

-- Insert default categories
INSERT INTO categories (id, name, slug, display_order) VALUES
    (UUID(), 'All', 'all', 0),
    (UUID(), 'Company Formation', 'company-formation', 1),
    (UUID(), 'Immigration', 'immigration', 2),
    (UUID(), 'Technology', 'technology', 3),
    (UUID(), 'Operations', 'operations', 4),
    (UUID(), 'Business Development', 'business-development', 5),
    (UUID(), 'Compliance', 'compliance', 6)
ON DUPLICATE KEY UPDATE name=name;

-- Insert default contact information
INSERT INTO contact_info (id, label, value, contact_type, icon, display_order) VALUES
    (UUID(), 'Email', 'julian@drozario.blog', 'email', 'mail', 1),
    (UUID(), 'Phone', '+971 55 386 8045', 'phone', 'phone', 2),
    (UUID(), 'LinkedIn', 'https://www.linkedin.com/in/julian-d-rozario', 'social', 'linkedin', 3),
    (UUID(), 'Status', 'Available for consultation', 'status', 'check-circle', 4)
ON DUPLICATE KEY UPDATE label=label;