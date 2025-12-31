/**
 * Strengths & Growth Areas Cards
 *
 * Side-by-side display of what's working well and where to focus.
 * Calm, coaching language - not "good vs bad".
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Target, TrendingUp } from "lucide-react";
import { type BehavioralArea, TRAIT_DISPLAY } from "@/api/tradingDNA";
import { cn } from "@/lib/utils";

interface StrengthsGrowthCardsProps {
  strengths: BehavioralArea[];
  growthAreas: BehavioralArea[];
}

export function StrengthsGrowthCards({
  strengths,
  growthAreas,
}: StrengthsGrowthCardsProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Strengths Card */}
      <Card className="border-emerald-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-emerald-500">
            <Sparkles className="w-4 h-4" />
            Your Strengths
          </CardTitle>
        </CardHeader>
        <CardContent>
          {strengths.length > 0 ? (
            <div className="space-y-4">
              {strengths.map((area, index) => (
                <AreaItem key={index} area={area} variant="strength" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Keep trading - your strengths will emerge
            </p>
          )}
        </CardContent>
      </Card>

      {/* Growth Areas Card */}
      <Card className="border-amber-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-amber-500">
            <Target className="w-4 h-4" />
            Growth Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          {growthAreas.length > 0 ? (
            <div className="space-y-4">
              {growthAreas.map((area, index) => (
                <AreaItem key={index} area={area} variant="growth" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">
              You're doing great across all areas!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AreaItem({
  area,
  variant,
}: {
  area: BehavioralArea;
  variant: "strength" | "growth";
}) {
  const traitInfo = TRAIT_DISPLAY[area.dimension];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-base">{traitInfo.icon}</span>
        <h4
          className={cn(
            "text-sm font-medium",
            variant === "strength" ? "text-emerald-500" : "text-amber-500"
          )}
        >
          {area.title}
        </h4>
      </div>
      <p className="text-sm text-muted-foreground pl-6">{area.description}</p>
      <div
        className={cn(
          "text-xs pl-6 flex items-center gap-1",
          variant === "strength" ? "text-emerald-500/70" : "text-amber-500/70"
        )}
      >
        <TrendingUp className="w-3 h-3" />
        <span>{area.evidence}</span>
      </div>
    </div>
  );
}
