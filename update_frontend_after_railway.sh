#!/bin/bash
# Run these commands AFTER you get your Railway URL

echo "🔄 Updating frontend with Railway URL..."

# 1. Update the environment file with your actual Railway URL
# Edit frontend/.env.production and replace with your real Railway URL

# 2. Rebuild frontend
cd frontend
npm run build

# 3. Prepare new upload package
cd ..
python prepare_hostinger_upload.py

echo "✅ Frontend updated! Upload the new files to Hostinger."