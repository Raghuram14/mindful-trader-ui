/**
 * DNA Summary Card
 *
 * Hero card showing the trader's archetype and personalized narrative.
 * Calm, coach-like presentation - not a "badge" or "achievement".
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, BarChart3, Calendar, TrendingUp } from "lucide-react";
import {
  type TraderArchetype,
  type DataQuality,
  ARCHETYPE_DISPLAY,
} from "@/api/tradingDNA";
import { cn } from "@/lib/utils";

interface DNASummaryCardProps {
  archetype: TraderArchetype;
  confidence: number;
  narrative: string;
  dataQuality: DataQuality;
}

export function DNASummaryCard({
  archetype,
  confidence,
  narrative,
  dataQuality,
}: DNASummaryCardProps) {
  const archetypeInfo = ARCHETYPE_DISPLAY[archetype];

  // Confidence level display
  const getConfidenceLabel = (conf: number) => {
    if (conf >= 80) return "Strong pattern";
    if (conf >= 60) return "Clear pattern";
    if (conf >= 40) return "Emerging pattern";
    return "Still forming";
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-card to-purple-50/20 dark:from-primary/10 dark:via-card dark:to-purple-950/20 border-primary/20 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{archetypeInfo.emoji}</div>
            <div>
              <CardTitle className={cn("text-xl", archetypeInfo.color)}>
                {archetypeInfo.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs font-normal">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {getConfidenceLabel(confidence)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Narrative */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {narrative}
        </p>

        {/* Data Quality Summary */}
        <div className="flex flex-wrap gap-4 pt-2 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{dataQuality.totalTradesAnalyzed} trades analyzed</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>{dataQuality.weeksWithData} weeks of data</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{dataQuality.reliabilityScore}% reliability</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
