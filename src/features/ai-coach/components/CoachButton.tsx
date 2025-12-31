/**
 * Coach Button - Floating AI Coach Access
 *
 * A calm, unobtrusive floating button in the bottom-right corner.
 * Opens the coach panel when clicked.
 * Available on all authenticated pages.
 */

import { MessageCircleQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CoachButtonProps {
  onClick: () => void;
  hasNewInsight?: boolean;
  className?: string;
}

export function CoachButton({
  onClick,
  hasNewInsight = false,
  className,
}: CoachButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className={cn(
        // Base styling - calm, not attention-grabbing
        "fixed bottom-6 right-6 z-50",
        "h-14 w-14 rounded-full shadow-lg",
        "bg-primary/90 hover:bg-primary",
        "text-primary-foreground",
        "transition-all duration-300 ease-out",
        "hover:scale-105 hover:shadow-xl",
        "focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
        // Mobile adjustment
        "md:bottom-8 md:right-8",
        className
      )}
      aria-label="Open AI Coach"
    >
      <MessageCircleQuestion className="h-6 w-6" />

      {/* Subtle indicator dot for new insight */}
      {hasNewInsight && (
        <span
          className={cn(
            "absolute -top-1 -right-1",
            "h-3 w-3 rounded-full",
            "bg-emerald-400",
            "animate-pulse"
          )}
        />
      )}
    </Button>
  );
}
