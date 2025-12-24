import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/auth.context';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credential: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await loginWithGoogle(credential);
      navigate('/today');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleError = (err: Error): void => {
    setError(err.message);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Mindful<span className="text-primary">Trade</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Trade with clarity, not emotion
          </p>
        </div>

        {/* Auth Card */}
        <div className="card-calm">
          <div className="text-center mb-6">
            <h2 className="text-lg font-medium text-foreground mb-2">
              Continue with Google
            </h2>
            <p className="text-sm text-muted-foreground">
              We use Google only to identify you. No passwords, no spam.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <GoogleSignInButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />

            {isLoading && (
              <p className="text-sm text-muted-foreground text-center">
                Authenticating...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
