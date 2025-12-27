/**
 * Advanced Metrics Card
 * 
 * Displays emotional, efficiency, timing, and streak metrics when available
 */

import { BehavioralSnapshot } from '../types/insightV2.types';
import { TrendingUp, TrendingDown, Clock, Zap, Brain, DollarSign, Info, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AdvancedMetricsCardProps {
  snapshot: BehavioralSnapshot;
}

export function AdvancedMetricsCard({ snapshot }: AdvancedMetricsCardProps) {
  const hasAdvancedMetrics = !!(snapshot.emotional || snapshot.efficiency || snapshot.timing || snapshot.streak || snapshot.advancedRisk);

  if (!hasAdvancedMetrics) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Brain className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Advanced Behavioral Metrics</h2>
        <span className="text-xs text-muted-foreground ml-auto">
          {snapshot.evaluatedTrades} {snapshot.evaluatedTrades === 1 ? 'trade' : 'trades'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emotional Metrics */}
        {snapshot.emotional && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-semibold text-foreground">Emotional Intelligence</h3>
            </div>
            <div className="space-y-2">
              <MetricRow 
                label="Fear Index" 
                value={snapshot.emotional.fearIndex} 
                unit="/100"
                color={snapshot.emotional.fearIndex > 60 ? 'text-amber-600' : 'text-foreground'}
                tooltip="Measures position size reduction after losses and hesitation to re-enter. Higher = more fear-driven decisions."
              />
              <MetricRow 
                label="Greed Index" 
                value={snapshot.emotional.greedIndex} 
                unit="/100"
                color={snapshot.emotional.greedIndex > 60 ? 'text-amber-600' : 'text-foreground'}
                tooltip="Measures position size increase after wins and overconfidence. Higher = more greed-driven decisions."
              />
              <MetricRow 
                label="FOMO Score" 
                value={snapshot.emotional.fomoScore} 
                unit="/100"
                color={snapshot.emotional.fomoScore > 40 ? 'text-red-600' : 'text-green-600'}
                tooltip="Detects rushed trades, clustering, and impulsive entries. Lower is better. >40 indicates FOMO behavior."
              />
              <MetricRow 
                label="Stress Level" 
                value={snapshot.emotional.stressLevel} 
                unit="/100"
                color={snapshot.emotional.stressLevel > 60 ? 'text-red-600' : 'text-green-600'}
                tooltip="Based on trade frequency, P&L variance, and rule violations. Lower is better. >60 indicates high stress."
              />
              <MetricRow 
                label="Emotional Consistency" 
                value={snapshot.emotional.emotionalConsistency} 
                unit="/100"
                color={snapshot.emotional.emotionalConsistency > 70 ? 'text-green-600' : 'text-amber-600'}
                tooltip="Measures stability in position sizing. Higher = more consistent. <50 indicates emotional volatility."
              />
              {snapshot.emotional.recoveryTime > 0 && (
                <MetricRow 
                  label="Recovery Time" 
                  value={snapshot.emotional.recoveryTime} 
                  unit=" min"
                  color={snapshot.emotional.recoveryTime < 15 ? 'text-amber-600' : 'text-green-600'}
                  tooltip="Median time between a loss and your next trade. <15 min may indicate insufficient cooldown."
                />
              )}
            </div>
          </div>
        )}

        {/* Efficiency Metrics */}
        {snapshot.efficiency && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-green-500" />
              <h3 className="text-sm font-semibold text-foreground">Capital Efficiency</h3>
            </div>
            <div className="space-y-2">
              <MetricRow 
                label="Profit Factor" 
                value={snapshot.efficiency.profitFactor} 
                decimals={2}
                color={snapshot.efficiency.profitFactor > 1 ? 'text-green-600' : 'text-red-600'}
                tooltip="Gross profit ÷ Gross loss. >1.0 = profitable, <1.0 = losing money. 1.5+ is good, 2.0+ is excellent."
              />
              <MetricRow 
                label="Expectancy" 
                value={snapshot.efficiency.expectancy} 
                unit=" ₹"
                decimals={2}
                color={snapshot.efficiency.expectancy > 0 ? 'text-green-600' : 'text-red-600'}
                tooltip="Average profit/loss per trade. Positive = your edge. Formula: (Win% × Avg Win) - (Loss% × Avg Loss)"
              />
              <MetricRow 
                label="Trade ROI" 
                value={snapshot.efficiency.tradeROI} 
                unit="%"
                decimals={2}
                color={snapshot.efficiency.tradeROI > 0 ? 'text-green-600' : 'text-red-600'}
                tooltip="Average return per trade relative to capital deployed. Shows how efficiently you use your money."
              />
              <MetricRow 
                label="Capital Utilization" 
                value={snapshot.efficiency.capitalUtilization} 
                unit="%"
                decimals={1}
                color="text-foreground"
                tooltip="Average % of your account size deployed per trade. Too low = underutilized capital, too high = over-leveraged."
              />
            </div>
          </div>
        )}

        {/* Timing Metrics */}
        {snapshot.timing && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-foreground">Trading Patterns</h3>
            </div>
            <div className="space-y-2">
              {snapshot.timing.bestTradingHours.length > 0 ? (
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Best Hours</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="text-xs">Hours with highest win rate. Requires at least 2 trades per hour and 4+ different trading hours.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="font-medium text-green-600">
                    {snapshot.timing.bestTradingHours.map(h => `${h}:00`).join(', ')}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground italic">
                  Need more trades across different hours to identify patterns
                </div>
              )}
              {snapshot.timing.worstTradingHours.length > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Worst Hours</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="text-xs">Hours with lowest win rate. Consider avoiding these times or being more selective.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="font-medium text-red-600">
                    {snapshot.timing.worstTradingHours.map(h => `${h}:00`).join(', ')}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Session Fatigue</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="text-xs">Detected when win rate drops 20%+ in the second half of your trading session. Consider taking breaks.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className={cn(
                  "font-medium",
                  snapshot.timing.sessionFatigueDetected ? 'text-amber-600' : 'text-green-600'
                )}>
                  {snapshot.timing.sessionFatigueDetected ? 'Detected' : 'None'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Streak Metrics */}
        {snapshot.streak && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-yellow-500" />
              <h3 className="text-sm font-semibold text-foreground">Momentum & Streaks</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Current Streak</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="text-xs">Your active winning or losing streak. Be cautious on long win streaks (overconfidence) and loss streaks (revenge trading).</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center gap-1">
                  {snapshot.streak.currentStreak.type === 'WIN' ? (
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  )}
                  <span className={cn(
                    "font-medium",
                    snapshot.streak.currentStreak.type === 'WIN' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {snapshot.streak.currentStreak.count} {snapshot.streak.currentStreak.type.toLowerCase()}
                    {snapshot.streak.currentStreak.count === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
              <MetricRow 
                label="Longest Win Streak" 
                value={snapshot.streak.longestWinStreak} 
                unit=" wins"
                color="text-green-600"
                tooltip="Highest number of consecutive winning trades. Shows your best momentum period."
              />
              <MetricRow 
                label="Longest Loss Streak" 
                value={snapshot.streak.longestLossStreak} 
                unit=" losses"
                color="text-red-600"
                tooltip="Highest number of consecutive losing trades. Important to know your worst drawdown pattern."
              />
            </div>
          </div>
        )}

        {/* Advanced Risk Analytics */}
        {snapshot.advancedRisk && (
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-semibold text-foreground">Advanced Risk Analytics</h3>
              <span className="text-xs text-muted-foreground ml-2">
                Requires 20+ trades for statistical significance
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              <MetricRow 
                label="Max Drawdown" 
                value={snapshot.advancedRisk.maxDrawdownPercent} 
                unit="%"
                decimals={2}
                color={
                  snapshot.advancedRisk.maxDrawdownPercent > 20 ? 'text-red-600' : 
                  snapshot.advancedRisk.maxDrawdownPercent > 10 ? 'text-amber-600' : 
                  'text-green-600'
                }
                tooltip="Largest peak-to-trough decline as % of account. <10% is healthy, 10-20% needs attention, >20% is dangerous."
              />
              <MetricRow 
                label="Drawdown Duration" 
                value={snapshot.advancedRisk.maxDrawdownDuration} 
                unit=" days"
                color="text-foreground"
                tooltip="Number of days from peak equity to recovery. Shorter is better. Long durations indicate difficulty bouncing back."
              />
              <MetricRow 
                label="Sharpe Ratio" 
                value={snapshot.advancedRisk.sharpeRatio} 
                decimals={2}
                color={
                  snapshot.advancedRisk.sharpeRatio > 2 ? 'text-green-600' : 
                  snapshot.advancedRisk.sharpeRatio > 1 ? 'text-amber-600' : 
                  'text-red-600'
                }
                tooltip="Risk-adjusted returns (annualized). >2 is excellent, 1-2 is good, <1 needs improvement. Measures return per unit of risk."
              />
              <MetricRow 
                label="Sortino Ratio" 
                value={snapshot.advancedRisk.sortinoRatio} 
                decimals={2}
                color={
                  snapshot.advancedRisk.sortinoRatio > 2 ? 'text-green-600' : 
                  snapshot.advancedRisk.sortinoRatio > 1 ? 'text-amber-600' : 
                  'text-red-600'
                }
                tooltip="Like Sharpe but only penalizes downside volatility. More forgiving of upside volatility. Higher is better."
              />
              <MetricRow 
                label="Kelly Percentage" 
                value={snapshot.advancedRisk.kellyPercentage} 
                unit="%"
                decimals={2}
                color={
                  snapshot.advancedRisk.kellyPercentage > 25 ? 'text-amber-600' : 
                  snapshot.advancedRisk.kellyPercentage > 0 ? 'text-green-600' : 
                  'text-red-600'
                }
                tooltip="Optimal position size per Kelly Criterion. Use 25-50% of this value for safety. Based on your win rate and average win/loss ratio."
              />
              <MetricRow 
                label="Risk of Ruin" 
                value={snapshot.advancedRisk.riskOfRuin * 100} 
                unit="%"
                decimals={2}
                color={
                  snapshot.advancedRisk.riskOfRuin > 0.05 ? 'text-red-600' : 
                  snapshot.advancedRisk.riskOfRuin > 0.01 ? 'text-amber-600' : 
                  'text-green-600'
                }
                tooltip="Probability of losing your entire account. Should be near 0%. >1% is risky, >5% is extremely dangerous. Based on your edge and position sizing."
              />
              <MetricRow 
                label="Value at Risk (95%)" 
                value={snapshot.advancedRisk.valueAtRisk95} 
                unit=" ₹"
                decimals={0}
                color="text-foreground"
                tooltip="95th percentile of losses. You can expect losses worse than this only 5% of the time. Helps set stop-loss limits."
              />
              <MetricRow 
                label="Expected Shortfall" 
                value={snapshot.advancedRisk.expectedShortfall} 
                unit=" ₹"
                decimals={0}
                color="text-foreground"
                tooltip="Average of your worst 5% of trades. Shows typical loss size in worst-case scenarios. Higher than VaR means tail risk."
              />
              
              {/* Exposure by Instrument */}
              {Object.keys(snapshot.advancedRisk.exposureByInstrument).length > 0 && (
                <div className="md:col-span-2 pt-2 border-t border-border">
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-sm text-muted-foreground">Risk Exposure by Instrument</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="text-xs">Breakdown of your risk by instrument type (STOCK, FUTURES, OPTIONS). Shows diversification or concentration.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(snapshot.advancedRisk.exposureByInstrument)
                      .sort(([, a], [, b]) => b - a)
                      .map(([instrument, percentage]) => (
                        <div key={instrument} className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">{instrument}:</span>
                          <span className="font-medium text-foreground">{percentage.toFixed(1)}%</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground pt-4 border-t border-border">
        Advanced metrics require sufficient trade data. Some metrics may not be available for short periods.
      </div>
    </div>
  );
}

interface MetricRowProps {
  label: string;
  value: number;
  unit?: string;
  decimals?: number;
  color?: string;
  tooltip?: string;
}

function MetricRow({ label, value, unit = '', decimals = 0, color = 'text-foreground', tooltip }: MetricRowProps) {
  return (
    <div className="flex justify-between items-center text-sm">
      <div className="flex items-center gap-1">
        <span className="text-muted-foreground">{label}</span>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3 h-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <span className={cn("font-medium", color)}>
        {value.toFixed(decimals)}{unit}
      </span>
    </div>
  );
}

