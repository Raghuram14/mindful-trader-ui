/**
 * Insight Strength Badge
 * 
 * Displays insight strength with tooltip explanation
 */

import { InsightStrength } from '../types/insightV2.types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface InsightStrengthBadgeProps {
  strength: InsightStrength;
  explanation: string;
}

export function InsightStrengthBadge({ strength, explanation }: InsightStrengthBadgeProps) {
  const getStrengthLabel = () => {
    switch (strength) {
      case InsightStrength.STRONG:
        return 'Strong pattern · High confidence';
      case InsightStrength.MODERATE:
        return 'Moderate pattern · Medium confidence';
      case InsightStrength.WEAK:
        return 'Weak signal · Low confidence';
    }
  };

  const getStrengthColor = () => {
    switch (strength) {
      case InsightStrength.STRONG:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case InsightStrength.MODERATE:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case InsightStrength.WEAK:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded font-medium ${getStrengthColor()}`}>
              {getStrengthLabel()}
            </span>
            <Info className="w-3 h-3 text-muted-foreground cursor-help" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-xs font-semibold mb-1">Pattern Strength</p>
          <p className="text-xs">
            {explanation}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Confidence reflects how consistently this pattern appears in your data.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

