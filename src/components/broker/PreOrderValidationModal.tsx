import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, XCircle, Loader2 } from "lucide-react";
import type { PreOrderValidationResult, RuleViolation } from "@/api/broker";

interface PreOrderValidationModalProps {
  open: boolean;
  onClose: () => void;
  validation: PreOrderValidationResult;
  onConfirm: (overrideReason?: string) => void;
  loading?: boolean;
}

export function PreOrderValidationModal({
  open,
  onClose,
  validation,
  onConfirm,
  loading = false,
}: PreOrderValidationModalProps) {
  const [overrideReason, setOverrideReason] = useState("");

  const isBlocked = validation.outcome === "BLOCK";
  const needsOverride = validation.outcome === "WARN";

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case "BLOCK":
        return "destructive";
      case "WARN":
        return "warning";
      default:
        return "default";
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case "BLOCK":
        return <XCircle className="w-5 h-5" />;
      case "WARN":
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const handleConfirm = () => {
    if (needsOverride && overrideReason.trim().length < 10) {
      alert("Please provide a reason for overriding (at least 10 characters)");
      return;
    }
    onConfirm(needsOverride ? overrideReason : undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getOutcomeIcon(validation.outcome)}
            {isBlocked
              ? "Order Blocked by Trading Rules"
              : "Order Requires Your Attention"}
          </DialogTitle>
          <DialogDescription>
            {isBlocked
              ? "This order violates one or more of your trading rules and cannot be placed."
              : "This order triggered warnings from your trading rules. Review carefully before proceeding."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {validation.violations.map(
            (violation: RuleViolation, index: number) => (
              <Alert
                key={index}
                variant={
                  violation.outcome === "BLOCK" ? "destructive" : "default"
                }
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          violation.outcome === "BLOCK"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {violation.ruleType.replace(/_/g, " ")}
                      </Badge>
                      <Badge variant="outline">
                        {violation.currentValue.toFixed(2)} /{" "}
                        {violation.limitValue.toFixed(2)}
                      </Badge>
                    </div>
                    <AlertDescription className="text-base">
                      {violation.message}
                    </AlertDescription>
                    {violation.suggestedAction && (
                      <div className="text-sm text-muted-foreground italic mt-2">
                        💡 {violation.suggestedAction}
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            )
          )}

          {needsOverride && (
            <div className="space-y-2 pt-4">
              <Label
                htmlFor="override-reason"
                className="text-base font-semibold"
              >
                Why are you choosing to override this warning? *
              </Label>
              <Textarea
                id="override-reason"
                placeholder="Example: Setup looks very strong with multiple confirmations, willing to take calculated risk..."
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="min-h-[100px]"
                maxLength={500}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  Documenting your reasoning helps track patterns in your
                  decision-making
                </span>
                <span>{overrideReason.length}/500</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          {!isBlocked && (
            <Button
              variant={needsOverride ? "destructive" : "default"}
              onClick={handleConfirm}
              disabled={
                loading || (needsOverride && overrideReason.trim().length < 10)
              }
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Placing Order...
                </>
              ) : needsOverride ? (
                "Override & Place Order"
              ) : (
                "Place Order"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
