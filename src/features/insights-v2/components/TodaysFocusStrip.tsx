/**
 * Today's Focus Strip
 * 
 * Converts FOCUS_NOW insights into actionable behaviors
 */

import { InsightCardV2 } from '../types/insightV2.types';
import { Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TodaysFocusStripProps {
  prioritizedInsights: InsightCardV2[];
}

/**
 * Extract actionable behaviors from insights
 */
function extractActions(insights: InsightCardV2[]): string[] {
  const actions: string[] = [];

  for (const insight of insights) {
    if (insight.actionPriority !== 'FOCUS_NOW') continue;

    // Extract action from recommendation
    const recommendation = insight.recommendation;
    
    // Simple extraction: look for imperative verbs and time-based actions
    if (recommendation.includes('Take a break') || recommendation.includes('Wait')) {
      actions.push('Take a break after losses before trading again');
    } else if (recommendation.includes('cooldown period')) {
      actions.push('Wait at least 2 hours after any loss before entering a new trade');
    } else if (recommendation.includes('Stop trading')) {
      actions.push('Stop trading after next risk violation');
    } else if (recommendation.includes('reduce position size')) {
      actions.push('Reduce position sizes to stay within risk limits');
    } else if (recommendation.includes('review your exit reasons')) {
      actions.push('Review exit reasons before closing trades early');
    } else if (recommendation.includes('write down your exit plan')) {
      actions.push('Write down exit plan before each trade');
    } else {
      // Fallback: use first sentence of recommendation
      const firstSentence = recommendation.split('.')[0];
      if (firstSentence && firstSentence.length < 100) {
        actions.push(firstSentence);
      }
    }
  }

  // Limit to max 2 actions
  return actions.slice(0, 2);
}

export function TodaysFocusStrip({ prioritizedInsights }: TodaysFocusStripProps) {
  const actions = extractActions(prioritizedInsights);

  if (actions.length === 0) {
    return null;
  }

  return (
    <Card className="border-primary/30 bg-primary/5 shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground mb-2">Today's Focus</h3>
            <ul className="space-y-1.5">
              {actions.map((action, index) => (
                <li key={index} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

