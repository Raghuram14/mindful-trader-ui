/**
 * Insight Card V2
 * 
 * Standard insight card for grouped insights
 */

import { InsightCardV2 as InsightCardV2Type } from '../types/insightV2.types';
import { InsightStrengthBadge } from './InsightStrengthBadge';
import { InsightMetricBadge } from '@/features/insights/components/InsightMetricBadge';

interface InsightCardV2Props {
  insight: InsightCardV2Type;
}

export function InsightCardV2({ insight }: InsightCardV2Props) {
  const getPeriodLabel = () => {
    switch (insight.observedOver.period) {
      case 'TODAY':
        return 'today';
      case 'WEEK':
        return 'this week';
      case 'MONTH':
        return 'this month';
    }
  };

  const getCategoryColor = () => {
    switch (insight.category) {
      case 'PSYCHOLOGY':
        return 'border-l-purple-500';
      case 'RISK':
        return 'border-l-red-500';
      case 'DISCIPLINE':
        return 'border-l-blue-500';
      case 'PERFORMANCE':
        return 'border-l-green-500';
    }
  };

  return (
    <div className={`card-calm border-l-4 ${getCategoryColor()}`}>
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-lg font-semibold text-foreground">{insight.headline}</h4>
        <InsightStrengthBadge strength={insight.insightStrength} explanation={insight.strengthExplanation} />
      </div>

      <p className="text-sm text-foreground mb-4">{insight.summary}</p>

      <div className="mb-4">
        <p className="text-xs font-medium text-foreground mb-1">Impact</p>
        <p className="text-xs text-muted-foreground">{insight.impact}</p>
      </div>

      <div className="mb-4">
        <p className="text-xs font-medium text-foreground mb-1">Recommendation</p>
        <p className="text-xs text-muted-foreground">{insight.recommendation}</p>
      </div>

      {/* Metrics */}
      {insight.metrics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {insight.metrics.map((metric, index) => (
            <InsightMetricBadge key={index} metric={metric} />
          ))}
        </div>
      )}

      {/* Time Context */}
      <div className="pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Observed across {insight.observedOver.trades} {insight.observedOver.trades === 1 ? 'trade' : 'trades'} {getPeriodLabel()}
        </p>
      </div>
    </div>
  );
}

