#!/usr/bin/env python3
"""
Complete Hostinger Deployment Preparation
Prepares both frontend and backend for Hostinger upload
"""

import os
import shutil
import zipfile
from pathlib import Path

def create_hostinger_complete_package():
    """Create complete package for Hostinger deployment"""
    
    print("🚀 Preparing complete Hostinger deployment package...")
    
    # Check if build directory exists
    build_dir = Path("frontend/build")
    if not build_dir.exists():
        print("❌ Frontend build not found. Building now...")
        os.system("cd frontend && npm run build")
        if not build_dir.exists():
            print("❌ Frontend build failed. Please run 'cd frontend && npm run build' manually")
            return False
    
    # Create deployment package directory
    deploy_dir = Path("hostinger_complete_deploy")
    if deploy_dir.exists():
        shutil.rmtree(deploy_dir)
    deploy_dir.mkdir()
    
    print("📋 Copying frontend files...")
    # Copy frontend build files to deployment directory
    for item in build_dir.iterdir():
        if item.is_file():
            shutil.copy2(item, deploy_dir / item.name)
            print(f"  ✅ Copied: {item.name}")
        elif item.is_dir():
            shutil.copytree(item, deploy_dir / item.name)
            print(f"  ✅ Copied folder: {item.name}/")
    
    print("📋 Copying backend API...")
    # Copy API files
    api_source = Path("api")
    api_dest = deploy_dir / "api"
    if api_source.exists():
        shutil.copytree(api_source, api_dest)
        print(f"  ✅ Copied API folder")
    else:
        print("  ⚠️  API folder not found - make sure api/index.php exists")
    
    # Copy database setup script
    setup_script = Path("setup_hostinger_mysql.php")
    if setup_script.exists():
        shutil.copy2(setup_script, deploy_dir / setup_script.name)
        print(f"  ✅ Copied database setup script")
    
    # Create zip file for easy upload
    print("📦 Creating zip file for upload...")
    with zipfile.ZipFile("hostinger_complete_upload.zip", 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(deploy_dir):
            for file in files:
                file_path = Path(root) / file
                arcname = file_path.relative_to(deploy_dir)
                zipf.write(file_path, arcname)
    
    print("\n🎉 Complete Hostinger package ready!")
    print("\n📋 UPLOAD INSTRUCTIONS:")
    print("="*60)
    print("1. UPLOAD TO HOSTINGER:")
    print(f"   - Upload ALL files from '{deploy_dir}/' to public_html/")
    print("   - OR upload 'hostinger_complete_upload.zip' and extract in public_html/")
    print("")
    print("2. SETUP DATABASE:")
    print("   - Visit https://your-domain.com/setup_hostinger_mysql.php")
    print("   - Delete the setup file after running it")
    print("")
    print("3. CONFIGURE:")
    print("   - Update database credentials in api/index.php")
    print("   - Update REACT_APP_BACKEND_URL in frontend environment")
    print("")
    print("📁 Files included:")
    
    # List all files
    for item in deploy_dir.rglob("*"):
        if item.is_file():
            print(f"  📄 {item.relative_to(deploy_dir)}")
    
    return True

def show_next_steps():
    """Show user what to do next"""
    print("\n🎯 NEXT STEPS:")
    print("="*40)
    print("1. 🗄️  CREATE MYSQL DATABASE in Hostinger control panel")
    print("2. 🔧 UPDATE database credentials in api/index.php")  
    print("3. 📤 UPLOAD files to Hostinger public_html/")
    print("4. 🗃️  RUN database setup: visit setup_hostinger_mysql.php")
    print("5. 🔐 CONFIGURE Firebase authorized domains")
    print("6. 🧪 TEST your website and API")
    print("")
    print("📖 Detailed instructions: HOSTINGER_COMPLETE_SETUP_GUIDE.md")
    print("")
    print("🎉 You'll have a complete working website with:")
    print("   ✅ React frontend")
    print("   ✅ PHP backend with Google auth")
    print("   ✅ MySQL database")
    print("   ✅ Admin panel")
    print("   ✅ Blog management")

def main():
    print("🌐 Hostinger Complete Deployment Preparation")
    print("="*50)
    
    # Check current directory
    if not Path("frontend").exists():
        print("❌ Please run this script from the project root directory")
        return
    
    # Create deployment package
    success = create_hostinger_complete_package()
    
    if success:
        show_next_steps()

if __name__ == "__main__":
    main()