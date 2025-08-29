import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLoading } from '@/components/ui/loading';

export default function Register() {
  const { signIn, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    // If user is already authenticated, redirect to intended destination
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSignUp = () => {
    // Auth.js handles signup through the same login flow
    signIn();
  };

  const handleGoogleSignUp = () => {
    signIn('google');
  };

  const handleGitHubSignUp = () => {
    signIn('github');
  };

  if (loading) {
    return <PageLoading message="Loading..." />;
  }

  if (isAuthenticated) {
    return <PageLoading message="Redirecting..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Sign up to get started with your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleSignUp}
            className="w-full"
            size="lg"
          >
            Sign Up with Auth.js
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={handleGoogleSignUp}
              className="w-full"
            >
              Google
            </Button>
            <Button 
              variant="outline" 
              onClick={handleGitHubSignUp}
              className="w-full"
            >
              GitHub
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Already have an account?{' '}
            <Button 
              variant="link" 
              className="p-0 h-auto text-xs"
              onClick={() => navigate('/login')}
            >
              Sign in here
            </Button>
          </p>

          <p className="text-xs text-center text-muted-foreground">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
