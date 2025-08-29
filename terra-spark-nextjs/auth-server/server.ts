import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Auth } from '@auth/core';
import Google from '@auth/core/providers/google';
import GitHub from '@auth/core/providers/github';
import Credentials from '@auth/core/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.AUTH_PORT ? Number(process.env.AUTH_PORT) : 3003;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:8080';

// Initialize Prisma
const prisma = new PrismaClient();

app.use(cors({ 
  origin: [FRONTEND_ORIGIN, 'http://localhost:8080', 'http://localhost:3003'], 
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const authOptions = {
  secret: process.env.AUTH_SECRET || 'dev_secret_change_me',
  trustHost: true,
  debug: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        
        if (isValid) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        }

        return null;
      }
    })
  ],
  session: { strategy: 'jwt' as const },
  callbacks: {
    async jwt({ token, user, account }: any) {
      if (account && user) {
        return {
          ...token,
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id,
          email: token.email,
          name: token.name,
          image: token.image,
        };
      }
      return session;
    },
    async signIn({ user, account }: any) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        console.log('🔐 OAuth sign-in successful:', user.email);
        
        try {
          // Find or create user in database
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email }
          });
          
          if (!dbUser) {
            // Create new user from OAuth
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                image: user.image,
              }
            });
            console.log('🔐 Created new user from OAuth:', dbUser.email);
          }
          
          // Create session
          const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
          
          await prisma.session.create({
            data: {
              sessionToken,
              userId: dbUser.id,
              expires
            }
          });
          
          console.log('🔐 OAuth session created for user:', dbUser.email);
        } catch (error) {
          console.error('❌ Error creating OAuth session:', error);
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }: any) {
      if (url.startsWith("/") || new URL(url).origin === baseUrl) {
        // For OAuth callbacks, redirect to our custom callback page
        if (url.includes('/callback')) {
          return FRONTEND_ORIGIN + '/oauth-callback';
        }
        return FRONTEND_ORIGIN + '/dashboard';
      }
      return url;
    }
  },
  cookies: {
    sessionToken: {
      name: 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        secure: false,
        path: '/',

      }
    }
  },
};

function toWebRequest(req: express.Request, overridePath?: string) {
  const url = `${req.protocol}://${req.get('host')}${overridePath ?? req.originalUrl}`;
  const method = req.method;
  const headers = req.headers as any;

  let body: string | undefined = undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    const ct = (headers['content-type'] || '') as string;
    if (ct.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries((req as any).body || {})) {
        params.append(k, String(v));
      }
      body = params.toString();
    } else if ((req as any).body && Object.keys((req as any).body).length > 0) {
      body = JSON.stringify((req as any).body);
    }
  }

  return new Request(url, {
    method,
    headers,
    body,
  });
}

app.get('/', (_req, res) => res.redirect(FRONTEND_ORIGIN));

// Simple user registration endpoint
app.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
      }
    });

    res.status(201).json({ 
      message: 'User created successfully',
      success: true,
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        image: user.image,
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle all Auth.js routes
app.use('/auth', async (req, res) => {
  try {
    console.log('🔐 Auth.js request:', req.method, req.url);
    
    const request = toWebRequest(req);
    const response = await Auth(request, authOptions);
    
    console.log('🔐 Auth.js response status:', response.status);
    
    const headers = Object.fromEntries(response.headers.entries());
    res.set(headers);
    
    // Handle logout specifically
    if (req.url.includes('/signout')) {
      console.log('🔐 Processing logout...');
      
      // Clear the session cookie
      res.clearCookie('authjs.session-token');
      
      // Get session token from cookies
      const sessionToken = req.cookies['authjs.session-token'];
      
      if (sessionToken) {
        // Delete session from database
        try {
          await prisma.session.deleteMany({
            where: { sessionToken }
          });
          console.log('🔐 Session deleted from database');
        } catch (error) {
          console.error('❌ Error deleting session:', error);
        }
      }
      
      // Redirect to frontend
      return res.redirect(FRONTEND_ORIGIN);
    }
    
    // Handle successful authentication
    if (response.status === 200 || response.status === 302) {
      const responseText = await response.text();
      
      // Check if this is a successful signin or OAuth callback
      if (req.url.includes('/signin') || req.url.includes('/callback')) {
        console.log('🔐 Processing successful authentication...');
        
        // For credentials provider, we need to handle the response differently
        if (req.method === 'POST' && req.url.includes('/signin')) {
          try {
            const body = req.body;
            console.log('🔐 Signin body:', body);
            
            if (body.email && body.password) {
              // Find user in database
              const user = await prisma.user.findUnique({
                where: { email: body.email }
              });
              
              if (user && user.password && await bcrypt.compare(body.password, user.password)) {
                // Create session
                const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
                
                await prisma.session.create({
                  data: {
                    sessionToken,
                    userId: user.id,
                    expires
                  }
                });
                
                // Set session cookie
                res.cookie('authjs.session-token', sessionToken, {
                  httpOnly: true,
                  secure: false,
                  sameSite: 'lax',
                  expires
                });
                
                console.log('🔐 Session created for user:', user.email);
                
                // Redirect to frontend
                return res.redirect(FRONTEND_ORIGIN + '/dashboard');
              }
            }
          } catch (error) {
            console.error('❌ Error processing credentials:', error);
          }
        }
        
        
      }
      
      // Send the response text
      return res.status(response.status).send(responseText);
    }
    
    // For other responses, send the response text
    const responseText = await response.text();
    res.status(response.status).send(responseText);
  } catch (error) {
    console.error('❌ Auth.js error:', error);
    res.status(500).json({ error: 'Authentication error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/session', async (req, res) => {
  try {
    // Get session token from cookies
    const sessionToken = req.cookies['authjs.session-token'];
    
    if (!sessionToken) {
      return res.status(401).json({ error: 'No session token' });
    }

    // Find session in database
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true }
    });

    if (!session || session.expires < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    res.json({ user: session.user });
  } catch (error) {
    console.error('Session endpoint error:', error);
    res.status(401).json({ error: 'Session error' });
  }
});

// Simple login endpoint for credentials
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Create session
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires
      }
    });
    
    // Set session cookie
    res.cookie('authjs.session-token', sessionToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires
    });
    
    console.log('🔐 Login successful for user:', user.email);
    
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image
      }
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Simple logout endpoint
app.post('/logout', async (req, res) => {
  try {
    console.log('🔐 Processing logout...');
    
    // Get session token from cookies
    const sessionToken = req.cookies['authjs.session-token'];
    
    if (sessionToken) {
      // Delete session from database
      try {
        await prisma.session.deleteMany({
          where: { sessionToken }
        });
        console.log('🔐 Session deleted from database');
      } catch (error) {
        console.error('❌ Error deleting session:', error);
      }
    }
    
    // Clear the session cookie
    res.clearCookie('authjs.session-token');
    
    console.log('🔐 Logout successful');
    
    res.json({ success: true, message: 'Logged out successfully' });
    
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create session from OAuth user
app.post('/oauth-session', async (req, res) => {
  try {
    const { email, name, image } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    console.log('🔐 Creating OAuth session for:', email);
    
    // Find or create user in database
    let user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      // Create new user from OAuth
      user = await prisma.user.create({
        data: {
          email,
          name: name || null,
          image: image || null,
        }
      });
      console.log('🔐 Created new user from OAuth:', user.email);
    }
    
    // Create session
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires
      }
    });
    
    // Set session cookie
    res.cookie('authjs.session-token', sessionToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires
    });
    
    console.log('🔐 OAuth session created for user:', user.email);
    
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image
      }
    });
    
  } catch (error) {
    console.error('❌ OAuth session creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
  console.log(`Frontend origin: ${FRONTEND_ORIGIN}`);
});
