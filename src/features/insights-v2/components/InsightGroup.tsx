/**
 * Insight Group
 * 
 * Groups insights by category with heading
 */

import { InsightCardV2 } from '../types/insightV2.types';
import { InsightCategory } from '../types/insightV2.types';
import { InsightCardV2 as InsightCardV2Component } from './InsightCardV2';

interface InsightGroupProps {
  category: InsightCategory;
  insights: InsightCardV2[];
}

export function InsightGroup({ category, insights }: InsightGroupProps) {
  if (insights.length === 0) {
    return null;
  }

  const getCategoryLabel = () => {
    switch (category) {
      case InsightCategory.PSYCHOLOGY:
        return 'Psychology';
      case InsightCategory.RISK:
        return 'Risk';
      case InsightCategory.DISCIPLINE:
        return 'Discipline';
      case InsightCategory.PERFORMANCE:
        return 'Performance';
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
        {getCategoryLabel()}
      </h3>
      <div className="space-y-4">
        {insights.map((insight) => (
          <InsightCardV2Component key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  );
}

