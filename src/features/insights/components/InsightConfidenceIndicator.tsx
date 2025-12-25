/**
 * Confidence Indicator Component
 * 
 * Shows insight reliability (not performance)
 */

import { InsightConfidence } from '../types/insight.types';

interface InsightConfidenceIndicatorProps {
  confidence: InsightConfidence;
}

export function InsightConfidenceIndicator({ confidence }: InsightConfidenceIndicatorProps) {
  const getColor = () => {
    switch (confidence) {
      case 'HIGH':
        return 'bg-green-500/20 border-green-500/40 text-green-600 dark:text-green-400';
      case 'MEDIUM':
        return 'bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-400';
      case 'LOW':
        return 'bg-muted border-border text-muted-foreground';
      default:
        return 'bg-muted border-border text-muted-foreground';
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium ${getColor()}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${
        confidence === 'HIGH' ? 'bg-green-500' :
        confidence === 'MEDIUM' ? 'bg-amber-500' :
        'bg-muted-foreground'
      }`} />
      <span className="capitalize">{confidence.toLowerCase()}</span>
    </div>
  );
}

