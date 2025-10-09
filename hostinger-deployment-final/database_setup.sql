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

-- Sample Blog Posts with Images
INSERT INTO blogs (title, excerpt, content, image_url, featured_image, date, category, author, slug, meta_title, meta_description, is_featured, tags) VALUES

-- Blog 1 - Featured
(
    'Complete Guide to Company Formation in Dubai Free Zones 2025',
    'Everything you need to know about setting up your business in Dubai Free Zones, including license types, costs, and step-by-step procedures.',
    '<h2>Introduction</h2><p>Dubai has emerged as one of the world''s leading business hubs, offering entrepreneurs unprecedented opportunities through its extensive network of free zones. In this comprehensive guide, we''ll walk you through everything you need to know about company formation in Dubai Free Zones.</p><h2>Why Choose Dubai Free Zones?</h2><p>Dubai Free Zones offer numerous advantages including 100% foreign ownership, zero corporate tax, full repatriation of capital and profits, and no currency restrictions. These benefits make it an attractive destination for international businesses.</p><h2>Types of Licenses</h2><p>There are three main types of licenses available: Trading License, Service License, and Industrial License. Each serves different business activities and comes with specific requirements.</p><h2>Step-by-Step Process</h2><ol><li>Choose your business activity</li><li>Select the appropriate free zone</li><li>Pick your company name</li><li>Submit required documents</li><li>Obtain initial approval</li><li>Sign lease agreement</li><li>Receive your license</li></ol><h2>Cost Breakdown</h2><p>The cost of setting up varies depending on the free zone and business activity. On average, expect to invest between AED 15,000 to AED 50,000 for the initial setup.</p>',
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-512453979798-5ea266f8880c?w=800&h=400&fit=crop',
    CURDATE(),
    'Company Formation',
    'Julian D''Rozario',
    'complete-guide-company-formation-dubai-free-zones-2025',
    'Complete Guide to Company Formation in Dubai Free Zones 2025',
    'Everything you need to know about setting up your business in Dubai Free Zones',
    TRUE,
    JSON_ARRAY('Dubai', 'Free Zone', 'Company Formation', 'Business Setup', 'UAE')
),

-- Blog 2
(
    'UAE Golden Visa: Complete Guide for Investors and Entrepreneurs',
    'Comprehensive guide to obtaining UAE Golden Visa, including eligibility criteria, benefits, application process, and investment requirements.',
    '<h2>What is the UAE Golden Visa?</h2><p>The UAE Golden Visa is a long-term residence visa that allows foreign nationals to live, work, and study in the UAE without the need for a national sponsor. It''s valid for 5 or 10 years and is automatically renewable.</p><h2>Who is Eligible?</h2><p>The Golden Visa is available to investors, entrepreneurs, specialized talents, researchers, outstanding students, and professionals in various fields including medicine, science, and art.</p><h2>Investment Requirements</h2><p>For investors, you need to invest a minimum of AED 2 million in property, or AED 10 million in an investment fund or company. Entrepreneurs with projects valued at least AED 500,000 are also eligible.</p><h2>Benefits</h2><ul><li>Long-term residency (5-10 years)</li><li>No sponsor required</li><li>Ability to sponsor family members</li><li>Freedom to stay outside UAE for extended periods</li><li>100% ownership of your business</li></ul>',
    'https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?w=800&h=400&fit=crop',
    DATE_SUB(CURDATE(), INTERVAL 2 DAY),
    'Immigration',
    'Julian D''Rozario',
    'uae-golden-visa-complete-guide-investors-entrepreneurs',
    'UAE Golden Visa: Complete Guide for Investors',
    'Comprehensive guide to obtaining UAE Golden Visa for investors and entrepreneurs',
    FALSE,
    JSON_ARRAY('Golden Visa', 'UAE Immigration', 'Investment', 'Residency', 'Dubai')
),

-- Blog 3
(
    'Meydan Free Zone vs Other Dubai Free Zones: Detailed Comparison',
    'In-depth comparison of Meydan Free Zone with other popular Dubai free zones including DMCC, JAFZA, and Dubai Silicon Oasis.',
    '<h2>Introduction</h2><p>Choosing the right free zone is crucial for your business success in Dubai. This article provides a comprehensive comparison of Meydan Free Zone with other major free zones.</p><h2>Meydan Free Zone Overview</h2><p>Located in the heart of Dubai, Meydan Free Zone offers strategic advantages for businesses focused on hospitality, retail, and lifestyle sectors. With over 3,200 licenses issued, it has become a preferred destination for entrepreneurs.</p><h2>Cost Comparison</h2><table><tr><th>Free Zone</th><th>Starting Cost</th><th>Office Space</th></tr><tr><td>Meydan</td><td>AED 15,000</td><td>From 10 sqm</td></tr><tr><td>DMCC</td><td>AED 20,000</td><td>From 12 sqm</td></tr><tr><td>JAFZA</td><td>AED 18,000</td><td>From 15 sqm</td></tr></table><h2>Key Advantages of Meydan</h2><ul><li>Strategic location near Business Bay and Downtown Dubai</li><li>Flexible office solutions</li><li>Quick setup process (3-5 days)</li><li>Competitive pricing</li><li>Excellent connectivity</li></ul>',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop',
    DATE_SUB(CURDATE(), INTERVAL 5 DAY),
    'Company Formation',
    'Julian D''Rozario',
    'meydan-free-zone-vs-other-dubai-free-zones-comparison',
    'Meydan Free Zone vs Other Dubai Free Zones',
    'Detailed comparison of Meydan Free Zone with other popular Dubai free zones',
    FALSE,
    JSON_ARRAY('Meydan', 'Free Zone', 'Comparison', 'DMCC', 'JAFZA')
),

-- Blog 4
(
    'Top 10 Business Activities for Dubai Free Zone License in 2025',
    'Explore the most profitable and in-demand business activities for Dubai free zone licenses, with detailed requirements and market insights.',
    '<h2>Most Popular Business Activities</h2><p>Based on market trends and our experience with over 3,200 license formations, here are the top business activities for 2025.</p><h2>1. E-commerce and Online Retail</h2><p>With the digital transformation boom, e-commerce continues to dominate. Requirements include trading license and potentially warehouse space.</p><h2>2. Digital Marketing and Social Media Management</h2><p>High demand with minimal capital requirements. Service license sufficient for most operations.</p><h2>3. IT Consulting and Software Development</h2><p>Technology sector remains strong with excellent profit margins and growth potential.</p><h2>4. Business Consulting</h2><p>Management consulting, HR services, and business advisory services are in high demand.</p><h2>5. Real Estate Services</h2><p>Property management, real estate brokerage, and consultancy services offer great opportunities.</p>',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop',
    DATE_SUB(CURDATE(), INTERVAL 7 DAY),
    'Business Development',
    'Julian D''Rozario',
    'top-10-business-activities-dubai-free-zone-license-2025',
    'Top 10 Business Activities for Dubai Free Zone 2025',
    'Most profitable business activities for Dubai free zone licenses in 2025',
    FALSE,
    JSON_ARRAY('Business Activities', 'Dubai', 'Free Zone', 'License', '2025 Trends')
),

-- Blog 5
(
    'Complete Document Checklist for UAE Company Formation',
    'Comprehensive checklist of all documents required for company formation in UAE free zones, mainland, and offshore jurisdictions.',
    '<h2>Essential Documents Overview</h2><p>Proper documentation is crucial for smooth company formation. This guide covers all required documents for different jurisdiction types.</p><h2>Personal Documents Required</h2><ul><li>Valid passport copy (colored)</li><li>Passport-size photographs (white background)</li><li>Emirates ID (if applicable)</li><li>Visa copy (if applicable)</li><li>Address proof (utility bill or bank statement)</li></ul><h2>Business Documents</h2><ul><li>Business plan outline</li><li>Memorandum of Association (MOA)</li><li>Articles of Association (AOA)</li><li>Share distribution agreement</li><li>Lease agreement for office space</li></ul><h2>Additional Requirements</h2><p>Depending on your business activity, additional documents like professional qualifications, industry-specific approvals, or no objection certificates may be required.</p><h2>Document Attestation</h2><p>Some documents may need attestation from your home country and UAE embassy. We can assist with the complete attestation process.</p>',
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=400&fit=crop',
    DATE_SUB(CURDATE(), INTERVAL 10 DAY),
    'Compliance',
    'Julian D''Rozario',
    'complete-document-checklist-uae-company-formation',
    'Complete Document Checklist for UAE Company Formation',
    'Comprehensive checklist of all documents required for UAE company formation',
    FALSE,
    JSON_ARRAY('Documents', 'Requirements', 'Company Formation', 'Checklist', 'UAE')
),

-- Blog 6
(
    'Understanding UAE Corporate Tax: What Businesses Need to Know',
    'Comprehensive guide to UAE corporate tax implementation, exemptions, compliance requirements, and planning strategies for businesses.',
    '<h2>UAE Corporate Tax Overview</h2><p>From June 1, 2023, the UAE implemented a federal corporate tax at a rate of 9% on taxable income exceeding AED 375,000. This marks a significant shift in the UAE''s tax landscape.</p><h2>Who is Affected?</h2><p>The corporate tax applies to all businesses operating in the UAE, including free zones, with certain exemptions for qualifying free zone persons.</p><h2>Tax Rates</h2><ul><li>0% on taxable income up to AED 375,000</li><li>9% on taxable income exceeding AED 375,000</li><li>Different rates may apply to large multinationals</li></ul><h2>Free Zone Benefits</h2><p>Qualifying free zone persons can benefit from 0% corporate tax on qualifying income, provided they meet specific conditions and maintain adequate substance.</p><h2>Compliance Requirements</h2><p>Businesses must maintain proper accounting records, file annual tax returns, and comply with transfer pricing regulations. The first tax period began on June 1, 2023.</p>',
    'https://images.unsplash.com/photo-1554224311-beee04f8f935?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1554224311-beee04f8f935?w=800&h=400&fit=crop',
    DATE_SUB(CURDATE(), INTERVAL 14 DAY),
    'Compliance',
    'Julian D''Rozario',
    'understanding-uae-corporate-tax-what-businesses-need-know',
    'Understanding UAE Corporate Tax for Businesses',
    'Comprehensive guide to UAE corporate tax and compliance requirements',
    FALSE,
    JSON_ARRAY('Corporate Tax', 'UAE Tax', 'Compliance', 'Business', 'Free Zone')
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