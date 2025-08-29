import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface AuthUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  sub?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (provider?: string, credentials?: { email: string; password: string }) => Promise<{ success: boolean; error?: string } | void>;
  signOut: () => void;
  createOAuthSession: (userData: { email: string; name?: string; image?: string }) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_BASE = import.meta.env.VITE_AUTH_BASE_URL || 'http://localhost:3003';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchSession() {
      try {
        console.log('🔍 Fetching session from:', `${AUTH_BASE}/session`);
        const res = await fetch(`${AUTH_BASE}/session`, { 
          credentials: 'include', 
          signal: controller.signal 
        });
        console.log('📡 Session response status:', res.status);
        
        if (res.ok) {
          const json = await res.json();
          console.log('✅ Session data received:', json);
          setUser(json?.user || null);
        } else {
          console.log('❌ Session fetch failed, status:', res.status);
          setUser(null);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('💥 Session fetch error:', error);
        }
        setUser(null);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    }
    
    fetchSession();
    return () => controller.abort();
  }, []);

           const signIn = async (provider?: string, credentials?: { email: string; password: string }) => {
           if (credentials) {
             try {
               const response = await fetch(`${AUTH_BASE}/login`, {
                 method: 'POST',
                 headers: {
                   'Content-Type': 'application/json',
                 },
                 credentials: 'include',
                 body: JSON.stringify(credentials),
               });
               
               if (response.ok) {
                 const data = await response.json();
                 setUser(data.user);
                 return { success: true };
               } else {
                 const error = await response.json();
                 return { success: false, error: error.error };
               }
             } catch (error) {
               console.error('Login error:', error);
               return { success: false, error: 'Network error' };
             }
           } else {
             if (provider) {
               // For OAuth, redirect to Auth.js signin
               window.location.href = `${AUTH_BASE}/auth/signin?provider=${provider}`;
             } else {
               window.location.href = `${AUTH_BASE}/auth/signin`;
             }
           }
         };

           const signOut = async () => {
           try {
             const response = await fetch(`${AUTH_BASE}/logout`, {
               method: 'POST',
               credentials: 'include',
             });
             
             if (response.ok) {
               setUser(null);
               window.location.href = '/';
             } else {
               console.error('Logout failed');
               // Fallback to Auth.js signout
               window.location.href = `${AUTH_BASE}/auth/signout`;
             }
           } catch (error) {
             console.error('Logout error:', error);
             // Fallback to Auth.js signout
             window.location.href = `${AUTH_BASE}/auth/signout`;
           }
         };

         const createOAuthSession = async (userData: { email: string; name?: string; image?: string }) => {
           try {
             const response = await fetch(`${AUTH_BASE}/oauth-session`, {
               method: 'POST',
               headers: {
                 'Content-Type': 'application/json',
               },
               credentials: 'include',
               body: JSON.stringify(userData),
             });
             
             if (response.ok) {
               const data = await response.json();
               setUser(data.user);
               return { success: true };
             } else {
               const error = await response.json();
               return { success: false, error: error.error };
             }
           } catch (error) {
             console.error('OAuth session creation error:', error);
             return { success: false, error: 'Network error' };
           }
         };

           const value = useMemo(() => ({ 
           user, 
           loading: loading || !initialized, 
           signIn, 
           signOut, 
           createOAuthSession,
           isAuthenticated: !!user 
         }), [user, loading, initialized]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
