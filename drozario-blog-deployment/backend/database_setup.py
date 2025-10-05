#!/usr/bin/env python3
"""
Database Setup Script for Julian Portfolio
Creates tables and inserts initial data
"""

import mysql.connector
from mysql.connector import Error
import json
import os
from datetime import datetime, date
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.mysql')

# Database configuration
MYSQL_CONFIG = {
    'host': os.getenv('MYSQL_HOST', 'localhost'),
    'user': os.getenv('MYSQL_USER', 'u691568332_julian_admin'),
    'password': os.getenv('MYSQL_PASSWORD', 'JulianDB2024!@#'),
    'database': os.getenv('MYSQL_DATABASE', 'u691568332_julian_portfol'),
    'port': int(os.getenv('MYSQL_PORT', 3306)),
    'charset': 'utf8mb4',
    'autocommit': True
}

def create_connection():
    """Create database connection"""
    try:
        connection = mysql.connector.connect(**MYSQL_CONFIG)
        print("✅ Database connection successful!")
        return connection
    except Error as e:
        print(f"❌ Database connection error: {e}")
        return None

def create_tables(cursor):
    """Create all required tables"""
    
    # Create blogs table
    blogs_table = """
    CREATE TABLE IF NOT EXISTS blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        excerpt TEXT NOT NULL,
        content LONGTEXT NOT NULL,
        date DATE NOT NULL,
        read_time VARCHAR(20) NOT NULL,
        category VARCHAR(100) NOT NULL,
        author VARCHAR(100) NOT NULL DEFAULT 'Julian D''Rozario',
        image_url TEXT,
        featured BOOLEAN DEFAULT FALSE,
        tags JSON,
        views INT DEFAULT 0,
        likes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_featured (featured),
        INDEX idx_date (date),
        INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    """
    
    # Create contact_info table
    contact_table = """
    CREATE TABLE IF NOT EXISTS contact_info (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        linkedin TEXT,
        availability VARCHAR(255) NOT NULL DEFAULT 'Available for consultation',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    """
    
    # Create categories table
    categories_table = """
    CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    """
    
    # Create admin_users table
    admin_table = """
    CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_username (username)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    """
    
    tables = [
        ("blogs", blogs_table),
        ("contact_info", contact_table), 
        ("categories", categories_table),
        ("admin_users", admin_table)
    ]
    
    for table_name, table_query in tables:
        try:
            cursor.execute(table_query)
            print(f"✅ Table '{table_name}' created successfully")
        except Error as e:
            print(f"❌ Error creating table '{table_name}': {e}")

def insert_initial_data(cursor):
    """Insert initial data into tables"""
    
    # Insert default contact information
    contact_query = """
    INSERT IGNORE INTO contact_info (email, phone, linkedin, availability) VALUES 
    (%s, %s, %s, %s)
    """
    contact_data = (
        'julian@drozario.blog', 
        '+971 55 386 8045', 
        'https://www.linkedin.com/in/julian-d-rozario?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app', 
        'Available for consultation'
    )
    
    try:
        cursor.execute(contact_query, contact_data)
        print("✅ Default contact information inserted")
    except Error as e:
        print(f"❌ Error inserting contact info: {e}")
    
    # Insert categories
    categories_data = [
        ('All', 12),
        ('Company Formation', 2),
        ('Immigration', 1),
        ('Technology', 2),
        ('Operations', 1),
        ('Business Development', 1),
        ('Compliance', 1),
        ('M&A', 1),
        ('Finance', 1),
        ('Digital Transformation', 1),
        ('Leadership', 1),
        ('Customer Experience', 1),
        ('Licensing', 2)
    ]
    
    category_query = "INSERT IGNORE INTO categories (name, count) VALUES (%s, %s)"
    try:
        cursor.executemany(category_query, categories_data)
        print("✅ Categories inserted successfully")
    except Error as e:
        print(f"❌ Error inserting categories: {e}")
    
    # Insert default admin user (username: admin, password: admin123)
    admin_query = """
    INSERT IGNORE INTO admin_users (username, password_hash, email) VALUES 
    (%s, %s, %s)
    """
    # Password hash for 'admin123'
    admin_data = (
        'admin', 
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeUVNlwLnN8Omc8Ny',  # admin123
        'admin@drozario.blog'
    )
    
    try:
        cursor.execute(admin_query, admin_data)
        print("✅ Default admin user created (username: admin, password: admin123)")
    except Error as e:
        print(f"❌ Error creating admin user: {e}")
    
    # Insert sample blog posts
    blog_posts = [
        {
            'title': 'Free Zone vs Mainland: Complete Guide to Dubai Business Setup',
            'excerpt': 'Understanding the key differences between Free Zone and Mainland company formation in Dubai and which option suits your business needs.',
            'content': '''Choosing between Free Zone and Mainland company formation is one of the most critical decisions when setting up a business in Dubai. This comprehensive guide will walk you through the key differences, advantages, and considerations for each option.

## Free Zone Company Formation

Free Zones in Dubai offer numerous advantages for international businesses:

### Benefits:
- 100% foreign ownership allowed
- No personal income tax
- No corporate tax for most business activities
- Simplified setup process
- Modern infrastructure and facilities

### Limitations:
- Limited to trading within the free zone or export
- Cannot directly trade in the UAE mainland market
- Office space must be within the free zone

## Mainland Company Formation

Mainland companies offer greater flexibility for local market access:

### Benefits:
- Can trade anywhere in the UAE
- Access to government contracts
- No restrictions on business location
- Can have local sponsors for 100% ownership in certain sectors

### Considerations:
- May require local sponsor or service agent
- More complex regulatory requirements
- Higher setup costs in some cases

## Making the Right Choice

The decision between Free Zone and Mainland depends on your business model, target market, and long-term goals. Consider these factors:

1. **Target Market**: If you plan to serve the local UAE market, Mainland might be better
2. **Business Type**: Some activities are restricted to certain zones
3. **Ownership Structure**: Your preference for ownership control
4. **Budget**: Initial setup and ongoing costs

For personalized advice on which option suits your specific business needs, feel free to reach out for a consultation.''',
            'date': '2024-01-15',
            'read_time': '8 min read',
            'category': 'Company Formation',
            'image_url': 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop',
            'featured': True,
            'tags': '["Dubai Business", "Free Zone", "Mainland", "Company Formation"]',
            'views': 2847,
            'likes': 89
        },
        {
            'title': 'UAE Visa Types for Business Owners: Complete Guide 2024',
            'excerpt': 'Navigate the UAE visa landscape with this comprehensive guide covering investor visas, employment visas, and residency requirements.',
            'content': '''Understanding UAE visa requirements is crucial for business owners and investors looking to establish their presence in the Emirates. This guide covers the most relevant visa types for entrepreneurs and business professionals.

## Investor Visa

The UAE Investor Visa is ideal for business owners who want to invest in the country:

### Requirements:
- Minimum investment of AED 500,000 in a property or business
- Valid for 2-3 years (renewable)
- Allows family sponsorship

### Benefits:
- No sponsor required
- Can live and work in the UAE
- Path to long-term residency

## Employment Visa

For business owners who are employed by their own company:

### Process:
1. Company obtains work permit
2. Employee applies for employment visa
3. Medical tests and Emirates ID
4. Residence visa issuance

### Duration:
- Typically 2-3 years
- Renewable based on employment status

## Golden Visa

The UAE Golden Visa offers long-term residency for qualified investors:

### Categories:
- Real estate investors (minimum AED 2 million)
- Business investors with significant economic contribution
- Entrepreneurs with promising startups

### Benefits:
- 5-10 year renewable visa
- Family inclusion
- No sponsor requirement

## Application Process

1. **Document Preparation**: Gather required documents
2. **Initial Application**: Submit through approved channels
3. **Medical Examination**: Complete required health checks
4. **Approval and Collection**: Receive visa and Emirates ID

## Key Considerations

- Processing times vary by visa type
- Medical insurance is mandatory
- Some visas require continuous residence
- Regular renewal procedures apply

For assistance with your specific visa requirements and application process, professional guidance can help ensure a smooth experience.''',
            'date': '2024-01-10',
            'read_time': '7 min read',
            'category': 'Immigration',
            'image_url': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop',
            'featured': False,
            'tags': '["UAE Visa", "Business Immigration", "Residency", "Dubai"]',
            'views': 1923,
            'likes': 67
        }
    ]
    
    blog_query = """
    INSERT IGNORE INTO blogs (title, excerpt, content, date, read_time, category, author, image_url, featured, tags, views, likes)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    
    for blog in blog_posts:
        try:
            cursor.execute(blog_query, (
                blog['title'],
                blog['excerpt'], 
                blog['content'],
                blog['date'],
                blog['read_time'],
                blog['category'],
                'Julian D\'Rozario',
                blog['image_url'],
                blog['featured'],
                blog['tags'],
                blog['views'],
                blog['likes']
            ))
            print(f"✅ Blog post '{blog['title'][:50]}...' inserted")
        except Error as e:
            print(f"❌ Error inserting blog post: {e}")

def main():
    """Main setup function"""
    print("🚀 Starting Julian Portfolio Database Setup...")
    print(f"📊 Connecting to database: {MYSQL_CONFIG['database']}")
    
    connection = create_connection()
    if not connection:
        return
    
    cursor = connection.cursor()
    
    try:
        print("\n📋 Creating tables...")
        create_tables(cursor)
        
        print("\n📝 Inserting initial data...")
        insert_initial_data(cursor)
        
        print("\n✅ Database setup completed successfully!")
        print("\n🔑 Admin Login Credentials:")
        print("   Username: admin")
        print("   Password: admin123")
        print("\n🌐 Admin Panel URL: http://localhost:3000/julian_portfolio")
        
    except Error as e:
        print(f"❌ Setup error: {e}")
    finally:
        cursor.close()
        connection.close()
        print("\n🔒 Database connection closed")

if __name__ == "__main__":
    main()