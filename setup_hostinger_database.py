#!/usr/bin/env python3
"""
Interactive Hostinger MySQL Setup
This script will help you set up your database step by step
"""

import mysql.connector
from mysql.connector import Error
import getpass

def get_hostinger_credentials():
    """Get MySQL credentials from user"""
    print("🔐 Enter your Hostinger MySQL Database Credentials")
    print("(You can find these in your Hostinger control panel > MySQL Databases)")
    print("")
    
    host = input("MySQL Host (usually 'localhost' or provided by Hostinger): ").strip()
    database = input("Database Name: ").strip()
    username = input("MySQL Username: ").strip()
    password = getpass.getpass("MySQL Password: ")
    
    return {
        'host': host,
        'user': username,
        'password': password,
        'database': database,
        'port': 3306,
        'charset': 'utf8mb4',
        'autocommit': True
    }

def test_connection(config):
    """Test database connection"""
    try:
        print("\n🔍 Testing database connection...")
        connection = mysql.connector.connect(**config)
        print("✅ Database connection successful!")
        return connection
    except Error as e:
        print(f"❌ Connection failed: {e}")
        return None

def create_tables(connection):
    """Create all required tables"""
    cursor = connection.cursor()
    
    try:
        print("\n📋 Creating database tables...")
        
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
            author VARCHAR(100) NOT NULL DEFAULT 'Julian D\'Rozario',
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
        print("✅ Created 'blogs' table")
        
        cursor.execute(admin_table)
        print("✅ Created 'admin_users' table")
        
        cursor.execute(contact_table)
        print("✅ Created 'contact_info' table")
        
        # Insert admin users (your Google emails)
        print("\n👤 Adding admin users...")
        admin_insert = """
        INSERT IGNORE INTO admin_users (username, email) VALUES 
        ('julian', 'juliandrozario@gmail.com'),
        ('abir', 'abirsabirhossain@gmail.com')
        """
        cursor.execute(admin_insert)
        
        # Insert sample contact info
        contact_insert = """
        INSERT IGNORE INTO contact_info (email, phone, linkedin) VALUES 
        ('juliandrozario@gmail.com', '+1-234-567-8900', 'https://linkedin.com/in/juliandrozario')
        """
        cursor.execute(contact_insert)
        
        print("✅ Admin users added successfully!")
        print("✅ Sample contact info added!")
        
        connection.commit()
        return True
        
    except Error as e:
        print(f"❌ Error creating tables: {e}")
        return False
    finally:
        cursor.close()

def save_env_file(config):
    """Save database configuration to .env file"""
    env_content = f"""# Hostinger MySQL Configuration
MYSQL_HOST={config['host']}
MYSQL_USER={config['user']}
MYSQL_PASSWORD={config['password']}
MYSQL_DATABASE={config['database']}
MYSQL_PORT=3306
JWT_SECRET_KEY=julian-portfolio-super-secret-jwt-key-2024-hostinger-production
"""
    
    with open('.env.hostinger', 'w') as f:
        f.write(env_content)
    
    print("✅ Configuration saved to '.env.hostinger'")

def main():
    print("🚀 Julian Portfolio - Hostinger MySQL Setup")
    print("=" * 50)
    
    # Get credentials
    config = get_hostinger_credentials()
    
    # Test connection
    connection = test_connection(config)
    if not connection:
        print("\n❌ Setup failed. Please check your credentials and try again.")
        print("Make sure your database exists in Hostinger control panel.")
        return
    
    # Create tables
    if create_tables(connection):
        print("\n🎉 Database setup completed successfully!")
        
        # Save configuration
        save_env_file(config)
        
        print("\n📋 Next Steps:")
        print("1. ✅ Database is ready")
        print("2. 📤 Deploy backend to Railway")
        print("3. 🌐 Build and upload frontend to Hostinger")
        print("4. 🔐 Test Google authentication")
        
    else:
        print("\n❌ Database setup failed. Please check the errors above.")
    
    connection.close()

if __name__ == "__main__":
    main()