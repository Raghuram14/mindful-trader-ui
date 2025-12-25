/**
 * Insights API Client
 */

import { apiClient } from '@/api/client';
import { InsightsResponse, InsightRange } from '../types/insight.types';

export const insightsApi = {
  /**
   * Get insights for a time range
   */
  async getInsights(range: InsightRange): Promise<InsightsResponse> {
    const rangeParam = range.toLowerCase();
    return apiClient.get<InsightsResponse>(`/insights?range=${rangeParam}`);
  },
};

