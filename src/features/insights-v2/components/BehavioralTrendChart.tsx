/**
 * BehavioralTrendChart Component
 *
 * Shows behavioral trends over time using recharts.
 * Visualizes weekly progress in key behavioral areas.
 */

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, TrendingUp, BarChart3 } from "lucide-react";
import { progressApi } from "../api/progress.api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Color palette for different metrics
const METRIC_COLORS = {
  disciplineScore: "#10b981", // emerald
  psychologyScore: "#6366f1", // indigo
  riskScore: "#f59e0b", // amber
  consistencyScore: "#06b6d4", // cyan
};

const METRIC_LABELS = {
  disciplineScore: "Discipline",
  psychologyScore: "Psychology",
  riskScore: "Risk Mgmt",
  consistencyScore: "Consistency",
};

export function BehavioralTrendChart() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["weeklyTrends"],
    queryFn: () => progressApi.getWeeklyTrends(8),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data || data.length < 2) {
    return (
      <Card className="bg-muted/20">
        <CardContent className="py-8 text-center">
          <BarChart3 className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Keep trading! Trends will appear after a few weeks of data.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Transform data for chart - format week labels
  const chartData = data.map((week) => {
    const weekStart = new Date(week.weekStartDate);
    return {
      ...week,
      label: `W${week.weekNumber}`,
      weekLabel: weekStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };
  });

  // Calculate overall trend direction
  const firstWeek = data[0];
  const lastWeek = data[data.length - 1];
  const avgFirstScore =
    (firstWeek.disciplineScore +
      firstWeek.psychologyScore +
      firstWeek.riskScore +
      firstWeek.consistencyScore) /
    4;
  const avgLastScore =
    (lastWeek.disciplineScore +
      lastWeek.psychologyScore +
      lastWeek.riskScore +
      lastWeek.consistencyScore) /
    4;
  const isImproving = avgLastScore > avgFirstScore;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Your Trends Over Time
            </CardTitle>
            <CardDescription>
              Weekly behavioral scores across key areas
            </CardDescription>
          </div>
          {isImproving && (
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
              Improving
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted"
                opacity={0.3}
              />
              <XAxis
                dataKey="weekLabel"
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                tickLine={false}
                axisLine={false}
                width={35}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number, name: string) => [
                  `${Math.round(value)}`,
                  METRIC_LABELS[name as keyof typeof METRIC_LABELS] || name,
                ]}
                labelFormatter={(label) => `Week of ${label}`}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                  <span className="text-xs text-muted-foreground">
                    {METRIC_LABELS[value as keyof typeof METRIC_LABELS] ||
                      value}
                  </span>
                )}
              />
              <Line
                type="monotone"
                dataKey="disciplineScore"
                stroke={METRIC_COLORS.disciplineScore}
                strokeWidth={2}
                dot={{ r: 3, fill: METRIC_COLORS.disciplineScore }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="psychologyScore"
                stroke={METRIC_COLORS.psychologyScore}
                strokeWidth={2}
                dot={{ r: 3, fill: METRIC_COLORS.psychologyScore }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="riskScore"
                stroke={METRIC_COLORS.riskScore}
                strokeWidth={2}
                dot={{ r: 3, fill: METRIC_COLORS.riskScore }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="consistencyScore"
                stroke={METRIC_COLORS.consistencyScore}
                strokeWidth={2}
                dot={{ r: 3, fill: METRIC_COLORS.consistencyScore }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary note */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          Based on {data.reduce((sum, w) => sum + w.tradesCount, 0)} trades over{" "}
          {data.length} weeks
        </p>
      </CardContent>
    </Card>
  );
}
