/**
 * useInsightsV2 Hook
 * 
 * Fetches insights V2 from backend with caching per range
 */

import { useState, useEffect, useCallback } from 'react';
import { insightsV2Api } from '../api/insightsV2.api';
import { InsightsResponseV2, InsightRange } from '../types/insightV2.types';

interface UseInsightsV2Result {
  data: InsightsResponseV2 | null;
  loading: boolean;
  error: boolean;
  refetch: () => void;
}

const cache: Record<InsightRange, { data: InsightsResponseV2 | null; timestamp: number }> = {
  TODAY: { data: null, timestamp: 0 },
  WEEK: { data: null, timestamp: 0 },
  MONTH: { data: null, timestamp: 0 },
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useInsightsV2(range: InsightRange): UseInsightsV2Result {
  const [data, setData] = useState<InsightsResponseV2 | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      // Check cache first
      const cached = cache[range];
      const now = Date.now();
      
      if (cached.data && (now - cached.timestamp) < CACHE_DURATION) {
        setData(cached.data);
        setLoading(false);
        return;
      }

      // Fetch from API
      const response = await insightsV2Api.getInsights(range);
      
      // Update cache
      cache[range] = {
        data: response,
        timestamp: now,
      };

      setData(response);
    } catch (err) {
      console.error('Failed to fetch insights V2:', err);
      setError(true);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return {
    data,
    loading,
    error,
    refetch: fetchInsights,
  };
}

