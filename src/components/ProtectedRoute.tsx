import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoading } from '@/components/ui/loading';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  redirectTo 
}: ProtectedRouteProps) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const [shouldRender, setShouldRender] = useState(false);

  // Default redirect URLs
  const AUTH_BASE = import.meta.env.VITE_AUTH_BASE_URL || 'http://localhost:3003';
  const defaultSignInUrl = `${AUTH_BASE}/auth/signin`;
  const defaultDashboardUrl = '/dashboard';

  // Add a small delay to prevent flash of content
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setShouldRender(true);
      }, 100); // Small delay to ensure smooth transition
      
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Show loading state while checking authentication
  if (loading || !shouldRender) {
    return <PageLoading message="Checking authentication..." />;
  }

  // If authentication is required and user is not logged in
  if (requireAuth && !isAuthenticated) {
    // Redirect to Auth.js signin page using window.location for external redirect
    const signInUrl = redirectTo || defaultSignInUrl;
    window.location.href = signInUrl;
    return null; // Return null since we're redirecting with window.location
  }

  // If authentication is NOT required and user IS logged in (e.g., login page)
  if (!requireAuth && isAuthenticated) {
    return <Navigate to={defaultDashboardUrl} replace />;
  }

  // User is authenticated and can access the protected route
  return <>{children}</>;
};
