/**
 * Hero Insight Card Component
 * 
 * Large, prominent display for the most impactful insight
 */

import { InsightCard as InsightCardType } from '../types/insight.types';
import { InsightConfidenceIndicator } from './InsightConfidenceIndicator';
import { InsightMetricBadge } from './InsightMetricBadge';

interface InsightHeroCardProps {
  insight: InsightCardType;
}

const categoryColors: Record<InsightCardType['category'], string> = {
  PSYCHOLOGY: 'border-l-purple-500/50 bg-purple-500/5',
  RISK: 'border-l-red-500/50 bg-red-500/5',
  DISCIPLINE: 'border-l-blue-500/50 bg-blue-500/5',
  PERFORMANCE: 'border-l-green-500/50 bg-green-500/5',
};

const categoryIcons: Record<InsightCardType['category'], string> = {
  PSYCHOLOGY: '🧠',
  RISK: '📉',
  DISCIPLINE: '🛡️',
  PERFORMANCE: '📊',
};

export function InsightHeroCard({ insight }: InsightHeroCardProps) {
  return (
    <div className={`card-calm border-l-4 ${categoryColors[insight.category]} p-6`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{categoryIcons[insight.category]}</span>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-1">
              {insight.headline}
            </h2>
            <p className="text-sm text-muted-foreground">
              {insight.summary}
            </p>
          </div>
        </div>
        <InsightConfidenceIndicator confidence={insight.confidence} />
      </div>

      {/* Key Metrics */}
      {insight.metrics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {insight.metrics.slice(0, 3).map((metric, index) => (
            <InsightMetricBadge key={index} metric={metric} />
          ))}
        </div>
      )}

      {/* Impact & Recommendation */}
      <div className="space-y-3 pt-4 border-t border-border">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Impact</p>
          <p className="text-sm text-foreground leading-relaxed">
            {insight.impact}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <p className="text-xs font-medium text-foreground mb-1">Recommendation</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {insight.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}

