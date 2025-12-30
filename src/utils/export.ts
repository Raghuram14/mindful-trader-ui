import { format } from 'date-fns';
import { FilterState } from '@/hooks/useHistoryFilters';
import { tradesApi, TradeResponse } from '@/api/trades';

interface ToastFn {
  (options: { title: string; description?: string; variant?: 'default' | 'destructive' }): void;
}

/**
 * Export trades to CSV file
 */
export async function exportTradesToCSV(
  filters: FilterState,
  totalCount: number,
  toast: ToastFn
): Promise<void> {
  try {
    // Show loading toast
    toast({
      title: 'Exporting trades...',
      description: `Preparing ${totalCount.toLocaleString()} trades for export`,
    });

    // Fetch all trades with current filters
    const query = {
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      dateFrom: filters.dateFrom?.toISOString().split('T')[0],
      dateTo: filters.dateTo?.toISOString().split('T')[0],
      symbol: filters.symbol,
      result: filters.result === 'all' ? undefined : filters.result,
      instrumentTypes: filters.instrumentTypes.length > 0 ? filters.instrumentTypes : undefined,
      exitReasons: filters.exitReasons.length > 0 ? filters.exitReasons : undefined,
      emotions: filters.emotions.length > 0 ? filters.emotions : undefined,
      sources: filters.sources.length > 0 ? filters.sources : undefined,
      minPnL: filters.minPnL,
      maxPnL: filters.maxPnL,
    };

    const trades = await tradesApi.exportAllTrades(query);

    if (trades.length === 0) {
      toast({
        title: 'No trades to export',
        description: 'There are no trades matching your filters',
        variant: 'destructive',
      });
      return;
    }

    // Generate CSV
    const csv = generateCSV(trades);

    // Download file
    const filename = `mindful-trader-export-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
    downloadCSV(csv, filename);

    // Success toast
    toast({
      title: 'Export successful',
      description: `Downloaded ${trades.length} trades to ${filename}`,
    });
  } catch (error) {
    console.error('Export failed:', error);
    toast({
      title: 'Export failed',
      description: error instanceof Error ? error.message : 'An error occurred during export',
      variant: 'destructive',
    });
  }
}

/**
 * Generate CSV string from trades
 */
function generateCSV(trades: TradeResponse[]): string {
  // CSV headers
  const headers = [
    'Date',
    'Time',
    'Symbol',
    'Instrument Type',
    'Option Type',
    'Trade Type',
    'Entry Price',
    'Exit Price',
    'Quantity',
    'P&L',
    'P&L %',
    'Result',
    'Confidence',
    'Exit Reason',
    'Emotions',
    'Source',
    'Notes',
  ];

  // Map trades to CSV rows
  const rows = trades.map((trade) => {
    const pnlPercent = trade.profitLoss && trade.entryPrice
      ? ((trade.profitLoss / (trade.entryPrice * trade.quantity)) * 100).toFixed(2)
      : '';

    return [
      trade.tradeDate,
      trade.tradeTime,
      trade.symbol,
      trade.instrumentType,
      trade.optionType || '',
      trade.type.toUpperCase(),
      trade.entryPrice.toString(),
      trade.exitPrice?.toString() || '',
      trade.quantity.toString(),
      trade.profitLoss?.toFixed(2) || '',
      pnlPercent ? `${pnlPercent}%` : '',
      trade.result?.toUpperCase() || '',
      trade.confidence.toString(),
      trade.exitReason || '',
      trade.emotions?.join(', ') || '',
      trade.source || 'MANUAL',
      escapeCSVField(trade.exitNote || ''),
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Escape CSV field if it contains special characters
 */
function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Download CSV content as file
 */
function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
