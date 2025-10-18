<?php
/**
 * Database Connection Test Script
 * 
 * PURPOSE: Test if PHP can connect to MySQL database
 * USAGE: Upload to public_html folder and access via browser
 * URL: https://drozario.blog/test_connection.php
 * 
 * ⚠️ IMPORTANT: DELETE THIS FILE AFTER TESTING!
 */

// Database credentials
$host = 'localhost';
$user = 'u691568332_Juliandrozario';
$pass = 'Toiral185#4';
$db = 'u691568332_toiraldbhub';

echo "<html><head><title>Database Connection Test</title>";
echo "<style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
    .success { color: #10b981; border: 2px solid #10b981; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .error { color: #ef4444; border: 2px solid #ef4444; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .info { color: #3b82f6; border: 2px solid #3b82f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .warning { color: #f59e0b; border: 2px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { text-align: left; padding: 12px; border: 1px solid #ddd; }
    th { background-color: #f3f4f6; }
    code { background-color: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
</style></head><body>";

echo "<h1>🔌 Database Connection Test</h1>";
echo "<p><strong>Testing connection to:</strong> $db @ $host</p>";

// Step 1: Test PDO availability
echo "<h2>Step 1: Check PHP PDO Extension</h2>";
if (class_exists('PDO')) {
    echo "<div class='success'>✅ PDO extension is available</div>";
} else {
    echo "<div class='error'>❌ PDO extension is not available. Contact hosting support.</div>";
    exit;
}

// Step 2: Test MySQL connection
echo "<h2>Step 2: Test MySQL Connection</h2>";
try {
    $dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    echo "<div class='success'>✅ Successfully connected to database: <code>$db</code></div>";
    
    // Step 3: Check tables
    echo "<h2>Step 3: Check Database Tables</h2>";
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (count($tables) > 0) {
        echo "<div class='success'>✅ Found " . count($tables) . " tables in database</div>";
        echo "<table>";
        echo "<tr><th>Table Name</th><th>Row Count</th></tr>";
        
        $requiredTables = ['blogs', 'user_profiles', 'contact_info', 'blog_likes', 'blog_saves', 'blog_comments'];
        
        foreach ($tables as $table) {
            try {
                $countStmt = $pdo->query("SELECT COUNT(*) as count FROM `$table`");
                $count = $countStmt->fetch()['count'];
                $status = in_array($table, $requiredTables) ? ' ✅' : '';
                echo "<tr><td>$table$status</td><td>$count rows</td></tr>";
            } catch (Exception $e) {
                echo "<tr><td>$table</td><td><span style='color:#ef4444;'>Error: " . $e->getMessage() . "</span></td></tr>";
            }
        }
        echo "</table>";
        
        // Check for missing required tables
        $missingTables = array_diff($requiredTables, $tables);
        if (count($missingTables) > 0) {
            echo "<div class='warning'>⚠️ Missing required tables: " . implode(', ', $missingTables) . "</div>";
            echo "<div class='info'>💡 <strong>Solution:</strong> Import the database schema from <code>database_schema.sql</code> via phpMyAdmin</div>";
        }
    } else {
        echo "<div class='error'>❌ No tables found in database</div>";
        echo "<div class='info'>💡 <strong>Solution:</strong> Import the database schema from <code>database_schema.sql</code> via phpMyAdmin</div>";
    }
    
    // Step 4: Test blogs table specifically
    if (in_array('blogs', $tables)) {
        echo "<h2>Step 4: Check Blogs Data</h2>";
        $stmt = $pdo->query("SELECT id, title, status FROM blogs LIMIT 5");
        $blogs = $stmt->fetchAll();
        
        if (count($blogs) > 0) {
            echo "<div class='success'>✅ Found " . count($blogs) . " sample blogs (showing first 5)</div>";
            echo "<table>";
            echo "<tr><th>ID</th><th>Title</th><th>Status</th></tr>";
            foreach ($blogs as $blog) {
                echo "<tr><td>{$blog['id']}</td><td>{$blog['title']}</td><td>{$blog['status']}</td></tr>";
            }
            echo "</table>";
        } else {
            echo "<div class='warning'>⚠️ Blogs table exists but has no data</div>";
            echo "<div class='info'>💡 <strong>Solution:</strong> Run the INSERT statements from <code>database_schema.sql</code> via phpMyAdmin</div>";
        }
    }
    
    // Step 5: Final summary
    echo "<h2>✅ Connection Test Complete</h2>";
    echo "<div class='success'>";
    echo "<p><strong>Status:</strong> Database connection is working!</p>";
    echo "<p><strong>Next steps:</strong></p>";
    echo "<ol>";
    echo "<li>If all required tables exist and have data, your database is ready ✅</li>";
    echo "<li>If tables are missing, import <code>database_schema.sql</code> via phpMyAdmin</li>";
    echo "<li>Test the API endpoints at <a href='/api/' target='_blank'>/api/</a></li>";
    echo "<li><strong style='color:#ef4444;'>DELETE THIS FILE (test_connection.php) after testing for security!</strong></li>";
    echo "</ol>";
    echo "</div>";
    
} catch (PDOException $e) {
    echo "<div class='error'>";
    echo "<h3>❌ Connection Failed</h3>";
    echo "<p><strong>Error:</strong> " . $e->getMessage() . "</p>";
    echo "<p><strong>Possible causes:</strong></p>";
    echo "<ul>";
    echo "<li>Database credentials are incorrect</li>";
    echo "<li>Database does not exist on the server</li>";
    echo "<li>MySQL server is not accessible from this host</li>";
    echo "<li>Firewall or security settings blocking connection</li>";
    echo "</ul>";
    echo "<p><strong>Solution:</strong> Check database credentials in Hostinger panel → Databases section</p>";
    echo "</div>";
}

echo "<hr><div class='warning'>";
echo "<h3>⚠️ Security Warning</h3>";
echo "<p><strong>IMPORTANT:</strong> This test file contains sensitive information. Delete it immediately after verifying the connection!</p>";
echo "<p>To delete: Access Hostinger File Manager → public_html → Delete <code>test_connection.php</code></p>";
echo "</div>";

echo "</body></html>";
?>
