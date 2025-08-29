# Terra Spark Net - Integrated Eco-Chat Project

A comprehensive React application that combines environmental awareness with AI-powered chat functionality. This project integrates the eco-wise-chatter chat app as a sub-project within the main Terra Spark Net application.

## 🌟 Features

### Main Application
- **Modern React + TypeScript** architecture
- **Responsive design** with Tailwind CSS
- **Theme switching** (light/dark mode)
- **Authentication system** using Auth.js default pages
- **Dashboard** for user management
- **Nature-inspired UI** with smooth animations

### Authentication System
- **Auth0 integration** for secure authentication
- **Multiple sign-in options** - Google OAuth, GitHub OAuth, Email/Password
- **Universal login** with Auth0's hosted login page
- **Secure token management** with Auth0 SDK
- **User profile management** with Auth0 user profiles
- **Social connections** for seamless OAuth experience

### Eco-Chat Integration
- **Floating chat widget** - Always accessible from any page
- **AI-powered environmental chatbot** using Google's Gemini model
- **Real-time chat interface** with beautiful eco-themed design
- **Environment-focused responses** with sustainability tips
- **Responsive chat components** with smooth animations
- **Backend API** built with Flask and Python

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python 3.7+
- Docker (for PostgreSQL)
- Google API key for Gemini AI

### Quick Setup (Recommended)

1. **Start PostgreSQL database:**
   ```bash
   docker run --name terra-spark-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=terraspark -e POSTGRES_USER=postgres -p 5432:5432 -d postgres:latest
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env and add your Auth0 credentials and Google API key
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Set up Auth0:**
   - Create an Auth0 account at [auth0.com](https://auth0.com)
   - Create a new application (Single Page Application)
   - Configure your Auth0 domain, client ID, and audience
   - Update the `.env` file with your Auth0 credentials

5. **Start the chat backend:**
   ```bash
   cd backend && ./start.sh
   ```

6. **Start the frontend:**
   ```bash
   npm run dev
   ```

### Manual Setup

#### Frontend Setup
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:5173`

#### Backend Setup
1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a Python virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create a `.env` file** with your Google API key:
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   ```

5. **Start the backend server:**
   ```bash
   python app.py
   ```

The backend will run on `http://localhost:8000`

## 📱 Available Routes

- `/` - Home page with features and navigation
- `/dashboard` - User dashboard (protected route)
- **Auth.js default pages** - `/auth/signin`, `/auth/signout` (handled by Auth.js)
- **Floating Chat** - Always accessible chat icon in bottom-right corner

## 🔐 Authentication Flow

The application now uses Auth.js's default pages for authentication:

1. **Sign In**: Users are redirected to `/auth/signin` which shows Auth.js's default signin page
2. **OAuth Providers**: Google and GitHub OAuth are handled seamlessly
3. **Credentials**: Email/password authentication is available on the default signin page
4. **Sign Out**: Users are redirected to `/auth/signout` for secure logout
5. **Protected Routes**: Dashboard and other protected content use the `ProtectedRoute` component

## 🎨 Eco-Chat Features

### Chat Interface
- **Real-time messaging** with typing indicators
- **Eco-themed design** with nature-inspired colors
- **Responsive layout** for all device sizes
- **Smooth animations** and transitions

### AI Capabilities
- **Environment-focused responses** using Google Gemini
- **Sustainability tips** and eco-friendly advice
- **Contextual conversations** about environmental topics
- **Emoji-enhanced responses** for better user experience

### Design System
- **Nature-inspired color palette** with green gradients
- **Custom CSS animations** for smooth interactions
- **Dark/light theme support** with eco-friendly aesthetics
- **Responsive components** built with shadcn/ui

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **React Router** for navigation
- **React Query** for data fetching
- **Auth.js** for authentication

### Backend
- **Flask** web framework for chat API
- **Express.js** auth server with Auth.js
- **Google Generative AI** (Gemini) for chat responses
- **PostgreSQL** database with Prisma ORM
- **bcrypt** password hashing for security
- **Multer** file upload handling for face images
- **CORS** enabled for frontend communication
- **Environment variable** management
- **Python virtual environment** for dependency isolation

### Development Tools
- **ESLint** for code quality
- **TypeScript** for type safety
- **PostCSS** and **Autoprefixer** for CSS processing

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Backend Scripts
- `./setup.sh` - Automated setup for the entire project
- `./backend/start.sh` - Quick backend startup with virtual environment

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── ChatInterface.tsx    # Main chat component
│   ├── Message.tsx          # Message display component
│   ├── ThemeToggle.tsx      # Theme switching component
│   ├── FloatingChat.tsx     # Floating chat widget
│   ├── ProtectedRoute.tsx   # Authentication guard component
│   └── Navbar.tsx           # Navigation component
├── pages/              # Page components
│   ├── Dashboard.tsx        # User dashboard
│   ├── Index.tsx            # Home page
│   └── NotFound.tsx         # 404 page
├── contexts/           # React contexts
│   ├── AuthContext.tsx      # Authentication context
│   └── ThemeContext.tsx     # Theme context
├── hooks/              # Custom React hooks
└── lib/                # Utility functions

auth-server/
├── server.ts           # Express.js server with Auth.js
├── prisma/             # Database schema and migrations
└── package.json        # Auth server dependencies

backend/
├── venv/               # Python virtual environment (created by setup)
├── app.py              # Flask application
├── requirements.txt    # Python dependencies
├── start.sh            # Backend startup script
└── README.md           # Backend documentation
```

## 🌱 Environmental Focus

This project emphasizes environmental awareness and sustainability:
- **Eco-themed design** with nature-inspired colors
- **AI responses** focused on environmental topics
- **Sustainability tips** and green living advice
- **Nature-inspired animations** and visual elements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues:
1. **Virtual Environment Issues:** Make sure you're using the virtual environment (`source venv/bin/activate`)
2. **Backend Connection:** Check the backend is running on port 8000
3. **API Key:** Verify your Google API key is set correctly in `backend/.env`
4. **Dependencies:** Run `./setup.sh` to ensure all dependencies are properly installed
5. **Browser Console:** Check for any JavaScript errors
6. **Authentication:** Ensure the auth server is running on port 3003

## 🚀 Quick Troubleshooting

### Common Issues:
- **"externally-managed-environment" error:** Use the setup script which creates a virtual environment
- **Backend won't start:** Make sure you're using the virtual environment (`source venv/bin/activate`)
- **Port conflicts:** If port 8000 is busy, set a different port: `PORT=8001 python app.py`
- **Frontend can't connect to backend:** Verify backend is running and check CORS settings
- **Missing dependencies:** Run `./setup.sh` to reinstall everything
- **Authentication issues:** Check that the auth server is running and accessible

### Port Management:
- **Default backend port:** 8000 (changed from 5000 to avoid macOS AirPlay conflicts)
- **Default auth server port:** 3003
- **Custom port:** Set `PORT=8001` environment variable before starting backend
- **Check port usage:** Use `lsof -i :8000` to see what's using the port

---

**🌍 Together, let's make our planet greener! 🌱**
