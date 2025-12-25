/**
 * Data Coverage Note
 * 
 * Displays data sufficiency information for zero/insufficient data states
 */

import { DataCoverage } from '../types/insightV2.types';
import { AlertCircle } from 'lucide-react';

interface DataCoverageNoteProps {
  dataCoverage: DataCoverage;
}

export function DataCoverageNote({ dataCoverage }: DataCoverageNoteProps) {
  if (dataCoverage.sufficient) {
    return null;
  }

  return (
    <div className="card-calm bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">
            Not enough data yet
          </p>
          <p className="text-xs text-amber-800 dark:text-amber-300">
            You have {dataCoverage.tradesAnalyzed} {dataCoverage.tradesAnalyzed === 1 ? 'trade' : 'trades'}, 
            but {dataCoverage.minimumRequired} {dataCoverage.minimumRequired === 1 ? 'trade is' : 'trades are'} needed 
            for reliable insights. Insights will improve as more trades are recorded.
          </p>
        </div>
      </div>
    </div>
  );
}

