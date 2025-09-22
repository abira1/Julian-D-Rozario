#!/bin/bash

# Julian D Rozario Portfolio - Quick Setup Script
echo "🚀 Setting up Julian D Rozario Portfolio..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/${NC}"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed. Please install Python 3.11+ from https://python.org/${NC}"
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB is not running. Please start MongoDB first.${NC}"
    echo "macOS: brew services start mongodb-community"
    echo "Linux: sudo systemctl start mongod"
    echo "Windows: net start MongoDB"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Install backend dependencies
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
cd backend
if ! pip install -r requirements.txt; then
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi

# Install frontend dependencies
echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
cd ../frontend
if ! yarn install; then
    echo -e "${YELLOW}⚠️  Yarn failed, trying with npm...${NC}"
    if ! npm install; then
        echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
        exit 1
    fi
fi

# Check for environment files
echo -e "${YELLOW}🔧 Checking environment configuration...${NC}"

if [ ! -f "../backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Creating backend .env file...${NC}"
    cat > ../backend/.env << EOL
MONGO_URL=mongodb://localhost:27017/portfolio_db
SECRET_KEY=your-secret-key-change-in-production
DEBUG=True
CORS_ORIGINS=http://localhost:3000
EOL
fi

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Creating frontend .env file...${NC}"
    cat > .env << EOL
REACT_APP_BACKEND_URL=http://localhost:8001
EOL
fi

echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo ""
echo -e "${GREEN}🚀 To start the application:${NC}"
echo ""
echo -e "${YELLOW}1. Start the backend server:${NC}"
echo "   cd backend && uvicorn server:app --host 0.0.0.0 --port 8001 --reload"
echo ""
echo -e "${YELLOW}2. Start the frontend server (in a new terminal):${NC}"
echo "   cd frontend && yarn start"
echo ""
echo -e "${GREEN}📱 The application will be available at:${NC}"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8001"
echo "   API Docs: http://localhost:8001/docs"
echo ""
echo -e "${GREEN}📚 For detailed instructions, see README.md${NC}"