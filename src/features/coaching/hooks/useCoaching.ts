/**
 * Coaching Hook
 * 
 * Manages coaching data fetching and state
 */

import { useState, useEffect, useCallback } from 'react';
import { coachingApi } from '../api/coaching.api';
import { CoachingGuidance, MindsetCheck } from '../types/coaching.types';

interface UseCoachingResult {
  mindsetCheck: MindsetCheck | null;
  guidance: CoachingGuidance | null;
  hasCheckedToday: boolean;
  isLoading: boolean;
  error: Error | null;
  refetchCheck: () => Promise<void>;
  refetchGuidance: () => Promise<void>;
  refreshCoaching: () => Promise<void>;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let mindsetCheckCache: { data: MindsetCheck | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};
let guidanceCache: { data: CoachingGuidance | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};

export function useCoaching(): UseCoachingResult {
  const [mindsetCheck, setMindsetCheck] = useState<MindsetCheck | null>(null);
  const [guidance, setGuidance] = useState<CoachingGuidance | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMindsetCheck = useCallback(async () => {
    try {
      // Check cache
      const now = Date.now();
      if (mindsetCheckCache.data && (now - mindsetCheckCache.timestamp) < CACHE_DURATION) {
        setMindsetCheck(mindsetCheckCache.data);
        return;
      }

      const check = await coachingApi.getTodayCheck();
      mindsetCheckCache = { data: check, timestamp: now };
      setMindsetCheck(check);
    } catch (err) {
      console.error('Failed to fetch mindset check:', err);
      // Don't set error for mindset check - it's optional
    }
  }, []);

  const fetchGuidance = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check cache
      const now = Date.now();
      if (guidanceCache.data && (now - guidanceCache.timestamp) < CACHE_DURATION) {
        setGuidance(guidanceCache.data);
        setIsLoading(false);
        return;
      }

      const guidanceData = await coachingApi.getDailyCoaching();
      guidanceCache = { data: guidanceData, timestamp: now };
      setGuidance(guidanceData);
    } catch (err) {
      console.error('Failed to fetch coaching guidance:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch coaching guidance'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchMindsetCheck(), fetchGuidance()]);
    };
    loadData();
  }, [fetchMindsetCheck, fetchGuidance]);

  // Refresh coaching (for event triggers)
  const refreshCoaching = useCallback(async () => {
    // Clear cache and refetch
    mindsetCheckCache = { data: null, timestamp: 0 };
    guidanceCache = { data: null, timestamp: 0 };
    await Promise.all([fetchMindsetCheck(), fetchGuidance()]);
  }, [fetchMindsetCheck, fetchGuidance]);

  const hasCheckedToday = mindsetCheck !== null;

  return {
    mindsetCheck,
    guidance,
    hasCheckedToday,
    isLoading,
    error,
    refetchCheck: fetchMindsetCheck,
    refetchGuidance: fetchGuidance,
    refreshCoaching,
  };
}

