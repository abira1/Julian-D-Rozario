# 🗄️ Database Setup Guide for Hostinger (MySQL)

This guide will help you set up the MySQL database for your Julian D'Rozario Portfolio website on **Hostinger Business Plan**.

---

## 📋 Prerequisites

- Hostinger Business Plan account
- Access to cPanel/hPanel
- phpMyAdmin access

---

## 🚀 Step-by-Step Setup

### Step 1: Access MySQL Database Manager

1. Log in to your **Hostinger** account
2. Go to **hPanel** (Hostinger Control Panel)
3. Navigate to **Databases** → **MySQL Databases**

### Step 2: Create a New Database

1. Click **"Create New Database"**
2. Enter database name: `julian_portfolio` (or your preferred name)
3. Click **"Create"**
4. **Note down the database name** - you'll need it later

### Step 3: Create Database User

1. Scroll down to **"MySQL Users"** section
2. Click **"Create New User"**
3. Enter username: `julian_admin` (or your preferred username)
4. Enter a strong password
5. Click **"Create User"**
6. **Important:** Save these credentials securely!

### Step 4: Assign User to Database

1. Scroll to **"Add User to Database"** section
2. Select the user you just created
3. Select the database you created
4. Check **"ALL PRIVILEGES"**
5. Click **"Add"**

### Step 5: Access phpMyAdmin

1. Go back to hPanel
2. Navigate to **Databases** → **phpMyAdmin**
3. Select your database from the left sidebar

### Step 6: Run the Migration Script

1. In phpMyAdmin, click on your database name (left sidebar)
2. Click on the **"SQL"** tab at the top
3. Open the file `/app/database_migration.sql` from your project
4. **Copy the entire SQL script**
5. **Paste it into the SQL tab** in phpMyAdmin
6. Click **"Go"** button at the bottom right
7. Wait for the script to execute (should take a few seconds)
8. You should see a success message!

### Step 7: Verify Tables Creation

1. In phpMyAdmin left sidebar, click on your database
2. You should see **6 tables**:
   - `blogs`
   - `contact_info`
   - `user_profiles`
   - `blog_likes`
   - `blog_saves`
   - `blog_comments`

3. Click on each table to verify structure
4. Sample data should be automatically inserted!

---

## 🔧 Backend Configuration

### Update `.env` File on Server

1. Connect to your Hostinger via FTP/SFTP or File Manager
2. Navigate to your backend directory
3. Edit the `.env` file:

```env
# Database Configuration
DATABASE_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=julian_admin
MYSQL_PASSWORD=your_strong_password_here
MYSQL_DATABASE=julian_portfolio

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=24

# Authorized Admin Emails (comma-separated)
AUTHORIZED_ADMIN_EMAILS=juliandrozario@gmail.com,abirsabirhossain@gmail.com

# Environment
ENVIRONMENT=production
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Important:** Replace the following:
- `your_strong_password_here` → Your actual MySQL password
- `your-super-secret-key-change-this-in-production` → Generate a random secret key
- Email addresses → Add your actual admin email(s)
- `yourdomain.com` → Your actual domain name

---

## 🌐 Finding Your MySQL Connection Details

### Method 1: From hPanel

1. Go to hPanel → **Databases** → **MySQL Databases**
2. Under "Current Databases" section, you'll find:
   - **Database Name**
   - **Username**
   - **Host** (usually `localhost` or specific hostname)

### Method 2: From Hosting Setup Email

Hostinger sends an email with database details when you create a database.

---

## 🔐 Security Best Practices

### 1. Strong Password
Generate a strong password for your MySQL user:
```bash
# Example strong password (don't use this exact one!)
Xy9$mK2@pLq7#nR8
```

### 2. JWT Secret Key
Generate a secure JWT secret:
```bash
# Example (generate your own!)
openssl rand -base64 32
```

### 3. Restrict Admin Access
Only add trusted email addresses to `AUTHORIZED_ADMIN_EMAILS`

### 4. CORS Origins
Only allow your actual domain in `CORS_ORIGINS`

---

## ✅ Testing the Connection

### Test Database Connection:

1. Create a test PHP file on your server: `test_db.php`

```php
<?php
$host = 'localhost';
$user = 'julian_admin';
$pass = 'your_password';
$db = 'julian_portfolio';

$conn = mysqli_connect($host, $user, $pass, $db);

if ($conn) {
    echo "✅ Database connected successfully!";
    
    // Test query
    $result = mysqli_query($conn, "SELECT COUNT(*) as count FROM blogs");
    $row = mysqli_fetch_assoc($result);
    echo "<br>Total blogs: " . $row['count'];
    
    mysqli_close($conn);
} else {
    echo "❌ Connection failed: " . mysqli_connect_error();
}
?>
```

2. Access via browser: `https://yourdomain.com/test_db.php`
3. You should see "Database connected successfully!"
4. **Delete the test file after verification!**

---

## 🐛 Troubleshooting

### Error: "Access denied for user"
**Solution:** 
- Verify username and password in `.env` file
- Ensure user has ALL PRIVILEGES on the database
- Check if user is assigned to the correct database

### Error: "Unknown database"
**Solution:**
- Verify database name is correct
- Ensure database was created successfully
- Check for typos in database name

### Error: "Can't connect to MySQL server"
**Solution:**
- Verify MySQL host (usually `localhost`)
- Check if MySQL service is running
- Contact Hostinger support if issue persists

### Error: "Too many connections"
**Solution:**
- Close unused database connections
- Check connection pool settings
- Contact Hostinger to increase connection limit

---

## 📊 Database Backup (Important!)

### Manual Backup via phpMyAdmin:

1. Open phpMyAdmin
2. Select your database
3. Click **"Export"** tab
4. Choose **"Quick"** export method
5. Format: **SQL**
6. Click **"Go"**
7. Save the `.sql` file securely

### Automated Backup:

Set up automated backups in Hostinger:
1. Go to hPanel
2. Navigate to **"Backups"**
3. Enable automated daily backups
4. Choose backup retention period

**Backup Schedule Recommendation:** Daily backups for production!

---

## 🔄 Database Migration (Future Updates)

When you need to add new features or modify tables:

1. Create a new migration SQL file
2. Test on local SQLite first
3. Create backup of production database
4. Run migration script in phpMyAdmin
5. Verify changes
6. Test application functionality

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Hostinger documentation
3. Contact Hostinger support (24/7 available)
4. Check application logs for error details

---

## 🎉 Success!

Once setup is complete, your portfolio website will:

✅ Store all blog posts in MySQL
✅ Track user interactions (likes, saves, comments)
✅ Manage user profiles via Firebase + MySQL
✅ Handle contact information
✅ Support admin operations

---

## 📝 Quick Reference

**Database Type:** MySQL 8.0+
**Tables:** 6 (blogs, contact_info, user_profiles, blog_likes, blog_saves, blog_comments)
**Sample Data:** Automatically inserted
**Character Set:** UTF-8 (utf8mb4_unicode_ci)
**Engine:** InnoDB (supports foreign keys and transactions)

---

## 🚀 Next Steps After Setup

1. ✅ Verify all tables created
2. ✅ Update backend `.env` file
3. ✅ Test database connection
4. ✅ Restart backend service
5. ✅ Test user login and profile features
6. ✅ Create your first blog post via admin panel
7. ✅ Set up automated backups

---

**Created for:** Julian D'Rozario Portfolio
**Database Schema Version:** 2.0.0
**Last Updated:** 2025

---

Need help? All configuration files are ready. Just follow the steps above! 🎯
