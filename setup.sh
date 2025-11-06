#!/bin/bash
# SlotSwapper Setup Script for Linux/Mac
# Run this: chmod +x setup.sh && ./setup.sh

echo "🚀 SlotSwapper Setup Script"
echo "============================"
echo ""

# Check if Docker is installed
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"
    echo ""
    echo "Starting with Docker setup (recommended)..."
    echo ""
    
    echo "Starting all services with Docker Compose..."
    docker-compose up --build
else
    echo "⚠️  Docker not found. Using manual setup..."
    echo ""
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js 18+ first."
        echo "Download from: https://nodejs.org/"
        exit 1
    fi
    
    echo "✅ Node.js is installed"
    echo "   Version: $(node --version)"
    echo ""
    
    # Setup Backend
    echo "📦 Setting up Backend..."
    cd backend
    
    if [ ! -d "node_modules" ]; then
        echo "   Installing backend dependencies..."
        npm install
    fi
    
    if [ ! -f ".env" ]; then
        echo "   Creating .env file..."
        cp .env.example .env
    fi
    
    echo "   Running database migrations..."
    npx prisma migrate dev --name init
    
    echo "✅ Backend setup complete"
    echo ""
    
    # Setup Frontend
    echo "📦 Setting up Frontend..."
    cd ../frontend
    
    if [ ! -d "node_modules" ]; then
        echo "   Installing frontend dependencies..."
        npm install
    fi
    
    echo "✅ Frontend setup complete"
    echo ""
    
    cd ..
    
    echo ""
    echo "🎉 Setup Complete!"
    echo ""
    echo "To start the application:"
    echo "1. Open a terminal and run:"
    echo "   cd backend && npm run dev"
    echo ""
    echo "2. Open ANOTHER terminal and run:"
    echo "   cd frontend && npm run dev"
    echo ""
    echo "3. Open browser: http://localhost:3000"
    echo ""
fi
