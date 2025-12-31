/**
 * Coaching API Client
 */

import { authService } from '@/auth/auth.service';
import { 
  MindsetCheck, 
  CreateMindsetCheckRequest, 
  CoachingGuidance,
  DailyReflection,
  CreateReflectionRequest,
  ReflectionStats,
} from '../types/coaching.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const coachingApi = {
  /**
   * Get today's mindset check
   */
  async getTodayCheck(): Promise<MindsetCheck | null> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/mindset-check/today`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      authService.clearToken();
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Failed to fetch mindset check');
    }

    const responseData = await response.json();
    
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    return responseData.data || null;
  },

  /**
   * Submit today's mindset check
   */
  async submitMindsetCheck(data: CreateMindsetCheckRequest): Promise<MindsetCheck> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/mindset-check/today`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      authService.clearToken();
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Failed to submit mindset check');
    }

    const responseData = await response.json();
    
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    return responseData as MindsetCheck;
  },

  /**
   * Get daily coaching guidance
   */
  async getDailyCoaching(): Promise<CoachingGuidance> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/coaching/daily`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      authService.clearToken();
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Failed to fetch coaching guidance');
    }

    const responseData = await response.json();
    
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    return responseData as CoachingGuidance;
  },

  /**
   * Refresh coaching (for event triggers)
   */
  async refreshCoaching(): Promise<CoachingGuidance> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/coaching/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      authService.clearToken();
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Failed to refresh coaching');
    }

    const responseData = await response.json();
    
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    return responseData as CoachingGuidance;
  },

  // ============================================
  // Daily Reflection Methods
  // ============================================

  /**
   * Get today's reflection
   */
  async getTodayReflection(): Promise<DailyReflection | null> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/coaching/reflection/today`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      authService.clearToken();
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Failed to fetch reflection');
    }

    const responseData = await response.json();
    
    if (responseData.success && responseData.data) {
      return responseData.data.reflection || null;
    }
    
    return null;
  },

  /**
   * Save today's reflection
   */
  async saveReflection(data: CreateReflectionRequest): Promise<DailyReflection> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/coaching/reflection`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      authService.clearToken();
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Failed to save reflection');
    }

    const responseData = await response.json();
    
    if (responseData.success && responseData.data) {
      return responseData.data.reflection;
    }
    
    return responseData as DailyReflection;
  },

  /**
   * Get reflection history
   */
  async getReflectionHistory(days: number = 30): Promise<DailyReflection[]> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/coaching/reflection/history?days=${days}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      authService.clearToken();
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Failed to fetch reflection history');
    }

    const responseData = await response.json();
    
    if (responseData.success && responseData.data) {
      return responseData.data.reflections || [];
    }
    
    return [];
  },

  /**
   * Get reflection stats
   */
  async getReflectionStats(days: number = 30): Promise<ReflectionStats> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/coaching/reflection/stats?days=${days}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      authService.clearToken();
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Failed to fetch reflection stats');
    }

    const responseData = await response.json();
    
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    return responseData as ReflectionStats;
  },
};

