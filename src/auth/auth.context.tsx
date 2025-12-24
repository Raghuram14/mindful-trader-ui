import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService } from "./auth.service";
import { AuthState } from "./auth.types";

interface AuthContextType {
  isAuthenticated: boolean;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    isAuthenticated: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      setAuthState({
        token,
        isAuthenticated: true,
      });
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
      // Navigation will be handled by the component calling this
    } catch (error) {
      authService.clearToken();
      setAuthState({
        token: null,
        isAuthenticated: false,
      });
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
