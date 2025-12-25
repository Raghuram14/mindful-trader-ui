/**
 * Import Summary Component
 * 
 * Shows import results after completion
 */

import { CheckCircle2, AlertCircle } from 'lucide-react';
import { ImportResponse } from '../types/tradeImport.types';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ImportSummaryProps {
  result: ImportResponse;
}

export function ImportSummary({ result }: ImportSummaryProps) {
  const [showWarnings, setShowWarnings] = useState(false);

  return (
    <div className="card-calm">
      <div className="flex items-center gap-3 mb-4">
        <CheckCircle2 className="w-6 h-6 text-green-500" />
        <h3 className="text-lg font-semibold text-foreground">Import Complete</h3>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Executions processed</span>
          <span className="font-medium text-foreground">{result.importedExecutions}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Trades reconstructed</span>
          <span className="font-medium text-foreground">{result.reconstructedTrades}</span>
        </div>
        {result.skippedRows > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Rows skipped</span>
            <span className="font-medium text-foreground">{result.skippedRows}</span>
          </div>
        )}
      </div>

      {result.warnings.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <button
            onClick={() => setShowWarnings(!showWarnings)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{result.warnings.length} warning(s)</span>
            {showWarnings ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showWarnings && (
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {result.warnings.map((warning, index) => (
                <li key={index} className="pl-6">• {warning}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

