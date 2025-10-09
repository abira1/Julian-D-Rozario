-- =====================================================
-- ADD IMAGE COLUMNS TO BLOGS TABLE
-- Run this on your Hostinger MySQL database
-- =====================================================

USE u691568332_toiraldbhub;

-- Add image columns to blogs table
ALTER TABLE blogs 
ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) NULL AFTER content,
ADD COLUMN IF NOT EXISTS featured_image VARCHAR(500) NULL AFTER image_url,
ADD INDEX IF NOT EXISTS idx_image_url (image_url);

-- Update existing blogs with placeholder images if they don't have images
UPDATE blogs 
SET image_url = CONCAT('https://via.placeholder.com/800x400/1e293b/94a3b8?text=', REPLACE(category, ' ', '+'))
WHERE image_url IS NULL OR image_url = '';

UPDATE blogs 
SET featured_image = image_url
WHERE featured_image IS NULL OR featured_image = '';

-- Verify the changes
SELECT 
    id, 
    title, 
    category,
    image_url,
    featured_image,
    status
FROM blogs 
LIMIT 5;

-- Show updated table structure
DESCRIBE blogs;
