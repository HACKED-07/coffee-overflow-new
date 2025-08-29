# Terra Spark Net - Next.js App Router

A modern Next.js 15 application with authentication, database integration, and beautiful UI components built with shadcn/ui.

## 🚀 Features

- **Next.js 15 App Router** - Latest Next.js with App Router for optimal performance
- **Authentication** - Secure authentication with Auth.js, OAuth providers, and database sessions
- **Database Integration** - PostgreSQL with Prisma ORM
- **Modern UI** - Beautiful components with shadcn/ui and Tailwind CSS
- **Dark Mode** - Theme switching with system preference detection
- **TypeScript** - Full TypeScript support
- **OAuth Support** - Google and GitHub OAuth providers

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: Auth.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **State Management**: React Context API
- **HTTP Client**: TanStack Query

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── oauth-callback/
│   ├── (dashboard)/       # Protected dashboard pages
│   │   └── dashboard/
│   ├── (marketing)/       # Public marketing pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   └── ProtectedRoute.tsx
├── contexts/             # React contexts
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── hooks/                # Custom hooks
│   └── use-toast.ts
└── lib/                  # Utility functions
    └── utils.ts

auth-server/              # Auth.js backend server
├── prisma/              # Database schema
├── server.ts            # Express server
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL
- Docker (optional, for database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd terra-spark-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd auth-server && npm install
   ```

3. **Set up the database**
   ```bash
   # Start PostgreSQL with Docker
   docker run --name terra-spark-postgres \
     -e POSTGRES_PASSWORD=password \
     -e POSTGRES_DB=terraspark \
     -e POSTGRES_USER=postgres \
     -p 5432:5432 \
     -d postgres:latest
   ```

4. **Set up environment variables**
   ```bash
   # Copy environment files
   cp .env.local.example .env.local
   cp auth-server/.env.example auth-server/.env
   ```

5. **Configure environment variables**
   ```bash
   # .env.local
   DATABASE_URL="postgresql://postgres:password@localhost:5432/terraspark?schema=public"
   NEXT_PUBLIC_AUTH_BASE_URL="http://localhost:3003"
   
   # auth-server/.env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/terraspark?schema=public"
   AUTH_SECRET="your-super-secret-auth-key-change-this-in-production"
   AUTH_PORT=3003
   FRONTEND_ORIGIN=http://localhost:3000
   ```

6. **Set up the database schema**
   ```bash
   cd auth-server
   npx prisma generate
   npx prisma db push
   ```

7. **Start the development servers**
   ```bash
   # Terminal 1: Start auth server
   cd auth-server
   npm run dev
   
   # Terminal 2: Start Next.js app
   npm run dev
   ```

8. **Open your browser**
   - Frontend: http://localhost:3000
   - Auth Server: http://localhost:3003

## 🔐 Authentication

### Credentials Login
- Register a new account at `/register`
- Login with email/password at `/login`

### OAuth Providers
Configure OAuth providers in `auth-server/.env`:

```bash
# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### OAuth Setup Instructions

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3003/auth/callback/google`

#### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3003/auth/callback/github`

## 🎨 Customization

### Adding New Pages
Create new pages in the appropriate route group:
- Public pages: `src/app/(marketing)/`
- Auth pages: `src/app/(auth)/`
- Protected pages: `src/app/(dashboard)/`

### Adding New Components
- UI components: `src/components/ui/`
- Custom components: `src/components/`

### Styling
- Global styles: `src/app/globals.css`
- Component styles: Use Tailwind CSS classes
- Theme customization: Modify CSS variables in `globals.css`

## 📦 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Other Platforms
- **Netlify**: Configure build settings for Next.js
- **Railway**: Use Railway's PostgreSQL service
- **DigitalOcean**: Use App Platform

## 🔧 Development

### Available Scripts

```bash
# Next.js
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Auth Server
cd auth-server
npm run dev          # Start auth server
npm run build        # Build auth server
```

### Database Management

```bash
cd auth-server

# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma db push --force-reset
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## 🎯 Roadmap

- [ ] Add more OAuth providers
- [ ] Implement user roles and permissions
- [ ] Add real-time features with WebSockets
- [ ] Create admin dashboard
- [ ] Add email verification
- [ ] Implement password reset
- [ ] Add two-factor authentication
- [ ] Create API documentation
- [ ] Add comprehensive testing
