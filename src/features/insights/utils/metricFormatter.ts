/**
 * Metric Formatter Utilities
 * 
 * Formats metric names and values for display
 */

/**
 * Convert camelCase to readable label
 * e.g., "revengeTradingScore" -> "Revenge Trading Score"
 */
export function formatMetricName(name: string): string {
  // Handle special cases first
  const specialCases: Record<string, string> = {
    revengeTradingScore: 'Revenge Trading Score',
    postLossTradeFrequency: 'Post-Loss Trade Frequency',
    nearLimitRules: 'Rules Near Limit',
    consistencyScore: 'Consistency Score',
    earlyExitPercent: 'Early Exit Rate',
    planAdherencePercent: 'Plan Adherence',
    ruleViolationRate: 'Rule Violations',
    manualExitRate: 'Manual Exit Rate',
    riskUtilizationPercent: 'Risk Utilization',
    avgRiskPerTrade: 'Avg Risk Per Trade',
    maxRiskPerTrade: 'Max Risk Per Trade',
    riskVariance: 'Risk Variance',
    positionSizeVariance: 'Position Size Variance',
    avgConfidence: 'Average Confidence',
    confidenceOutcomeCorrelation: 'Confidence-Outcome Correlation',
    fatigueScore: 'Fatigue Score',
    totalTrades: 'Total Trades',
    winRate: 'Win Rate',
    avgProfitLoss: 'Avg Profit/Loss',
    totalProfitLoss: 'Total Profit/Loss',
    avgTimeInTrade: 'Avg Time In Trade',
    tradesPerSession: 'Trades Per Session',
    longTradeWinRate: 'Long Trade Win Rate',
    longTradeAvgPnl: 'Long Trade Avg P&L',
    positionSizeTrend: 'Position Size Trend',
  };

  if (specialCases[name]) {
    return specialCases[name];
  }

  // Generic camelCase to Title Case conversion
  return name
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim();
}

/**
 * Check if a metric should be formatted as currency
 */
export function isCurrencyMetric(name: string, unit?: string): boolean {
  // If unit is explicitly set, use it
  if (unit === '%' || unit === '/hr') {
    return false;
  }

  // Metrics that should NOT be currency
  const nonCurrencyMetrics = [
    'score',
    'correlation',
    'rate',
    'percent',
    'frequency',
    'count',
    'trades',
    'rules',
    'confidence',
  ];

  const lowerName = name.toLowerCase();
  if (nonCurrencyMetrics.some((keyword) => lowerName.includes(keyword))) {
    return false;
  }

  // Metrics that should be currency
  const currencyMetrics = [
    'risk',
    'profit',
    'loss',
    'pnl',
    'price',
    'value',
    'amount',
    'size',
    'variance', // Position size variance might be currency
  ];

  // Only treat as currency if it contains currency keywords AND doesn't have a unit
  return currencyMetrics.some((keyword) => lowerName.includes(keyword)) && !unit;
}

/**
 * Format metric value based on type
 */
export function formatMetricValue(value: number, unit?: string, name?: string): string {
  const lowerName = name?.toLowerCase() || '';

  // Handle percentage (explicit unit)
  if (unit === '%') {
    return `${value.toFixed(1)}%`;
  }

  // Handle frequency (explicit unit)
  if (unit === '/hr') {
    return `${value.toFixed(1)}/hr`;
  }

  // Handle scores (0-1 scale) - show as percentage
  // Examples: revengeTradingScore, consistencyScore, fatigueScore
  if (lowerName.includes('score') || lowerName.includes('correlation')) {
    return `${(value * 100).toFixed(0)}%`;
  }

  // Handle count/integer metrics (no decimals)
  // Examples: nearLimitRules, totalTrades
  if (
    lowerName.includes('count') ||
    lowerName.includes('rules') ||
    (lowerName.includes('trades') && !lowerName.includes('frequency'))
  ) {
    return Math.round(value).toString();
  }

  // Handle currency (only if explicitly a currency metric)
  if (isCurrencyMetric(name || '', unit)) {
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';
    if (absValue >= 100000) {
      return `${sign}₹${(absValue / 100000).toFixed(1)}L`;
    }
    if (absValue >= 1000) {
      return `${sign}₹${(absValue / 1000).toFixed(1)}k`;
    }
    return `${sign}₹${absValue.toFixed(0)}`;
  }

  // Default: show as decimal number (for percentages, rates, etc. without explicit unit)
  if (lowerName.includes('percent') || lowerName.includes('rate')) {
    return `${value.toFixed(1)}%`;
  }

  // For other numeric values
  if (Math.abs(value) < 1) {
    return value.toFixed(2);
  }
  if (Math.abs(value) < 10) {
    return value.toFixed(1);
  }
  return Math.round(value).toString();
}

