/**
 * Insight Card Component
 * 
 * Individual insight card with headline, summary, impact, recommendation
 */

import { InsightCard as InsightCardType } from '../types/insight.types';
import { InsightConfidenceIndicator } from './InsightConfidenceIndicator';
import { InsightMetricBadge } from './InsightMetricBadge';

interface InsightCardProps {
  insight: InsightCardType;
}

const categoryColors: Record<InsightCardType['category'], string> = {
  PSYCHOLOGY: 'border-l-purple-500/40',
  RISK: 'border-l-red-500/40',
  DISCIPLINE: 'border-l-blue-500/40',
  PERFORMANCE: 'border-l-green-500/40',
};

const categoryIcons: Record<InsightCardType['category'], string> = {
  PSYCHOLOGY: '🧠',
  RISK: '📉',
  DISCIPLINE: '🛡️',
  PERFORMANCE: '📊',
};

export function InsightCard({ insight }: InsightCardProps) {
  return (
    <div className={`card-calm border-l-4 ${categoryColors[insight.category]}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{categoryIcons[insight.category]}</span>
          <h3 className="font-semibold text-foreground">{insight.headline}</h3>
        </div>
        <InsightConfidenceIndicator confidence={insight.confidence} />
      </div>

      {/* Summary */}
      <p className="text-sm text-foreground leading-relaxed mb-3">
        {insight.summary}
      </p>

      {/* Impact */}
      <div className="mb-3">
        <p className="text-xs text-muted-foreground mb-1">Impact</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {insight.impact}
        </p>
      </div>

      {/* Recommendation */}
      <div className="mb-3 p-3 rounded-lg bg-secondary/50 border border-border">
        <p className="text-xs font-medium text-foreground mb-1">Recommendation</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {insight.recommendation}
        </p>
      </div>

      {/* Metrics */}
      {insight.metrics.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
          {insight.metrics.map((metric, index) => (
            <InsightMetricBadge key={index} metric={metric} />
          ))}
        </div>
      )}
    </div>
  );
}

