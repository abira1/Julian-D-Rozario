# 🎯 J# Julian D'Rozario - Business Consultant Portfolio

A comprehensive portfolio website for Julian D'Rozario, featuring a modern dark theme design with blog management capabilities and administrative dashboard.

## 🚀 Quick Local Development Setup

### Prerequisites
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download here](https://python.org/)
- **MySQL** (v8.0 or higher) - [Download here](https://dev.mysql.com/downloads/)
- **yarn** (recommended) - `npm install -g yarn`

### 1. Clone and Navigate
```bash
git clone <repository-url>
cd Julian-D-Rozario
```

### 2. Backend Setup (FastAPI + MySQL)

#### Step 2.1: Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Step 2.2: Setup MySQL Database
1. Start your local MySQL server
2. Create a database named `julian_portfolio`:
```sql
CREATE DATABASE julian_portfolio;
```

#### Step 2.3: Configure Environment
1. Copy `.env.local` to `.env`:
```bash
cp .env.local .env
```
2. Update MySQL credentials in `.env`:
```
MYSQL_USER=your_mysql_username
MYSQL_PASSWORD=your_mysql_password
```

#### Step 2.4: Initialize Database
```bash
python database_setup.py
```

#### Step 2.5: Start Backend Server
```bash
python server.py
```
✅ **Backend should now be running at:** `http://localhost:8001`

### 3. Frontend Setup (React + Tailwind)

#### Step 3.1: Install Dependencies
```bash
cd ../frontend
yarn install
```

#### Step 3.2: Start Frontend Development Server
```bash
yarn start
```
✅ **Frontend should now be running at:** `http://localhost:3000`

## 🎯 Features

### 🎨 Frontend Features
- **Responsive Design** - Optimized for all device sizes
- **Dark Theme** - Modern gradient-based dark design
- **Blog System** - Dynamic blog listing and individual post pages
- **Admin Dashboard** - Complete content management system
- **Contact Management** - Dynamic contact information system
- **Lazy Loading** - Optimized performance with skeleton loaders
- **Smooth Animations** - GSAP-powered animations and transitions

### ⚡ Backend Features
- **FastAPI Framework** - High-performance async API
- **MySQL Database** - Reliable data persistence
- **JWT Authentication** - Secure admin authentication
- **Google OAuth** - Optional Google login integration
- **Blog Management** - Full CRUD operations for blog posts
- **Contact Management** - Dynamic contact information API
- **Rate Limiting** - Built-in API rate limiting
- **CORS Support** - Configured for development and production

## 📁 Project Structure

```
Julian-D-Rozario/
├── backend/                 # FastAPI Backend
│   ├── server.py           # Main server file
│   ├── database_setup.py   # Database initialization
│   ├── database_schema.py  # Database models
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
│
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   └── App.js        # Main App component
│   ├── package.json      # Node.js dependencies
│   └── .env             # Frontend environment variables
│
└── README.md            # This file
```

## 🔧 Development Commands

### Backend Commands
```bash
# Start development server
python server.py

# Reset database
python database_setup.py

# Check database schema
python database_schema.py
```

### Frontend Commands
```bash
# Start development server
yarn start

# Build for production
yarn build

# Run tests
yarn test
```

## 🌐 Admin Dashboard

Access the admin dashboard at: `http://localhost:3000/julian_portfolio`

**Default Admin Email:** `juliandrozario@gmail.com` (configure in backend/.env)

## 🚀 Production Deployment

For production deployment to Hostinger or other platforms, see the deployment guides in the docs folder (to be created).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Developed by Julian D'Rozario** | Business Consultant & Technology Leaderlian D'Rozario Portfolio - Production MySQL Backend

> **Status:** ✅ Conversion Complete - Ready for Hostinger Deployment

## 📖 Overview

This is Julian D'Rozario's professional portfolio website with a complete content management system. The backend has been fully converted from Firebase mock mode to a production-ready MySQL database hosted on Hostinger.

**Live Website:** https://drozario.blog

## 🏗️ Architecture

### Tech Stack
- **Frontend:** React 19.1.0 + GSAP animations + Tailwind CSS
- **Backend:** FastAPI 0.116.2 + aiomysql async MySQL driver
- **Database:** MySQL 8.0 on Hostinger (u691568332_Dataubius)
- **Authentication:** Google OAuth 2.0 + JWT tokens + Email whitelist
- **Hosting:** Hostinger (MySQL + Web hosting)

### System Design
```
┌─────────────────┐
│   React SPA     │ ← Frontend (No changes made)
│  (Port 3000)    │
└────────┬────────┘
         │ HTTPS/API
         ▼
┌─────────────────┐
│ FastAPI Backend │ ← Completely rewritten for MySQL
│  (Port 8001)    │
└────────┬────────┘
         │ aiomysql
         ▼
┌─────────────────┐
│ MySQL Database  │ ← Hostinger MySQL (localhost)
│ u691568332_     │
│   Dataubius     │
└─────────────────┘
```

## 🚀 Quick Start (Hostinger Deployment)

### 1. Upload Files
Upload entire project to Hostinger via SSH/FTP

### 2. Configure Environment
```bash
cd /path/to/backend
cp .env.example .env
# Edit .env with MySQL credentials (already provided)
```

### 3. Install Dependencies
```bash
pip3 install --user -r requirements.txt
```

### 4. Initialize Database
```bash
chmod +x setup_database.sh
./setup_database.sh
```

### 5. Start Backend
```bash
uvicorn server:app --host 0.0.0.0 --port 8001
# Or for production:
gunicorn -w 4 -k uvicorn.workers.UvicornWorker server:app --bind 0.0.0.0:8001
```

### 6. Build & Deploy Frontend
```bash
cd /path/to/frontend
yarn install
yarn build
cp -r build/* /path/to/public_html/
```

**For detailed deployment:** See [`HOSTINGER_DEPLOYMENT.md`](./HOSTINGER_DEPLOYMENT.md)

## 📁 Project Structure

```
/app/
├── backend/
│   ├── server.py                      # ✅ NEW: MySQL-based FastAPI server
│   ├── database_schema.sql            # ✅ NEW: Complete MySQL schema
│   ├── migrate_data_to_mysql.py       # ✅ NEW: Data migration script
│   ├── setup_database.sh              # ✅ NEW: One-command DB setup
│   ├── backup_database.sh             # ✅ NEW: Backup script
│   ├── restore_database.sh            # ✅ NEW: Restore script
│   ├── requirements.txt               # ✅ UPDATED: Removed Firebase, added aiomysql
│   ├── .env                           # ✅ UPDATED: MySQL credentials
│   └── .env.example                   # ✅ NEW: Environment template
│
├── frontend/                          # ❌ NO CHANGES - Works identically
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env
│
├── CONVERSION_SUMMARY.md              # ✅ NEW: Complete conversion summary
├── HOSTINGER_DEPLOYMENT.md            # ✅ NEW: Deployment guide
├── TESTING_GUIDE.md                   # ✅ NEW: Testing instructions
├── README.md                          # This file
└── test_result.md                     # Testing data
```

## 🔐 Admin Access

### Authorized Admin Emails (Hardcoded Whitelist)
1. **Julian D'Rozario:** `juliandrozario@gmail.com`
2. **Abir Sabir Hossain:** `abirsabirhossain@gmail.com`

Only these two emails can access the admin panel and manage content.

## 📊 Database Schema

### Tables Created
- `admin_users` - Admin accounts (2 authorized emails)
- `categories` - Blog categories (7 categories)
- `blogs` - Blog articles (6 migrated articles)
- `contact_info` - Contact information (4 entries)
- `blog_comments` - User comments on blogs
- `blog_likes` - Like tracking per user

## 🎨 Features

### Public Features
- ✅ Professional blog with 6 high-quality articles
- ✅ Category-based filtering
- ✅ Individual blog post pages with view tracking
- ✅ Responsive design (mobile-first)
- ✅ GSAP animations throughout

### Admin Features (Authorized Users Only)
- ✅ Google OAuth login with email whitelist
- ✅ Full blog CRUD operations
- ✅ Real-time content updates
- ✅ Blog views and likes tracking

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [`CONVERSION_SUMMARY.md`](./CONVERSION_SUMMARY.md) | Complete conversion details |
| [`HOSTINGER_DEPLOYMENT.md`](./HOSTINGER_DEPLOYMENT.md) | Step-by-step deployment guide |
| [`TESTING_GUIDE.md`](./TESTING_GUIDE.md) | Testing procedures and expected results |

## 🧪 Testing

```bash
# Backend API health check
curl https://drozario.blog/api/

# Get all blogs
curl https://drozario.blog/api/blogs

# Get categories  
curl https://drozario.blog/api/categories
```

**For complete testing guide:** See [`TESTING_GUIDE.md`](./TESTING_GUIDE.md)

## 📞 Contact

**Julian D'Rozario**
- Email: julian@drozario.blog
- Phone: +971 55 386 8045
- LinkedIn: [linkedin.com/in/julian-d-rozario](https://www.linkedin.com/in/julian-d-rozario)

---

**Backend Version:** 2.0 (MySQL Production)  
**Last Updated:** January 2025  
**Status:** ✅ Production Ready
