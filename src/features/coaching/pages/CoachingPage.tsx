/**
 * Coaching Page (Homepage)
 * 
 * Daily coaching experience with mindset check and behavioral guidance
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Loader2, Plus, TrendingUp, ArrowRight } from 'lucide-react';
import { DailyMindsetCheck } from '../components/DailyMindsetCheck';
import { CoachingGuidance } from '../components/CoachingGuidance';
import { useCoaching } from '../hooks/useCoaching';
import { useTrades } from '@/context/TradeContext';
import { Button } from '@/components/ui/button';
import { GuardrailsCard } from '@/components/GuardrailsCard';
import { cn } from '@/lib/utils';

export default function CoachingPage() {
  const { 
    mindsetCheck, 
    guidance, 
    hasCheckedToday, 
    isLoading, 
    error,
    refreshCoaching 
  } = useCoaching();
  const { getOpenTrades } = useTrades();
  const [mindsetSubmitted, setMindsetSubmitted] = useState(false);
  const openTrades = getOpenTrades();

  // Refresh coaching when mindset is submitted
  useEffect(() => {
    if (mindsetSubmitted) {
      refreshCoaching();
      setMindsetSubmitted(false);
    }
  }, [mindsetSubmitted, refreshCoaching]);

  // Refresh coaching on trade events
  useEffect(() => {
    const handleTradeCreated = () => {
      // Small delay to ensure backend has processed the trade
      setTimeout(() => {
        refreshCoaching();
      }, 1000);
    };

    const handleTradeClosed = (event: Event) => {
      const customEvent = event as CustomEvent;
      const isLoss = customEvent.detail?.isLoss;
      
      // Always refresh, but especially important for losses
      setTimeout(() => {
        refreshCoaching();
      }, isLoss ? 500 : 1000);
    };

    window.addEventListener('trade-created', handleTradeCreated);
    window.addEventListener('trade-closed', handleTradeClosed);

    return () => {
      window.removeEventListener('trade-created', handleTradeCreated);
      window.removeEventListener('trade-closed', handleTradeClosed);
    };
  }, [refreshCoaching]);

  return (
    <AppLayout>
      <div className="page-container animate-fade-in">
        {/* Header */}
        <header className="mb-8">
          <h1 className="page-title">Today</h1>
          <p className="page-subtitle mt-1">A calm focus for your trading day</p>
        </header>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 mb-6">
            <p className="text-sm text-destructive">
              {error instanceof Error ? error.message : 'Failed to load coaching guidance'}
            </p>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && (
          <div className="space-y-6">
            {/* Daily Check-In - Show first if not submitted today */}
            {!hasCheckedToday && !mindsetSubmitted && (
              <DailyMindsetCheck 
                onSubmitted={() => {
                  setMindsetSubmitted(true);
                  // Refresh coaching after mindset check is submitted
                  setTimeout(() => {
                    refreshCoaching();
                  }, 500);
                }} 
              />
            )}

            {/* Coaching Guidance - Show if available (works with or without mindset check) */}
            {guidance && (
              <CoachingGuidance guidance={guidance} />
            )}

            {/* Empty State - No guidance yet */}
            {!guidance && hasCheckedToday && (
              <div className="rounded-lg border border-border bg-muted/20 p-12 text-center">
                <p className="text-sm text-muted-foreground">
                  Generating your daily guidance...
                </p>
              </div>
            )}

            {/* Today's Guardrails */}
            <GuardrailsCard />

            {/* Open Trades - Condensed View */}
            {openTrades.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Open trades: {openTrades.length}
                    </span>
                  </div>
                  {openTrades.length > 3 && (
                    <Link
                      to="/history"
                      className="text-xs text-primary hover:text-primary/80 hover:underline"
                    >
                      View all
                    </Link>
                  )}
                </div>
                
                <div className="space-y-2">
                  {openTrades.slice(0, 3).map((trade) => (
                    <Link
                      key={trade.id}
                      to={`/trade/${trade.id}`}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">{trade.symbol}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                          {trade.instrumentType}
                        </span>
                        {trade.instrumentType === 'OPTIONS' && trade.optionType && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-accent text-accent-foreground">
                            {trade.optionType}
                          </span>
                        )}
                        <span className={cn(
                          'text-xs px-1.5 py-0.5 rounded',
                          trade.type === 'buy' 
                            ? 'bg-success/20 text-success' 
                            : 'bg-destructive/20 text-destructive'
                        )}>
                          {trade.type.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Button asChild className="w-full" size="lg">
                  <Link to="/add-trade">
                    <Plus className="w-4 h-4" />
                    Add Trade
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Take a moment. You don't need to trade immediately.
                </p>
              </div>
              <Button asChild variant="outline" className="flex-1" size="lg">
                <Link to="/insights-v2?range=today">
                  View Insights
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

