/**
 * Progress Comparison Types
 * 
 * Frontend types for the behavioral journey and progress comparison feature
 */

export type BehavioralCategory = 'DISCIPLINE' | 'PSYCHOLOGY' | 'RISK' | 'CONSISTENCY' | 'GENERAL';

export type ChangeDirection = 'IMPROVED' | 'UNCHANGED' | 'NEEDS_ATTENTION';

export type TrendDirection = 'IMPROVING' | 'STABLE' | 'DECLINING';

export interface PeriodValue {
  value: number;
  label: string;
  tradesAnalyzed: number;
}

export interface MetricChange {
  absolute: number;
  percentage: number;
  direction: ChangeDirection;
}

export interface MetricCoaching {
  headline: string;
  insight: string;
  encouragement?: string;
}

/**
 * A single behavioral metric showing before/after comparison
 */
export interface BehavioralGrowthMetric {
  name: string;
  category: BehavioralCategory;
  periodA: PeriodValue;
  periodB: PeriodValue;
  change: MetricChange;
  coaching: MetricCoaching;
}

/**
 * A milestone achieved on the journey
 */
export interface JourneyMilestone {
  id: string;
  title: string;
  description: string;
  achievedAt: Date | string;
  category: BehavioralCategory;
  icon: string;
}

/**
 * A data point for trend charts
 */
export interface TrendDataPoint {
  date: string;
  label: string;
  value: number;
  tradesInPeriod: number;
}

export interface TrendCoaching {
  trendMessage: string;
  recentChange: string;
}

/**
 * A trend line for a specific metric
 */
export interface BehavioralTrend {
  metricName: string;
  metricKey: string;
  category: BehavioralCategory;
  dataPoints: TrendDataPoint[];
  overallDirection: TrendDirection;
  coaching: TrendCoaching;
}

export interface JourneyCoaching {
  journeyHeadline: string;
  keyProgress: string;
  nextFocus: string;
  encouragement: string;
}

/**
 * Overall journey snapshot
 */
export interface JourneySnapshot {
  tradingDays: number;
  totalTradesAnalyzed: number;
  journeyStartDate: Date | string | null;
  currentScore: number;
  startingScore: number;
  scoreChange: number;
  growthAreas: BehavioralGrowthMetric[];
  developingAreas: BehavioralGrowthMetric[];
  milestones: JourneyMilestone[];
  trends: BehavioralTrend[];
  coaching: JourneyCoaching;
}

export interface ComparisonPeriod {
  label: string;
  startDate: string;
  endDate: string;
  tradesCount: number;
}

/**
 * Full progress comparison response from API
 */
export interface ProgressComparisonResponse {
  userId: string;
  generatedAt: string;
  periodA: ComparisonPeriod;
  periodB: ComparisonPeriod;
  journey: JourneySnapshot;
  hasSufficientData: boolean;
  minimumTradesRequired: number;
}

/**
 * Weekly behavioral data for trend charts
 */
export interface WeeklyBehavioralData {
  weekNumber: number;
  weekStartDate: Date | string;
  weekEndDate: Date | string;
  tradesCount: number;
  disciplineScore: number;
  psychologyScore: number;
  riskScore: number;
  consistencyScore: number;
  planAdherenceRate: number;
  earlyExitRate: number;
  revengeTradeRate: number;
  avgConfidence: number;
  confidenceAccuracy: number;
  emotionalBalance: number;
}
