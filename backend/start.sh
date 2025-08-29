#!/bin/bash

echo "🌍 Starting EcoBot Backend..."
echo "=============================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run the setup script first:"
    echo "   cd .. && ./setup.sh"
    exit 1
fi

# Activate virtual environment
echo "🐍 Activating virtual environment..."
source venv/bin/activate

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Please create one with your Google API key:"
    echo "   GOOGLE_API_KEY=your_google_api_key_here"
    echo ""
    echo "🔑 Get your API key from: https://makersuite.google.com/app/apikey"
    echo ""
    echo "Press Enter to continue anyway, or Ctrl+C to exit..."
    read
fi

# Start the Flask application
echo "🚀 Starting Flask server..."
echo "🌐 Backend will be available at: http://localhost:8000"
echo "📱 Frontend can connect to: http://localhost:8000"
echo ""
echo "💡 To use a different port, set the PORT environment variable:"
echo "   PORT=8001 python app.py"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python app.py
