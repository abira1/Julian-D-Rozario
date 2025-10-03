#!/bin/bash
# Manual Database Restore Script for Julian D'Rozario Portfolio
# Usage: ./restore_database.sh <backup_file.sql.gz>

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "Usage: ./restore_database.sh <backup_file.sql.gz>"
    echo "Available backups:"
    ls -lh ./backups/portfolio_backup_*.sql.gz 2>/dev/null || echo "  No backups found"
    exit 1
fi

# Load environment variables
source .env

BACKUP_FILE=$1

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Confirm restore
read -p "This will restore database $MYSQL_DATABASE from $BACKUP_FILE. Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restore cancelled"
    exit 0
fi

# Decompress and restore
echo "Restoring database..."
gunzip < $BACKUP_FILE | mysql -h $MYSQL_HOST \
    -u $MYSQL_USER \
    -p$MYSQL_PASSWORD \
    $MYSQL_DATABASE

# Check if restore was successful
if [ $? -eq 0 ]; then
    echo "Database restored successfully from $BACKUP_FILE"
else
    echo "Restore failed!"
    exit 1
fi