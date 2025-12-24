import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (element: HTMLElement, config: {
            type: string;
            size: string;
            text: string;
            theme: string;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface UseGoogleAuthOptions {
  onSuccess: (credential: string) => void;
  onError?: (error: Error) => void;
}

export function useGoogleAuth({ onSuccess, onError }: UseGoogleAuthOptions) {
  const scriptLoaded = useRef(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      console.error('VITE_GOOGLE_CLIENT_ID is not set');
      return;
    }

    // Load Google Identity Services script
    if (!scriptLoaded.current) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        scriptLoaded.current = true;
        initializeGoogleAuth();
      };
      script.onerror = () => {
        if (onError) {
          onError(new Error('Failed to load Google Identity Services'));
        }
      };
      document.head.appendChild(script);
    } else {
      initializeGoogleAuth();
    }

    function initializeGoogleAuth(): void {
      if (!window.google?.accounts?.id) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: { credential: string }) => {
          if (response.credential) {
            onSuccess(response.credential);
          } else {
            if (onError) {
              onError(new Error('No credential received from Google'));
            }
          }
        },
      });
    }

    return () => {
      // Cleanup if needed
    };
  }, [clientId, onSuccess, onError]);

  const triggerSignIn = (): void => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  };

  return { triggerSignIn };
}

