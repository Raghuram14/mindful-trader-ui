import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTrades } from '@/context/TradeContext';
import { formatCurrency, Trade } from '@/lib/mockData';
import { Filter } from 'lucide-react';
import {
  getBehavioralTag,
  isWithinPlan,
  formatTradeTime,
  getConfidenceDots,
  getInsightHint,
} from '@/utils/tradeBehavior';

const exitReasonLabels: Record<NonNullable<Trade['exitReason']>, string> = {
  target: 'Target',
  stop: 'Stop',
  fear: 'Fear',
  unsure: 'Unsure',
  impulse: 'Impulse',
};

export default function HistoryPage() {
  const { getClosedTrades, trades } = useTrades();
  const closedTrades = getClosedTrades();

  const [filterReason, setFilterReason] = useState<Trade['exitReason'] | 'all'>('all');
  const [filterConfidence, setFilterConfidence] = useState<number | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTrades = closedTrades.filter(trade => {
    if (filterReason !== 'all' && trade.exitReason !== filterReason) return false;
    if (filterConfidence !== 'all' && trade.confidence !== filterConfidence) return false;
    return true;
  });

  return (
    <AppLayout>
      <div className="page-container animate-fade-in">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Trade History</h1>
              <p className="page-subtitle mt-1">Review your past trades</p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Filters */}
        {showFilters && (
          <div className="card-calm mb-6 animate-fade-in">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Exit Reason
                </label>
                <select
                  value={filterReason || 'all'}
                  onChange={(e) => setFilterReason(e.target.value as Trade['exitReason'] | 'all')}
                  className="input-calm w-full"
                >
                  <option value="all">All</option>
                  {Object.entries(exitReasonLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Confidence
                </label>
                <select
                  value={filterConfidence}
                  onChange={(e) => setFilterConfidence(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  className="input-calm w-full"
                >
                  <option value="all">All</option>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Trade List */}
        {filteredTrades.length === 0 ? (
          <div className="card-calm text-center py-12">
            <p className="text-muted-foreground">No closed trades yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTrades.map((trade) => {
              const behavioralTag = getBehavioralTag(trade);
              const withinPlan = isWithinPlan(trade);
              const timeContext = formatTradeTime(trade);
              const confidenceDots = getConfidenceDots(trade.confidence);
              const insightHint = getInsightHint(trade, trades);

              return (
                <div
                  key={trade.id}
                  className="card-calm"
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Left side - Trade info */}
                    <div className="flex-1">
                      {/* Header row with symbol, badges, and time */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-semibold text-lg text-foreground">{trade.symbol}</span>
                        <span className="text-xs px-2 py-0.5 rounded font-medium bg-secondary text-secondary-foreground">
                          {trade.instrumentType}
                        </span>
                        {trade.instrumentType === 'OPTIONS' && trade.optionType && (
                          <span className="text-xs px-2 py-0.5 rounded font-medium bg-accent text-accent-foreground">
                            {trade.optionType}
                          </span>
                        )}
                        {trade.exitReason && (
                          <span className="text-xs px-2 py-0.5 rounded font-medium bg-secondary text-secondary-foreground">
                            {exitReasonLabels[trade.exitReason]}
                          </span>
                        )}
                        {timeContext && (
                          <span className="text-xs text-muted-foreground ml-auto">
                            {timeContext}
                          </span>
                        )}
                      </div>

                      {/* Trade details - Single row */}
                      <div className="flex items-center gap-4 text-sm flex-wrap mb-2">
                        <span className="text-foreground">
                          <span className="text-muted-foreground">Qty:</span> <span className="font-medium">{trade.quantity}</span>
                        </span>
                        <span className="text-foreground">
                          <span className="text-muted-foreground">Entry:</span> <span className="font-medium">{formatCurrency(trade.entryPrice)}</span>
                        </span>
                        {trade.exitPrice && (
                          <span className="text-foreground">
                            <span className="text-muted-foreground">Exit:</span> <span className="font-medium">{formatCurrency(trade.exitPrice)}</span>
                          </span>
                        )}
                        <span className="text-foreground flex items-center gap-1">
                          <span className="text-muted-foreground">Conf:</span>
                          <span className="font-medium text-xs tracking-wider" title={`${trade.confidence}/5`}>
                            {confidenceDots}
                          </span>
                        </span>
                      </div>

                      {/* Behavioral insights row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Plan vs Outcome */}
                        {trade.status === 'closed' && (
                          <span className="text-xs px-2 py-0.5 rounded font-medium bg-secondary/50 text-muted-foreground">
                            {withinPlan ? 'Within Plan' : 'Deviated from Plan'}
                          </span>
                        )}

                        {/* Behavioral Tag */}
                        {behavioralTag && (
                          <span className="text-xs px-2 py-0.5 rounded font-medium bg-secondary/50 text-muted-foreground">
                            {behavioralTag}
                          </span>
                        )}

                        {/* Insight Hint */}
                        {insightHint && (
                          <span className="text-xs text-muted-foreground italic">
                            {insightHint}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right side - P&L display - Compact box */}
                    {trade.profitLoss !== undefined && (
                      <div className={`flex flex-col items-center justify-center px-4 py-3 rounded-lg border-2 min-w-[120px] ${
                        trade.profitLoss > 0
                          ? 'border-green-500/30 bg-green-500/5'
                          : trade.profitLoss < 0
                          ? 'border-red-500/30 bg-red-500/5'
                          : 'border-border bg-secondary'
                      }`}>
                        <div className={`text-xl font-bold mb-1 ${
                          trade.profitLoss > 0
                            ? 'text-green-600 dark:text-green-400'
                            : trade.profitLoss < 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-foreground'
                        }`}>
                          {trade.profitLoss > 0 ? '+' : ''}{formatCurrency(trade.profitLoss)}
                        </div>
                        {trade.profitLoss !== 0 && trade.entryPrice && trade.quantity && (
                          <div className="text-xs text-muted-foreground">
                            {((Math.abs(trade.profitLoss) / (trade.entryPrice * trade.quantity)) * 100).toFixed(2)}%
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
