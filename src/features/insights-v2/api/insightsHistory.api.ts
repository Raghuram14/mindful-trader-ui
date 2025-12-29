/**
 * Insights History API
 * 
 * API endpoints for historical insights data, trends, and exports
 */

import { apiClient } from '@/api/client';
import { authService } from '@/auth/auth.service';

export interface TrendData {
  raw: Array<{
    date: Date;
    timeRange: string;
    discipline: string;
    risk: string;
    psychology: string;
    consistencyScore: number;
    tradeCount: number;
  }>;
  weekly: Array<{
    weekStart: Date;
    weekEnd: Date;
    discipline: number;
    risk: number;
    psychology: number;
    breachCount: number;
    tradeCount: number;
    winRate: number;
  }>;
}

export interface AggregateResult {
  weeksAggregated: number;
}

export const insightsHistoryApi = {
  /**
   * Get metric trends over time
   */
  async getTrends(days: number = 30, expand: boolean = false): Promise<TrendData> {
    return apiClient.get<TrendData>(`/insights/trends?days=${days}&expand=${expand}`);
  },

  /**
   * Trigger weekly aggregation for old data
   */
  async aggregateWeeks(): Promise<AggregateResult> {
    return apiClient.post<AggregateResult>('/insights/aggregate', {});
  },

  /**
   * Export insights data as CSV
   */
  async exportData(startDate?: string, endDate?: string): Promise<Blob> {
    let url = '/insights/export';
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) {
      url += '?' + params.toString();
    }

    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${url}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export data');
    }

    return response.blob();
  },
};
