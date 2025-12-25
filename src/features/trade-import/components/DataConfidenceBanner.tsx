/**
 * Data Confidence Banner Component
 * 
 * Shows data confidence messaging when imported trades exist
 * Appears on Trades and Insights pages
 */

import { Info } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DataConfidenceBannerProps {
  importedTradeCount: number;
  totalTradeCount: number;
}

export function DataConfidenceBanner({ importedTradeCount, totalTradeCount }: DataConfidenceBannerProps) {
  if (importedTradeCount === 0) {
    return null;
  }

  const isMixed = importedTradeCount < totalTradeCount;

  return (
    <div className="card-calm border-l-4 border-l-blue-500/40 bg-blue-500/5 mb-6">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold text-foreground mb-1">
            Data Confidence: {isMixed ? 'Mixed Sources' : 'Imported'}
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">
            {isMixed
              ? 'Some of your trades were imported from broker records. These reflect execution behavior but may not include planned stop or target.'
              : 'Your trades were imported from broker records. These reflect execution behavior but may not include planned stop or target.'}
          </p>
          <p className="text-xs text-muted-foreground italic">
            Add intent to individual trades to unlock deeper insights (optional).
          </p>
        </div>
      </div>
    </div>
  );
}

