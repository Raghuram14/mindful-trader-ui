/**
 * Milestone Toast
 *
 * Subtle, auto-dismissing toast for newly achieved milestones.
 * Design Philosophy:
 * - Calm recognition: "You've reached a milestone" not "Achievement unlocked!"
 * - Auto-dismiss after 4 seconds (enough to read, not intrusive)
 * - No sound or vibration
 * - Acknowledges milestone on display
 */

import { useEffect, useState, useCallback } from "react";
import {
  streaksApi,
  Milestone,
  MilestoneCategory,
  MilestoneType,
} from "@/api/streaks";
import { cn } from "@/lib/utils";
import { Calendar, TrendingUp, Eye, Heart, X } from "lucide-react";

interface MilestoneToastProps {
  className?: string;
}

/**
 * Get icon and color for each milestone category
 */
function getCategoryMeta(category: MilestoneCategory) {
  switch (category) {
    case "CONSISTENCY":
      return {
        icon: Calendar,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
      };
    case "GROWTH":
      return {
        icon: TrendingUp,
        color: "text-green-500",
        bg: "bg-green-500/10",
        borderColor: "border-green-500/20",
      };
    case "AWARENESS":
      return {
        icon: Eye,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        borderColor: "border-purple-500/20",
      };
    case "RESILIENCE":
      return {
        icon: Heart,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        borderColor: "border-amber-500/20",
      };
  }
}

/**
 * Get a calm, coach-like message for milestone
 */
function getMilestoneMessage(type: MilestoneType): string {
  const messages: Record<MilestoneType, string> = {
    // Consistency
    FIRST_WEEK_PLAN_ADHERENCE: "You followed your plan on most trades this week",
    DISCIPLINE_STREAK_5: "5 trades in a row with solid discipline",
    DISCIPLINE_STREAK_10: "10 trades with consistent discipline",
    DISCIPLINE_STREAK_20: "20 trades showing real commitment",
    REFLECTION_STREAK_7: "A week of daily reflections - nice habit",
    REFLECTION_STREAK_14: "Two weeks of reflection practice",
    REFLECTION_STREAK_30: "A month of daily reflection",
    
    // Growth
    DISCIPLINE_SCORE_IMPROVED_10: "Your discipline has noticeably improved",
    DISCIPLINE_SCORE_IMPROVED_20: "Significant progress in your discipline",
    FIRST_WEEK_NO_VIOLATIONS: "Clean week - no rule violations",
    MONTH_IMPROVED_OVERALL: "Your overall scores have improved this month",
    
    // Awareness
    FIRST_PATTERN_NOTICED: "You're starting to notice your patterns",
    TRADES_LOGGED_10: "10 trades with full journaling",
    TRADES_LOGGED_50: "50 trades logged - building real data",
    TRADES_LOGGED_100: "100 trades - you have meaningful insights now",
    
    // Resilience
    RETURNED_AFTER_LOSS: "Back to trading calmly after a tough day",
    CALM_AFTER_STREAK_BREAK: "Fresh start with good discipline",
    WEEK_AFTER_TOUGH_DAY: "A week of solid trading after a setback",
  };
  
  return messages[type] || "You've reached a milestone";
}

/**
 * Single milestone toast item
 */
function MilestoneToastItem({
  milestone,
  onDismiss,
}: {
  milestone: Milestone;
  onDismiss: () => void;
}) {
  const meta = getCategoryMeta(milestone.category);
  const Icon = meta.icon;
  // Auto-dismiss after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 p-4 rounded-lg border shadow-lg",
        "bg-card",
        meta.borderColor,
        "animate-in slide-in-from-bottom-5 fade-in duration-300"
      )}
    >
      <div className={cn("rounded-lg p-2", meta.bg)}>
        <Icon className={cn("w-4 h-4", meta.color)} />
      </div>
      <div className="flex-1 pr-6">
        <p className="text-xs font-medium text-muted-foreground mb-0.5">
          Journey marker
        </p>
        <p className="text-sm font-medium text-foreground">{milestone.title}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {getMilestoneMessage(milestone.type)}
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3 h-3 text-muted-foreground" />
      </button>
    </div>
  );
}

export function MilestoneToast({ className }: MilestoneToastProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [displayedMilestone, setDisplayedMilestone] =
    useState<Milestone | null>(null);

  // Fetch unacknowledged milestones on mount
  useEffect(() => {
    async function fetchMilestones() {
      try {
        const unacknowledged = await streaksApi.getUnacknowledgedMilestones();
        setMilestones(unacknowledged);
        // Show the first one
        if (unacknowledged.length > 0) {
          setDisplayedMilestone(unacknowledged[0]);
        }
      } catch (err) {
        console.error("Failed to fetch milestones:", err);
      }
    }

    fetchMilestones();
  }, []);

  // Handle dismissing a milestone
  const handleDismiss = useCallback(async () => {
    if (!displayedMilestone) return;
    try {
      // Acknowledge this milestone
      await streaksApi.acknowledgeMilestone(displayedMilestone._id);
    } catch (err) {
      console.error("Failed to acknowledge milestone:", err);
    }

    // Move to next milestone or clear
    setMilestones((prev) => {
      const remaining = prev.filter((m) => m._id !== displayedMilestone._id);

      // Show next if available
      if (remaining.length > 0) {
        // Small delay before showing next
        setTimeout(() => {
          setDisplayedMilestone(remaining[0]);
        }, 300);
      } else {
        setDisplayedMilestone(null);
      }
      return remaining;
    });
  }, [displayedMilestone]);

  // Don't render if no milestone to show
  if (!displayedMilestone) {
    return null;
  }

  return (
    <div className={cn("fixed bottom-4 right-4 z-50 max-w-sm", className)}>
      <MilestoneToastItem
        milestone={displayedMilestone}
        onDismiss={handleDismiss}
      />

      {/* Counter for remaining milestones */}
      {milestones.length > 1 && (
        <p className="text-xs text-muted-foreground text-right mt-1 mr-2">
          +{milestones.length - 1} more
        </p>
      )}
    </div>
  );
}
