import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoading } from '@/components/ui/loading';
import { useToast } from '@/hooks/use-toast';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { createOAuthSession } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Get user data from URL parameters (this would be set by Auth.js)
        const userEmail = searchParams.get('email');
        const userName = searchParams.get('name');
        const userImage = searchParams.get('image');
        const error = searchParams.get('error');

        if (error) {
          toast({
            title: "OAuth Error",
            description: "Failed to authenticate with OAuth provider",
            variant: "destructive",
          });
          navigate('/login');
          return;
        }

        if (!userEmail) {
          toast({
            title: "Authentication Error",
            description: "No user information received from OAuth provider",
            variant: "destructive",
          });
          navigate('/login');
          return;
        }

        // Create session using the OAuth user data
        const result = await createOAuthSession({
          email: userEmail,
          name: userName || undefined,
          image: userImage || undefined,
        });

        if (result.success) {
          toast({
            title: "Success",
            description: "Successfully authenticated with OAuth!",
          });
          navigate('/dashboard');
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to create session",
            variant: "destructive",
          });
          navigate('/login');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred during OAuth authentication",
          variant: "destructive",
        });
        navigate('/login');
      } finally {
        setIsProcessing(false);
      }
    };

    processOAuthCallback();
  }, [searchParams, createOAuthSession, navigate, toast]);

  if (isProcessing) {
    return <PageLoading message="Completing OAuth authentication..." />;
  }

  return null;
}
