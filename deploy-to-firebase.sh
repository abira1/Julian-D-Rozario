#!/bin/bash

# Firebase Deployment Script for Julian D'Rozario Portfolio
# This script builds and deploys the frontend to Firebase Hosting

set -e

echo "🚀 Starting Firebase Deployment Process..."
echo ""

# Navigate to frontend directory
cd /app/frontend

# Step 1: Build the production version
echo "📦 Step 1/3: Building production version..."
yarn build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

echo "✅ Build completed successfully!"
echo ""

# Step 2: Deploy to Firebase Hosting
echo "🔥 Step 2/3: Deploying to Firebase Hosting..."
echo ""
echo "⚠️  IMPORTANT: You need to be logged in to Firebase CLI"
echo "If deployment fails, please run: firebase login"
echo ""

firebase deploy --only hosting

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Deployment failed!"
    echo ""
    echo "Troubleshooting steps:"
    echo "1. Make sure you're logged in: firebase login"
    echo "2. Check your Firebase project: firebase projects:list"
    echo "3. Try deploying manually: firebase deploy --only hosting"
    exit 1
fi

echo ""
echo "✅ Deployment completed successfully!"
echo ""

# Step 3: Deploy database rules
echo "📋 Step 3/3: Deploying Firebase Realtime Database rules..."
firebase deploy --only database

if [ $? -ne 0 ]; then
    echo "⚠️  Database rules deployment failed (non-critical)"
else
    echo "✅ Database rules deployed successfully!"
fi

echo ""
echo "🎉 All done! Your site should be live at:"
echo "https://julian-d-rozario.web.app"
echo ""
echo "To view your site:"
echo "firebase hosting:channel:open live"
echo ""
