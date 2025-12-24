import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTrades } from '@/context/TradeContext';
import { formatCurrency, Trade } from '@/lib/mockData';
import { Filter } from 'lucide-react';

const exitReasonLabels: Record<NonNullable<Trade['exitReason']>, string> = {
  target: 'Target',
  stop: 'Stop',
  fear: 'Fear',
  unsure: 'Unsure',
  impulse: 'Impulse',
};

export default function HistoryPage() {
  const { getClosedTrades } = useTrades();
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
            {filteredTrades.map((trade) => (
              <div
                key={trade.id}
                className="card-calm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-foreground">{trade.symbol}</span>
                    <span className="text-xs px-2 py-0.5 rounded font-medium bg-secondary text-secondary-foreground">
                      {trade.instrumentType}
                    </span>
                    {trade.instrumentType === 'OPTIONS' && trade.optionType && (
                      <span className="text-xs px-2 py-0.5 rounded font-medium bg-accent text-accent-foreground">
                        {trade.optionType}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      trade.result === 'win' 
                        ? 'bg-success/20 text-success' 
                        : 'bg-destructive/20 text-destructive'
                    }`}>
                      {trade.result?.toUpperCase()}
                    </span>
                  </div>
                  {trade.exitReason && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                      {exitReasonLabels[trade.exitReason]}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  <span>Qty: {trade.quantity}</span>
                  <span>Confidence: {trade.confidence}/5</span>
                  <span>Risk: {formatCurrency(trade.riskComfort)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
