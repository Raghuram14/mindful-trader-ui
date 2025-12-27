/**
 * Primary Insight Card
 * 
 * Collapsed by default - glanceable headline + key metric
 * Expandable for full details
 */

import { InsightCardV2 } from '../types/insightV2.types';
import { InsightStrengthBadge } from './InsightStrengthBadge';
import { InsightMetricBadgeV2 } from './InsightMetricBadgeV2';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface PrimaryInsightCardProps {
  insight: InsightCardV2;
}

export function PrimaryInsightCard({ insight }: PrimaryInsightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Get the most important metric to display
  const primaryMetric = insight.metrics[0];

  return (
    <div className="rounded-lg border-2 border-amber-500/30 bg-amber-500/5 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Collapsed View - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-5 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg transition-all"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            <div className="rounded-full bg-amber-500/20 p-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-lg font-bold text-foreground leading-tight">
                {insight.headline}
              </h3>
              <InsightStrengthBadge 
                strength={insight.insightStrength} 
                explanation={insight.strengthExplanation} 
              />
            </div>
            
            <p className="text-sm text-foreground/80 mb-3">
              {insight.summary}
            </p>

            {/* Primary Metric - Inline */}
            {primaryMetric && (
              <div className="flex items-center gap-3 mb-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  <span className="text-xs font-medium text-muted-foreground">
                    {primaryMetric.name}:
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {primaryMetric.displayValue}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {insight.observedOver.trades} {insight.observedOver.trades === 1 ? 'trade' : 'trades'} {getPeriodLabel()}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-primary font-medium mt-3">
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>Hide details</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>Show full insight</span>
                </>
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Expanded View - Details */}
      {isExpanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-amber-500/20 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Impact
            </p>
            <p className="text-sm text-foreground/90 leading-relaxed">
              {insight.impact}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              What to do
            </p>
            <p className="text-sm text-foreground/90 leading-relaxed">
              {insight.recommendation}
            </p>
          </div>

          {/* All Metrics */}
          {insight.metrics.length > 1 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Supporting Data
              </p>
              <div className="flex flex-wrap gap-2">
                {insight.metrics.slice(1).map((metric, index) => (
                  <InsightMetricBadgeV2 key={index} metric={metric} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

