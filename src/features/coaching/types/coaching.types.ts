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

export interface CoachingGuidance {
  scenario: CoachingScenario;
  focus: string;
  context: string;
  gentleReminder?: string;
  redirectToInsights?: boolean;
  generatedAt: string;
}

