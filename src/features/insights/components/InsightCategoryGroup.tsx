/**
 * Insight Category Group Component
 * 
 * Groups insights by category with heading
 */

import { InsightCard } from './InsightCard';
import { InsightCard as InsightCardType } from '../types/insight.types';

interface InsightCategoryGroupProps {
  category: InsightCardType['category'];
  insights: InsightCardType[];
}

const categoryLabels: Record<InsightCardType['category'], string> = {
  PSYCHOLOGY: '🧠 Psychology',
  RISK: '📉 Risk',
  DISCIPLINE: '🛡️ Discipline',
  PERFORMANCE: '📊 Performance',
};

export function InsightCategoryGroup({ category, insights }: InsightCategoryGroupProps) {
  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
        {categoryLabels[category]}
      </h3>
      <div className="space-y-3">
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  );
}

