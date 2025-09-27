<?php
/**
 * Hostinger MySQL Database Setup
 * Run this once to create all required tables
 */

// UPDATE THESE WITH YOUR HOSTINGER MYSQL CREDENTIALS
$db_config = [
    'host' => 'localhost',
    'username' => 'your_hostinger_mysql_user',     // e.g. u123456789_julian
    'password' => 'your_hostinger_mysql_password', // Your MySQL password
    'database' => 'your_hostinger_database_name'   // e.g. u123456789_julian_portfolio
];

try {
    echo "🚀 Setting up Hostinger MySQL Database...\n";
    
    // Connect to database
    $pdo = new PDO(
        "mysql:host={$db_config['host']};dbname={$db_config['database']};charset=utf8mb4",
        $db_config['username'],
        $db_config['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ]
    );
    
    echo "✅ Database connection successful!\n";
    
    // Create blogs table
    $blogs_table = "
        CREATE TABLE IF NOT EXISTS blogs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(500) NOT NULL,
            excerpt TEXT NOT NULL,
            content LONGTEXT NOT NULL,
            date DATE NOT NULL,
            read_time VARCHAR(20) NOT NULL DEFAULT '5 min read',
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
    ";
    
    $pdo->exec($blogs_table);
    echo "✅ Created 'blogs' table\n";
    
    // Create admin_users table
    $admin_table = "
        CREATE TABLE IF NOT EXISTS admin_users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(255) NOT NULL UNIQUE,
            firebase_uid VARCHAR(255),
            last_login TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_username (username),
            INDEX idx_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $pdo->exec($admin_table);
    echo "✅ Created 'admin_users' table\n";
    
    // Create contact_info table
    $contact_table = "
        CREATE TABLE IF NOT EXISTS contact_info (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(50) NOT NULL,
            linkedin TEXT,
            availability VARCHAR(255) NOT NULL DEFAULT 'Available for consultation',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $pdo->exec($contact_table);
    echo "✅ Created 'contact_info' table\n";
    
    // Insert admin users
    $admin_insert = "
        INSERT IGNORE INTO admin_users (username, email) VALUES 
        ('julian', 'juliandrozario@gmail.com'),
        ('abir', 'abirsabirhossain@gmail.com')
    ";
    
    $pdo->exec($admin_insert);
    echo "✅ Added admin users\n";
    
    // Insert sample contact info
    $contact_insert = "
        INSERT IGNORE INTO contact_info (email, phone, linkedin) VALUES 
        ('juliandrozario@gmail.com', '+1-234-567-8900', 'https://linkedin.com/in/juliandrozario')
    ";
    
    $pdo->exec($contact_insert);
    echo "✅ Added sample contact info\n";
    
    // Insert sample blog post
    $sample_blog = "
        INSERT IGNORE INTO blogs (title, excerpt, content, date, category, tags) VALUES 
        ('Welcome to Julian D''Rozario Portfolio', 
         'Discover expert business consultation services for UAE market expansion and growth.',
         '<h2>Welcome to My Portfolio</h2><p>I''m Julian D''Rozario, a business consultant specializing in UAE market expansion, regulatory compliance, and strategic growth planning.</p><h3>Services Offered:</h3><ul><li>Business Formation in UAE</li><li>Market Entry Strategy</li><li>Regulatory Compliance</li><li>Strategic Planning</li></ul>',
         CURDATE(),
         'Business Strategy',
         '[\"UAE Business\", \"Consultation\", \"Market Entry\"]')
    ";
    
    $pdo->exec($sample_blog);
    echo "✅ Added sample blog post\n";
    
    echo "\n🎉 Database setup completed successfully!\n";
    echo "\n📋 Next Steps:\n";
    echo "1. Update database credentials in api/index.php\n";
    echo "2. Upload api/ folder to your Hostinger public_html/\n";
    echo "3. Upload frontend files to public_html/\n";
    echo "4. Test your website!\n";
    
} catch (PDOException $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>