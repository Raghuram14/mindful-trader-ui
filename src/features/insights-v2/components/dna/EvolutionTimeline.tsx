/**
 * Evolution Timeline
 *
 * Shows how the trader's behavioral score has evolved month-over-month.
 * Uses Recharts AreaChart for smooth visualization.
 */

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Calendar } from "lucide-react";
import { type EvolutionPoint } from "@/api/tradingDNA";

interface EvolutionTimelineProps {
  evolution: EvolutionPoint[];
}

export function EvolutionTimeline({ evolution }: EvolutionTimelineProps) {
  // Format month for display
  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split("-");
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
  };

  // Transform data for chart
  const chartData = evolution.map((point) => ({
    ...point,
    monthLabel: formatMonth(point.month),
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as EvolutionPoint & {
        monthLabel: string;
      };
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg max-w-[200px]">
          <p className="font-medium text-sm">{data.monthLabel}</p>
          <div className="mt-2 space-y-1">
            <p className="text-xs text-muted-foreground">
              Score:{" "}
              <span className="font-medium text-foreground">
                {data.overallScore}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Trades:{" "}
              <span className="font-medium text-foreground">
                {data.tradeCount}
              </span>
            </p>
            {data.highlights.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border">
                {data.highlights.map((highlight, i) => (
                  <p
                    key={i}
                    className="text-xs text-emerald-600 dark:text-emerald-400"
                  >
                    ✓ {highlight}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate overall trend
  const firstScore = evolution.length > 0 ? evolution[0].overallScore : 0;
  const lastScore =
    evolution.length > 0 ? evolution[evolution.length - 1].overallScore : 0;
  const overallChange = lastScore - firstScore;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Your Evolution
            </CardTitle>
            <CardDescription>
              How your behavioral score has changed over time
            </CardDescription>
          </div>
          {evolution.length > 1 && (
            <div className="text-right">
              <p
                className={`text-lg font-semibold ${
                  overallChange > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : overallChange < 0
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground"
                }`}
              >
                {overallChange > 0 ? "+" : ""}
                {overallChange} points
              </p>
              <p className="text-xs text-muted-foreground">since you started</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="evolutionGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                strokeOpacity={0.5}
                vertical={false}
              />
              <XAxis
                dataKey="monthLabel"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                tickCount={5}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="overallScore"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#evolutionGradient)"
                dot={{
                  fill: "hsl(var(--primary))",
                  strokeWidth: 2,
                  r: 4,
                  stroke: "hsl(var(--background))",
                }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Highlights strip */}
        {evolution.some((e) => e.highlights.length > 0) && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">
              Recent highlights:
            </p>
            <div className="flex flex-wrap gap-2">
              {evolution
                .slice(-3)
                .filter((e) => e.highlights.length > 0)
                .flatMap((e) => e.highlights)
                .slice(0, 4)
                .map((highlight, i) => (
                  <span
                    key={i}
                    className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-full"
                  >
                    {highlight}
                  </span>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
