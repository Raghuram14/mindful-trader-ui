import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService } from "./auth.service";
import { AuthState } from "./auth.types";
import { profileApi } from "@/api/profile";

interface AuthContextType {
  isAuthenticated: boolean;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  userEmail: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    isAuthenticated: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Fetch user email from profile API
  const fetchUserEmail = async () => {
    try {
      const profile = await profileApi.getProfile();
      setUserEmail(profile.email);
    } catch (error) {
      console.error("Failed to fetch user email:", error);
      setUserEmail(null);
    }
  };

  // Check for existing token on mount
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      setAuthState({
        token,
        isAuthenticated: true,
      });
      // Fetch email from profile API
      fetchUserEmail();
    }
    setIsLoading(false);
  }, []);

  const loginWithGoogle = async (idToken: string): Promise<void> => {
    try {
      const { token } = await authService.loginWithGoogle(idToken);
      authService.saveToken(token);
      setAuthState({
        token,
        isAuthenticated: true,
      });
      // Fetch email from profile API
      await fetchUserEmail();
      // Navigation will be handled by the component calling this
    } catch (error) {
      authService.clearToken();
      setAuthState({
        token: null,
        isAuthenticated: false,
      });
      setUserEmail(null);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Call backend logout endpoint and clear token
      await authService.logout();
    } catch (error) {
      // Even if backend call fails, clear token locally
      authService.clearToken();
    } finally {
      setAuthState({
        token: null,
        isAuthenticated: false,
      });
      setUserEmail(null);
      // Navigation will be handled by the component calling this
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        loginWithGoogle,
        logout,
        isLoading,
        userEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
