import os
import google.generativeai as genai
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

# Load environment variables from a .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Configure the API key
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Use a supported Gemini model
model = genai.GenerativeModel('gemini-2.5-flash')

# Start a themed chat session
chat = model.start_chat(history=[
    {"role": "user", "parts": ["You are an AI chatbot specialized in environment, sustainability, and eco-friendly practices. "
                               "When users ask questions, always reply in a friendly, informative way and connect it to the environment. "
                               "Use emojis like 🌱🌍♻️ where appropriate."]}
])

def get_gemini_response(question):
    """
    Sends a user's question to the Gemini model and returns the themed response.
    """
    try:
        response = chat.send_message(question)
        return response.text
    except Exception as e:
        print(f"Error getting Gemini response: {e}")
        raise e

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "EcoBot API is running! 🌍"})

@app.route('/chat', methods=['POST'])
def chat_endpoint():
    """
    Chat endpoint that receives user messages and returns EcoBot responses
    """
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({"error": "Message is required"}), 400
        
        user_message = data['message'].strip()
        
        if not user_message:
            return jsonify({"error": "Message cannot be empty"}), 400
        
        # Get response from Gemini
        bot_response = get_gemini_response(user_message)
        
        return jsonify({
            "response": bot_response,
            "status": "success"
        })
        
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({
            "error": "Sorry, I'm having trouble connecting to my eco-brain right now. Please try again! 🌱",
            "status": "error"
        }), 500

@app.route('/', methods=['GET'])
def root():
    """Root endpoint"""
    return jsonify({
        "message": "🌍 EcoBot API is running!",
        "endpoints": {
            "/health": "GET - Health check",
            "/chat": "POST - Send a message to EcoBot"
        }
    })

if __name__ == '__main__':
    # Get port from environment variable or default to 8000
    port = int(os.getenv("PORT", 8000))
    
    print("🌍 EcoBot API starting...")
    print("Make sure you have your GOOGLE_API_KEY in your .env file!")
    print(f"🚀 Server will start on port {port}")
    print("💡 To use a different port, set the PORT environment variable")
    
    try:
        app.run(debug=True, host='0.0.0.0', port=port)
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ Port {port} is already in use!")
            print(f"💡 Try setting a different port: PORT={port + 1} python app.py")
            print(f"💡 Or check what's using port {port}: lsof -i :{port}")
        else:
            raise e
