import { apiClient } from './client';
import { TradingRuleType, RuleCategory } from '@/lib/mockData';

export interface RuleResponse {
  id: string;
  type: TradingRuleType;
  category: RuleCategory;
  value: number;
  valueType?: 'PERCENTAGE' | 'ABSOLUTE';
  isActive: boolean;
  description: string;
  isCustom?: boolean;
  customName?: string;
  disabledUntil?: string;
  disableReason?: string;
}

export interface CreateRuleRequest {
  type: TradingRuleType;
  value: number;
  valueType?: 'PERCENTAGE' | 'ABSOLUTE';
  isActive?: boolean;
  description: string;
  isCustom?: boolean;
  customName?: string;
}

export interface UpdateRuleRequest {
  value?: number;
  valueType?: 'PERCENTAGE' | 'ABSOLUTE';
  isActive?: boolean;
  description?: string;
  disabledUntil?: string;
  disableReason?: string;
}

// Rule categories mapping
export const RULE_CATEGORIES: Record<TradingRuleType, RuleCategory> = {
  // Risk Management
  DAILY_LOSS: 'RISK',
  WEEKLY_LOSS: 'RISK',
  MAX_POSITION_SIZE: 'RISK',
  MAX_OPEN_POSITIONS: 'RISK',
  DAILY_TARGET: 'RISK',
  // Discipline
  MAX_TRADES_PER_DAY: 'DISCIPLINE',
  MAX_LOSING_TRADES: 'DISCIPLINE',
  STOP_AFTER_TARGET: 'DISCIPLINE',
  STOP_AFTER_LOSS: 'DISCIPLINE',
  NO_AVERAGING_DOWN: 'DISCIPLINE',
  MIN_RR_RATIO: 'DISCIPLINE',
  // Timing
  NO_TRADING_BEFORE: 'TIMING',
  NO_TRADING_AFTER: 'TIMING',
  COOLING_OFF_PERIOD: 'TIMING',
  // Psychology
  STOP_AFTER_CONSECUTIVE_LOSSES: 'PSYCHOLOGY',
  REQUIRE_TRADE_PLAN: 'PSYCHOLOGY',
  MAX_TRADES_AFTER_WIN: 'PSYCHOLOGY',
};

// Category labels for UI
export const CATEGORY_LABELS: Record<RuleCategory, string> = {
  RISK: 'Risk Management',
  DISCIPLINE: 'Trading Discipline',
  TIMING: 'Timing Rules',
  PSYCHOLOGY: 'Psychology & Behavior',
};

// Category icons (Lucide icon names)
export const CATEGORY_ICONS: Record<RuleCategory, string> = {
  RISK: 'Shield',
  DISCIPLINE: 'Target',
  TIMING: 'Clock',
  PSYCHOLOGY: 'Brain',
};

// Rule templates for UI
export interface RuleTemplate {
  type: TradingRuleType;
  name: string;
  description: string;
  defaultValue: number;
  valueType?: 'PERCENTAGE' | 'ABSOLUTE';
  unit: string;
  explanation: string;
  category: RuleCategory;
}

export const RULE_TEMPLATES: RuleTemplate[] = [
  // Risk Management
  {
    type: 'DAILY_LOSS',
    name: 'Daily Loss Limit',
    description: 'Maximum loss allowed per day',
    defaultValue: 2,
    valueType: 'PERCENTAGE',
    unit: '% of capital',
    explanation: 'Stop trading when you hit this loss to preserve capital',
    category: 'RISK',
  },
  {
    type: 'WEEKLY_LOSS',
    name: 'Weekly Loss Limit',
    description: 'Maximum loss allowed per week',
    defaultValue: 5,
    valueType: 'PERCENTAGE',
    unit: '% of capital',
    explanation: 'Take a break from trading when weekly losses hit this limit',
    category: 'RISK',
  },
  {
    type: 'MAX_POSITION_SIZE',
    name: 'Max Position Size',
    description: 'Maximum value per trade',
    defaultValue: 10,
    valueType: 'PERCENTAGE',
    unit: '% of capital',
    explanation: 'Prevents overexposure to a single trade',
    category: 'RISK',
  },
  {
    type: 'MAX_OPEN_POSITIONS',
    name: 'Max Open Positions',
    description: 'Maximum concurrent positions',
    defaultValue: 3,
    unit: 'positions',
    explanation: 'Limits how many trades you can have open at once',
    category: 'RISK',
  },
  {
    type: 'DAILY_TARGET',
    name: 'Daily Profit Target',
    description: 'Target profit for the day',
    defaultValue: 2,
    valueType: 'PERCENTAGE',
    unit: '% of capital',
    explanation: 'Consider stopping when you hit your target to lock in profits',
    category: 'RISK',
  },
  // Discipline
  {
    type: 'MAX_TRADES_PER_DAY',
    name: 'Max Trades Per Day',
    description: 'Maximum number of trades per day',
    defaultValue: 5,
    unit: 'trades',
    explanation: 'Quality over quantity - focus on best setups only',
    category: 'DISCIPLINE',
  },
  {
    type: 'MAX_LOSING_TRADES',
    name: 'Max Consecutive Losses',
    description: 'Stop after consecutive losses',
    defaultValue: 2,
    unit: 'losses',
    explanation: 'Take a break to reset mentally after consecutive losses',
    category: 'DISCIPLINE',
  },
  {
    type: 'STOP_AFTER_TARGET',
    name: 'Stop After Target',
    description: 'Stop trading when target is hit',
    defaultValue: 1,
    unit: 'enabled',
    explanation: 'Avoid giving back profits by stopping once target is achieved',
    category: 'DISCIPLINE',
  },
  {
    type: 'STOP_AFTER_LOSS',
    name: 'Stop After Any Loss',
    description: 'Stop trading after any losing trade',
    defaultValue: 1,
    unit: 'enabled',
    explanation: 'Prevents revenge trading after a loss',
    category: 'DISCIPLINE',
  },
  {
    type: 'NO_AVERAGING_DOWN',
    name: 'No Averaging Down',
    description: 'Don\'t add to losing positions',
    defaultValue: 1,
    unit: 'enabled',
    explanation: 'Adding to losers often compounds mistakes',
    category: 'DISCIPLINE',
  },
  {
    type: 'MIN_RR_RATIO',
    name: 'Minimum Risk-Reward',
    description: 'Minimum required R:R ratio',
    defaultValue: 2,
    unit: ':1 ratio',
    explanation: 'Only take trades with favorable risk-reward',
    category: 'DISCIPLINE',
  },
  // Timing
  {
    type: 'NO_TRADING_BEFORE',
    name: 'No Trading Before',
    description: 'Don\'t trade before this time',
    defaultValue: 570, // 9:30 AM in minutes
    unit: 'time (HH:MM)',
    explanation: 'Wait for market to settle before trading',
    category: 'TIMING',
  },
  {
    type: 'NO_TRADING_AFTER',
    name: 'No Trading After',
    description: 'Don\'t trade after this time',
    defaultValue: 900, // 3:00 PM in minutes
    unit: 'time (HH:MM)',
    explanation: 'Avoid last hour volatility and low liquidity',
    category: 'TIMING',
  },
  {
    type: 'COOLING_OFF_PERIOD',
    name: 'Cooling Off Period',
    description: 'Wait time after a loss',
    defaultValue: 15,
    unit: 'minutes',
    explanation: 'Take a mental break after a losing trade',
    category: 'TIMING',
  },
  // Psychology
  {
    type: 'STOP_AFTER_CONSECUTIVE_LOSSES',
    name: 'Stop After Loss Streak',
    description: 'Stop after consecutive losses',
    defaultValue: 3,
    unit: 'losses',
    explanation: 'Something is off - stop and reassess your strategy',
    category: 'PSYCHOLOGY',
  },
  {
    type: 'REQUIRE_TRADE_PLAN',
    name: 'Require Trade Plan',
    description: 'Must have SL and target defined',
    defaultValue: 1,
    unit: 'enabled',
    explanation: 'Never enter a trade without a clear exit plan',
    category: 'PSYCHOLOGY',
  },
  {
    type: 'MAX_TRADES_AFTER_WIN',
    name: 'Max Trades After Win',
    description: 'Limit trades after a winning streak',
    defaultValue: 2,
    unit: 'trades',
    explanation: 'Prevent overconfidence from causing overtrading',
    category: 'PSYCHOLOGY',
  },
];

// Helper to format time value (minutes from midnight) to HH:MM
export function formatTimeValue(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Helper to parse HH:MM to minutes from midnight
export function parseTimeValue(time: string): number {
  const [hours, mins] = time.split(':').map(Number);
  return hours * 60 + mins;
}

// Boolean rules that don't need numeric values
export const BOOLEAN_RULES: TradingRuleType[] = [
  'STOP_AFTER_TARGET',
  'STOP_AFTER_LOSS',
  'NO_AVERAGING_DOWN',
  'REQUIRE_TRADE_PLAN',
];

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

