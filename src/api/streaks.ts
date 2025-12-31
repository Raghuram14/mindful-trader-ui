import { apiClient } from './client';

/**
 * Streak Types - matches backend StreakType
 */
export type StreakType = 
  | 'PLAN_ADHERENCE'    // Consecutive trades following the plan
  | 'DISCIPLINE'        // Consecutive trades with no rule violations
  | 'CALM_EXECUTION'    // Trades without FOMO/revenge patterns
  | 'RISK_RESPECT'      // Trades within position size/stop rules
  | 'REFLECTION';       // Consecutive days completing daily reflection

/**
 * Milestone Types - matches backend MilestoneType
 */
export type MilestoneCategory = 
  | 'CONSISTENCY'   // Plan adherence, regular reflection
  | 'GROWTH'        // Score improvements, behavioral changes
  | 'AWARENESS'     // Pattern recognition, self-reflection
  | 'RESILIENCE';   // Bounce back from tough days

export type MilestoneType =
  // Consistency milestones
  | 'FIRST_WEEK_PLAN_ADHERENCE'
  | 'DISCIPLINE_STREAK_5'
  | 'DISCIPLINE_STREAK_10'
  | 'DISCIPLINE_STREAK_20'
  | 'REFLECTION_STREAK_7'
  | 'REFLECTION_STREAK_14'
  | 'REFLECTION_STREAK_30'
  // Growth milestones
  | 'DISCIPLINE_SCORE_IMPROVED_10'
  | 'DISCIPLINE_SCORE_IMPROVED_20'
  | 'FIRST_WEEK_NO_VIOLATIONS'
  | 'MONTH_IMPROVED_OVERALL'
  // Awareness milestones
  | 'FIRST_PATTERN_NOTICED'
  | 'TRADES_LOGGED_10'
  | 'TRADES_LOGGED_50'
  | 'TRADES_LOGGED_100'
  // Resilience milestones
  | 'RETURNED_AFTER_LOSS'
  | 'CALM_AFTER_STREAK_BREAK'
  | 'WEEK_AFTER_TOUGH_DAY';

/**
 * Active Streak Response - only streaks with currentCount > 0
 */
export interface ActiveStreak {
  type: StreakType;
  currentCount: number;
  longestCount: number;
  averageCount: number;
  streakStartDate: string | null;
  lastUpdated: string;
}

/**
 * Full Streak Response - includes all streak data
 */
export interface FullStreak extends ActiveStreak {
  totalStreaks: number;
  totalCompletedItems: number;
}

/**
 * Milestone Response
 */
export interface Milestone {
  _id: string;
  type: MilestoneType;
  category: MilestoneCategory;
  title: string;
  description: string;
  achievedAt: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  context?: {
    value?: number;
    previousValue?: number;
    relatedTradeIds?: string[];
  };
}

/**
 * Streaks & Milestones API
 * 
 * Design Philosophy:
 * - Streaks are only fetched when active (no zero counters shown to user)
 * - Milestones are journey markers, not achievements
 * - All recognition is calm and coach-like
 */
export const streaksApi = {
  /**
   * Get active behavioral streaks (currentCount > 0)
   */
  getActiveStreaks: () => {
    return apiClient.get<ActiveStreak[]>('/coaching/streaks');
  },

  /**
   * Get all streaks including inactive ones
   * (for analytics/admin purposes)
   */
  getAllStreaks: () => {
    return apiClient.get<FullStreak[]>('/coaching/streaks/all');
  },

  /**
   * Get unacknowledged milestones
   * (for showing new milestone toasts)
   */
  getUnacknowledgedMilestones: () => {
    return apiClient.get<Milestone[]>('/coaching/milestones');
  },

  /**
   * Get all milestones (acknowledged and unacknowledged)
   */
  getAllMilestones: () => {
    return apiClient.get<Milestone[]>('/coaching/milestones/all');
  },

  /**
   * Acknowledge a milestone (mark as seen)
   */
  acknowledgeMilestone: (id: string) => {
    return apiClient.post<Milestone>(`/coaching/milestones/${id}/acknowledge`);
  },

  /**
   * Acknowledge all unacknowledged milestones
   */
  acknowledgeAllMilestones: () => {
    return apiClient.post<{ acknowledged: number }>('/coaching/milestones/acknowledge-all');
  },
};
