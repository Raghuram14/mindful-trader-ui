/**
 * Rule Breach Nudge Component
 * 
 * Gentle, non-alarming component to show rule breach messages.
 * Uses muted amber/yellow colors (not red) per product guidelines.
 */

import { AlertTriangle } from 'lucide-react';

interface RuleBreachNudgeProps {
  message: string;
}

export function RuleBreachNudge({ message }: RuleBreachNudgeProps) {
  return (
    <div className="card-calm border-l-4 border-l-warning/50 bg-warning/5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-warning/70 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-foreground leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

