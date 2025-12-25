/**
 * Trade Import Types
 */

export interface ImportRequest {
  broker: string;
  fileType: 'EQ' | 'FO';
}

export interface ImportResponse {
  importedExecutions: number;
  reconstructedTrades: number;
  skippedRows: number;
  warnings: string[];
}

export interface ImportState {
  isImporting: boolean;
  progress: 'idle' | 'parsing' | 'storing' | 'reconstructing' | 'complete' | 'error';
  result: ImportResponse | null;
  error: string | null;
}

