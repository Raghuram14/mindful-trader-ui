/**
 * Primary Insight Card
 * 
 * Highlighted card for top 1-2 prioritized insights
 */

import { InsightCardV2 } from '../types/insightV2.types';
import { InsightStrengthBadge } from './InsightStrengthBadge';
import { InsightMetricBadge } from '@/features/insights/components/InsightMetricBadge';
import { Sparkles } from 'lucide-react';

interface PrimaryInsightCardProps {
  insight: InsightCardV2;
}

export function PrimaryInsightCard({ insight }: PrimaryInsightCardProps) {
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

  return (
    <div className="card-calm border-2 border-primary/20 bg-primary/5 mb-8">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Key Behavioral Focus</h3>
        </div>
        <InsightStrengthBadge strength={insight.insightStrength} explanation={insight.strengthExplanation} />
      </div>

      <h4 className="text-xl font-bold text-foreground mb-2">{insight.headline}</h4>
      <p className="text-base text-foreground mb-4">{insight.summary}</p>

      <div className="mb-4">
        <p className="text-sm font-medium text-foreground mb-2">Impact</p>
        <p className="text-sm text-muted-foreground">{insight.impact}</p>
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium text-foreground mb-2">Recommendation</p>
        <p className="text-sm text-muted-foreground">{insight.recommendation}</p>
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
      <div className="pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Observed across {insight.observedOver.trades} {insight.observedOver.trades === 1 ? 'trade' : 'trades'} {getPeriodLabel()}
        </p>
      </div>
    </div>
  );
}

