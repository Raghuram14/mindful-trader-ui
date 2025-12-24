import { useEffect, useRef, useState } from 'react';

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  onError?: (error: Error) => void;
}

export function GoogleSignInButton({ onSuccess, onError }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      console.error('VITE_GOOGLE_CLIENT_ID is not set');
      if (onError) {
        onError(new Error('Google Client ID not configured'));
      }
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      setScriptLoaded(true);
      initializeGoogleAuth();
      return;
    }

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setScriptLoaded(true);
      initializeGoogleAuth();
    };

    script.onerror = () => {
      if (onError) {
        onError(new Error('Failed to load Google Identity Services'));
      }
    };

    document.head.appendChild(script);

    function initializeGoogleAuth(): void {
      if (window.google?.accounts?.id && buttonRef.current) {
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

        window.google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          size: 'large',
          text: 'signin_with',
          theme: 'outline',
        });
      }
    }
  }, [clientId, onSuccess, onError]);

  if (!clientId) {
    return (
      <div className="text-center text-sm text-muted-foreground">
        Google authentication not configured
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div ref={buttonRef} id="google-signin-button" />
    </div>
  );
}
