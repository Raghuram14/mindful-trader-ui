/**
 * Insights V2 Page
 *
 * Behavioral coaching page - focused on growth journey, not judgment
 * Shows: Progress → Today's Focus → Patterns → Trends
 */

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Loader2 } from "lucide-react";
import { useInsightsV2 } from "../hooks/useInsightsV2";
import { useTrades } from "@/context/TradeContext";
import { JourneyProgressCard } from "../components/JourneyProgressCard";
import { BehavioralTrendChart } from "../components/BehavioralTrendChart";
import { TodaysFocusStrip } from "../components/TodaysFocusStrip";
import { InsightGroup } from "../components/InsightGroup";
import { DataCoverageNote } from "../components/DataCoverageNote";
import { ExportInsightsButton } from "../components/ExportInsightsButton";
import { StreakStrip } from "../components/StreakStrip";
import { MilestoneToast } from "../components/MilestoneToast";
import { InsightRange, InsightCategory } from "../types/insightV2.types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";

export default function InsightsV2Page() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRange =
    (searchParams.get("range")?.toUpperCase() as InsightRange) || "WEEK";
  const [range, setRange] = useState<InsightRange>(initialRange);
  const { data: insightsResponse, loading, error } = useInsightsV2(range);
  const { trades } = useTrades();

  const handleRangeChange = (newRange: InsightRange) => {
    setRange(newRange);
    setSearchParams({ range: newRange.toLowerCase() });
  };

  return (
    <AppLayout>
      <div className="page-container animate-fade-in">
        <header className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="page-title">Your Journey</h1>
            <p className="page-subtitle mt-1">
              See how you're growing as a trader
            </p>
          </div>
          <ExportInsightsButton />
        </header>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="card-calm text-center py-12">
            <p className="text-sm text-muted-foreground">
              Failed to load insights. Please try again.
            </p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && insightsResponse && (
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* SECTION 1: Your Progress Journey (Before/After) */}
            <JourneyProgressCard />

            {/* SECTION 1.5: Active Behavioral Streaks */}
            <StreakStrip />

            {/* SECTION 2: Today's Focus - What to work on */}
            {insightsResponse.prioritizedInsights.length > 0 && (
              <TodaysFocusStrip
                prioritizedInsights={insightsResponse.prioritizedInsights}
              />
            )}

            {/* SECTION 3: Your Trends Over Time */}
            <BehavioralTrendChart />

            {/* SECTION 4: Pattern Details (by time range) */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Recent Patterns
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Behaviors we've noticed in your recent trades
                  </p>
                </div>
                <Tabs
                  value={range}
                  onValueChange={(value) =>
                    handleRangeChange(value as InsightRange)
                  }
                >
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="TODAY" className="text-xs">
                      Today
                    </TabsTrigger>
                    <TabsTrigger value="WEEK" className="text-xs">
                      Week
                    </TabsTrigger>
                    <TabsTrigger value="MONTH" className="text-xs">
                      Month
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Data Coverage Note */}
              {!insightsResponse.dataCoverage.sufficient && (
                <DataCoverageNote
                  dataCoverage={insightsResponse.dataCoverage}
                />
              )}

              {/* Pattern Groups */}
              {Object.entries(insightsResponse.groupedInsights).some(
                ([, insights]) => insights.length > 0
              ) ? (
                <div className="space-y-4">
                  {Object.entries(insightsResponse.groupedInsights).map(
                    ([category, insights]) =>
                      insights.length > 0 && (
                        <InsightGroup
                          key={category}
                          category={category as InsightCategory}
                          insights={insights}
                        />
                      )
                  )}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    {insightsResponse.dataCoverage.sufficient
                      ? "No specific patterns detected. Keep trading mindfully!"
                      : "Record a few more trades to see patterns emerge."}
                  </p>
                </div>
              )}
            </div>

            {/* Encouragement Footer */}
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground italic">
                Every trade you log helps us coach you better. Keep going.
              </p>
            </div>
          </div>
        )}

        {/* Milestone Toast - shows new achievements */}
        <MilestoneToast />
      </div>
    </AppLayout>
  );
}
