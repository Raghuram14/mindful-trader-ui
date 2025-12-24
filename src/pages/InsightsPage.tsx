import { useState, useEffect } from 'react';
import { Brain, Clock, Shield, Target, TrendingUp } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { mockInsights, InsightScope, Insight, behavioralInsights } from '@/lib/mockData';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useTrades } from '@/context/TradeContext';
import { useIsMobile } from '@/hooks/use-mobile';

export default function InsightsPage() {
  const isMobile = useIsMobile();
  const [scope, setScope] = useState<InsightScope>('WEEK');

  // Set default scope based on device (desktop: WEEK, mobile: TODAY)
  useEffect(() => {
    if (isMobile) {
      setScope('TODAY');
    }
  }, [isMobile]);
  const { getClosedTrades, getOpenTrades } = useTrades();
  const closedTrades = getClosedTrades();
  const openTrades = getOpenTrades();

  // Calculate TODAY insights dynamically
  const getTodayInsights = (): Insight[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayClosedTrades = closedTrades.filter(trade => {
      if (!trade.closedAt) return false;
      const tradeDate = new Date(trade.closedAt);
      tradeDate.setHours(0, 0, 0, 0);
      return tradeDate.getTime() === today.getTime();
    });

    const earlyExits = todayClosedTrades.filter(
      t => t.exitReason === 'fear' || t.exitReason === 'impulse' || t.exitReason === 'unsure'
    ).length;

    const insights: Insight[] = [];

    // Live Observation
    if (todayClosedTrades.length > 0) {
      insights.push({
        scope: 'TODAY',
        type: 'SNAPSHOT',
        title: 'Live Observation',
        description: earlyExits > 0
          ? `You've exited ${earlyExits} ${earlyExits === 1 ? 'trade' : 'trades'} early today.`
          : `You've closed ${todayClosedTrades.length} ${todayClosedTrades.length === 1 ? 'trade' : 'trades'} today.`,
        severity: earlyExits > 0 ? 'WARNING' : 'NEUTRAL',
      });
    } else if (openTrades.length > 0) {
      insights.push({
        scope: 'TODAY',
        type: 'SNAPSHOT',
        title: 'Live Observation',
        description: `You have ${openTrades.length} ${openTrades.length === 1 ? 'trade' : 'trades'} open.`,
        severity: 'NEUTRAL',
      });
    } else {
      insights.push({
        scope: 'TODAY',
        type: 'SNAPSHOT',
        title: 'Live Observation',
        description: 'No trades recorded today yet.',
        severity: 'NEUTRAL',
      });
    }

    // Rule Awareness (if applicable)
    // This would ideally come from RulesContext, but for now we'll use a simple check
    if (earlyExits > 0 && todayClosedTrades.length >= 2) {
      insights.push({
        scope: 'TODAY',
        type: 'PATTERN',
        title: 'Rule Awareness',
        description: "You're close to a limit you set for today.",
        severity: 'WARNING',
      });
    }

    // Gentle Nudge
    if (earlyExits >= 2) {
      insights.push({
        scope: 'TODAY',
        type: 'FOCUS',
        title: 'Gentle Nudge',
        description: 'Consider pausing before taking another trade.',
        severity: 'NEUTRAL',
      });
    }

    return insights.length > 0 ? insights : mockInsights.TODAY;
  };

  // Get insights for current scope
  const insights = scope === 'TODAY' ? getTodayInsights() : mockInsights[scope];

  // Calculate behavioral score for WEEK scope
  const getBehavioralScore = (): number => {
    if (scope !== 'WEEK') return 0;
    // Simple calculation: percentage of trades that hit target or stop (vs fear/impulse)
    const weekTrades = closedTrades.filter(trade => {
      if (!trade.closedAt) return false;
      const tradeDate = new Date(trade.closedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return tradeDate >= weekAgo;
    });

    if (weekTrades.length === 0) return behavioralInsights.score;

    const disciplinedExits = weekTrades.filter(
      t => t.exitReason === 'target' || t.exitReason === 'stop'
    ).length;
    return Math.round((disciplinedExits / weekTrades.length) * 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getIconForType = (type: Insight['type']) => {
    switch (type) {
      case 'SNAPSHOT':
        return TrendingUp;
      case 'PATTERN':
        return Brain;
      case 'CONTEXT':
        return Clock;
      case 'FOCUS':
        return Target;
      default:
        return Brain;
    }
  };

  const getSeverityColor = (severity?: Insight['severity']) => {
    switch (severity) {
      case 'POSITIVE':
        return 'border-l-success';
      case 'WARNING':
        return 'border-l-warning';
      default:
        return 'border-l-primary';
    }
  };

  const renderSnapshot = (insight: Insight, score?: number) => {
    const Icon = getIconForType(insight.type);
    return (
      <div className="card-calm text-center py-8">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-3">
          <Icon className="w-4 h-4" />
          {insight.title}
        </div>
        {score !== undefined && scope === 'WEEK' && (
          <>
            <p className={`text-6xl font-bold tracking-tight ${getScoreColor(score)} mb-2`}>
              {score}
            </p>
            <p className="text-xs text-muted-foreground mb-3">Behavioral Score</p>
          </>
        )}
        <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
        {insight.delta && (
          <p className="text-xs text-muted-foreground italic">{insight.delta}</p>
        )}
      </div>
    );
  };

  const renderPattern = (insight: Insight) => {
    const Icon = getIconForType(insight.type);
    return (
      <div className={`card-calm ${getSeverityColor(insight.severity)} border-l-2`}>
        <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
          <Icon className="w-4 h-4" />
          {insight.title}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {insight.description}
        </p>
      </div>
    );
  };

  const renderContext = (insight: Insight) => {
    const Icon = getIconForType(insight.type);
    return (
      <div className="card-calm border-l-2 border-l-primary/30">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
          <Icon className="w-4 h-4 text-primary" />
          {insight.title}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {insight.description}
        </p>
      </div>
    );
  };

  const renderFocus = (insight: Insight) => {
    const Icon = getIconForType(insight.type);
    return (
      <div className="card-calm border-l-4 border-l-primary">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
          <Icon className="w-4 h-4 text-primary" />
          {insight.title}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {insight.description}
        </p>
      </div>
    );
  };

  const renderInsight = (insight: Insight, score?: number) => {
    switch (insight.type) {
      case 'SNAPSHOT':
        return renderSnapshot(insight, score);
      case 'PATTERN':
        return renderPattern(insight);
      case 'CONTEXT':
        return renderContext(insight);
      case 'FOCUS':
        return renderFocus(insight);
      default:
        return null;
    }
  };

  const snapshotInsight = insights.find(i => i.type === 'SNAPSHOT');
  const patternInsights = insights.filter(i => i.type === 'PATTERN');
  const contextInsight = insights.find(i => i.type === 'CONTEXT');
  const focusInsight = insights.find(i => i.type === 'FOCUS');

  const behavioralScore = scope === 'WEEK' ? getBehavioralScore() : undefined;

  return (
    <AppLayout>
      <div className="page-container animate-fade-in">
        <header className="mb-8">
          <h1 className="page-title">Insights</h1>
          <p className="page-subtitle mt-1">Patterns from your trading behavior</p>
        </header>

        {/* Scope Selector */}
        <div className="mb-8">
          <Tabs value={scope} onValueChange={(value) => setScope(value as InsightScope)}>
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="TODAY">Today</TabsTrigger>
              <TabsTrigger value="WEEK">This Week</TabsTrigger>
              <TabsTrigger value="MONTH">This Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-6 max-w-3xl mx-auto">
          {/* 1. Snapshot */}
          {snapshotInsight && (
            <div>
              {renderInsight(snapshotInsight, behavioralScore)}
            </div>
          )}

          {/* 2. Behavioral Patterns */}
          {patternInsights.length > 0 && (
            <div className="space-y-4">
              {patternInsights.map((insight, index) => (
                <div key={index}>
                  {renderInsight(insight)}
                </div>
              ))}
            </div>
          )}

          {/* 3. Contextual Insight */}
          {contextInsight && (
            <div>
              {renderInsight(contextInsight)}
            </div>
          )}

          {/* 4. Focus & Guidance */}
          {focusInsight && (
            <div>
              {renderInsight(focusInsight)}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
