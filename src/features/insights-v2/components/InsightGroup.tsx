/**
 * Insight Group
 *
 * Groups patterns by category with coaching-friendly labels
 */

import {
  InsightCardV2 as InsightCardV2Type,
  InsightCategory,
} from "../types/insightV2.types";
import { InsightCardV2 } from "./InsightCardV2";
import { Brain, Shield, Target, TrendingUp } from "lucide-react";

interface InsightGroupProps {
  category: InsightCategory;
  insights: InsightCardV2Type[];
}

/**
 * Group insights by groupContext if available
 */
function groupByContext(
  insights: InsightCardV2Type[]
): Map<string | null, InsightCardV2Type[]> {
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

// Coaching-friendly category labels
const CATEGORY_CONFIG: Record<
  InsightCategory,
  { label: string; icon: React.ReactNode; color: string }
> = {
  [InsightCategory.PSYCHOLOGY]: {
    label: "Emotional Patterns",
    icon: <Brain className="w-4 h-4" />,
    color: "text-purple-500",
  },
  [InsightCategory.RISK]: {
    label: "Risk Habits",
    icon: <Shield className="w-4 h-4" />,
    color: "text-amber-500",
  },
  [InsightCategory.DISCIPLINE]: {
    label: "Discipline & Consistency",
    icon: <Target className="w-4 h-4" />,
    color: "text-blue-500",
  },
  [InsightCategory.PERFORMANCE]: {
    label: "Trading Efficiency",
    icon: <TrendingUp className="w-4 h-4" />,
    color: "text-green-500",
  },
};

export function InsightGroup({ category, insights }: InsightGroupProps) {
  if (insights.length === 0) {
    return null;
  }

  const config = CATEGORY_CONFIG[category];
  const grouped = groupByContext(insights);

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className={config.color}>{config.icon}</span>
        <h3 className="text-sm font-medium text-foreground">{config.label}</h3>
        <span className="text-xs text-muted-foreground">
          ({insights.length})
        </span>
      </div>
      <div className="space-y-3">
        {Array.from(grouped.entries()).map(([groupTitle, groupInsights]) => (
          <div key={groupTitle || "default"} className="space-y-2">
            {groupTitle && (
              <p className="text-xs text-muted-foreground pl-1">
                {groupInsights[0].groupContext?.groupDescription}
              </p>
            )}
            {groupInsights.map((insight) => (
              <InsightCardV2 key={insight.id} insight={insight} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
