#!/bin/bash

echo "🚀 Setting up Terra Spark Net - Next.js App Router"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install auth-server dependencies
echo "📦 Installing auth-server dependencies..."
cd auth-server && npm install && cd ..

# Create environment files if they don't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local..."
    cat > .env.local << EOF
DATABASE_URL="postgresql://postgres:password@localhost:5432/terraspark?schema=public"
NEXT_PUBLIC_AUTH_BASE_URL="http://localhost:3003"
EOF
fi

if [ ! -f auth-server/.env ]; then
    echo "📝 Creating auth-server/.env..."
    cat > auth-server/.env << EOF
DATABASE_URL="postgresql://postgres:password@localhost:5432/terraspark?schema=public"
AUTH_SECRET="your-super-secret-auth-key-change-this-in-production"
AUTH_PORT=3003
FRONTEND_ORIGIN=http://localhost:3000
EOF
fi

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start PostgreSQL database:"
echo "   docker run --name terra-spark-postgres \\"
echo "     -e POSTGRES_PASSWORD=password \\"
echo "     -e POSTGRES_DB=terraspark \\"
echo "     -e POSTGRES_USER=postgres \\"
echo "     -p 5432:5432 \\"
echo "     -d postgres:latest"
echo ""
echo "2. Set up database schema:"
echo "   cd auth-server && npx prisma generate && npx prisma db push"
echo ""
echo "3. Start development servers:"
echo "   npm run dev:all"
echo ""
echo "4. Open your browser:"
echo "   - Frontend: http://localhost:3000"
echo "   - Auth Server: http://localhost:3003"
echo ""
echo "🔐 For OAuth setup, see README.md for detailed instructions."

