/**
 * Insights V2 Types
 * 
 * Frontend types matching backend InsightV2 types
 */

export type InsightVersion = 'v1' | 'v2';

export type InsightRange = 'TODAY' | 'WEEK' | 'MONTH';

export enum InsightStrength {
  STRONG = "STRONG",
  MODERATE = "MODERATE",
  WEAK = "WEAK",
}

export enum DisciplineStatus {
  GOOD = "GOOD",
  NEEDS_ATTENTION = "NEEDS_ATTENTION",
  POOR = "POOR",
}

export enum RiskStatus {
  CONTROLLED = "CONTROLLED",
  NEAR_LIMITS = "NEAR_LIMITS",
  EXCESSIVE = "EXCESSIVE",
}

export enum PsychologyStatus {
  ALIGNED = "ALIGNED",
  MISMATCHED = "MISMATCHED",
}

export enum InsightCategory {
  PSYCHOLOGY = "PSYCHOLOGY",
  RISK = "RISK",
  DISCIPLINE = "DISCIPLINE",
  PERFORMANCE = "PERFORMANCE",
}

export interface MetricSnapshot {
  name: string;
  value: number;
  unit?: string;
  trend?: "UP" | "DOWN" | "STABLE";
}

export interface DataCoverage {
  tradesAnalyzed: number;
  minimumRequired: number;
  sufficient: boolean;
}

export interface ObservedOver {
  trades: number;
  sessions: number;
  period: InsightRange;
}

export interface InsightCardV2 {
  id: string;
  category: InsightCategory;
  headline: string;
  summary: string;
  impact: string;
  recommendation: string;
  insightStrength: InsightStrength;
  strengthExplanation: string;
  metrics: MetricSnapshot[];
  timeRange: InsightRange;
  insightVersion: string;
  generatedAt: string;
  observedOver: ObservedOver;
  priorityScore: number;
}

export interface BehavioralSnapshot {
  discipline: DisciplineStatus;
  risk: RiskStatus;
  psychology: PsychologyStatus;
  consistencyScore: number; // 0-100
  evaluatedTrades: number;
  period: InsightRange;
}

export interface InsightsResponseV2 {
  version: 'v2';
  range: InsightRange;
  generatedAt: string;
  snapshot: BehavioralSnapshot;
  dataCoverage: DataCoverage;
  prioritizedInsights: InsightCardV2[]; // Top 1-2 insights
  groupedInsights: Record<InsightCategory, InsightCardV2[]>;
}

