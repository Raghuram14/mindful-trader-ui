/**
 * Insight Types
 * 
 * Types matching backend InsightCard contract exactly
 */

export type InsightCategory = 'PSYCHOLOGY' | 'RISK' | 'DISCIPLINE' | 'PERFORMANCE';
export type InsightConfidence = 'HIGH' | 'MEDIUM' | 'LOW';
export type InsightRange = 'TODAY' | 'WEEK' | 'MONTH';

export interface MetricSnapshot {
  name: string;
  value: number;
  unit?: string;
  trend?: 'UP' | 'DOWN' | 'STABLE';
}

export interface InsightCard {
  id: string;
  category: InsightCategory;
  headline: string;
  summary: string;
  impact: string;
  recommendation: string;
  confidence: InsightConfidence;
  metrics: MetricSnapshot[];
  timeRange: InsightRange;
  insightVersion: string;
  generatedAt: string;
}

export interface InsightsResponse {
  range: InsightRange;
  generatedAt: string;
  insights: InsightCard[];
}

