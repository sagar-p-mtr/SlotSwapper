# SlotSwapper Setup Script for Windows
# Run this in PowerShell: .\setup.ps1

Write-Host "🚀 SlotSwapper Setup Script" -ForegroundColor Cyan
Write-Host "============================`n" -ForegroundColor Cyan

# Check if Docker is installed
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue

if ($dockerInstalled) {
    Write-Host "✅ Docker is installed" -ForegroundColor Green
    Write-Host "`nStarting with Docker setup (recommended)...`n" -ForegroundColor Yellow
    
    Write-Host "Starting all services with Docker Compose..." -ForegroundColor Cyan
    docker-compose up --build
} else {
    Write-Host "⚠️  Docker not found. Using manual setup...`n" -ForegroundColor Yellow
    
    # Check if Node.js is installed
    $nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
    
    if (-not $nodeInstalled) {
        Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
        Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "✅ Node.js is installed" -ForegroundColor Green
    $nodeVersion = node --version
    Write-Host "   Version: $nodeVersion`n" -ForegroundColor Gray
    
    # Setup Backend
    Write-Host "📦 Setting up Backend..." -ForegroundColor Cyan
    Set-Location backend
    
    if (-not (Test-Path "node_modules")) {
        Write-Host "   Installing backend dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    if (-not (Test-Path ".env")) {
        Write-Host "   Creating .env file..." -ForegroundColor Yellow
        Copy-Item .env.example .env
    }
    
    Write-Host "   Running database migrations..." -ForegroundColor Yellow
    npx prisma migrate dev --name init
    
    Write-Host "✅ Backend setup complete`n" -ForegroundColor Green
    
    # Setup Frontend
    Write-Host "📦 Setting up Frontend..." -ForegroundColor Cyan
    Set-Location ../frontend
    
    if (-not (Test-Path "node_modules")) {
        Write-Host "   Installing frontend dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    Write-Host "✅ Frontend setup complete`n" -ForegroundColor Green
    
    Set-Location ..
    
    Write-Host "`n🎉 Setup Complete!" -ForegroundColor Green
    Write-Host "`nTo start the application:" -ForegroundColor Cyan
    Write-Host "1. Open a PowerShell window and run:" -ForegroundColor Yellow
    Write-Host "   cd backend" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host "`n2. Open ANOTHER PowerShell window and run:" -ForegroundColor Yellow
    Write-Host "   cd frontend" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host "`n3. Open browser: http://localhost:3000`n" -ForegroundColor Yellow
}
