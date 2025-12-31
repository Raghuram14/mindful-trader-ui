/**
 * Trading DNA Page
 *
 * Behavioral fingerprint dashboard - reveals who you are as a trader.
 * Shows stable traits, patterns, strengths, and evolution over time.
 *
 * Philosophy: Awareness, not judgment. Mirror, not scorecard.
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, RefreshCw, Dna, AlertCircle } from "lucide-react";
import { getTradingDNA, type TradingDNAResponse } from "@/api/tradingDNA";
import { DNASummaryCard } from "../components/dna/DNASummaryCard";
import { TraitRadarChart } from "../components/dna/TraitRadarChart";
import { StrengthsGrowthCards } from "../components/dna/StrengthsGrowthCards";
import { EvolutionTimeline } from "../components/dna/EvolutionTimeline";
import { PatternFrequencyCard } from "../components/dna/PatternFrequencyCard";
import { DNAInsufficientData } from "../components/dna/DNAInsufficientData";

export default function TradingDNAPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["tradingDNA"],
    queryFn: () => getTradingDNA(false),
    staleTime: 60 * 60 * 1000, // 1 hour - DNA doesn't change frequently
    retry: 1,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await getTradingDNA(true); // Force refresh
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <AppLayout>
      <div className="page-container animate-fade-in">
        {/* Header */}
        <header className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Dna className="w-6 h-6 text-primary" />
              <h1 className="page-title">Your Trading DNA</h1>
            </div>
            <p className="page-subtitle mt-1">
              Your behavioral fingerprint as a trader
            </p>
          </div>
          {data?.hasEnoughData && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
          )}
        </header>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary/60 mb-4" />
            <p className="text-sm text-muted-foreground">
              Analyzing your trading patterns...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="flex items-center gap-3 py-6">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div>
                <p className="text-sm font-medium">
                  Unable to load your Trading DNA
                </p>
                <p className="text-xs text-muted-foreground">
                  Please try again later
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Insufficient Data State */}
        {!isLoading && !error && data && !data.hasEnoughData && (
          <DNAInsufficientData
            tradeCount={data.tradeCount}
            message={data.message}
          />
        )}

        {/* Main Content - DNA Dashboard */}
        {!isLoading && !error && data?.hasEnoughData && data.dna && (
          <div className="space-y-8 max-w-5xl mx-auto">
            {/* Section 1: DNA Summary - Archetype and narrative */}
            <DNASummaryCard
              archetype={data.dna.archetype}
              confidence={data.dna.archetypeConfidence}
              narrative={data.dna.archetypeNarrative}
              dataQuality={data.dna.dataQuality}
            />

            {/* Section 2: Trait Radar - Visual DNA */}
            <TraitRadarChart traits={data.dna.traits} />

            {/* Section 3: Strengths & Growth Areas */}
            <StrengthsGrowthCards
              strengths={data.dna.strengths}
              growthAreas={data.dna.growthAreas}
            />

            {/* Section 4: Evolution Timeline */}
            {data.dna.evolution.length > 0 && (
              <EvolutionTimeline evolution={data.dna.evolution} />
            )}

            {/* Section 5: Pattern Frequencies */}
            {(data.dna.dominantPatterns.length > 0 ||
              data.dna.rarePatterns.length > 0) && (
              <PatternFrequencyCard
                dominantPatterns={data.dna.dominantPatterns}
                rarePatterns={data.dna.rarePatterns}
              />
            )}

            {/* Footer */}
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground italic">
                Your DNA evolves as you trade. Check back to see your growth.
              </p>
              {data.dna.computedAt && (
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Last computed:{" "}
                  {new Date(data.dna.computedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
