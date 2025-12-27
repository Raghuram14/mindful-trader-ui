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

  // Get primary metric for compact display
  const primaryMetric = insight.metrics[0];

  return (
    <div className={cn(`border-l-4 ${getCategoryColor()} rounded-lg overflow-hidden bg-card border border-border hover:shadow-sm transition-all`)}>
      {/* Collapsed View - Compact */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <h4 className="font-semibold text-foreground text-sm leading-tight flex-1">
            {insight.headline}
          </h4>
          <InsightStrengthBadge strength={insight.insightStrength} explanation={insight.strengthExplanation} />
        </div>

        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {insight.summary}
        </p>

        {/* Inline metric + expand button */}
        <div className="flex items-center justify-between gap-3">
          {primaryMetric && (
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-secondary/50 border border-border">
              <span className="text-xs font-medium text-foreground">
                {primaryMetric.displayValue}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-1 text-xs text-primary font-medium">
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3" />
                <span>Less</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                <span>More</span>
              </>
            )}
          </div>
        </div>
      </button>

      {/* Expanded View - Details */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3 animate-in fade-in slide-in-from-top-1 duration-150">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Impact
            </p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              {insight.impact}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              What to do
            </p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              {insight.recommendation}
            </p>
          </div>

          {/* All Metrics */}
          {insight.metrics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {insight.metrics.map((metric, index) => (
                <InsightMetricBadgeV2 key={index} metric={metric} />
              ))}
            </div>
          )}

          {/* Time Context */}
          <div className="pt-2 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              {insight.observedOver.trades} {insight.observedOver.trades === 1 ? 'trade' : 'trades'} {getPeriodLabel()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

