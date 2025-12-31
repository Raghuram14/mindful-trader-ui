/**
 * Trait Radar Chart
 * 
 * Visual representation of behavioral trait scores using Recharts RadarChart.
 * Shows the "shape" of the trader's behavioral DNA.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { type TraitScore, TRAIT_DISPLAY } from "@/api/tradingDNA";
import { cn } from "@/lib/utils";

interface TraitRadarChartProps {
  traits: TraitScore[];
}

export function TraitRadarChart({ traits }: TraitRadarChartProps) {
  // Transform traits for Recharts
  const chartData = traits.map(trait => ({
    trait: TRAIT_DISPLAY[trait.dimension].title,
    score: trait.score,
    stability: trait.stability,
    fullMark: 100,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const trait = traits.find(
        t => TRAIT_DISPLAY[t.dimension].title === payload[0].payload.trait
      );
      if (!trait) return null;

      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm">{TRAIT_DISPLAY[trait.dimension].title}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Score: <span className="font-medium text-foreground">{trait.score}/100</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Stability: <span className="font-medium text-foreground">{trait.stability}%</span>
          </p>
          <div className="flex items-center gap-1 mt-1">
            {trait.trend === 'IMPROVING' && (
              <>
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400">Improving</span>
              </>
            )}
            {trait.trend === 'DECLINING' && (
              <>
                <TrendingDown className="w-3 h-3 text-amber-500" />
                <span className="text-xs text-amber-600 dark:text-amber-400">Needs attention</span>
              </>
            )}
            {trait.trend === 'STABLE' && (
              <>
                <Minus className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Stable</span>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Your Trait Profile</CardTitle>
        <CardDescription>
          The shape of your behavioral tendencies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid 
                  gridType="polygon"
                  stroke="#4b5563"
                  strokeOpacity={0.4}
                />
                <PolarAngleAxis 
                  dataKey="trait" 
                  tick={{ 
                    fontSize: 12, 
                    fill: '#9ca3af',
                    fontWeight: 500
                  }}
                  tickLine={false}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.25}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Trait List */}
          <div className="space-y-3">
            {traits.map(trait => (
              <TraitRow key={trait.dimension} trait={trait} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TraitRow({ trait }: { trait: TraitScore }) {
  const info = TRAIT_DISPLAY[trait.dimension];

  return (
    <div className="flex items-center gap-3">
      <div className="text-lg">{info.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium truncate">{info.title}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{trait.score}</span>
            {trait.trend === 'IMPROVING' && (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            )}
            {trait.trend === 'DECLINING' && (
              <TrendingDown className="w-3.5 h-3.5 text-amber-500" />
            )}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all",
              trait.score >= 70 ? "bg-emerald-500" :
              trait.score >= 50 ? "bg-primary" :
              "bg-amber-500"
            )}
            style={{ width: `${trait.score}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {info.description}
        </p>
      </div>
    </div>
  );
}
