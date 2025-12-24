import { GoogleAuthResponse } from './auth.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export class AuthService {
  private static TOKEN_KEY = 'mindfultrade_token';

  async loginWithGoogle(idToken: string): Promise<{ token: string; expiresAt: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    const data = (await response.json()) as GoogleAuthResponse;

    if (!response.ok || !data.success || !data.data) {
      throw new Error(data.error || data.message || 'Authentication failed');
    }

    return data.data;
  }

  saveToken(token: string): void {
    localStorage.setItem(AuthService.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(AuthService.TOKEN_KEY);
  }

  clearToken(): void {
    localStorage.removeItem(AuthService.TOKEN_KEY);
  }
}

export const authService = new AuthService();

