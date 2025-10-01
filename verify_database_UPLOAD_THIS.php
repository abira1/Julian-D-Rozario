<?php
header('Content-Type: text/html; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 1);
?>
<!DOCTYPE html>
<html>
<head>
    <title>Database Verification - drozario.blog</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
        .success { color: #22c55e; background: #dcfce7; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .error { color: #ef4444; background: #fef2f2; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .info { color: #3b82f6; background: #eff6ff; padding: 10px; border-radius: 5px; margin: 10px 0; }
        h1 { color: #7c3aed; }
        h2 { color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
        th { background: #f9fafb; }
    </style>
</head>
<body>
    <div class='container'>
        <h1>🔍 Database Verification - drozario.blog</h1>

<?php
// Database connection
$host = 'localhost';
$username = 'u691568332_Dataubius';
$password = 'gAJ#6kF*2L';
$database = 'u691568332_Dataubius';

try {
    $conn = new mysqli($host, $username, $password, $database);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    echo "<div class='success'>✅ Database connection successful!</div>";
    echo "<div class='info'>📊 Connected to: $database</div>";
    
    // Check tables
    $tables = ['users', 'blogs', 'categories', 'blog_stats', 'blog_interactions', 'blog_comments'];
    $all_exist = true;
    
    echo "<h2>📋 Table Status</h2>";
    echo "<table>";
    echo "<tr><th>Table</th><th>Status</th><th>Records</th></tr>";
    
    foreach ($tables as $table) {
        $result = $conn->query("SHOW TABLES LIKE '$table'");
        if ($result && $result->num_rows > 0) {
            $count_result = $conn->query("SELECT COUNT(*) as count FROM $table");
            $count = $count_result ? $count_result->fetch_assoc()['count'] : 0;
            echo "<tr><td>$table</td><td style='color: green;'>✅ EXISTS</td><td>$count</td></tr>";
        } else {
            $all_exist = false;
            echo "<tr><td>$table</td><td style='color: red;'>❌ MISSING</td><td>-</td></tr>";
        }
    }
    echo "</table>";
    
    // Upload directory check
    echo "<h2>🖼️ Upload System</h2>";
    $upload_dir = 'uploads';
    if (is_dir($upload_dir)) {
        echo "<div class='success'>✅ Upload directory exists</div>";
    } else {
        echo "<div class='error'>❌ Upload directory missing</div>";
    }
    
    // API endpoints check
    echo "<h2>🔧 API Endpoints</h2>";
    $endpoints = [
        'api/index.php' => 'Main API',
        'api_premium_blog.php' => 'Premium Blog API'
    ];
    
    echo "<table>";
    echo "<tr><th>File</th><th>Status</th></tr>";
    foreach ($endpoints as $file => $desc) {
        if (file_exists($file)) {
            echo "<tr><td>$desc</td><td style='color: green;'>✅ EXISTS</td></tr>";
        } else {
            echo "<tr><td>$desc</td><td style='color: red;'>❌ MISSING</td></tr>";
        }
    }
    echo "</table>";
    
    // Summary
    echo "<h2>📋 Summary</h2>";
    if ($all_exist) {
        echo "<div class='success'>🎉 System is ready!</div>";
        echo "<div class='info'>";
        echo "<strong>Next Steps:</strong><br>";
        echo "• Test banner upload: <a href='test_banner_upload.html'>test_banner_upload.html</a><br>";
        echo "• Admin panel: <a href='julian_portfolio'>julian_portfolio</a><br>";
        echo "• View blog: <a href='blog/1'>blog/1</a>";
        echo "</div>";
    } else {
        echo "<div class='error'>⚠️ Some tables missing - run database setup</div>";
    }
    
    $conn->close();
    
} catch (Exception $e) {
    echo "<div class='error'>❌ Error: " . $e->getMessage() . "</div>";
}
?>

    <hr>
    <div class='info'>
        <strong>System Info:</strong><br>
        PHP: <?php echo phpversion(); ?><br>
        Time: <?php echo date('Y-m-d H:i:s'); ?>
    </div>
    </div>
</body>
</html>