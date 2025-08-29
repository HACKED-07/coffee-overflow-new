'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function OAuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
          router.push('/login');
          return;
        }

        if (!userEmail) {
          toast({
            title: "Authentication Error",
            description: "No user information received from OAuth provider",
            variant: "destructive",
          });
          router.push('/login');
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
          router.push('/dashboard');
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to create session",
            variant: "destructive",
          });
          router.push('/login');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred during OAuth authentication",
          variant: "destructive",
        });
        router.push('/login');
      } finally {
        setIsProcessing(false);
      }
    };

    processOAuthCallback();
  }, [searchParams, createOAuthSession, router, toast]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Completing OAuth authentication...</p>
        </div>
      </div>
    );
  }

  return null;
}

