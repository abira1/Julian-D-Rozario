#!/usr/bin/env python3
"""
Quick setup script for Hostinger MySQL
Run this once to create all tables
"""

import mysql.connector
from mysql.connector import Error

# UPDATE THESE WITH YOUR HOSTINGER MYSQL CREDENTIALS
HOSTINGER_MYSQL_CONFIG = {
    'host': 'localhost',  # or your Hostinger MySQL host
    'user': 'your_hostinger_mysql_user',
    'password': 'your_hostinger_mysql_password', 
    'database': 'your_hostinger_database_name',
    'port': 3306,
    'charset': 'utf8mb4',
    'autocommit': True
}

def setup_hostinger_database():
    """Setup database for Hostinger hosting"""
    try:
        connection = mysql.connector.connect(**HOSTINGER_MYSQL_CONFIG)
        cursor = connection.cursor()
        
        print("✅ Connected to Hostinger MySQL!")
        
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
            INDEX idx_date (date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
        
        # Create admin_users table  
        admin_table = """
        CREATE TABLE IF NOT EXISTS admin_users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(255) NOT NULL,
            firebase_uid VARCHAR(255),
            last_login TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_username (username),
            INDEX idx_email (email)
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
        
        # Execute table creation
        cursor.execute(blogs_table)
        cursor.execute(admin_table)
        cursor.execute(contact_table)
        
        print("✅ All tables created successfully!")
        
        # Insert admin users (your Google emails)
        admin_insert = """
        INSERT IGNORE INTO admin_users (username, email) VALUES 
        ('julian', 'juliandrozario@gmail.com'),
        ('abir', 'abirsabirhossain@gmail.com')
        """
        cursor.execute(admin_insert)
        
        print("✅ Admin users added!")
        print("🎉 Hostinger database setup complete!")
        
    except Error as e:
        print(f"❌ Database error: {e}")
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    setup_hostinger_database()