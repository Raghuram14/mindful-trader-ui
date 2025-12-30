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
  emotions?: Trade['emotions'];
  closedAt?: string; // ISO string for exit date/time
}

export interface CloseTradeResponse extends TradeResponse {
  planAdherence?: 'followed' | 'deviated' | 'no_plan';
  ruleBreaches?: Array<{
    ruleId: string;
    ruleType: string;
    message: string;
  }>;
  nudgeMessage?: string;
}

export interface CompleteTradeRequest {
  plannedTarget?: number;
  plannedStop?: number;
  confidence?: number;
  reason?: string;
}

// History page types
export interface GetClosedTradesQuery {
  skip?: number;
  limit?: number;
  sortBy?: 'closedAt' | 'profitLoss' | 'symbol';
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
  symbol?: string;
  result?: 'win' | 'loss';
  instrumentTypes?: string[];
  exitReasons?: string[];
  emotions?: string[];
  sources?: string[];
  minPnL?: number;
  maxPnL?: number;
}

export interface PaginatedTradesResponse {
  trades: TradeResponse[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface MonthTradesResponse {
  trades: TradeResponse[];
  monthTotal: number;
  winCount: number;
  lossCount: number;
}

export interface TradesMetadataResponse {
  totalTrades: number;
  firstTradeDate: string | null;
  lastTradeDate: string | null;
  availableMonths: Array<{
    year: number;
    month: number;
  }>;
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

  completeTrade: async (id: string, data: CompleteTradeRequest): Promise<TradeResponse> => {
    return apiClient.put<TradeResponse>(`/trades/${id}/complete`, data);
  },

  closeTrade: async (id: string, data: CloseTradeRequest): Promise<CloseTradeResponse> => {
    return apiClient.post<CloseTradeResponse>(`/trades/${id}/close`, data);
  },

  deleteTrade: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/trades/${id}`);
  },

  // History page methods
  getClosedTradesPaginated: async (query: GetClosedTradesQuery): Promise<PaginatedTradesResponse> => {
    const params = new URLSearchParams();
    
    if (query.skip !== undefined) params.append('skip', query.skip.toString());
    if (query.limit !== undefined) params.append('limit', query.limit.toString());
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);
    if (query.dateFrom) params.append('dateFrom', query.dateFrom);
    if (query.dateTo) params.append('dateTo', query.dateTo);
    if (query.symbol) params.append('symbol', query.symbol);
    if (query.result) params.append('result', query.result);
    if (query.instrumentTypes?.length) params.append('instrumentTypes', query.instrumentTypes.join(','));
    if (query.exitReasons?.length) params.append('exitReasons', query.exitReasons.join(','));
    if (query.emotions?.length) params.append('emotions', query.emotions.join(','));
    if (query.sources?.length) params.append('sources', query.sources.join(','));
    if (query.minPnL !== undefined) params.append('minPnL', query.minPnL.toString());
    if (query.maxPnL !== undefined) params.append('maxPnL', query.maxPnL.toString());

    return apiClient.get<PaginatedTradesResponse>(`/trades/closed-paginated?${params.toString()}`);
  },

  getMonthTrades: async (year: number, month: number): Promise<MonthTradesResponse> => {
    return apiClient.get<MonthTradesResponse>(`/trades/calendar-month?year=${year}&month=${month}`);
  },

  getTradesMetadata: async (): Promise<TradesMetadataResponse> => {
    return apiClient.get<TradesMetadataResponse>('/trades/metadata');
  },

  exportAllTrades: async (query: Omit<GetClosedTradesQuery, 'skip' | 'limit'>): Promise<TradeResponse[]> => {
    const params = new URLSearchParams();
    
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);
    if (query.dateFrom) params.append('dateFrom', query.dateFrom);
    if (query.dateTo) params.append('dateTo', query.dateTo);
    if (query.symbol) params.append('symbol', query.symbol);
    if (query.result) params.append('result', query.result);
    if (query.instrumentTypes?.length) params.append('instrumentTypes', query.instrumentTypes.join(','));
    if (query.exitReasons?.length) params.append('exitReasons', query.exitReasons.join(','));
    if (query.emotions?.length) params.append('emotions', query.emotions.join(','));
    if (query.sources?.length) params.append('sources', query.sources.join(','));
    if (query.minPnL !== undefined) params.append('minPnL', query.minPnL.toString());
    if (query.maxPnL !== undefined) params.append('maxPnL', query.maxPnL.toString());
    
    // Request all trades by setting very high limit
    params.append('limit', '999999');
    params.append('skip', '0');

    const result = await apiClient.get<PaginatedTradesResponse>(`/trades/closed-paginated?${params.toString()}`);
    return result.trades;
  },
};
