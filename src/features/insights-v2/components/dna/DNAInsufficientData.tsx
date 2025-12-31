/**
 * DNA Insufficient Data Component
 * 
 * Shown when user doesn't have enough trades for DNA computation.
 * Encouraging, not discouraging.
 */

import { Card, CardContent } from "@/components/ui/card";
import { Dna, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DNAInsufficientDataProps {
  tradeCount: number;
  message: string;
}

const MINIMUM_TRADES = 20;

export function DNAInsufficientData({ tradeCount, message }: DNAInsufficientDataProps) {
  const progress = Math.min(100, (tradeCount / MINIMUM_TRADES) * 100);

  return (
    <Card className="max-w-lg mx-auto">
      <CardContent className="py-12 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <Dna className="w-8 h-8 text-primary" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Your DNA is Forming</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {message}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-xs mx-auto space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{tradeCount} trades logged</span>
            <span>{MINIMUM_TRADES} needed</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Encouragement */}
        <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="w-4 h-4" />
          <span>
            {MINIMUM_TRADES - tradeCount} more trade{MINIMUM_TRADES - tradeCount !== 1 ? 's' : ''} to go
          </span>
        </div>

        <p className="text-xs text-muted-foreground italic">
          Each trade you log helps build your unique profile
        </p>
      </CardContent>
    </Card>
  );
}
