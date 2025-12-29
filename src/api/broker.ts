import { apiClient } from './client';

export interface BrokerConnectionStatus {
  connected: boolean;
  broker?: 'ZERODHA' | 'ANGELONE' | 'UPSTOX' | 'IIFL';
  userId?: string;
  connectedAt?: string;
  expiresAt?: string;
  marketOpen: boolean;
  margins?: {
    available: number;
    used: number;
    total: number;
  };
}

export interface BrokerPosition {
  tradingsymbol: string;
  exchange: string;
  product: string;
  quantity: number;
  averagePrice: number;
  lastPrice: number;
  pnl: number;
  value: number;
}

export interface PlaceOrderRequest {
  tradeData: {
    instrumentType: 'STOCK' | 'FUTURES' | 'OPTIONS';
    symbol: string;
    optionType?: 'PUT' | 'CALL';
    tradeDate: string;
    tradeTime: string;
    type: 'buy' | 'sell';
    quantity: number;
    entryPrice: number;
    plannedStop?: number;
    plannedTarget?: number;
    confidence: number;
    riskComfort: number;
    reason?: string;
  };
  overrideWarnings?: boolean;
  overrideReason?: string;
}

export interface RuleViolation {
  ruleId: string;
  ruleType: string;
  outcome: 'PASS' | 'WARN' | 'BLOCK';
  message: string;
  currentValue: number;
  limitValue: number;
  suggestedAction?: string;
}

export interface PreOrderValidationResult {
  outcome: 'PASS' | 'WARN' | 'BLOCK';
  violations: RuleViolation[];
  canProceed: boolean;
  requiresOverride: boolean;
}

export interface PlaceOrderResponse {
  requiresOverride?: boolean;
  validation?: PreOrderValidationResult;
  trade?: any;
  error?: string;
}

export interface SyncResult {
  positionsMatched: number;
  tradesCreated: number;
  tradesUpdated: number;
  tradesClosed: number;
  errors: string[];
}

export interface OrderStatus {
  status: {
    success: boolean;
    orderId?: string;
    error?: string;
  };
}

export interface InstrumentSearchResult {
  tradingsymbol: string;
  name: string;
  exchange: string;
  instrument_type: string;
  instrument_token: string;
  segment: string;
}

export interface ValidateSymbolResponse {
  valid: boolean;
  instrument: InstrumentSearchResult | null;
}

export interface LastPriceResponse {
  lastPrice: number | null;
}

class BrokerApi {
  /**
   * Initiate broker connection (OAuth flow)
   */
  async connect(broker: string): Promise<{ loginUrl: string }> {
    return apiClient.post(`/broker/${broker}/connect`, {});
  }

  /**
   * Handle OAuth callback (exchange request_token for access_token)
   */
  async handleCallback(broker: string, requestToken: string): Promise<BrokerConnectionStatus> {
    return apiClient.post(`/broker/${broker}/callback`, { request_token: requestToken });
  }

  /**
   * Get broker connection status and margins
   */
  async getStatus(broker: string): Promise<BrokerConnectionStatus> {
    return apiClient.get(`/broker/${broker}/status`);
  }

  /**
   * Disconnect broker
   */
  async disconnect(broker: string): Promise<{ connected: false }> {
    return apiClient.delete(`/broker/${broker}/disconnect`);
  }

  /**
   * Get broker positions
   */
  async getPositions(broker: string): Promise<{ positions: BrokerPosition[] }> {
    return apiClient.get(`/broker/${broker}/positions`);
  }

  /**
   * Get broker margins
   */
  async getMargins(broker: string): Promise<BrokerConnectionStatus['margins']> {
    return apiClient.get(`/broker/${broker}/margins`);
  }

  /**
   * Place order with rule validation
   */
  async placeOrder(broker: string, request: PlaceOrderRequest): Promise<PlaceOrderResponse> {
    return apiClient.post(`/broker/${broker}/orders`, request);
  }

  /**
   * Get order status
   */
  async getOrderStatus(broker: string, orderId: string): Promise<OrderStatus> {
    return apiClient.get(`/broker/${broker}/orders/${orderId}`);
  }

  /**
   * Manually trigger position sync
   */
  async syncPositions(broker: string): Promise<SyncResult> {
    return apiClient.post(`/broker/${broker}/sync`, {});
  }

  /**
   * Search instruments by query
   */
  async searchInstruments(
    broker: string,
    search: string,
    exchange: string = 'NSE',
    refresh?: boolean
  ): Promise<{ instruments: InstrumentSearchResult[] }> {
    const params = new URLSearchParams({ search, exchange });
    if (refresh) params.append('refresh', 'true');
    return apiClient.get(`/broker/${broker}/instruments/search?${params.toString()}`);
  }

  /**
   * Validate if a symbol exists
   */
  async validateSymbol(
    broker: string,
    symbol: string,
    exchange: string = 'NSE'
  ): Promise<ValidateSymbolResponse> {
    const params = new URLSearchParams({ symbol, exchange });
    return apiClient.get(`/broker/${broker}/instruments/validate?${params.toString()}`);
  }

  /**
   * Get last traded price for instrument
   */
  async getLastPrice(broker: string, instrumentToken: string): Promise<LastPriceResponse> {
    const params = new URLSearchParams({ instrumentToken });
    return apiClient.get(`/broker/${broker}/instruments/price?${params.toString()}`);
  }

  /**
   * Clear instruments cache
   */
  async clearInstrumentsCache(broker: string, exchange?: string): Promise<void> {
    const params = exchange ? `?exchange=${exchange}` : '';
    return apiClient.delete(`/broker/${broker}/instruments/cache${params}`);
  }
}

export const brokerApi = new BrokerApi();
