/**
 * JourneyProgressCard Component
 *
 * Hero card showing the trader's behavioral progress journey.
 * Compares first 15 trades vs last 15 trades to show growth.
 * Coaching-focused, not judgmental.
 */

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Target,
  Award,
  Loader2,
} from "lucide-react";
import { progressApi } from "../api/progress.api";
import { cn } from "@/lib/utils";

export function JourneyProgressCard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["progressComparison"],
    queryFn: () => progressApi.getProgressComparison(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary/60" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return null; // Silently fail - this is optional content
  }

  if (!data.hasSufficientData) {
    return (
      <Card className="bg-gradient-to-br from-muted/30 to-muted/50 border-border">
        <CardContent className="py-8 text-center">
          <Target className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Keep trading! We need at least {data.minimumTradesRequired} trades
            to show your progress journey.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-2">
            You're building your foundation.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { journey } = data;
  const scoreImproved = journey.scoreChange > 0;
  const scoreUnchanged = journey.scoreChange === 0;

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-card to-emerald-50/20 dark:from-primary/10 dark:via-card dark:to-emerald-950/20 border-primary/20 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Your Growth Journey
            </CardTitle>
            <CardDescription>
              Comparing your first {data.periodA.tradesCount} trades to your
              recent {data.periodB.tradesCount} trades
            </CardDescription>
          </div>
          {journey.milestones.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <Award className="w-4 h-4" />
              <span>
                {journey.milestones.length} milestone
                {journey.milestones.length > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Score Display */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 dark:bg-muted/30 border border-border/50">
          <div className="text-center flex-1">
            <p className="text-xs text-muted-foreground mb-1">Then</p>
            <p className="text-3xl font-bold text-muted-foreground">
              {Math.round(journey.startingScore)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {data.periodA.label}
            </p>
          </div>

          <div className="flex flex-col items-center px-4">
            {scoreImproved ? (
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            ) : scoreUnchanged ? (
              <Minus className="w-6 h-6 text-muted-foreground" />
            ) : (
              <TrendingDown className="w-6 h-6 text-amber-500" />
            )}
            <span
              className={cn(
                "text-sm font-semibold mt-1",
                scoreImproved
                  ? "text-emerald-500"
                  : scoreUnchanged
                  ? "text-muted-foreground"
                  : "text-amber-500"
              )}
            >
              {scoreImproved ? "+" : ""}
              {Math.round(journey.scoreChange)} pts
            </span>
          </div>

          <div className="text-center flex-1">
            <p className="text-xs text-muted-foreground mb-1">Now</p>
            <p
              className={cn(
                "text-3xl font-bold",
                scoreImproved ? "text-emerald-500" : "text-foreground"
              )}
            >
              {Math.round(journey.currentScore)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {data.periodB.label}
            </p>
          </div>
        </div>

        {/* Coaching Message */}
        <div className="rounded-lg bg-primary/10 dark:bg-primary/20 p-4 border border-primary/20">
          <p className="text-sm font-medium text-foreground mb-1">
            {journey.coaching.journeyHeadline}
          </p>
          <p className="text-sm text-muted-foreground">
            {journey.coaching.keyProgress}
          </p>
        </div>

        {/* Growth Areas */}
        {journey.growthAreas.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Where You've Grown
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {journey.growthAreas.slice(0, 4).map((metric) => (
                <div
                  key={metric.name}
                  className="rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 p-3 border border-emerald-500/30"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">
                      {metric.name}
                    </span>
                    <span className="text-xs font-medium text-emerald-500">
                      +{Math.round(metric.change.absolute)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {Math.round(metric.periodA.value)}
                    </span>
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-500">
                      {Math.round(metric.periodB.value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Focus */}
        {journey.coaching.nextFocus && (
          <div className="pt-4 border-t border-border/50">
            <div className="flex items-start gap-2">
              <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Next Focus
                </p>
                <p className="text-sm text-foreground">
                  {journey.coaching.nextFocus}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
