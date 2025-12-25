/**
 * Insights V2 Page
 * 
 * Enhanced insights page with behavioral snapshot, prioritization, and better semantics
 */

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Loader2 } from 'lucide-react';
import { useInsightsV2 } from '../hooks/useInsightsV2';
import { useTrades } from '@/context/TradeContext';
import { DataConfidenceBanner } from '@/features/trade-import/components/DataConfidenceBanner';
import { BehavioralSnapshotCard } from '../components/BehavioralSnapshotCard';
import { PrimaryInsightCard } from '../components/PrimaryInsightCard';
import { InsightGroup } from '../components/InsightGroup';
import { DataCoverageNote } from '../components/DataCoverageNote';
import { TodaysFocusStrip } from '../components/TodaysFocusStrip';
import { InsightRange, InsightCategory } from '../types/insightV2.types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'react-router-dom';

export default function InsightsV2Page() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRange = (searchParams.get('range')?.toUpperCase() as InsightRange) || 'TODAY';
  const [range, setRange] = useState<InsightRange>(initialRange);
  const { data: insightsResponse, loading, error } = useInsightsV2(range);
  const { trades } = useTrades();

  // Calculate imported trade counts for banner
  const importedTradeCount = trades.filter(t => t.source === 'IMPORTED').length;

  const handleRangeChange = (newRange: InsightRange) => {
    setRange(newRange);
    setSearchParams({ range: newRange.toLowerCase() });
  };

  return (
    <AppLayout>
      <div className="page-container animate-fade-in">
        <header className="mb-8">
          <h1 className="page-title">Insights</h1>
          <p className="page-subtitle mt-1">Patterns from your trading behavior</p>
        </header>

        {/* Tabs */}
        <div className="mb-8">
          <Tabs value={range} onValueChange={(value) => handleRangeChange(value as InsightRange)}>
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="TODAY">Today</TabsTrigger>
              <TabsTrigger value="WEEK">This Week</TabsTrigger>
              <TabsTrigger value="MONTH">This Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Data Confidence Banner */}
        {importedTradeCount > 0 && (
          <div className="mb-8">
            <DataConfidenceBanner
              importedTradeCount={importedTradeCount}
              totalTradeCount={trades.length}
            />
            {insightsResponse && insightsResponse.prioritizedInsights.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2 italic">
                {importedTradeCount === trades.length
                  ? 'Insights are based on executed trades. Plan-based patterns may be limited.'
                  : 'Insights combine manual and imported trades.'}
              </p>
            )}
          </div>
        )}

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
            {/* Behavioral Snapshot */}
            <BehavioralSnapshotCard snapshot={insightsResponse.snapshot} />

            {/* Data Coverage Note */}
            {!insightsResponse.dataCoverage.sufficient && (
              <DataCoverageNote dataCoverage={insightsResponse.dataCoverage} />
            )}

            {/* Primary Insights */}
            {insightsResponse.prioritizedInsights.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Key Behavioral Focus</h2>
                {insightsResponse.prioritizedInsights.map((insight) => (
                  <PrimaryInsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            )}

            {/* Today's Focus Strip */}
            {insightsResponse.prioritizedInsights.length > 0 && (
              <TodaysFocusStrip prioritizedInsights={insightsResponse.prioritizedInsights} />
            )}

            {/* Empty State */}
            {insightsResponse.prioritizedInsights.length === 0 && 
             Object.values(insightsResponse.groupedInsights).every(group => group.length === 0) && (
              <div className="card-calm text-center py-12">
                <p className="text-sm text-muted-foreground">
                  {insightsResponse.dataCoverage.sufficient
                    ? 'No behavioral patterns detected at this time.'
                    : 'Not enough data yet. Insights will appear as you record more trades.'}
                </p>
              </div>
            )}

            {/* Grouped Insights */}
            {Object.entries(insightsResponse.groupedInsights).map(([category, insights]) => (
              <InsightGroup
                key={category}
                category={category as InsightCategory}
                insights={insights}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

