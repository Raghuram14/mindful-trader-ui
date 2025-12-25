/**
 * Insight Card V2
 * 
 * Standard insight card for grouped insights
 */

import { InsightCardV2 as InsightCardV2Type } from '../types/insightV2.types';
import { InsightStrengthBadge } from './InsightStrengthBadge';
import { InsightMetricBadgeV2 } from './InsightMetricBadgeV2';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightCardV2Props {
  insight: InsightCardV2Type;
}

export function InsightCardV2({ insight }: InsightCardV2Props) {
  const [isExpanded, setIsExpanded] = useState(insight.actionPriority === 'FOCUS_NOW');

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

  // Visual hierarchy based on actionPriority
  const getCardStyle = () => {
    switch (insight.actionPriority) {
      case 'FOCUS_NOW':
        return 'border-2 border-primary/50 bg-primary/5 shadow-lg';
      case 'WATCH':
        return 'border border-border bg-secondary/30';
      case 'AWARENESS':
        return 'border border-border/50 bg-muted/20';
      default:
        return 'card-calm';
    }
  };

  return (
    <div className={cn(`border-l-4 ${getCategoryColor()} ${getCardStyle()} rounded-lg p-4`)}>
      <div className="flex items-start justify-between mb-3">
        <h4 className={cn(
          "font-semibold text-foreground",
          insight.actionPriority === 'FOCUS_NOW' ? 'text-lg' : 'text-base'
        )}>
          {insight.headline}
        </h4>
        <InsightStrengthBadge strength={insight.insightStrength} explanation={insight.strengthExplanation} />
      </div>

      <p className="text-sm text-foreground mb-4">{insight.summary}</p>

      {/* Progressive disclosure for secondary insights */}
      {insight.actionPriority !== 'FOCUS_NOW' && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3 h-3" />
              Hide details
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              Show details
            </>
          )}
        </button>
      )}

      {/* Expandable content */}
      {(isExpanded || insight.actionPriority === 'FOCUS_NOW') && (
        <>
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
                <InsightMetricBadgeV2 key={index} metric={metric} />
              ))}
            </div>
          )}
        </>
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

