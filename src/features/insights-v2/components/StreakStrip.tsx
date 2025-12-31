/**
 * Streak Strip
 *
 * Horizontal strip showing active behavioral streaks.
 * Design Philosophy:
 * - Only shown when there are active streaks (count > 0)
 * - Calm, supportive visual design (no flashy animations)
 * - No "streak broken" messaging - quiet reset
 */

import { useEffect, useState } from "react";
import { streaksApi, ActiveStreak, StreakType } from "@/api/streaks";
import { cn } from "@/lib/utils";
import { Target, Shield, Heart, Scale, BookOpen, Flame } from "lucide-react";

interface StreakStripProps {
  className?: string;
}

/**
 * Get icon and color for each streak type
 */
function getStreakMeta(type: StreakType) {
  switch (type) {
    case "PLAN_ADHERENCE":
      return {
        icon: Target,
        label: "Plan",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        description: "Following your trading plan",
      };
    case "DISCIPLINE":
      return {
        icon: Shield,
        label: "Discipline",
        color: "text-green-500",
        bg: "bg-green-500/10",
        description: "Trading within your rules",
      };
    case "CALM_EXECUTION":
      return {
        icon: Heart,
        label: "Calm",
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        description: "Trading without FOMO or revenge",
      };
    case "RISK_RESPECT":
      return {
        icon: Scale,
        label: "Risk",
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        description: "Respecting position limits",
      };
    case "REFLECTION":
      return {
        icon: BookOpen,
        label: "Reflection",
        color: "text-teal-500",
        bg: "bg-teal-500/10",
        description: "Daily reflection practice",
      };
  }
}

/**
 * Single streak badge
 */
function StreakBadge({ streak }: { streak: ActiveStreak }) {
  const meta = getStreakMeta(streak.type);
  const Icon = meta.icon;

  // Check if this is a "personal best" streak
  const isPersonalBest =
    streak.currentCount >= streak.longestCount && streak.longestCount > 1;

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
        meta.bg,
        "hover:bg-opacity-20"
      )}
    >
      <Icon className={cn("w-4 h-4", meta.color)} />
      <span className="text-sm font-medium text-foreground">
        {streak.currentCount}
      </span>
      <span className="text-xs text-muted-foreground hidden sm:inline">
        {meta.label}
      </span>
      {/* Personal best indicator - subtle flame icon */}
      {isPersonalBest && streak.currentCount >= 5 && (
        <Flame className="w-3 h-3 text-orange-400 animate-pulse" />
      )}

      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
        <p className="text-xs font-medium text-foreground">
          {streak.currentCount} {streak.currentCount === 1 ? "trade" : "trades"}{" "}
          {meta.description.toLowerCase()}
        </p>
        {streak.averageCount > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Your average: {Math.round(streak.averageCount)}
          </p>
        )}
        {isPersonalBest && streak.currentCount >= 5 && (
          <p className="text-xs text-orange-400 mt-0.5">Personal best!</p>
        )}
      </div>
    </div>
  );
}

export function StreakStrip({ className }: StreakStripProps) {
  const [streaks, setStreaks] = useState<ActiveStreak[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStreaks() {
      try {
        const activeStreaks = await streaksApi.getActiveStreaks();
        // Only show streaks with meaningful counts (3+)
        setStreaks(activeStreaks.filter((s) => s.currentCount >= 3));
      } catch (err) {
        console.error("Failed to fetch streaks:", err);
        setError("Could not load streaks");
      } finally {
        setLoading(false);
      }
    }

    fetchStreaks();
  }, []);

  // Don't render anything if no streaks, loading, or error
  if (loading || error || streaks.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card/50 p-4",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground">
          Building momentum
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {streaks.map((streak) => (
          <StreakBadge key={streak.type} streak={streak} />
        ))}
      </div>
    </div>
  );
}
