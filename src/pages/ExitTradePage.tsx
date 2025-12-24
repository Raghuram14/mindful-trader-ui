import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTrades } from '@/context/TradeContext';
import { Trade } from '@/lib/mockData';

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
  const [note, setNote] = useState('');

  const trade = getTradeById(id || '');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) return;

    closeTrade(trade.id, selectedReason, note || undefined);
    navigate('/today');
  };

  return (
    <AppLayout>
      <div className="page-container animate-fade-in">
        <header className="mb-8">
          <h1 className="page-title">Exit Trade</h1>
          <p className="page-subtitle mt-1">{trade.symbol} · {trade.type.toUpperCase()}</p>
        </header>

        <form onSubmit={handleSubmit} className="max-w-md">
          {/* Exit Reason */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-foreground mb-4">
              Why did you exit?
            </label>
            <div className="space-y-2">
              {exitReasons.map((reason) => (
                <button
                  key={reason.id}
                  type="button"
                  onClick={() => setSelectedReason(reason.id)}
                  className={`w-full text-left px-4 py-4 rounded-lg font-medium transition-all duration-200 ${
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

          {/* Optional Note */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-foreground mb-2">
              Anything you noticed? <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Brief reflection..."
              rows={3}
              className="input-calm w-full resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <Link
              to={`/trade/${trade.id}`}
              className="btn-secondary flex-1 text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!selectedReason}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Exit
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
