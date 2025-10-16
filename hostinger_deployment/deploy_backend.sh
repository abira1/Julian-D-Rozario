#!/bin/bash

# =========================================
# Backend Deployment Script for Hostinger VPS
# Julian D'Rozario Portfolio
# =========================================

set -e  # Exit on error

echo "========================================="
echo "Backend Deployment Script"
echo "Julian D'Rozario Portfolio"
echo "========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="$HOME/apps/backend"
VENV_DIR="$BACKEND_DIR/venv"
SERVICE_NAME="portfolio-backend"

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if running on supported system
check_system() {
    echo "Checking system requirements..."
    
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 not found. Please install Python 3.8+"
        exit 1
    fi
    
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    print_success "Python $PYTHON_VERSION found"
    
    if ! command -v pip3 &> /dev/null; then
        print_error "pip3 not found. Installing..."
        curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
        python3 get-pip.py --user
        rm get-pip.py
    fi
    
    print_success "pip3 found"
}

# Create directory structure
setup_directories() {
    echo ""
    echo "Setting up directories..."
    
    mkdir -p "$BACKEND_DIR"
    mkdir -p "$BACKEND_DIR/uploads/images"
    mkdir -p "$BACKEND_DIR/logs"
    
    print_success "Directories created"
}

# Copy backend files
copy_files() {
    echo ""
    echo "Copying backend files..."
    
    if [ -d "/app/backend" ]; then
        cp -r /app/backend/* "$BACKEND_DIR/"
        print_success "Backend files copied"
    else
        print_warning "Backend source not found at /app/backend"
        print_warning "Please manually upload backend files to $BACKEND_DIR"
    fi
}

# Create virtual environment
setup_virtualenv() {
    echo ""
    echo "Setting up virtual environment..."
    
    if [ ! -d "$VENV_DIR" ]; then
        python3 -m venv "$VENV_DIR"
        print_success "Virtual environment created"
    else
        print_warning "Virtual environment already exists"
    fi
    
    source "$VENV_DIR/bin/activate"
    print_success "Virtual environment activated"
}

# Install dependencies
install_dependencies() {
    echo ""
    echo "Installing Python dependencies..."
    
    if [ -f "$BACKEND_DIR/requirements.txt" ]; then
        pip install --upgrade pip
        pip install -r "$BACKEND_DIR/requirements.txt"
        print_success "Dependencies installed"
    else
        print_error "requirements.txt not found"
        exit 1
    fi
}

# Setup environment file
setup_env() {
    echo ""
    echo "Setting up environment file..."
    
    if [ ! -f "$BACKEND_DIR/.env" ]; then
        if [ -f "$BACKEND_DIR/.env.example" ]; then
            cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
            print_warning ".env file created from example"
            print_warning "Please edit $BACKEND_DIR/.env with your credentials"
        else
            cat > "$BACKEND_DIR/.env" << EOF
# Database Configuration
DATABASE_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=your_database_name

# JWT Configuration
JWT_SECRET=$(openssl rand -hex 32)
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=24

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Admin Emails
AUTHORIZED_ADMIN_EMAILS=juliandrozario@gmail.com,abirsabirhossain@gmail.com

# CORS
CORS_ORIGINS=https://drozario.blog,https://www.drozario.blog

# Environment
ENVIRONMENT=production
RATE_LIMIT_PER_MINUTE=60
EOF
            print_success ".env file created"
            print_warning "Please edit $BACKEND_DIR/.env with your credentials"
        fi
    else
        print_success ".env file already exists"
    fi
}

# Create systemd service
create_service() {
    echo ""
    echo "Creating systemd service..."
    
    if [ "$EUID" -eq 0 ]; then
        cat > /etc/systemd/system/${SERVICE_NAME}.service << EOF
[Unit]
Description=Julian Portfolio Backend API
After=network.target mysql.service
Wants=mysql.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$BACKEND_DIR
Environment="PATH=$VENV_DIR/bin"
ExecStart=$VENV_DIR/bin/uvicorn server:app --host 0.0.0.0 --port 8001 --workers 4
Restart=always
RestartSec=10
StandardOutput=append:$BACKEND_DIR/logs/backend.log
StandardError=append:$BACKEND_DIR/logs/backend.error.log

[Install]
WantedBy=multi-user.target
EOF
        
        systemctl daemon-reload
        systemctl enable ${SERVICE_NAME}
        print_success "Systemd service created and enabled"
    else
        print_warning "Not running as root. Cannot create systemd service."
        print_warning "Run this script with sudo or create service manually."
        
        # Create manual start script
        cat > "$BACKEND_DIR/start.sh" << EOF
#!/bin/bash
source $VENV_DIR/bin/activate
cd $BACKEND_DIR
nohup uvicorn server:app --host 0.0.0.0 --port 8001 > logs/backend.log 2>&1 &
echo \$! > backend.pid
echo "Backend started with PID \$(cat backend.pid)"
EOF
        
        cat > "$BACKEND_DIR/stop.sh" << EOF
#!/bin/bash
if [ -f $BACKEND_DIR/backend.pid ]; then
    kill \$(cat $BACKEND_DIR/backend.pid)
    rm $BACKEND_DIR/backend.pid
    echo "Backend stopped"
else
    echo "No PID file found"
fi
EOF
        
        chmod +x "$BACKEND_DIR/start.sh"
        chmod +x "$BACKEND_DIR/stop.sh"
        
        print_success "Manual start/stop scripts created"
        print_warning "Use $BACKEND_DIR/start.sh to start backend"
        print_warning "Use $BACKEND_DIR/stop.sh to stop backend"
    fi
}

# Configure Apache proxy (if Apache is installed)
configure_apache() {
    echo ""
    echo "Configuring Apache proxy..."
    
    if command -v apache2 &> /dev/null || command -v httpd &> /dev/null; then
        print_warning "Apache detected. You may need to configure proxy manually."
        echo ""
        echo "Add this to your Apache VirtualHost configuration:"
        echo ""
        echo "  ProxyPreserveHost On"
        echo "  ProxyPass /api http://127.0.0.1:8001/api"
        echo "  ProxyPassReverse /api http://127.0.0.1:8001/api"
        echo ""
        echo "Or add to .htaccess:"
        echo ""
        echo "  RewriteEngine On"
        echo "  RewriteCond %{REQUEST_URI} ^/api"
        echo "  RewriteRule ^api/(.*)$ http://127.0.0.1:8001/api/\$1 [P,L]"
        echo ""
    fi
}

# Test installation
test_installation() {
    echo ""
    echo "Testing installation..."
    
    if [ -f "$BACKEND_DIR/server.py" ]; then
        print_success "server.py found"
    else
        print_error "server.py not found"
        return 1
    fi
    
    if [ -f "$BACKEND_DIR/.env" ]; then
        print_success ".env file found"
    else
        print_error ".env file not found"
        return 1
    fi
    
    # Test Python import
    cd "$BACKEND_DIR"
    source "$VENV_DIR/bin/activate"
    python3 -c "import fastapi; import aiomysql" 2>/dev/null
    if [ $? -eq 0 ]; then
        print_success "Python dependencies working"
    else
        print_error "Python dependencies check failed"
        return 1
    fi
    
    print_success "Installation test passed"
}

# Start backend
start_backend() {
    echo ""
    echo "Starting backend service..."
    
    if [ "$EUID" -eq 0 ]; then
        systemctl start ${SERVICE_NAME}
        sleep 3
        
        if systemctl is-active --quiet ${SERVICE_NAME}; then
            print_success "Backend service started successfully"
        else
            print_error "Backend service failed to start"
            print_warning "Check logs: journalctl -u ${SERVICE_NAME} -n 50"
            return 1
        fi
    else
        if [ -f "$BACKEND_DIR/start.sh" ]; then
            bash "$BACKEND_DIR/start.sh"
            sleep 3
            print_success "Backend started manually"
        fi
    fi
}

# Main deployment
main() {
    echo ""
    print_warning "This script will deploy the FastAPI backend to $BACKEND_DIR"
    read -p "Continue? (y/n) " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled"
        exit 0
    fi
    
    check_system
    setup_directories
    copy_files
    setup_virtualenv
    install_dependencies
    setup_env
    create_service
    configure_apache
    
    if test_installation; then
        start_backend
        
        echo ""
        echo "========================================="
        echo "Deployment Complete!"
        echo "========================================="
        echo ""
        echo "Backend location: $BACKEND_DIR"
        echo "Logs location: $BACKEND_DIR/logs/"
        echo ""
        echo "Next steps:"
        echo "1. Edit $BACKEND_DIR/.env with your credentials"
        echo "2. Initialize database (if needed)"
        echo "3. Restart backend service"
        echo ""
        
        if [ "$EUID" -eq 0 ]; then
            echo "Service commands:"
            echo "  sudo systemctl status ${SERVICE_NAME}"
            echo "  sudo systemctl restart ${SERVICE_NAME}"
            echo "  sudo systemctl stop ${SERVICE_NAME}"
            echo "  sudo journalctl -u ${SERVICE_NAME} -f"
        else
            echo "Manual commands:"
            echo "  $BACKEND_DIR/start.sh"
            echo "  $BACKEND_DIR/stop.sh"
            echo "  tail -f $BACKEND_DIR/logs/backend.log"
        fi
        
        echo ""
        echo "Test backend: curl http://localhost:8001/api/health"
        echo ""
    else
        print_error "Deployment failed. Check errors above."
        exit 1
    fi
}

# Run main
main
