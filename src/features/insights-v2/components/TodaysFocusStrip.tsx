/**
 * Today's Focus Strip
 * 
 * HERO element - single most important action for today
 * Minimal, glanceable, action-oriented
 */

import { InsightCardV2 } from '../types/insightV2.types';
import { Target } from 'lucide-react';

interface TodaysFocusStripProps {
  prioritizedInsights: InsightCardV2[];
}

/**
 * Extract the single most important action
 */
function extractPrimaryAction(insights: InsightCardV2[]): string | null {
  for (const insight of insights) {
    if (insight.actionPriority !== 'FOCUS_NOW') continue;

    const recommendation = insight.recommendation;
    
    // Extract one clear, actionable sentence
    if (recommendation.includes('cooldown period') || recommendation.includes('Wait')) {
      return 'Wait 2 hours after any loss before your next trade';
    } else if (recommendation.includes('Stop trading')) {
      return 'Stop trading after your next rule breach';
    } else if (recommendation.includes('reduce position size')) {
      return 'Keep position sizes within your limits today';
    } else if (recommendation.includes('review your exit reasons')) {
      return 'Review your exit plan before closing any trade';
    } else if (recommendation.includes('write down your exit plan')) {
      return 'Write down your exit plan before entering trades';
    } else if (recommendation.includes('Take a break')) {
      return 'Take a break before trading again';
    } else {
      // Fallback: use first sentence, shortened
      const firstSentence = recommendation.split('.')[0];
      if (firstSentence && firstSentence.length < 80) {
        return firstSentence;
      }
    }
  }
  
  return null;
}

export function TodaysFocusStrip({ prioritizedInsights }: TodaysFocusStripProps) {
  const action = extractPrimaryAction(prioritizedInsights);

  if (!action) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6 shadow-sm mb-8">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className="rounded-full bg-primary/10 p-3">
            <Target className="w-6 h-6 text-primary" />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Today's Focus
          </p>
          <p className="text-lg font-semibold text-foreground leading-relaxed">
            {action}
          </p>
        </div>
      </div>
    </div>
  );
}

