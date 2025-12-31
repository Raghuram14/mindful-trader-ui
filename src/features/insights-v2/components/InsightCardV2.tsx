/**
 * Insight Card V2
 *
 * Pattern card - shows observed behaviors with coaching recommendations
 * Soft styling, non-judgmental language
 */

import { InsightCardV2 as InsightCardV2Type } from "../types/insightV2.types";
import { InsightMetricBadgeV2 } from "./InsightMetricBadgeV2";
import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface InsightCardV2Props {
  insight: InsightCardV2Type;
}

export function InsightCardV2({ insight }: InsightCardV2Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPeriodLabel = () => {
    switch (insight.observedOver.period) {
      case "TODAY":
        return "today";
      case "WEEK":
        return "this week";
      case "MONTH":
        return "this month";
    }
  };

  // Softer category colors - no red
  const getCategoryAccent = () => {
    switch (insight.category) {
      case "PSYCHOLOGY":
        return "bg-purple-500/10 border-purple-500/20";
      case "RISK":
        return "bg-amber-500/10 border-amber-500/20";
      case "DISCIPLINE":
        return "bg-blue-500/10 border-blue-500/20";
      case "PERFORMANCE":
        return "bg-green-500/10 border-green-500/20";
    }
  };

  // Get primary metric for compact display
  const primaryMetric = insight.metrics[0];

  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden border transition-all hover:shadow-sm",
        getCategoryAccent()
      )}
    >
      {/* Collapsed View - Compact */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <h4 className="font-medium text-foreground text-sm leading-tight flex-1">
            {insight.headline}
          </h4>
          {insight.actionPriority === "FOCUS_NOW" && (
            <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
          )}
        </div>

        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {insight.summary}
        </p>

        {/* Inline metric + expand button */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {insight.observedOver.trades}{" "}
            {insight.observedOver.trades === 1 ? "trade" : "trades"}
          </span>

          <div className="flex items-center gap-1 text-xs text-primary font-medium">
            {isExpanded ? (
              <>
                <span>Less</span>
                <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                <span>Details</span>
                <ChevronDown className="w-3 h-3" />
              </>
            )}
          </div>
        </div>
      </button>

      {/* Expanded View - Details */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3 animate-in fade-in slide-in-from-top-1 duration-150">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Why this matters
            </p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              {insight.impact}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Something to try
            </p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              {insight.recommendation}
            </p>
          </div>

          {/* All Metrics */}
          {insight.metrics.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {insight.metrics.map((metric, index) => (
                <InsightMetricBadgeV2 key={index} metric={metric} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
