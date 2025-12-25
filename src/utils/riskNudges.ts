/**
 * Risk Nudge Utilities
 * 
 * These utilities calculate informational risk metrics for display only.
 * They do NOT enforce rules or block actions.
 * 
 * TODO: Replace FE-derived calculations with backend-provided values (Phase 2)
 */

/**
 * Calculate percentage of account at risk
 */
export function calculateAccountRiskPercent(
  riskComfort: number,
  accountSize: number | undefined
): number | null {
  if (!accountSize || accountSize <= 0) {
    return null;
  }
  return (riskComfort / accountSize) * 100;
}

/**
 * Check if trade would conflict with daily rules
 * Returns informational message if potential conflict exists
 */
export function checkDailyRuleConflicts(
  riskComfort: number,
  dailyStatus: Array<{
    ruleId: string;
    currentValue: number;
    limitValue: number;
    remainingValue: number;
    status: 'SAFE' | 'WARNING' | 'BREACHED';
  }>,
  rules: Array<{
    id: string;
    type: string;
  }>
): string | null {
  // TODO: Replace FE-derived conflict detection with backend-provided analysis (Phase 2)
  
  // Check daily loss limit
  const dailyLossRule = dailyStatus.find(status => {
    const rule = rules.find(r => r.id === status.ruleId);
    return rule?.type === 'DAILY_LOSS';
  });

  if (dailyLossRule) {
    // If adding this trade's risk would exceed remaining limit
    if (dailyLossRule.remainingValue > 0 && riskComfort > dailyLossRule.remainingValue) {
      return `This trade may move you closer to your daily loss limit.`;
    }
    // If already at or near limit
    if (dailyLossRule.status === 'WARNING' && riskComfort > 0) {
      return `This trade may move you closer to your daily loss limit.`;
    }
    if (dailyLossRule.status === 'BREACHED') {
      return `You have already reached your daily loss limit. Consider whether additional trades align with your plan.`;
    }
  }

  // Check daily target
  const dailyTargetRule = dailyStatus.find(status => {
    const rule = rules.find(r => r.id === status.ruleId);
    return rule?.type === 'DAILY_TARGET';
  });

  if (dailyTargetRule && dailyTargetRule.status === 'BREACHED') {
    return `You have already reached your daily target. Consider whether additional trades align with your plan.`;
  }

  // Check losing trades limit
  const losingTradesRule = dailyStatus.find(status => {
    const rule = rules.find(r => r.id === status.ruleId);
    return rule?.type === 'MAX_LOSING_TRADES';
  });

  if (losingTradesRule && losingTradesRule.status === 'WARNING') {
    return `You are close to your losing trades limit for today.`;
  }

  if (losingTradesRule && losingTradesRule.status === 'BREACHED') {
    return `You have reached your losing trades limit for today. Consider whether additional trades align with your plan.`;
  }

  return null;
}

/**
 * Calculate actual risk based on stop price and quantity
 * Note: Entry price is required for accurate calculation
 */
export function calculateActualRisk(
  entryPrice: number | undefined,
  stopPrice: number | undefined,
  quantity: number | undefined
): number | null {
  // TODO: Replace FE-derived risk calculation with backend-provided values (Phase 2)
  
  if (!entryPrice || !stopPrice || !quantity || quantity <= 0) {
    return null;
  }

  return Math.abs(entryPrice - stopPrice) * quantity;
}

/**
 * Check if actual risk exceeds risk comfort
 */
export function checkRiskMismatch(
  actualRisk: number | null,
  riskComfort: number
): boolean {
  if (actualRisk === null) {
    return false;
  }
  return actualRisk > riskComfort;
}

