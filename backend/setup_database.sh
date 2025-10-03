#!/bin/bash
# Database Setup Script for Hostinger
# This script initializes the MySQL database with schema and migrates data

echo "🚀 Julian D'Rozario Portfolio - MySQL Database Setup"
echo "=================================================="
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ Error: .env file not found"
    exit 1
fi

echo "📋 Configuration:"
echo "  Database: $MYSQL_DATABASE"
echo "  User: $MYSQL_USER"
echo "  Host: $MYSQL_HOST"
echo ""

# Check if mysql command is available
if ! command -v mysql &> /dev/null; then
    echo "❌ Error: mysql command not found"
    echo "   Please install MySQL client or run this script on Hostinger server"
    exit 1
fi

# Create database schema
echo "📊 Creating database schema..."
mysql -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE < database_schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Database schema created successfully"
else
    echo "❌ Error creating database schema"
    exit 1
fi

# Migrate data
echo ""
echo "📦 Migrating blog data..."
python3 migrate_data_to_mysql.py

if [ $? -eq 0 ]; then
    echo "✅ Data migration completed successfully"
else
    echo "❌ Error during data migration"
    exit 1
fi

echo ""
echo "🎉 Database setup completed successfully!"
echo ""
echo "📝 Next steps:"
echo "  1. Restart the backend server: sudo supervisorctl restart backend"
echo "  2. Test API endpoints: curl http://localhost:8001/api/"
echo "  3. Login to admin panel with authorized email"
echo ""
