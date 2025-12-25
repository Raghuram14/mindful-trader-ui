/**
 * useInsights Hook
 * 
 * Fetches insights from backend with caching per range
 */

import { useState, useEffect } from 'react';
import { insightsApi } from '../api/insights.api';
import { InsightCard, InsightRange } from '../types/insight.types';

interface UseInsightsResult {
  data: InsightCard[] | null;
  loading: boolean;
  error: boolean;
  refetch: () => void;
}

const cache: Record<InsightRange, { data: InsightCard[] | null; timestamp: number }> = {
  TODAY: { data: null, timestamp: 0 },
  WEEK: { data: null, timestamp: 0 },
  MONTH: { data: null, timestamp: 0 },
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useInsights(range: InsightRange): UseInsightsResult {
  const [data, setData] = useState<InsightCard[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const fetchInsights = async () => {
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
      const response = await insightsApi.getInsights(range);
      
      // Update cache
      cache[range] = {
        data: response.insights,
        timestamp: now,
      };

      setData(response.insights);
    } catch (err) {
      console.error('Failed to fetch insights:', err);
      setError(true);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  return {
    data,
    loading,
    error,
    refetch: fetchInsights,
  };
}

