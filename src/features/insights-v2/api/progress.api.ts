/**
 * Progress API Client
 * 
 * API client for progress comparison and behavioral journey features
 */

import { apiClient } from '@/api/client';
import { ProgressComparisonResponse, WeeklyBehavioralData } from '../types/progress.types';

export const progressApi = {
  /**
   * Get progress comparison - before/after behavioral analysis
   */
  async getProgressComparison(): Promise<ProgressComparisonResponse> {
    return apiClient.get<ProgressComparisonResponse>('/insights/progress');
  },

  /**
   * Get weekly behavioral trends for charts
   * @param weeks Number of weeks to fetch (default 8)
   */
  async getWeeklyTrends(weeks: number = 8): Promise<WeeklyBehavioralData[]> {
    return apiClient.get<WeeklyBehavioralData[]>(`/insights/progress/weekly?weeks=${weeks}`);
  },
};
