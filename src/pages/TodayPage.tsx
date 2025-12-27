import { Link } from 'react-router-dom';
import { Plus, TrendingUp, AlertCircle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTrades } from '@/context/TradeContext';
import { behavioralInsights } from '@/lib/mockData';
import { GuardrailsCard } from '@/components/GuardrailsCard';

export default function TodayPage() {
  const { getOpenTrades } = useTrades();
  const openTrades = getOpenTrades();

  return (
    <AppLayout>
      <div className="page-container animate-fade-in">
        {/* Header */}
        <header className="mb-8">
          <h1 className="page-title">Today</h1>
          <p className="page-subtitle mt-1">Stay aligned with your plan</p>
        </header>

        {/* Trade Focus - Behavioral Reminder */}
        <div className="card-calm border-l-2 border-l-warning/50 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Behavioral Reminder</p>
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
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      trade.type === 'buy' 
                        ? 'bg-success/20 text-success' 
                        : 'bg-destructive/20 text-destructive'
                    }`}>
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
      </div>
    </AppLayout>
  );
}
