/**
 * Insights Page
 * 
 * Main insights page with backend integration
 * All insight logic is handled by backend
 */

import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Loader2 } from 'lucide-react';
import { useInsights } from '../hooks/useInsights';
import { useTrades } from '@/context/TradeContext';
import { DataConfidenceBanner } from '@/features/trade-import/components/DataConfidenceBanner';
import { InsightTabs } from '../components/InsightTabs';
import { InsightHeroCard } from '../components/InsightHeroCard';
import { InsightCategoryGroup } from '../components/InsightCategoryGroup';
import { InsightEmptyState } from '../components/InsightEmptyState';
import { InsightRange, InsightCard } from '../types/insight.types';

export default function InsightsPage() {
  const [range, setRange] = useState<InsightRange>('TODAY');
  const { data: insights, loading, error } = useInsights(range);
  const { trades } = useTrades();

  // Calculate imported trade counts for banner
  const importedTradeCount = useMemo(() => {
    return trades.filter(t => t.source === 'IMPORTED').length;
  }, [trades]);

  // Group insights by category
  const groupedInsights = useMemo(() => {
    if (!insights || insights.length === 0) {
      return {
        hero: null,
        psychology: [] as InsightCard[],
        risk: [] as InsightCard[],
        discipline: [] as InsightCard[],
        performance: [] as InsightCard[],
      };
    }

    // Sort by confidence (HIGH > MEDIUM > LOW) for hero selection
    const sorted = [...insights].sort((a, b) => {
      const confidenceOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
    });

    const hero = sorted[0] || null;
    const rest = sorted.slice(1);

    // Group remaining by category
    const groups = {
      psychology: [] as InsightCard[],
      risk: [] as InsightCard[],
      discipline: [] as InsightCard[],
      performance: [] as InsightCard[],
    };

    for (const insight of rest) {
      const categoryKey = insight.category.toLowerCase() as keyof typeof groups;
      if (categoryKey in groups) {
        groups[categoryKey].push(insight);
      }
    }

    return { hero, ...groups };
  }, [insights]);

  return (
    <AppLayout>
      <div className="page-container animate-fade-in">
        <header className="mb-8">
          <h1 className="page-title">Insights</h1>
          <p className="page-subtitle mt-1">Patterns from your trading behavior</p>
        </header>

        {/* Tabs */}
        <div className="mb-8">
          <InsightTabs value={range} onValueChange={setRange} />
        </div>

        {/* Data Confidence Banner */}
        {importedTradeCount > 0 && (
          <div className="mb-8">
            <DataConfidenceBanner
              importedTradeCount={importedTradeCount}
              totalTradeCount={trades.length}
            />
            {insights && insights.length > 0 && (
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
        {!loading && !error && (
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Hero Insight */}
            {groupedInsights.hero && (
              <div>
                <InsightHeroCard insight={groupedInsights.hero} />
              </div>
            )}

            {/* Empty State */}
            {insights && insights.length === 0 && (
              <InsightEmptyState />
            )}

            {/* Category Groups */}
            {insights && insights.length > 0 && (
              <div className="space-y-8">
                <InsightCategoryGroup
                  category="PSYCHOLOGY"
                  insights={groupedInsights.psychology}
                />
                <InsightCategoryGroup
                  category="RISK"
                  insights={groupedInsights.risk}
                />
                <InsightCategoryGroup
                  category="DISCIPLINE"
                  insights={groupedInsights.discipline}
                />
                <InsightCategoryGroup
                  category="PERFORMANCE"
                  insights={groupedInsights.performance}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

