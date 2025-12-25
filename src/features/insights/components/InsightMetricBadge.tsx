/**
 * Metric Badge Component
 * 
 * Compact display for insight metrics
 */

import { MetricSnapshot } from '../types/insight.types';
import { formatMetricName, formatMetricValue } from '../utils/metricFormatter';

interface InsightMetricBadgeProps {
  metric: MetricSnapshot;
}

export function InsightMetricBadge({ metric }: InsightMetricBadgeProps) {
  const displayName = formatMetricName(metric.name);
  const displayValue = formatMetricValue(metric.value, metric.unit, metric.name);

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
      <span className="text-muted-foreground">{displayName}:</span>
      <span className="font-semibold">{displayValue}</span>
    </div>
  );
}

