import { apiClient } from './client';
import { TradingRule, TradingRuleType } from '@/lib/mockData';

export interface RuleResponse {
  id: string;
  type: TradingRuleType;
  value: number;
  valueType?: 'PERCENTAGE' | 'ABSOLUTE';
  isActive: boolean;
  description: string;
}

export interface CreateRuleRequest {
  type: TradingRuleType;
  value: number;
  valueType?: 'PERCENTAGE' | 'ABSOLUTE';
  isActive?: boolean;
  description: string;
}

export interface UpdateRuleRequest {
  value?: number;
  valueType?: 'PERCENTAGE' | 'ABSOLUTE';
  isActive?: boolean;
  description?: string;
}

export const rulesApi = {
  getRules: async (): Promise<RuleResponse[]> => {
    return apiClient.get<RuleResponse[]>('/rules');
  },

  getRule: async (id: string): Promise<RuleResponse> => {
    return apiClient.get<RuleResponse>(`/rules/${id}`);
  },

  createRule: async (data: CreateRuleRequest): Promise<RuleResponse> => {
    return apiClient.post<RuleResponse>('/rules', data);
  },

  updateRule: async (id: string, data: UpdateRuleRequest): Promise<RuleResponse> => {
    return apiClient.patch<RuleResponse>(`/rules/${id}`, data);
  },

  deleteRule: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/rules/${id}`);
  },
};

