#!/bin/bash
# Manual Database Backup Script for Julian D'Rozario Portfolio
# Usage: ./backup_database.sh

# Load environment variables
source .env

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/portfolio_backup_$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Perform backup
echo "Starting database backup..."
mysqldump -h $MYSQL_HOST \
    -u $MYSQL_USER \
    -p$MYSQL_PASSWORD \
    $MYSQL_DATABASE \
    --single-transaction \
    --quick \
    --lock-tables=false \
    > $BACKUP_FILE

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup successful: $BACKUP_FILE"
    
    # Compress backup
    gzip $BACKUP_FILE
    echo "Backup compressed: $BACKUP_FILE.gz"
    
    # Keep only last 7 backups
    ls -t $BACKUP_DIR/portfolio_backup_*.sql.gz | tail -n +8 | xargs -r rm
    echo "Old backups cleaned up (keeping last 7)"
else
    echo "Backup failed!"
    exit 1
fi