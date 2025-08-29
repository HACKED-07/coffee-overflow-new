# EcoBot Backend

This is the Python backend for the EcoBot chat functionality, integrated into the Terra Spark Net project.

## Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   Create a `.env` file in the backend directory with your Google API key:
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   ```

3. **Run the backend:**
   ```bash
   python app.py
   ```

The backend will start on `http://localhost:5000`

## API Endpoints

- `GET /` - Root endpoint with API information
- `GET /health` - Health check endpoint
- `POST /chat` - Chat endpoint for sending messages to EcoBot

## Features

- Environment-focused AI chatbot using Google's Gemini model
- CORS enabled for frontend communication
- Error handling and validation
- Eco-friendly themed responses with emojis

## Requirements

- Python 3.7+
- Google API key for Gemini
- Flask and related dependencies
