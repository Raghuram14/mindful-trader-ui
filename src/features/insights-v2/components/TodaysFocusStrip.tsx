/**
 * Today's Focus Strip
 *
 * Coaching element - single actionable focus for today
 * Supportive, not alarming
 */

import { InsightCardV2 } from "../types/insightV2.types";
import { Lightbulb } from "lucide-react";

interface TodaysFocusStripProps {
  prioritizedInsights: InsightCardV2[];
}

/**
 * Extract the single most helpful coaching tip
 */
function extractCoachingTip(insights: InsightCardV2[]): string | null {
  for (const insight of insights) {
    if (insight.actionPriority !== "FOCUS_NOW") continue;

    const recommendation = insight.recommendation;

    // Reframe as supportive coaching tips
    if (
      recommendation.includes("cooldown period") ||
      recommendation.includes("Wait")
    ) {
      return "Try taking a 2-hour break after a loss - it helps reset your mindset";
    } else if (recommendation.includes("Stop trading")) {
      return "Consider pausing for the day if you hit your limit - fresh starts help";
    } else if (recommendation.includes("reduce position size")) {
      return "Staying within your position limits today will help you feel more in control";
    } else if (recommendation.includes("review your exit reasons")) {
      return "Before closing trades, take a moment to review your original exit plan";
    } else if (recommendation.includes("write down your exit plan")) {
      return "Writing down your exit plan before entering can boost your confidence";
    } else if (recommendation.includes("Take a break")) {
      return "A short break before your next trade can help you think more clearly";
    } else {
      // Fallback: use first sentence, reframed positively
      const firstSentence = recommendation.split(".")[0];
      if (firstSentence && firstSentence.length < 80) {
        return firstSentence;
      }
    }
  }

  return null;
}

export function TodaysFocusStrip({
  prioritizedInsights,
}: TodaysFocusStripProps) {
  const tip = extractCoachingTip(prioritizedInsights);

  if (!tip) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-gradient-to-r from-blue-500/5 via-transparent to-transparent p-5">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="rounded-xl bg-blue-500/10 p-2.5">
            <Lightbulb className="w-5 h-5 text-blue-500" />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Something to try today
          </p>
          <p className="text-sm font-medium text-foreground leading-relaxed">
            {tip}
          </p>
        </div>
      </div>
    </div>
  );
}
