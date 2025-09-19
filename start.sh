#!/bin/bash

# Julian D Rozario Portfolio - Development Startup Script
echo "🚀 Starting Julian D Rozario Portfolio in development mode..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null; then
        return 0
    else
        return 1
    fi
}

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo -e "${RED}❌ MongoDB is not running. Please start MongoDB first.${NC}"
    echo "macOS: brew services start mongodb-community"
    echo "Linux: sudo systemctl start mongod"
    echo "Windows: net start MongoDB"
    exit 1
fi

# Check if backend port is available
if check_port 8001; then
    echo -e "${YELLOW}⚠️  Port 8001 is already in use. Killing existing process...${NC}"
    lsof -ti:8001 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Check if frontend port is available
if check_port 3000; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use. Killing existing process...${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Start backend server in background
echo -e "${YELLOW}🔧 Starting backend server...${NC}"
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload > ../backend.log 2>&1 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if check_port 8001; then
    echo -e "${GREEN}✅ Backend server started successfully on port 8001${NC}"
else
    echo -e "${RED}❌ Failed to start backend server. Check backend.log for details.${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Start frontend server
echo -e "${YELLOW}🎨 Starting frontend development server...${NC}"
cd ../frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    yarn install || npm install
fi

# Start frontend
yarn start > ../frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
echo -e "${YELLOW}⏳ Waiting for frontend server to start...${NC}"
for i in {1..30}; do
    if check_port 3000; then
        echo -e "${GREEN}✅ Frontend server started successfully on port 3000${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Frontend server took too long to start. Check frontend.log for details.${NC}"
        kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
        exit 1
    fi
done

echo ""
echo -e "${GREEN}🎉 Application started successfully!${NC}"
echo ""
echo -e "${GREEN}📱 Available at:${NC}"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8001"
echo "   API Documentation: http://localhost:8001/docs"
echo ""
echo -e "${YELLOW}📝 Logs:${NC}"
echo "   Backend: tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo -e "${YELLOW}⏹️  To stop the servers:${NC}"
echo "   Press Ctrl+C or run: kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Keep script running and handle cleanup
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for processes
wait