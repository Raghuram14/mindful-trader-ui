/**
 * Coaching Guidance Component
 *
 * Displays calm, supportive daily coaching message
 * Now includes journey context for personalized encouragement
 */

import { CoachingGuidance as CoachingGuidanceType } from "../types/coaching.types";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Lightbulb,
  Heart,
  TrendingUp,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CoachingGuidanceProps {
  guidance: CoachingGuidanceType;
}

const SCENARIO_ICONS = {
  STRUGGLING: Heart,
  CAUTIOUS: Lightbulb,
  BALANCED: Sparkles,
  CONFIDENT: Sparkles,
  FOCUSED: Sparkles,
  MIXED: Lightbulb,
};

const SCENARIO_COLORS = {
  STRUGGLING: "text-amber-600 dark:text-amber-500",
  CAUTIOUS: "text-blue-600 dark:text-blue-500",
  BALANCED: "text-green-600 dark:text-green-500",
  CONFIDENT: "text-purple-600 dark:text-purple-500",
  FOCUSED: "text-primary",
  MIXED: "text-orange-600 dark:text-orange-500",
};

export function CoachingGuidance({ guidance }: CoachingGuidanceProps) {
  const Icon = SCENARIO_ICONS[guidance.scenario];
  const iconColor = SCENARIO_COLORS[guidance.scenario];

  return (
    <div className="rounded-lg border border-border bg-gradient-to-br from-card via-card to-accent/5 p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={cn("rounded-full bg-primary/10 p-3", iconColor)}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Today's Focus
          </h2>
          <p className="text-sm text-muted-foreground">
            One thing to trade with more clarity today
          </p>
        </div>
      </div>

      {/* Journey Message - Encouraging progress note */}
      {guidance.journeyMessage && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-lg p-4 border border-emerald-200/50 dark:border-emerald-800/30">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-emerald-800 dark:text-emerald-200">
              {guidance.journeyMessage}
            </p>
          </div>
        </div>
      )}

      {/* Main Coaching Message */}
      <div className="space-y-4">
        <div className="prose prose-sm max-w-none">
          <p className="text-lg leading-relaxed text-foreground font-medium whitespace-pre-line">
            {guidance.focus}
          </p>
        </div>

        <div className="pt-4 border-t border-border/50">
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
            {guidance.context}
          </p>
        </div>

        {/* Gentle Reminder */}
        {guidance.gentleReminder && (
          <div className="pt-4 border-t border-border/30">
            <p className="text-sm italic text-muted-foreground leading-relaxed">
              {guidance.gentleReminder}
            </p>
          </div>
        )}
      </div>

      {/* Journey Context Summary */}
      {guidance.journeyContext && (
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span>Behavioral Score: </span>
              <span
                className={cn(
                  "font-medium",
                  guidance.journeyContext.currentScore >= 70
                    ? "text-emerald-600 dark:text-emerald-400"
                    : guidance.journeyContext.currentScore >= 50
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground"
                )}
              >
                {Math.round(guidance.journeyContext.currentScore)}
              </span>
              {guidance.journeyContext.scoreChange > 0 && (
                <span className="text-emerald-600 dark:text-emerald-400 text-xs">
                  (+{Math.round(guidance.journeyContext.scoreChange)})
                </span>
              )}
            </div>
            {guidance.journeyContext.topGrowthArea && (
              <div className="text-emerald-600 dark:text-emerald-400">
                <span className="text-muted-foreground">Growing: </span>
                <span className="font-medium">
                  {guidance.journeyContext.topGrowthArea}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Link to Insights */}
      {guidance.redirectToInsights && (
        <div className="pt-4 border-t border-border/50">
          <Link
            to="/insights-v2?range=today"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View detailed insights
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
