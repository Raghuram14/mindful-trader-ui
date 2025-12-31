/**
 * DailyReflection Component
 *
 * Simple end-of-day check-in that matches existing UX patterns.
 * Focused on quick reflection, not detailed journaling.
 *
 * Design principles:
 * - Match DailyMindsetCheck styling (theme colors, not custom gradients)
 * - Keep it simple - just 2 questions
 * - Quick to complete (< 30 seconds)
 * - Coaching-focused language
 */

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sunset, CheckCircle2, Loader2 } from "lucide-react";
import { coachingApi } from "../api/coaching.api";
import { CreateReflectionRequest } from "../types/coaching.types";
import { cn } from "@/lib/utils";

interface DailyReflectionProps {
  todaysFocus?: string;
  onComplete?: () => void;
}

const FEELING_OPTIONS = [
  { value: 1 as const, label: "Tough day", emoji: "😔" },
  { value: 2 as const, label: "Challenging", emoji: "😐" },
  { value: 3 as const, label: "Okay", emoji: "🙂" },
  { value: 4 as const, label: "Good", emoji: "😊" },
  { value: 5 as const, label: "Great", emoji: "🌟" },
];

export function DailyReflection({
  todaysFocus,
  onComplete,
}: DailyReflectionProps) {
  const queryClient = useQueryClient();

  // Check if reflection already exists - longer stale time to reduce API calls
  const { data: existingReflection, isLoading } = useQuery({
    queryKey: ["todayReflection"],
    queryFn: () => coachingApi.getTodayReflection(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Form state
  const [overallFeeling, setOverallFeeling] = useState<
    1 | 2 | 3 | 4 | 5 | null
  >(null);
  const [reflection, setReflection] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Pre-fill form if reflection exists
  useEffect(() => {
    if (existingReflection) {
      setOverallFeeling(existingReflection.overallFeeling);
      setReflection(existingReflection.biggestWin || "");
      setIsSubmitted(true);
    }
  }, [existingReflection]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (data: CreateReflectionRequest) =>
      coachingApi.saveReflection(data),
    onSuccess: () => {
      setIsSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["todayReflection"] });
      onComplete?.();
    },
  });

  const handleSubmit = () => {
    if (!overallFeeling) return;

    saveMutation.mutate({
      focusFollowed: 3, // Default - simplified form
      overallFeeling,
      biggestWin: reflection.trim() || undefined,
    });
  };

  // Loading skeleton matching component size
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="rounded-full bg-muted p-2 w-9 h-9" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-3 w-48 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Completed state - compact summary
  if (isSubmitted && existingReflection) {
    const selectedFeeling = FEELING_OPTIONS.find(
      (o) => o.value === existingReflection.overallFeeling
    );

    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Sunset className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Day Complete
              </h2>
              <p className="text-sm text-muted-foreground">
                {selectedFeeling?.emoji} {selectedFeeling?.label} • See you
                tomorrow
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-primary">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-primary/10 p-2">
          <Sunset className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">End of Day</h2>
          <p className="text-sm text-muted-foreground">
            Quick reflection before you go
          </p>
        </div>
      </div>

      {/* Today's Focus Reminder */}
      {todaysFocus && (
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground mb-1">
            Today's focus was:
          </p>
          <p className="text-sm text-foreground line-clamp-2">{todaysFocus}</p>
        </div>
      )}

      {/* Overall Feeling */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">
          How did trading feel today?
        </p>
        <div className="grid grid-cols-5 gap-2">
          {FEELING_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setOverallFeeling(option.value)}
              className={cn(
                "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all",
                "hover:bg-accent hover:border-primary/50",
                overallFeeling === option.value
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background"
              )}
            >
              <span className="text-xl">{option.emoji}</span>
              <span className="text-xs font-medium text-foreground text-center">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Optional Quick Note */}
      <div className="space-y-2">
        <label
          htmlFor="reflection-note"
          className="text-sm font-medium text-foreground"
        >
          One thing that went well{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <Textarea
          id="reflection-note"
          placeholder="e.g., I stuck to my stop loss today"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          rows={2}
          className="resize-none"
        />
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!overallFeeling || saveMutation.isPending}
        className="w-full"
        size="lg"
      >
        {saveMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Complete today's reflection"
        )}
      </Button>

      {saveMutation.isError && (
        <p className="text-sm text-destructive text-center">
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
}
