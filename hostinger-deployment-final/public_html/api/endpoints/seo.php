<?php
/**
 * SEO Endpoints
 */

function generateSitemap() {
    $pdo = getDBConnection();
    
    $stmt = $pdo->query("
        SELECT id, slug, title, updated_at 
        FROM blogs 
        WHERE status = 'published' 
        ORDER BY updated_at DESC
    ");
    $blogs = $stmt->fetchAll();
    
    header('Content-Type: application/xml');
    
    echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
    
    // Homepage
    echo "  <url>\n";
    echo "    <loc>" . SITE_URL . "/</loc>\n";
    echo "    <lastmod>" . date('Y-m-d') . "</lastmod>\n";
    echo "    <changefreq>weekly</changefreq>\n";
    echo "    <priority>1.0</priority>\n";
    echo "  </url>\n";
    
    // Blog listing
    echo "  <url>\n";
    echo "    <loc>" . SITE_URL . "/blog</loc>\n";
    echo "    <lastmod>" . date('Y-m-d') . "</lastmod>\n";
    echo "    <changefreq>daily</changefreq>\n";
    echo "    <priority>0.9</priority>\n";
    echo "  </url>\n";
    
    // Individual blogs
    foreach ($blogs as $blog) {
        $blogUrl = SITE_URL . "/blog/" . ($blog['slug'] ?? $blog['id']);
        $updated = date('Y-m-d', strtotime($blog['updated_at']));
        
        echo "  <url>\n";
        echo "    <loc>" . htmlspecialchars($blogUrl) . "</loc>\n";
        echo "    <lastmod>$updated</lastmod>\n";
        echo "    <changefreq>monthly</changefreq>\n";
        echo "    <priority>0.8</priority>\n";
        echo "  </url>\n";
    }
    
    echo '</urlset>';
    exit();
}

function generateRobotsTxt() {
    header('Content-Type: text/plain');
    
    echo "User-agent: *\n";
    echo "Allow: /\n";
    echo "Disallow: /julian_portfolio/\n";
    echo "Disallow: /api/\n";
    echo "\n";
    echo "Sitemap: " . SITE_URL . "/sitemap.xml\n";
    
    exit();
}