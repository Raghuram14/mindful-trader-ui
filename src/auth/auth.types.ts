export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}

export interface GoogleAuthResponse {
  success: boolean;
  data?: {
    token: string;
    expiresAt: string;
  };
  message?: string;
  error?: string;
}

