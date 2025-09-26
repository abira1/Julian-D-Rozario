#!/usr/bin/env python3
"""
Hostinger Upload Preparation Script
This script prepares your files for easy upload to Hostinger
"""

import os
import shutil
import zipfile
from pathlib import Path

def create_hostinger_package():
    """Create a package ready for Hostinger upload"""
    
    print("🚀 Preparing files for Hostinger deployment...")
    
    # Check if build directory exists
    build_dir = Path("frontend/build")
    if not build_dir.exists():
        print("❌ Build directory not found. Please run 'cd frontend && npm run build' first")
        return False
    
    # Create deployment package directory
    deploy_dir = Path("hostinger_deploy")
    if deploy_dir.exists():
        shutil.rmtree(deploy_dir)
    deploy_dir.mkdir()
    
    # Copy build files to deployment directory
    print("📋 Copying build files...")
    for item in build_dir.iterdir():
        if item.is_file():
            shutil.copy2(item, deploy_dir / item.name)
            print(f"  ✅ Copied: {item.name}")
        elif item.is_dir():
            shutil.copytree(item, deploy_dir / item.name)
            print(f"  ✅ Copied folder: {item.name}/")
    
    # Create zip file for easy upload
    print("📦 Creating zip file for upload...")
    with zipfile.ZipFile("hostinger_upload.zip", 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(deploy_dir):
            for file in files:
                file_path = Path(root) / file
                arcname = file_path.relative_to(deploy_dir)
                zipf.write(file_path, arcname)
    
    print("\n🎉 Files prepared successfully!")
    print("\n📋 UPLOAD INSTRUCTIONS:")
    print("="*50)
    print("Option 1 - Individual Files:")
    print(f"  - Upload ALL files from '{deploy_dir}/' to your Hostinger public_html/")
    print("\nOption 2 - Zip Upload:")
    print("  - Upload 'hostinger_upload.zip' to Hostinger")
    print("  - Extract it in public_html/ folder")
    print("\n📁 Files to upload:")
    
    # List files that will be uploaded
    for item in deploy_dir.rglob("*"):
        if item.is_file():
            print(f"  📄 {item.relative_to(deploy_dir)}")
    
    return True

def check_environment():
    """Check if environment is properly configured"""
    print("\n🔍 Checking environment configuration...")
    
    env_file = Path("frontend/.env.production")
    if env_file.exists():
        print("✅ Production environment file exists")
        with open(env_file, 'r') as f:
            content = f.read()
            if "REACT_APP_BACKEND_URL" in content:
                print("✅ Backend URL configured")
            else:
                print("⚠️  Backend URL not configured - you'll need to set this after Railway deployment")
    else:
        print("⚠️  No production environment file found")
    
    # Check if package.json exists
    package_json = Path("frontend/package.json")
    if package_json.exists():
        print("✅ Frontend package.json found")
    else:
        print("❌ Frontend package.json not found")

def main():
    print("🌐 Hostinger Deployment Preparation")
    print("="*40)
    
    # Check current directory
    if not Path("frontend").exists():
        print("❌ Please run this script from the project root directory")
        return
    
    # Check environment
    check_environment()
    
    # Create deployment package
    success = create_hostinger_package()
    
    if success:
        print("\n🚀 NEXT STEPS:")
        print("1. 📤 Upload files to Hostinger public_html/")
        print("2. 🚀 Deploy backend to Railway")
        print("3. 🔄 Update frontend with Railway URL and re-upload")
        print("4. 🔐 Configure Firebase authentication")
        print("5. 🧪 Test your website")
        print("\nDetailed instructions are in 'HOSTINGER_DEPLOYMENT_STEPS.md'")

if __name__ == "__main__":
    main()