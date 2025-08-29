#!/bin/bash

echo "🌍 Setting up Terra Spark Net with Eco-Chat Integration..."
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.7 or higher first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✅ Node.js, Python, and Docker are installed"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

# Setup database
echo "🗄️ Setting up PostgreSQL database..."
if ! docker ps | grep -q terra-spark-postgres; then
    echo "🐘 Starting PostgreSQL container..."
    docker run --name terra-spark-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=terraspark -e POSTGRES_USER=postgres -p 5432:5432 -d postgres:latest
    echo "✅ PostgreSQL container started"
else
    echo "✅ PostgreSQL container is already running"
fi

# Setup Prisma
echo "🔧 Setting up Prisma database..."
npx prisma generate
npx prisma db push

# Setup auth server
echo "🔐 Setting up auth server..."
cd auth-server
npm install
npx prisma generate
cd ..

# Setup Python virtual environment
echo "🐍 Setting up Python virtual environment..."
cd backend

# Remove existing venv if it exists
if [ -d "venv" ]; then
    echo "🗑️  Removing existing virtual environment..."
    rm -rf venv
fi

# Create new virtual environment
python3 -m venv venv

if [ $? -eq 0 ]; then
    echo "✅ Virtual environment created successfully"
else
    echo "❌ Failed to create virtual environment"
    exit 1
fi

# Activate virtual environment and install dependencies
echo "📦 Installing backend dependencies in virtual environment..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed successfully"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Deactivate virtual environment
deactivate

cd ..

# Check if .env file exists in backend
if [ ! -f "backend/.env" ]; then
    echo "⚠️  No .env file found in backend directory"
    echo "📝 Please create a .env file in the backend directory with your Google API key:"
    echo "   GOOGLE_API_KEY=your_google_api_key_here"
    echo ""
    echo "🔑 Get your API key from: https://makersuite.google.com/app/apikey"
fi

echo ""
echo "🎉 Setup complete! Here's how to run the project:"
echo ""
echo "🔐 To start the auth server (in one terminal):"
echo "   cd auth-server && npm run dev"
echo ""
echo "🚀 To start the frontend (in another terminal):"
echo "   npm run dev"
echo ""
echo "🐍 To start the backend (in a third terminal):"
echo "   cd backend && ./start.sh"
echo ""
echo "🌐 Frontend will be available at: http://localhost:8080"
echo "🔐 Auth server will be available at: http://localhost:3003"
echo "🔌 Backend will be available at: http://localhost:8000"
echo "💬 Chat widget will appear as a floating icon on all pages"
echo ""
echo "💡 Don't forget to set up your Google API key in backend/.env"
echo "🔑 Configure OAuth providers in .env for Google/GitHub login"
echo "🌱 Happy coding and making our planet greener!"
