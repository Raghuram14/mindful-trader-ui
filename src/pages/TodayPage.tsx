import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, TrendingUp, AlertCircle, Edit } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useTrades } from "@/context/TradeContext";
import { behavioralInsights } from "@/lib/mockData";
import { GuardrailsCard } from "@/components/GuardrailsCard";
import { TradeCompletionWizard } from "@/components/trade/TradeCompletionWizard";
import { ExternalExitNotification } from "@/components/trade/ExternalExitNotification";
import { tradesApi } from "@/api/trades";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function TodayPage() {
  const { getOpenTrades, refreshTrades } = useTrades();
  const openTrades = getOpenTrades();
  const { toast } = useToast();
  const [completingTrade, setCompletingTrade] = useState<any | null>(null);
  const [dismissedExits, setDismissedExits] = useState<Set<string>>(new Set());

  // Check for incomplete trades
  const incompleteTrades = openTrades.filter(
    (t: any) =>
      t.needsCompletion || !t.reason || (!t.plannedTarget && !t.plannedStop)
  );

  // Check for externally closed trades
  const externallyClosedTrades = openTrades.filter(
    (t: any) => t.status === "externally_closed" && !dismissedExits.has(t.id)
  );

  const handleCompleteTrade = async (data: any) => {
    if (!completingTrade) return;
    try {
      await tradesApi.completeTrade(completingTrade.id, {
        confidence: data.confidence,
        plannedTarget: data.plannedTarget
          ? parseFloat(data.plannedTarget)
          : undefined,
        plannedStop: data.plannedStop
          ? parseFloat(data.plannedStop)
          : undefined,
        reason: data.reason,
      });
      toast({
        title: "Trade completed",
        description: "Your trading plan has been saved.",
      });
      await refreshTrades();
      setCompletingTrade(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete trade. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDismissExit = (tradeId: string) => {
    setDismissedExits((prev) => new Set(prev).add(tradeId));
  };

  return (
    <AppLayout>
      <div className="page-container animate-fade-in">
        {/* Header */}
        <header className="mb-8">
          <h1 className="page-title">Today</h1>
          <p className="page-subtitle mt-1">Stay aligned with your plan</p>
        </header>

        {/* External Exit Notifications */}
        {externallyClosedTrades.length > 0 && (
          <div className="space-y-3 mb-6">
            {externallyClosedTrades.map((trade: any) => (
              <ExternalExitNotification
                key={trade.id}
                trade={trade}
                onComplete={(tradeId) => {
                  const trade = openTrades.find((t) => t.id === tradeId);
                  if (trade) setCompletingTrade(trade);
                }}
                onDismiss={handleDismissExit}
              />
            ))}
          </div>
        )}

        {/* Incomplete Trades Alert */}
        {incompleteTrades.length > 0 && (
          <div className="card-calm border-l-2 border-l-blue-500 mb-6">
            <div className="flex items-start gap-3">
              <Edit className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground mb-1">
                  Complete Your Trading Plan
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  {incompleteTrades.length} trade
                  {incompleteTrades.length > 1 ? "s" : ""} need
                  {incompleteTrades.length === 1 ? "s" : ""} completion
                </p>
                <div className="flex gap-2 flex-wrap">
                  {incompleteTrades.map((trade: any) => (
                    <Button
                      key={trade.id}
                      size="sm"
                      variant="outline"
                      onClick={() => setCompletingTrade(trade)}
                    >
                      Complete {trade.symbol}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trade Focus - Behavioral Reminder */}
        <div className="card-calm border-l-2 border-l-warning/50 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                Behavioral Reminder
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {behavioralInsights.reminder}
              </p>
            </div>
          </div>
        </div>

        {/* Today's Guardrails */}
        <div className="mb-6">
          <GuardrailsCard />
        </div>

        {/* Open Trades */}
        {openTrades.length > 0 && (
          <div className="card-calm mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Open trades: {openTrades.length}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {openTrades.slice(0, 3).map((trade) => (
                <Link
                  key={trade.id}
                  to={`/exit-trade/${trade.id}`}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">
                      {trade.symbol}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                      {trade.instrumentType}
                    </span>
                    {trade.instrumentType === "OPTIONS" && trade.optionType && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-accent text-accent-foreground">
                        {trade.optionType}
                      </span>
                    )}
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        trade.type === "buy"
                          ? "bg-success/20 text-success"
                          : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {trade.type.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">→</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="space-y-3">
          <Link
            to="/add-trade"
            className="flex items-center justify-center gap-3 btn-primary w-full py-4"
          >
            <Plus className="w-5 h-5" />
            Add Trade
          </Link>
          <Link
            to="/insights"
            className="flex items-center justify-center gap-3 btn-secondary w-full py-4"
          >
            <TrendingUp className="w-5 h-5" />
            Insights
          </Link>
        </div>

        {/* Trade Completion Wizard */}
        {completingTrade && (
          <TradeCompletionWizard
            trade={completingTrade}
            open={!!completingTrade}
            onOpenChange={(open) => !open && setCompletingTrade(null)}
            onComplete={handleCompleteTrade}
          />
        )}
      </div>
    </AppLayout>
  );
}
