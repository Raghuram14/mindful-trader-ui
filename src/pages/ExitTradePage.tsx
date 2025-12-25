import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTrades } from '@/context/TradeContext';
import { Trade } from '@/lib/mockData';
import { formatCurrency } from '@/lib/mockData';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const exitReasons: { id: Trade['exitReason']; label: string }[] = [
  { id: 'target', label: 'Target hit' },
  { id: 'stop', label: 'Stop hit' },
  { id: 'fear', label: 'Fear' },
  { id: 'unsure', label: 'Unsure' },
  { id: 'impulse', label: 'Impulse' },
];

export default function ExitTradePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTradeById, closeTrade } = useTrades();

  const [selectedReason, setSelectedReason] = useState<Trade['exitReason']>();
  const [exitPrice, setExitPrice] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const trade = getTradeById(id || '');

  // Calculate profit/loss when exit price is entered
  const calculatedProfitLoss = useMemo(() => {
    if (!trade || !exitPrice) return null;
    const exitPriceNum = parseFloat(exitPrice);
    if (isNaN(exitPriceNum) || exitPriceNum <= 0) return null;

    const priceDifference = exitPriceNum - trade.entryPrice;
    // For buy: profit if exit > entry, loss if exit < entry
    // For sell: profit if exit < entry, loss if exit > entry
    const profitLoss = trade.type === 'buy'
      ? priceDifference * trade.quantity
      : -priceDifference * trade.quantity;

    return profitLoss;
  }, [trade, exitPrice]);

  if (!trade || trade.status === 'closed') {
    return (
      <AppLayout>
        <div className="page-container">
          <p className="text-muted-foreground">Trade not found or already closed</p>
          <Link to="/today" className="text-primary hover:underline mt-4 inline-block">
            Back to Today
          </Link>
        </div>
      </AppLayout>
    );
  }

  const isValid = selectedReason && exitPrice && parseFloat(exitPrice) > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      setIsSubmitting(true);
      await closeTrade(trade.id, selectedReason!, parseFloat(exitPrice), note || undefined);
      
      toast({
        title: 'Trade closed',
        description: `Trade exited with ${calculatedProfitLoss && calculatedProfitLoss > 0 ? 'profit' : 'loss'} of ${calculatedProfitLoss ? formatCurrency(Math.abs(calculatedProfitLoss)) : ''}.`,
      });

      navigate('/today');
    } catch (error) {
      toast({
        title: 'Failed to close trade',
        description: error instanceof Error ? error.message : 'An error occurred while closing the trade.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="page-container animate-fade-in">
        <header className="mb-6">
          <h1 className="page-title">Exit Trade</h1>
          <p className="page-subtitle mt-1">{trade.symbol} · {trade.type.toUpperCase()}</p>
        </header>

        <form onSubmit={handleSubmit} className="max-w-2xl">
          {/* Trade Summary - Compact Grid */}
          <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card-calm">
              <div className="text-xs text-muted-foreground mb-1">Entry Price</div>
              <p className="text-lg font-semibold text-foreground">{formatCurrency(trade.entryPrice)}</p>
            </div>
            <div className="card-calm">
              <div className="text-xs text-muted-foreground mb-1">Quantity</div>
              <p className="text-lg font-semibold text-foreground">{trade.quantity}</p>
            </div>
            {trade.plannedStop && (
              <div className="card-calm">
                <div className="text-xs text-muted-foreground mb-1">Planned Stop</div>
                <p className="text-lg font-semibold text-foreground">{formatCurrency(trade.plannedStop)}</p>
              </div>
            )}
            {trade.plannedTarget && (
              <div className="card-calm">
                <div className="text-xs text-muted-foreground mb-1">Planned Target</div>
                <p className="text-lg font-semibold text-foreground">{formatCurrency(trade.plannedTarget)}</p>
              </div>
            )}
          </div>

          {/* Exit Price and P&L in one row */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="exitPrice" className="block text-sm font-medium text-foreground mb-2">
                Exit Price <span className="text-destructive">*</span>
              </Label>
              <Input
                id="exitPrice"
                type="number"
                step="0.01"
                value={exitPrice}
                onChange={(e) => {
                  const value = e.target.value;
                  setExitPrice(value);
                }}
                placeholder="Enter exit price"
                className="h-10 w-full"
                min="0.01"
                required
              />
              {exitPrice && parseFloat(exitPrice) <= 0 && (
                <p className="text-xs text-destructive mt-1">Exit price must be greater than 0</p>
              )}
            </div>

            {/* Calculated Profit/Loss Display - Compact */}
            {exitPrice && parseFloat(exitPrice) > 0 && calculatedProfitLoss !== null && (
              <div className={`card-calm border-2 ${
                calculatedProfitLoss > 0
                  ? 'border-green-500/30 bg-green-500/5'
                  : calculatedProfitLoss < 0
                  ? 'border-red-500/30 bg-red-500/5'
                  : 'border-border'
              }`}>
                <div className="text-xs text-muted-foreground mb-1">
                  {calculatedProfitLoss > 0 ? 'Profit' : calculatedProfitLoss < 0 ? 'Loss' : 'Break Even'}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-bold ${
                    calculatedProfitLoss > 0
                      ? 'text-green-600 dark:text-green-400'
                      : calculatedProfitLoss < 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-foreground'
                  }`}>
                    {calculatedProfitLoss > 0 ? '+' : ''}{formatCurrency(calculatedProfitLoss)}
                  </span>
                  {calculatedProfitLoss !== 0 && trade.entryPrice && trade.quantity && (
                    <span className="text-sm text-muted-foreground">
                      ({((Math.abs(calculatedProfitLoss) / (trade.entryPrice * trade.quantity)) * 100).toFixed(2)}%)
                    </span>
                  )}
                </div>
                {calculatedProfitLoss !== 0 && trade.entryPrice && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(trade.entryPrice)} → {formatCurrency(parseFloat(exitPrice))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Exit Reason and Note in one row */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Why did you exit? <span className="text-destructive">*</span>
              </label>
              <div className="space-y-2">
                {exitReasons.map((reason) => (
                  <button
                    key={reason.id}
                    type="button"
                    onClick={() => setSelectedReason(reason.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedReason === reason.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {reason.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Anything you noticed? <span className="text-muted-foreground font-normal text-xs">(optional)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Brief reflection..."
                rows={5}
                className="input-calm w-full resize-none h-full"
              />
            </div>
          </div>

          {/* Submit - Fixed at bottom */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Link
              to={`/trade/${trade.id}`}
              className="btn-secondary flex-1 text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                  Closing...
                </>
              ) : (
                'Confirm Exit'
              )}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
