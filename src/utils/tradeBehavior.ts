/**
 * Trade Behavioral Analysis Utilities
 * 
 * These utilities provide behavioral interpretations of trades for display only.
 * They do NOT enforce rules or judge behavior.
 * 
 * TODO: Replace FE-derived behavioral analysis with backend-provided insights (Phase 2)
 */

import { Trade } from '@/lib/mockData';

/**
 * Get behavioral tag for a trade
 * Returns a single, human-readable behavioral interpretation
 */
export function getBehavioralTag(trade: Trade): string {
  // TODO: Replace FE-derived behavioral tags with backend-evaluated insights (Phase 2)
  
  if (trade.status !== 'closed' || !trade.exitReason || trade.profitLoss === undefined) {
    return '';
  }

  // Stop hit → Exited as Planned
  if (trade.exitReason === 'stop') {
    return 'Exited as Planned';
  }

  // Target hit → Held to Target
  if (trade.exitReason === 'target') {
    return 'Held to Target';
  }

  // Exit before stop/target → Exited Early
  if (trade.plannedStop || trade.plannedTarget) {
    if (trade.exitReason === 'fear' || trade.exitReason === 'unsure' || trade.exitReason === 'impulse') {
      return 'Exited Early';
    }
  }

  // Loss > Risk Comfort → Risk Exceeded
  if (trade.profitLoss < 0 && trade.riskComfort && Math.abs(trade.profitLoss) > trade.riskComfort) {
    return 'Risk Exceeded';
  }

  // Confidence ≥ 4 AND Loss → Overconfident Trade
  if (trade.confidence >= 4 && trade.profitLoss < 0) {
    return 'Overconfident Trade';
  }

  // Default: no specific tag
  return '';
}

/**
 * Check if trade was within plan
 */
export function isWithinPlan(trade: Trade): boolean {
  // TODO: Replace FE-derived plan alignment with backend evaluation (Phase 2)
  
  if (trade.status !== 'closed' || !trade.exitReason) {
    return false;
  }

  // Exit reason matches planned stop/target → Within Plan
  if (trade.exitReason === 'stop' && trade.plannedStop) {
    return true;
  }

  if (trade.exitReason === 'target' && trade.plannedTarget) {
    return true;
  }

  // Anything else → Deviated from Plan
  return false;
}

/**
 * Format relative time for trade
 */
export function formatTradeTime(trade: Trade): string {
  if (!trade.closedAt) {
    return '';
  }

  const now = new Date();
  const closedDate = new Date(trade.closedAt);
  const diffMs = now.getTime() - closedDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Format time
  const timeStr = closedDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (diffDays === 0) {
    return `Today • ${timeStr}`;
  } else if (diffDays === 1) {
    return `Yesterday • ${timeStr}`;
  } else if (diffDays < 7) {
    return `${diffDays} days ago • ${timeStr}`;
  } else {
    // For older trades, show date
    return closedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: closedDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}

/**
 * Get confidence visualization dots
 */
export function getConfidenceDots(confidence: number): string {
  const filled = '●';
  const empty = '○';
  return filled.repeat(confidence) + empty.repeat(5 - confidence);
}

/**
 * Get subtle insight hint for trade (if applicable)
 * Returns empty string if no pattern detected
 */
export function getInsightHint(trade: Trade, allTrades: Trade[]): string {
  // TODO: Replace FE-derived pattern detection with backend insights (Phase 2)
  
  if (trade.status !== 'closed') {
    return '';
  }

  // Check for early exits pattern (3+ trades with early exits in last 7 days)
  const recentTrades = allTrades.filter(t => {
    if (t.status !== 'closed' || !t.closedAt) return false;
    const daysDiff = Math.floor((new Date().getTime() - new Date(t.closedAt).getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7;
  });

  const earlyExits = recentTrades.filter(t => {
    const tag = getBehavioralTag(t);
    return tag === 'Exited Early';
  });

  if (earlyExits.length >= 3 && getBehavioralTag(trade) === 'Exited Early') {
    return 'Contributes to your weekly insight on early exits.';
  }

  // Check for overconfident pattern
  const overconfidentTrades = recentTrades.filter(t => {
    const tag = getBehavioralTag(t);
    return tag === 'Overconfident Trade';
  });

  if (overconfidentTrades.length >= 2 && getBehavioralTag(trade) === 'Overconfident Trade') {
    return 'Part of a recurring pattern this week.';
  }

  return '';
}

