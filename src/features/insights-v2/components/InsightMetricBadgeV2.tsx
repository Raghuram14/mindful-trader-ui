/**
 * Insight Metric Badge V2
 * 
 * Displays metrics with defensive rendering for unreliable data
 */

import { MetricSnapshot } from '../types/insightV2.types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { formatMetricName, formatMetricValue } from '@/features/insights/utils/metricFormatter';

interface InsightMetricBadgeV2Props {
  metric: MetricSnapshot;
}

export function InsightMetricBadgeV2({ metric }: InsightMetricBadgeV2Props) {
  // Runtime assertion: Never show 0% or misleading numbers if unreliable
  if (metric.value === 0 && !metric.isReliable) {
    // This should never happen if backend is correct, but guard against it
    console.warn('Unsafe metric rendering blocked', metric);
  }

  const displayText = metric.isReliable 
    ? formatMetricValue(metric.value ?? 0, metric.unit, metric.name)
    : metric.displayValue;

  const badgeContent = (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground">
      <span className="text-muted-foreground">{formatMetricName(metric.name)}:</span>
      <span className={metric.isReliable ? 'text-foreground' : 'text-muted-foreground italic'}>
        {displayText}
      </span>
      {!metric.isReliable && (
        <Info className="w-3 h-3 text-muted-foreground" />
      )}
    </span>
  );

  // If unreliable, show tooltip with reason
  if (!metric.isReliable && metric.reason) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badgeContent}
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs max-w-xs">{metric.reason}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badgeContent;
}

