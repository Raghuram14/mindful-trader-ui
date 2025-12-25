import { apiClient } from './client';
import { Trade } from '@/lib/mockData';

export interface TradeResponse {
  id: string;
  instrumentType: Trade['instrumentType'];
  symbol: string;
  optionType?: Trade['optionType'];
  tradeDate: string;
  tradeTime: string;
  type: Trade['type'];
  quantity: number;
  entryPrice: number;
  plannedStop?: number;
  plannedTarget?: number;
  confidence: number;
  riskComfort: number;
  reason?: string;
  status: Trade['status'];
  exitReason?: Trade['exitReason'];
  exitPrice?: number;
  profitLoss?: number;
  exitNote?: string;
  result?: Trade['result'];
  emotions?: Trade['emotions'];
  createdAt: string;
  closedAt?: string;
  source?: 'MANUAL' | 'IMPORTED';
  dataCompleteness?: {
    hasPlannedRisk: boolean;
    hasDeclaredIntent: boolean;
  };
}

export interface CreateTradeRequest {
  instrumentType: Trade['instrumentType'];
  symbol: string;
  optionType?: Trade['optionType'];
  tradeDate: string;
  tradeTime: string;
  type: Trade['type'];
  quantity: number;
  entryPrice: number;
  plannedStop?: number;
  plannedTarget?: number;
  confidence: number;
  riskComfort: number;
  reason?: string;
}

export interface UpdateTradeRequest {
  plannedStop?: number;
  plannedTarget?: number;
  reason?: string;
  emotions?: Trade['emotions'];
}

export interface CloseTradeRequest {
  exitReason: Trade['exitReason'];
  exitPrice: number;
  exitNote?: string;
}

export const tradesApi = {
  getTrades: async (): Promise<TradeResponse[]> => {
    return apiClient.get<TradeResponse[]>('/trades');
  },

  getOpenTrades: async (): Promise<TradeResponse[]> => {
    return apiClient.get<TradeResponse[]>('/trades/open');
  },

  getClosedTrades: async (): Promise<TradeResponse[]> => {
    return apiClient.get<TradeResponse[]>('/trades/closed');
  },

  getTrade: async (id: string): Promise<TradeResponse> => {
    return apiClient.get<TradeResponse>(`/trades/${id}`);
  },

  createTrade: async (data: CreateTradeRequest): Promise<TradeResponse> => {
    return apiClient.post<TradeResponse>('/trades', data);
  },

  updateTrade: async (id: string, data: UpdateTradeRequest): Promise<TradeResponse> => {
    return apiClient.patch<TradeResponse>(`/trades/${id}`, data);
  },

  closeTrade: async (id: string, data: CloseTradeRequest): Promise<TradeResponse> => {
    return apiClient.post<TradeResponse>(`/trades/${id}/close`, data);
  },

  deleteTrade: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/trades/${id}`);
  },
};

