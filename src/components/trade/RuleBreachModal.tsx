/**
 * Rule Breach Modal
 * 
 * Shows a gentle, non-judgmental modal when rules are breached after closing a trade.
 * Provides behavioral guidance and reflection prompts.
 */

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RuleBreachNudge } from './RuleBreachNudge';

interface RuleBreachModalProps {
  open: boolean;
  onClose: () => void;
  ruleBreaches: Array<{
    ruleId: string;
    ruleType: string;
    message: string;
  }>;
  nudgeMessage?: string;
}

export function RuleBreachModal({
  open,
  onClose,
  ruleBreaches,
  nudgeMessage,
}: RuleBreachModalProps) {
  const getBehavioralGuidance = (ruleType: string): string => {
    switch (ruleType) {
      case 'DAILY_LOSS':
        return "Notice how you're feeling right now. Sometimes taking a break helps us return with clearer judgment.";
      case 'DAILY_TARGET':
        return "Notice the urge to continue trading. Is it coming from a place of discipline or something else?";
      case 'MAX_LOSING_TRADES':
        return "What patterns do you notice in today's trades?";
      default:
        return "This is a good moment to pause and check in with how you're feeling.";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-foreground">
            You've reached a limit you set
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            This is a moment to pause and reflect, not judge.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Rule Breach Messages */}
          {ruleBreaches.map((breach, index) => (
            <div key={breach.ruleId || index} className="space-y-3">
              <RuleBreachNudge message={breach.message} />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {getBehavioralGuidance(breach.ruleType)}
              </p>
            </div>
          ))}

          {/* General Nudge if provided */}
          {nudgeMessage && ruleBreaches.length === 0 && (
            <RuleBreachNudge message={nudgeMessage} />
          )}

          {/* Reflection Prompt */}
          {ruleBreaches.length > 0 && (
            <div className="card-calm border-l-4 border-l-primary/30 bg-primary/5 mt-4">
              <p className="text-sm text-foreground leading-relaxed">
                Before your next trade, take a moment to notice: What's driving your decision right now?
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <Button
            onClick={onClose}
            className="btn-primary"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

