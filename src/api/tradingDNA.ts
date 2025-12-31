import { apiClient } from './client';

/**
 * Trading DNA Types - Behavioral fingerprint
 */

// Trader Archetypes
export type TraderArchetype =
  | 'PATIENT_OBSERVER'     // Waits for setups, low FOMO, disciplined entries
  | 'QUICK_RESPONDER'      // Fast decisions, high activity, needs discipline guardrails
  | 'CAUTIOUS_PLANNER'     // High plan adherence, risk-averse, methodical
  | 'INTUITIVE_TRADER'     // Mixes analysis with gut, variable consistency
  | 'STEADY_PRACTITIONER'  // Consistent behavior, moderate across all traits
  | 'EVOLVING_LEARNER';    // Still developing clear patterns, high growth potential

// Trait Dimensions
export type TraitDimension =
  | 'DISCIPLINE'        // Rule adherence, plan following
  | 'PATIENCE'          // Waiting for setups, not chasing
  | 'EMOTIONAL_CONTROL' // Calm execution, low FOMO/revenge
  | 'RISK_AWARENESS'    // Position sizing, stop discipline
  | 'SELF_REFLECTION'   // Daily reflection practice
  | 'CONSISTENCY';      // Stable behavior across conditions

// Trait Score
export interface TraitScore {
  dimension: TraitDimension;
  score: number;           // 0-100 normalized score
  stability: number;       // 0-100 how consistent this trait is
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  recentChange: number;    // Change in last 30 days (-100 to +100)
}

// Pattern Frequency
export interface PatternFrequency {
  patternType: string;
  occurrenceRate: number;  // 0-100 percentage
  lastOccurred: string | null;
  trend: 'MORE_FREQUENT' | 'STABLE' | 'LESS_FREQUENT';
}

// Evolution Point (monthly)
export interface EvolutionPoint {
  month: string;           // YYYY-MM format
  overallScore: number;
  tradeCount: number;
  highlights: string[];
}

// Behavioral Area (strength or growth area)
export interface BehavioralArea {
  dimension: TraitDimension;
  title: string;
  description: string;
  evidence: string;
}

// Data Quality metrics
export interface DataQuality {
  totalTradesAnalyzed: number;
  dateRange: {
    start: string;
    end: string;
  };
  weeksWithData: number;
  reliabilityScore: number;  // 0-100
}

// Full Trading DNA object
export interface TradingDNA {
  archetype: TraderArchetype;
  archetypeConfidence: number;
  archetypeNarrative: string;
  traits: TraitScore[];
  dominantPatterns: PatternFrequency[];
  rarePatterns: PatternFrequency[];
  strengths: BehavioralArea[];
  growthAreas: BehavioralArea[];
  evolution: EvolutionPoint[];
  dataQuality: DataQuality;
  computedAt: string;
}

// API Response types
export interface TradingDNAResponse {
  hasEnoughData: boolean;
  tradeCount: number;
  message: string;
  dna: TradingDNA | null;
}

export interface DNAEligibilityResponse {
  hasEnough: boolean;
  tradeCount: number;
  message: string;
}

/**
 * Archetype metadata for UI display
 */
export const ARCHETYPE_DISPLAY: Record<TraderArchetype, { title: string; emoji: string; color: string }> = {
  PATIENT_OBSERVER: {
    title: 'The Patient Observer',
    emoji: '🔭',
    color: 'text-blue-500',
  },
  QUICK_RESPONDER: {
    title: 'The Quick Responder',
    emoji: '⚡',
    color: 'text-yellow-500',
  },
  CAUTIOUS_PLANNER: {
    title: 'The Cautious Planner',
    emoji: '📋',
    color: 'text-green-500',
  },
  INTUITIVE_TRADER: {
    title: 'The Intuitive Trader',
    emoji: '🎯',
    color: 'text-purple-500',
  },
  STEADY_PRACTITIONER: {
    title: 'The Steady Practitioner',
    emoji: '⚖️',
    color: 'text-teal-500',
  },
  EVOLVING_LEARNER: {
    title: 'The Evolving Learner',
    emoji: '🌱',
    color: 'text-emerald-500',
  },
};

/**
 * Trait dimension metadata for UI display
 */
export const TRAIT_DISPLAY: Record<TraitDimension, { title: string; icon: string; description: string }> = {
  DISCIPLINE: {
    title: 'Discipline',
    icon: '📏',
    description: 'Following your rules and trading plan',
  },
  PATIENCE: {
    title: 'Patience',
    icon: '⏳',
    description: 'Waiting for quality setups',
  },
  EMOTIONAL_CONTROL: {
    title: 'Emotional Steadiness',
    icon: '🧘',
    description: 'Trading with calm focus',
  },
  RISK_AWARENESS: {
    title: 'Risk Awareness',
    icon: '🛡️',
    description: 'Position sizing and stop discipline',
  },
  SELF_REFLECTION: {
    title: 'Self-Reflection',
    icon: '📝',
    description: 'Regular journaling and review',
  },
  CONSISTENCY: {
    title: 'Consistency',
    icon: '📊',
    description: 'Stable behavior across conditions',
  },
};

/**
 * Get Trading DNA - Behavioral fingerprint
 * @param forceRefresh - Force recomputation of DNA
 */
export async function getTradingDNA(forceRefresh: boolean = false): Promise<TradingDNAResponse> {
  const params = forceRefresh ? '?refresh=true' : '';
  const response = await apiClient.get<TradingDNAResponse>(`/insights/dna${params}`);
  return response;
}

/**
 * Check if user has enough data for Trading DNA
 */
export async function checkDNAEligibility(): Promise<DNAEligibilityResponse> {
  const response = await apiClient.get<DNAEligibilityResponse>('/insights/dna/eligibility');
  return response;
}
