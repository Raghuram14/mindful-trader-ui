export interface Trade {
  id: string;
  instrumentType: 'STOCK' | 'FUTURES' | 'OPTIONS';
  symbol: string;
  optionType?: 'PUT' | 'CALL'; // Only for OPTIONS
  tradeDate: string; // ISO date string
  tradeTime: string; // HH:mm format
  type: 'buy' | 'sell';
  quantity: number;
  entryPrice: number;
  plannedStop?: number;
  plannedTarget?: number;
  confidence: number;
  riskComfort: number;
  reason?: string;
  status: 'open' | 'closed';
  exitReason?: 'target' | 'stop' | 'fear' | 'unsure' | 'impulse';
  exitPrice?: number;
  profitLoss?: number;
  exitNote?: string;
  result?: 'win' | 'loss';
  createdAt: Date;
  closedAt?: Date;
  emotions?: ('fear' | 'neutral' | 'confident' | 'greed' | 'fomo' | 'regret' | 'calm')[];
  source?: 'MANUAL' | 'MANUAL_BROKER' | 'BROKER_EXTERNAL' | 'IMPORTED';
  dataCompleteness?: {
    hasPlannedRisk: boolean;
    hasDeclaredIntent: boolean;
  };
}

export const mockTrades: Trade[] = [
  {
    id: '1',
    instrumentType: 'STOCK',
    symbol: 'RELIANCE',
    tradeDate: new Date().toISOString().split('T')[0],
    tradeTime: new Date().toTimeString().slice(0, 5),
    type: 'buy',
    quantity: 10,
    entryPrice: 2450.50,
    plannedStop: 2420,
    plannedTarget: 2520,
    confidence: 4,
    riskComfort: 2000,
    reason: 'Strong support at 2420, bullish momentum',
    status: 'open',
    createdAt: new Date(),
    emotions: ['neutral'],
  },
  {
    id: '2',
    instrumentType: 'STOCK',
    symbol: 'TCS',
    tradeDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    tradeTime: '10:30',
    type: 'sell',
    quantity: 5,
    entryPrice: 3890,
    plannedStop: 3920,
    plannedTarget: 3800,
    confidence: 3,
    riskComfort: 1000,
    status: 'closed',
    exitReason: 'fear',
    result: 'loss',
    createdAt: new Date(Date.now() - 86400000),
    closedAt: new Date(Date.now() - 43200000),
  },
  {
    id: '3',
    instrumentType: 'STOCK',
    symbol: 'HDFC',
    tradeDate: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    tradeTime: '11:15',
    type: 'buy',
    quantity: 20,
    entryPrice: 1580,
    plannedStop: 1560,
    plannedTarget: 1640,
    confidence: 5,
    riskComfort: 1500,
    status: 'closed',
    exitReason: 'target',
    result: 'win',
    createdAt: new Date(Date.now() - 172800000),
    closedAt: new Date(Date.now() - 130000000),
  },
  {
    id: '4',
    instrumentType: 'OPTIONS',
    symbol: 'NIFTY',
    optionType: 'CALL',
    tradeDate: new Date(Date.now() - 259200000).toISOString().split('T')[0],
    tradeTime: '09:45',
    type: 'buy',
    quantity: 50,
    entryPrice: 1420,
    plannedStop: 1400,
    plannedTarget: 1480,
    confidence: 2,
    riskComfort: 500,
    status: 'closed',
    exitReason: 'impulse',
    result: 'loss',
    createdAt: new Date(Date.now() - 259200000),
    closedAt: new Date(Date.now() - 216000000),
  },
];

export const behavioralInsights = {
  score: 67,
  pattern: "You exited early even when losses were within your comfort limit.",
  nudge: "Next week, pause before exiting trades that are still within your risk comfort.",
  reminder: "You tend to exit early on your first trade of the day.",
};

// Insights Data Model
export type InsightScope = 'TODAY' | 'WEEK' | 'MONTH';
export type InsightType = 'SNAPSHOT' | 'PATTERN' | 'CONTEXT' | 'FOCUS';
export type InsightSeverity = 'NEUTRAL' | 'WARNING' | 'POSITIVE';

export interface Insight {
  scope: InsightScope;
  type: InsightType;
  title: string;
  description: string;
  severity?: InsightSeverity;
  delta?: string; // For trend indicators
}

// Mock Insights Data
export const mockInsights: Record<InsightScope, Insight[]> = {
  TODAY: [
    {
      scope: 'TODAY',
      type: 'SNAPSHOT',
      title: 'Live Observation',
      description: "You've exited 2 trades early today.",
      severity: 'NEUTRAL',
    },
    {
      scope: 'TODAY',
      type: 'PATTERN',
      title: 'Rule Awareness',
      description: "You're close to a limit you set for today.",
      severity: 'WARNING',
    },
    {
      scope: 'TODAY',
      type: 'FOCUS',
      title: 'Gentle Nudge',
      description: 'Consider pausing before taking another trade.',
      severity: 'NEUTRAL',
    },
  ],
  WEEK: [
    {
      scope: 'WEEK',
      type: 'SNAPSHOT',
      title: 'Behavioral Snapshot',
      description: 'You followed your plan in 4 of 6 trades.',
      severity: 'NEUTRAL',
      delta: '↑ 5 vs last week',
    },
    {
      scope: 'WEEK',
      type: 'PATTERN',
      title: 'Exit Discipline',
      description: 'You exited early in 62% of trades that were still within your risk comfort.',
      severity: 'WARNING',
    },
    {
      scope: 'WEEK',
      type: 'PATTERN',
      title: 'Confidence Mismatch',
      description: 'Higher confidence trades showed more emotional exits than lower confidence ones.',
      severity: 'WARNING',
    },
    {
      scope: 'WEEK',
      type: 'PATTERN',
      title: 'Rule Interaction',
      description: 'Most early exits happened after your first losing trade of the day.',
      severity: 'NEUTRAL',
    },
    {
      scope: 'WEEK',
      type: 'CONTEXT',
      title: 'Timing Pattern',
      description: 'Early exits mostly occurred in the first 45 minutes of trading.',
      severity: 'NEUTRAL',
    },
    {
      scope: 'WEEK',
      type: 'FOCUS',
      title: 'Next Focus',
      description: 'Next week, when a trade is still within your risk comfort, wait 3 minutes before exiting.',
      severity: 'NEUTRAL',
    },
  ],
  MONTH: [
    {
      scope: 'MONTH',
      type: 'SNAPSHOT',
      title: 'Trend Insight',
      description: 'Early exits reduced by 18% compared to last month.',
      severity: 'POSITIVE',
    },
    {
      scope: 'MONTH',
      type: 'PATTERN',
      title: 'Rule Adherence',
      description: 'You respected your daily loss limits more consistently this month.',
      severity: 'POSITIVE',
    },
    {
      scope: 'MONTH',
      type: 'PATTERN',
      title: 'Growth Pattern',
      description: 'Improved discipline was strongest on days with fewer trades.',
      severity: 'POSITIVE',
    },
  ],
};

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const getTimeInTrade = (createdAt: Date): string => {
  const now = new Date();
  const diff = now.getTime() - createdAt.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Trading Rules & Guardrails Data Models
export interface UserProfile {
  name: string;
  experienceLevel: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERIENCED';
  accountSize: number;
  tradingStyle: 'INTRADAY' | 'SWING' | 'MIXED';
}

export type TradingRuleType = 
  // Risk Management
  | 'DAILY_LOSS' 
  | 'WEEKLY_LOSS'
  | 'MAX_POSITION_SIZE'
  | 'MAX_OPEN_POSITIONS'
  | 'DAILY_TARGET'
  // Discipline
  | 'MAX_TRADES_PER_DAY'
  | 'MAX_LOSING_TRADES' 
  | 'STOP_AFTER_TARGET'
  | 'STOP_AFTER_LOSS'
  | 'NO_AVERAGING_DOWN'
  | 'MIN_RR_RATIO'
  // Timing
  | 'NO_TRADING_BEFORE'
  | 'NO_TRADING_AFTER'
  | 'COOLING_OFF_PERIOD'
  // Psychology
  | 'STOP_AFTER_CONSECUTIVE_LOSSES'
  | 'REQUIRE_TRADE_PLAN'
  | 'MAX_TRADES_AFTER_WIN';

export type RuleCategory = 'RISK' | 'DISCIPLINE' | 'TIMING' | 'PSYCHOLOGY';

export interface TradingRule {
  id: string;
  type: TradingRuleType;
  category: RuleCategory;
  value: number;
  valueType?: 'PERCENTAGE' | 'ABSOLUTE';
  isActive: boolean;
  description: string;
  // Custom rule support
  isCustom?: boolean;
  customName?: string;
  // Temporary disable support
  disabledUntil?: string;
  disableReason?: string;
}

export type RuleStatus = 'SAFE' | 'WARNING' | 'BREACHED';

export interface DailyRuleStatus {
  ruleId: string;
  currentValue: number;
  limitValue: number;
  remainingValue: number;
  status: RuleStatus;
}

// Mock data
export const mockUserProfile: UserProfile = {
  name: '',
  experienceLevel: 'INTERMEDIATE',
  accountSize: 100000,
  tradingStyle: 'MIXED',
};

export const mockTradingRules: TradingRule[] = [
  {
    id: '1',
    type: 'DAILY_LOSS',
    category: 'RISK',
    value: 2,
    valueType: 'PERCENTAGE',
    isActive: true,
    description: 'Daily loss limit: 2% of account',
  },
  {
    id: '2',
    type: 'MAX_LOSING_TRADES',
    category: 'RISK',
    value: 2,
    isActive: true,
    description: 'No more than 2 losing trades per day',
  },
  {
    id: '3',
    type: 'STOP_AFTER_TARGET',
    category: 'DISCIPLINE',
    value: 1,
    isActive: false,
    description: 'Stop trading once daily target is hit',
  },
];

export const mockDailyRuleStatus: DailyRuleStatus[] = [
  {
    ruleId: '1',
    currentValue: 800,
    limitValue: 2000,
    remainingValue: 1200,
    status: 'SAFE',
  },
  {
    ruleId: '2',
    currentValue: 1,
    limitValue: 2,
    remainingValue: 1,
    status: 'WARNING',
  },
];

// Utility function to display confidence as dots
export const getConfidenceDisplay = (confidence: number): string => {
  return '●'.repeat(confidence) + '○'.repeat(5 - confidence);
};

// Format trade time relative to now
export const formatTradeTime = (date: Date | string): string => {
  const tradeDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - tradeDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

// Analyze trade behavior and plan adherence
export const analyzeTradeBehavior = (trade: Trade): {
  followedPlan: boolean;
  behavioralTag?: string;
  insights?: string;
} | null => {
  if (trade.status !== 'closed' || !trade.exitPrice) return null;

  const exitWithinTarget = trade.plannedTarget
    ? Math.abs(trade.exitPrice - trade.plannedTarget) / trade.plannedTarget <= 0.02
    : false;

  const exitWithinStop = trade.plannedStop
    ? Math.abs(trade.exitPrice - trade.plannedStop) / trade.plannedStop <= 0.02
    : false;

  const followedPlan = exitWithinTarget || exitWithinStop;

  let behavioralTag: string | undefined;
  let insights: string | undefined;

  if (trade.exitReason === 'fear' && trade.result === 'win') {
    behavioralTag = 'Premature Exit';
    insights = 'You exited a winning trade early due to fear. The trade could have reached your target.';
  } else if (trade.exitReason === 'impulse' && trade.result === 'loss') {
    behavioralTag = 'Impulsive Exit';
    insights = 'You exited impulsively, possibly cutting losses too early or chasing losses.';
  } else if (!followedPlan && trade.result === 'loss') {
    behavioralTag = 'Plan Deviation';
    insights = 'You deviated from your plan and took a loss. Review your exit strategy.';
  } else if (followedPlan && trade.result === 'win') {
    behavioralTag = 'Disciplined Win';
    insights = 'Great job! You followed your plan and achieved your target.';
  }

  return { followedPlan, behavioralTag, insights };
};
