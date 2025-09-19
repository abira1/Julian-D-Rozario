# Julian D Rozario - Business Consultant Portfolio

A modern, full-stack web application showcasing business consulting services with an elegant design and interactive features.

## 🚀 Project Overview

This project is a professional portfolio website built for Julian D Rozario, a business consultant and licensing advisor. The application features:

- **Modern React Frontend** with advanced animations and responsive design
- **FastAPI Backend** with MongoDB integration
- **Interactive Service Cards** with particle effects and hover animations
- **Blog System** with rich content management
- **Contact Forms** and client interaction features
- **Mobile-First Design** with desktop optimizations

## 🛠 Technology Stack

### Frontend
- **React 19.0.0** - Latest React with concurrent features
- **React Router DOM 7.5.1** - Client-side routing
- **GSAP 3.13.0** - Advanced animations and interactions
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Axios 1.8.4** - HTTP client for API calls

### Backend
- **FastAPI 0.115.6** - Modern Python web framework
- **MongoDB** with **Motor 3.5.1** - Async database driver
- **Uvicorn 0.34.0** - ASGI server
- **Pydantic 2.10.3** - Data validation
- **Python-Jose** - JWT token handling

### Development Tools
- **CRACO 7.1.0** - Create React App Configuration Override
- **ESLint 9.23.0** - Code linting
- **Black 24.10.0** - Python code formatting
- **Pytest 8.3.4** - Python testing framework

## 📋 Prerequisites

Before running this project locally, ensure you have the following installed:

### Required Software
- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.11 or higher) - [Download](https://python.org/)
- **MongoDB** (v6.0 or higher) - [Download](https://mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)

### Package Managers
- **Yarn** (recommended) or npm for frontend dependencies
- **pip** for Python packages

## 🏗 Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd app
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Environment Configuration
Create a `.env` file in the `backend` directory:
```bash
# backend/.env
MONGO_URL=mongodb://localhost:27017/portfolio_db
SECRET_KEY=your-secret-key-here
DEBUG=True
CORS_ORIGINS=http://localhost:3000
```

#### Start MongoDB
Make sure MongoDB is running on your system:

**macOS (with Homebrew):**
```bash
brew services start mongodb-community
```

**Linux (systemd):**
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Windows:**
```bash
net start MongoDB
```

#### Start Backend Server
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

The backend will be available at: `http://localhost:8001`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
yarn install
# or
npm install
```

#### Environment Configuration
Create a `.env` file in the `frontend` directory:
```bash
# frontend/.env
REACT_APP_BACKEND_URL=http://localhost:8001
```

#### Start Development Server
```bash
cd frontend
yarn start
# or
npm start
```

The frontend will be available at: `http://localhost:3000`

## 🚀 Running the Application

### Development Mode
1. **Start MongoDB** (see instructions above)
2. **Start Backend Server:**
   ```bash
   cd backend
   uvicorn server:app --host 0.0.0.0 --port 8001 --reload
   ```
3. **Start Frontend Development Server:**
   ```bash
   cd frontend
   yarn start
   ```

### Production Build

#### Build Frontend
```bash
cd frontend
yarn build
# or
npm run build
```

#### Deploy Backend
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001
```

## 📁 Project Structure

```
/app
├── README.md                 # This file
├── backend/                  # FastAPI backend application
│   ├── server.py            # Main FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Backend environment variables
├── frontend/                # React frontend application
│   ├── public/              # Static assets
│   ├── src/                 # Source code
│   │   ├── components/      # React components
│   │   │   ├── Navigation.js
│   │   │   ├── HeroSection.js
│   │   │   ├── ServicesSection.js
│   │   │   ├── MagicBento.js
│   │   │   ├── BlogPost.js
│   │   │   ├── BlogListing.js
│   │   │   └── Footer.js
│   │   ├── data/           # Mock data and constants
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
│   ├── package.json        # Frontend dependencies
│   ├── craco.config.js     # CRACO configuration
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── .env                # Frontend environment variables
└── tests/                  # Test files
```

## 🎨 Key Features

### 1. Interactive Service Cards
- **Particle Effects**: Hover animations with floating particles
- **3D Tilt Effects**: Cards respond to mouse movement
- **Responsive Design**: Optimized for all screen sizes
- **Dynamic Content**: Service descriptions adapt to screen size

### 2. Modern Blog System
- **Rich Content**: Support for images, quotes, and formatted text
- **Reading Progress**: Visual progress indicator
- **Social Sharing**: Twitter, LinkedIn, Facebook integration
- **Comments System**: Interactive comment functionality
- **Related Articles**: Automatic content recommendations

### 3. Advanced Animations
- **GSAP Integration**: Smooth, performant animations
- **Scroll Triggers**: Elements animate on scroll
- **Hover Effects**: Interactive micro-interactions
- **Page Transitions**: Smooth navigation between pages

### 4. Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Progressive Enhancement**: Enhanced features for larger screens
- **Touch-Friendly**: Optimized for touch interactions
- **Cross-Browser**: Compatible with modern browsers

## 🔧 Configuration Options

### Tailwind CSS Customization
Edit `frontend/tailwind.config.js` to customize:
- Colors and gradients
- Typography scales
- Spacing and sizing
- Animation timings

### GSAP Animation Settings
Modify animation parameters in:
- `frontend/src/components/MagicBento.js`
- `frontend/src/components/Navigation.js`
- Individual component files

### Backend API Configuration
Adjust settings in `backend/server.py`:
- CORS origins
- Rate limiting
- Database connection parameters
- Authentication settings

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
yarn test
# or
npm test
```

### End-to-End Testing
The project includes comprehensive testing utilities:
- Backend API testing with pytest
- Frontend component testing
- Integration testing capabilities

## 🚀 Deployment

### Environment Variables for Production

#### Backend (.env)
```bash
MONGO_URL=mongodb://your-production-mongo-url
SECRET_KEY=your-production-secret-key
DEBUG=False
CORS_ORIGINS=https://your-production-domain.com
```

#### Frontend (.env.production)
```bash
REACT_APP_BACKEND_URL=https://your-api-domain.com
```

### Build Commands
```bash
# Frontend production build
cd frontend && yarn build

# Backend with production settings
cd backend && uvicorn server:app --host 0.0.0.0 --port 8001 --workers 4
```

## 📞 API Endpoints

### Backend API Routes
- `GET /api/` - Health check endpoint
- `GET /api/status` - Get status check entries
- `POST /api/status` - Create status check entry

All API endpoints are prefixed with `/api` for proper routing.

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"

# Restart MongoDB service
brew services restart mongodb-community  # macOS
sudo systemctl restart mongod           # Linux
```

#### 2. Port Already in Use
```bash
# Kill process using port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Kill process using port 8001 (backend)
lsof -ti:8001 | xargs kill -9
```

#### 3. Dependency Installation Issues
```bash
# Clear npm/yarn cache
yarn cache clean
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json yarn.lock
yarn install
```

#### 4. Python Dependencies Issues
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/macOS
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

### Performance Optimization
- Enable gzip compression for production
- Optimize images and assets
- Use CDN for static files
- Implement caching strategies

## 📄 License

This project is proprietary software developed for Julian D Rozario's business portfolio.

## 🤝 Contributing

This is a private project. For feature requests or bug reports, please contact the development team.

## 📧 Support

For technical support or questions about the application:
- Email: support@julianrozario.com
- Documentation: This README file
- API Documentation: Available at `/docs` when backend is running

## 🔄 Version History

### v2.0.0 (Current)
- ✅ Fixed desktop service card subtitle display
- ✅ Reduced blog page blur effects for better readability
- ✅ Updated all dependencies to latest stable versions
- ✅ Comprehensive codebase cleanup
- ✅ Enhanced documentation

### v1.0.0
- Initial release with modern mobile navbar
- Service section with uploaded images
- Blog system implementation
- Contact forms and footer

---

**Built with ❤️ using modern web technologies**

**Last Updated:** December 2024
