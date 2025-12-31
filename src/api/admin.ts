/**
 * Admin API Client
 * 
 * API calls for admin functionality.
 * REMOVAL: Delete this file and remove imports from AdminPage
 */

import { apiClient } from "./client";

// Types matching backend admin.types.ts
export interface AdminDashboardStats {
  users: {
    total: number;
    newToday: number;
    newThisWeek: number;
    byExperience: Record<string, number>;
  };
  trades: {
    total: number;
    openCount: number;
    closedCount: number;
    todayCount: number;
  };
  activity: {
    activeToday: number;
    mindsetChecksToday: number;
    ruleBreachesToday: number;
  };
  suggestions: {
    total: number;
    pending: number;
    implemented: number;
  };
}

export interface AdminUserListItem {
  _id: string;
  email: string;
  name: string;
  experienceLevel?: string;
  tradingStyle?: string;
  accountSize?: number;
  createdAt: string;
  lastActivity?: string;
  stats: {
    totalTrades: number;
    openTrades: number;
  };
}

export interface AdminUserDetail {
  user: AdminUserListItem;
  recentTrades: Array<{
    _id: string;
    symbol: string;
    type: string;
    entryPrice: number;
    quantity: number;
    status: string;
    tradeDate: string;
    pnl?: number;
  }>;
  recentMindsetChecks: Array<{
    _id: string;
    feeling: number;
    marketBias: string;
    createdAt: string;
  }>;
  recentRuleBreaches: Array<{
    _id: string;
    ruleType: string;
    severity: string;
    occurredAt: string;
  }>;
}

export interface AdminActivityItem {
  type: "user_joined" | "trade_opened" | "trade_closed" | "mindset_check" | "rule_breach";
  userId: string;
  userEmail: string;
  userName: string;
  details: string;
  timestamp: string;
}

export interface UsersResponse {
  users: AdminUserListItem[];
  total: number;
  page: number;
  totalPages: number;
}

// Admin API functions
export const adminApi = {
  /**
   * Check if current user is admin
   */
  checkAdminStatus: async (): Promise<{ isAdmin: boolean }> => {
    try {
      return await apiClient.get<{ isAdmin: boolean }>("/admin/check");
    } catch {
      return { isAdmin: false };
    }
  },

  /**
   * Get dashboard statistics
   */
  getDashboard: async (): Promise<AdminDashboardStats> => {
    return apiClient.get<AdminDashboardStats>("/admin/dashboard");
  },

  /**
   * Get users with search and pagination
   */
  getUsers: async (options?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<UsersResponse> => {
    const params = new URLSearchParams();
    if (options?.search) params.append("search", options.search);
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());
    
    const queryString = params.toString();
    return apiClient.get<UsersResponse>(`/admin/users${queryString ? `?${queryString}` : ""}`);
  },

  /**
   * Get detailed user information
   */
  getUserDetail: async (userId: string): Promise<AdminUserDetail> => {
    return apiClient.get<AdminUserDetail>(`/admin/users/${userId}`);
  },

  /**
   * Get recent activity
   */
  getRecentActivity: async (limit?: number): Promise<AdminActivityItem[]> => {
    const params = limit ? `?limit=${limit}` : "";
    return apiClient.get<AdminActivityItem[]>(`/admin/activity${params}`);
  },
};
