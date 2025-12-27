/**
 * Insight Group
 * 
 * Groups insights by category, with special handling for Psychology section grouping
 */

import { InsightCardV2 as InsightCardV2Type, InsightCategory } from '../types/insightV2.types';
import { InsightCardV2 } from './InsightCardV2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InsightGroupProps {
  category: InsightCategory;
  insights: InsightCardV2Type[];
}

/**
 * Group insights by groupContext if available
 */
function groupByContext(insights: InsightCardV2Type[]): Map<string | null, InsightCardV2Type[]> {
  const groups = new Map<string | null, InsightCardV2Type[]>();
  
  for (const insight of insights) {
    const groupKey = insight.groupContext?.groupTitle || null;
    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(insight);
  }
  
  return groups;
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

  // Special handling for Psychology: group by context
  if (category === InsightCategory.PSYCHOLOGY) {
    const grouped = groupByContext(insights);
    
    return (
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
          {getCategoryLabel()}
        </h3>
        <div className="space-y-4">
          {Array.from(grouped.entries()).map(([groupTitle, groupInsights]) => {
            if (groupTitle) {
              // Grouped insights
              const groupContext = groupInsights[0].groupContext;
              return (
                <Card key={groupTitle} className="border-border bg-secondary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-foreground">
                      {groupContext?.groupTitle}
                    </CardTitle>
                    {groupContext?.groupDescription && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {groupContext.groupDescription}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {groupInsights.map((insight) => (
                      <InsightCardV2 key={insight.id} insight={insight} />
                    ))}
                  </CardContent>
                </Card>
              );
            } else {
              // Ungrouped insights
              return (
                <div key="ungrouped" className="space-y-3">
                  {groupInsights.map((insight) => (
                    <InsightCardV2 key={insight.id} insight={insight} />
                  ))}
                </div>
              );
            }
          })}
        </div>
      </div>
    );
  }

  // Default: no grouping
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {getCategoryLabel()}
        </h3>
        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
          {insights.length}
        </span>
      </div>
      <div className="space-y-3">
        {insights.map((insight) => (
          <InsightCardV2 key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  );
}
