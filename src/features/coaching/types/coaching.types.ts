/**
 * Coaching Types
 */

export type MindsetFeeling = 'STRUGGLING' | 'CAUTIOUS' | 'BALANCED' | 'CONFIDENT' | 'FOCUSED';

export type CoachingScenario = 
  | 'STRUGGLING' 
  | 'CAUTIOUS' 
  | 'BALANCED' 
  | 'CONFIDENT' 
  | 'FOCUSED' 
  | 'MIXED';

export interface MindsetCheck {
  id: string;
  userId: string;
  date: string;
  question: string;
  response?: string;
  feeling: MindsetFeeling;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMindsetCheckRequest {
  question?: string;
  response?: string;
  feeling: MindsetFeeling;
}

// Journey context from progress comparison
export interface JourneyContext {
  currentScore: number;
  scoreChange: number;
  topGrowthArea: string | null;
  topDevelopingArea: string | null;
  tradingDays: number;
  totalTrades: number;
}

export interface CoachingGuidance {
  scenario: CoachingScenario;
  focus: string;
  context: string;
  gentleReminder?: string;
  redirectToInsights?: boolean;
  journeyContext?: JourneyContext;
  journeyMessage?: string;
  generatedAt: string;
}

// Daily Reflection (end-of-day check-in)
export interface DailyReflection {
  _id?: string;
  userId: string;
  date: string;
  focusFollowed: 1 | 2 | 3 | 4 | 5;
  biggestWin: string | null;
  biggestChallenge: string | null;
  tomorrowIntention: string | null;
  overallFeeling: 1 | 2 | 3 | 4 | 5;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReflectionRequest {
  focusFollowed: 1 | 2 | 3 | 4 | 5;
  biggestWin?: string;
  biggestChallenge?: string;
  tomorrowIntention?: string;
  overallFeeling: 1 | 2 | 3 | 4 | 5;
}

export interface ReflectionStats {
  totalReflections: number;
  averageFocusRating: number;
  averageFeeling: number;
  consistencyPercentage: number;
  recentWins: string[];
  recentChallenges: string[];
}
