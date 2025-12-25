/**
 * useTradeImport Hook
 * 
 * Manages trade import state and API calls
 */

import { useState } from 'react';
import { tradeImportApi } from '../api/tradeImport.api';
import { ImportState, ImportRequest } from '../types/tradeImport.types';

export function useTradeImport() {
  const [state, setState] = useState<ImportState>({
    isImporting: false,
    progress: 'idle',
    result: null,
    error: null,
  });

  const importTrades = async (file: File, request: ImportRequest) => {
    setState({
      isImporting: true,
      progress: 'parsing',
      result: null,
      error: null,
    });

    try {
      // Simulate progress steps
      setState(prev => ({ ...prev, progress: 'parsing' }));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setState(prev => ({ ...prev, progress: 'storing' }));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setState(prev => ({ ...prev, progress: 'reconstructing' }));

      const result = await tradeImportApi.importTrades(
        file,
        request.broker,
        request.fileType
      );

      setState({
        isImporting: false,
        progress: 'complete',
        result,
        error: null,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Import failed';
      setState({
        isImporting: false,
        progress: 'error',
        result: null,
        error: errorMessage,
      });
      throw error;
    }
  };

  const reset = () => {
    setState({
      isImporting: false,
      progress: 'idle',
      result: null,
      error: null,
    });
  };

  return {
    ...state,
    importTrades,
    reset,
  };
}

