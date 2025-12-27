/**
 * Plan Adherence Utility
 * 
 * Helper function to determine if trade followed plan based on exit reason and planned stop/target.
 * This is a frontend helper - backend provides the authoritative check.
 */

import { Trade } from '@/lib/mockData';

/**
 * Check if trade followed plan based on exit reason and planned stop/target
 */
export function checkPlanAdherence(
  trade: Trade,
  exitPrice: number,
  exitReason: Trade['exitReason']
): 'followed' | 'deviated' | 'no_plan' {
  // If no planned stop or target, we can't determine adherence
  if (!trade.plannedStop && !trade.plannedTarget) {
    return 'no_plan';
  }

  // If exit reason is 'target' and we have a planned target, it followed plan
  if (exitReason === 'target' && trade.plannedTarget) {
    return 'followed';
  }

  // If exit reason is 'stop' and we have a planned stop, it followed plan
  if (exitReason === 'stop' && trade.plannedStop) {
    return 'followed';
  }

  // Otherwise, it deviated from plan
  return 'deviated';
}

