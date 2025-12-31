/**
 * Pattern Frequency Card
 * 
 * Shows which behavioral patterns appear most/least often.
 * Uses non-judgmental language - patterns are observations, not verdicts.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2 } from "lucide-react";
import { type PatternFrequency } from "@/api/tradingDNA";
import { cn } from "@/lib/utils";

interface PatternFrequencyCardProps {
  dominantPatterns: PatternFrequency[];
  rarePatterns: PatternFrequency[];
}

/**
 * Human-readable pattern names and descriptions
 */
const PATTERN_INFO: Record<string, { label: string; description: string; isPositive: boolean }> = {
  EARLY_EXIT_BIAS: {
    label: "Early Exits",
    description: "Closing trades before reaching target",
    isPositive: false,
  },
  CONFIDENCE_MISMATCH: {
    label: "Confidence Mismatch",
    description: "Outcomes don't match declared confidence",
    isPositive: false,
  },
  OVERTRADING_AFTER_LOSS: {
    label: "Overtrading After Loss",
    description: "Increasing activity after losses",
    isPositive: false,
  },
  RULE_FATIGUE: {
    label: "Rule Fatigue",
    description: "More rule breaches over time",
    isPositive: false,
  },
  POSITION_SIZE_INFLATION: {
    label: "Position Inflation",
    description: "Sizing up after wins",
    isPositive: false,
  },
  PATIENCE_PREMIUM: {
    label: "Patience Premium",
    description: "Patient trades perform better",
    isPositive: true,
  },
  REVENGE_TRADING: {
    label: "Revenge Trading",
    description: "Quick re-entries after losses",
    isPositive: false,
  },
  RISK_LIMIT_PRESSURE: {
    label: "Risk Limit Pressure",
    description: "Trading near daily limits",
    isPositive: false,
  },
  PLAN_VS_EXECUTION_GAP: {
    label: "Plan-Execution Gap",
    description: "Actual trades differ from plan",
    isPositive: false,
  },
  CONSISTENCY_SCORE: {
    label: "Consistent Behavior",
    description: "Stable trading approach",
    isPositive: true,
  },
  FOMO_TRADING: {
    label: "FOMO Trading",
    description: "Chasing moves without setup",
    isPositive: false,
  },
  STRESS_TRADING: {
    label: "Stress Trading",
    description: "Trading when stressed",
    isPositive: false,
  },
  DRAWDOWN_RISK: {
    label: "Drawdown Risk",
    description: "Extended losing periods",
    isPositive: false,
  },
};

export function PatternFrequencyCard({ 
  dominantPatterns, 
  rarePatterns 
}: PatternFrequencyCardProps) {
  // Separate dominant patterns into concerning and positive
  const concerningPatterns = dominantPatterns.filter(
    p => !PATTERN_INFO[p.patternType]?.isPositive
  );
  const positivePatterns = dominantPatterns.filter(
    p => PATTERN_INFO[p.patternType]?.isPositive
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Pattern Frequency</CardTitle>
        <CardDescription>
          Which behavioral patterns appear in your trading
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Positive Patterns */}
        {positivePatterns.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Working Well
            </h4>
            <div className="space-y-2">
              {positivePatterns.map((pattern) => (
                <PatternRow 
                  key={pattern.patternType} 
                  pattern={pattern} 
                  variant="positive"
                />
              ))}
            </div>
          </div>
        )}

        {/* Patterns to Watch */}
        {concerningPatterns.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Patterns to Notice
            </h4>
            <div className="space-y-2">
              {concerningPatterns.map((pattern) => (
                <PatternRow 
                  key={pattern.patternType} 
                  pattern={pattern} 
                  variant="concerning"
                />
              ))}
            </div>
          </div>
        )}

        {/* Rare Patterns */}
        {rarePatterns.length > 0 && (
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              Rarely Seen
            </h4>
            <div className="flex flex-wrap gap-2">
              {rarePatterns.map((pattern) => {
                const info = PATTERN_INFO[pattern.patternType];
                return (
                  <Badge 
                    key={pattern.patternType} 
                    variant="secondary"
                    className={cn(
                      "text-xs font-normal",
                      info?.isPositive 
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                        : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                    )}
                  >
                    {info?.label || pattern.patternType}
                  </Badge>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              These patterns rarely appear in your trading
            </p>
          </div>
        )}

        {dominantPatterns.length === 0 && rarePatterns.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Keep trading - patterns will emerge over time
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function PatternRow({ 
  pattern, 
  variant 
}: { 
  pattern: PatternFrequency; 
  variant: 'positive' | 'concerning';
}) {
  const info = PATTERN_INFO[pattern.patternType] || {
    label: pattern.patternType.replace(/_/g, ' '),
    description: '',
    isPositive: false,
  };

  const TrendIcon = {
    MORE_FREQUENT: TrendingUp,
    STABLE: Minus,
    LESS_FREQUENT: TrendingDown,
  }[pattern.trend];

  const trendColor = {
    MORE_FREQUENT: variant === 'positive' ? 'text-emerald-500' : 'text-amber-500',
    STABLE: 'text-muted-foreground',
    LESS_FREQUENT: variant === 'positive' ? 'text-amber-500' : 'text-emerald-500',
  }[pattern.trend];

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{info.label}</p>
        {info.description && (
          <p className="text-xs text-muted-foreground">{info.description}</p>
        )}
      </div>
      <div className="flex items-center gap-3 ml-4">
        <div className="text-right">
          <p className="text-sm font-semibold">{pattern.occurrenceRate}%</p>
          <p className="text-xs text-muted-foreground">of periods</p>
        </div>
        <TrendIcon className={cn("w-4 h-4", trendColor)} />
      </div>
    </div>
  );
}
