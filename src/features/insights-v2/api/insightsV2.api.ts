/**
 * Insights V2 API Client
 */

import { apiClient } from '@/api/client';
import { InsightsResponseV2, InsightRange } from '../types/insightV2.types';

export const insightsV2Api = {
  /**
   * Get insights V2 for a time range
   */
  async getInsights(range: InsightRange): Promise<InsightsResponseV2> {
    const rangeParam = range.toLowerCase();
    return apiClient.get<InsightsResponseV2>(`/insights?range=${rangeParam}&version=v2`);
  },
};

