import { useState } from "react";
import { Check, TrendingUp, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { Trade } from "@/lib/mockData";

type CompletionStep = "commitment" | "review";

interface CompletionFormData {
  confidence: number;
  plannedTarget: string;
  plannedStop: string;
  reason: string;
}

interface TradeCompletionWizardProps {
  trade: Trade;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: CompletionFormData) => Promise<void>;
}

const CONFIDENCE_LABELS = ["Very Low", "Low", "Neutral", "High", "Very High"];

export function TradeCompletionWizard({
  trade,
  open,
  onOpenChange,
  onComplete,
}: TradeCompletionWizardProps) {
  const [currentStep, setCurrentStep] = useState<CompletionStep>("commitment");
  const [formData, setFormData] = useState<CompletionFormData>({
    confidence: trade.confidence || 3,
    plannedTarget: trade.plannedTarget?.toString() || "",
    plannedStop: trade.plannedStop?.toString() || "",
    reason: trade.reason || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateCommitment = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.reason.trim()) {
      newErrors.reason = "Trade reason is required";
    }

    if (!formData.plannedTarget.trim() && !formData.plannedStop.trim()) {
      newErrors.plannedTarget =
        "At least one risk level (target or stop) is required";
      newErrors.plannedStop =
        "At least one risk level (target or stop) is required";
    }

    const target = parseFloat(formData.plannedTarget);
    const stop = parseFloat(formData.plannedStop);

    if (formData.plannedTarget && (isNaN(target) || target <= 0)) {
      newErrors.plannedTarget = "Target must be a positive number";
    }

    if (formData.plannedStop && (isNaN(stop) || stop <= 0)) {
      newErrors.plannedStop = "Stop loss must be a positive number";
    }

    // Validate target/stop makes sense based on trade direction
    if (formData.plannedTarget && formData.plannedStop) {
      if (trade.type === "buy") {
        if (target <= trade.entryPrice) {
          newErrors.plannedTarget =
            "Target should be above entry price for buy trades";
        }
        if (stop >= trade.entryPrice) {
          newErrors.plannedStop =
            "Stop loss should be below entry price for buy trades";
        }
      } else {
        if (target >= trade.entryPrice) {
          newErrors.plannedTarget =
            "Target should be below entry price for sell trades";
        }
        if (stop <= trade.entryPrice) {
          newErrors.plannedStop =
            "Stop loss should be above entry price for sell trades";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === "commitment" && validateCommitment()) {
      setCurrentStep("review");
    }
  };

  const handleBack = () => {
    if (currentStep === "review") {
      setCurrentStep("commitment");
    }
  };

  const handleSubmit = async () => {
    if (!validateCommitment()) return;

    setIsSubmitting(true);
    try {
      await onComplete({
        confidence: formData.confidence,
        plannedTarget: formData.plannedTarget
          ? parseFloat(formData.plannedTarget).toString()
          : "",
        plannedStop: formData.plannedStop
          ? parseFloat(formData.plannedStop).toString()
          : "",
        reason: formData.reason,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to complete trade:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateRiskReward = (): {
    risk: number;
    reward: number;
    ratio: string;
  } | null => {
    const target = parseFloat(formData.plannedTarget);
    const stop = parseFloat(formData.plannedStop);

    if (isNaN(target) || isNaN(stop)) return null;

    const risk = Math.abs(trade.entryPrice - stop) * trade.quantity;
    const reward = Math.abs(target - trade.entryPrice) * trade.quantity;
    const ratio = risk > 0 ? (reward / risk).toFixed(2) : "∞";

    return { risk, reward, ratio };
  };

  const steps: { id: CompletionStep; label: string }[] = [
    { id: "commitment", label: "Commitment" },
    { id: "review", label: "Review" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Trade Details</DialogTitle>
          <DialogDescription>
            Add your trading plan and risk management details for {trade.symbol}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                    index < currentStepIndex
                      ? "bg-primary border-primary text-primary-foreground"
                      : index === currentStepIndex
                      ? "border-primary text-primary"
                      : "border-muted text-muted-foreground"
                  )}
                >
                  {index < currentStepIndex ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <span className="text-xs mt-1 text-center">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2",
                    index < currentStepIndex ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {currentStep === "commitment" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Trading Plan & Risk Management
                </CardTitle>
                <CardDescription>
                  Define your conviction level, targets, and stop loss
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Confidence Slider */}
                <div className="space-y-3">
                  <Label htmlFor="confidence">
                    Confidence Level:{" "}
                    <span className="font-semibold text-primary">
                      {CONFIDENCE_LABELS[formData.confidence - 1]}
                    </span>
                  </Label>
                  <Slider
                    id="confidence"
                    min={1}
                    max={5}
                    step={1}
                    value={[formData.confidence]}
                    onValueChange={(value) =>
                      setFormData({ ...formData, confidence: value[0] })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Very Low</span>
                    <span>Neutral</span>
                    <span>Very High</span>
                  </div>
                </div>

                {/* Trade Details Summary */}
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Symbol:</span>
                    <span className="font-medium">{trade.symbol}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <span
                      className={cn(
                        "font-medium uppercase",
                        trade.type === "buy" ? "text-green-600" : "text-red-600"
                      )}
                    >
                      {trade.type}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Entry Price:</span>
                    <span className="font-medium">
                      ₹{trade.entryPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className="font-medium">{trade.quantity}</span>
                  </div>
                </div>

                {/* Target & Stop Loss */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plannedTarget">
                      Planned Target{" "}
                      <span className="text-xs text-muted-foreground">
                        (Optional)
                      </span>
                    </Label>
                    <Input
                      id="plannedTarget"
                      type="number"
                      step="0.01"
                      placeholder="Target price"
                      value={formData.plannedTarget}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          plannedTarget: e.target.value,
                        })
                      }
                      className={
                        errors.plannedTarget ? "border-destructive" : ""
                      }
                    />
                    {errors.plannedTarget && (
                      <p className="text-xs text-destructive">
                        {errors.plannedTarget}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plannedStop">
                      Stop Loss{" "}
                      <span className="text-xs text-muted-foreground">
                        (Optional)
                      </span>
                    </Label>
                    <Input
                      id="plannedStop"
                      type="number"
                      step="0.01"
                      placeholder="Stop loss price"
                      value={formData.plannedStop}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          plannedStop: e.target.value,
                        })
                      }
                      className={errors.plannedStop ? "border-destructive" : ""}
                    />
                    {errors.plannedStop && (
                      <p className="text-xs text-destructive">
                        {errors.plannedStop}
                      </p>
                    )}
                  </div>
                </div>

                {/* Risk/Reward Display */}
                {(() => {
                  const rr = calculateRiskReward();
                  return rr ? (
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">
                          Risk/Reward Analysis
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Risk</p>
                          <p className="font-semibold text-red-600">
                            ₹{rr.risk.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Reward</p>
                          <p className="font-semibold text-green-600">
                            ₹{rr.reward.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">R:R Ratio</p>
                          <p className="font-semibold text-primary">
                            1:{rr.ratio}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Reason */}
                <div className="space-y-2">
                  <Label htmlFor="reason">
                    Why this trade? <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="reason"
                    placeholder="Describe your reasoning for this trade..."
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    rows={4}
                    className={errors.reason ? "border-destructive" : ""}
                  />
                  {errors.reason && (
                    <p className="text-xs text-destructive">{errors.reason}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === "review" && (
            <Card>
              <CardHeader>
                <CardTitle>Review & Confirm</CardTitle>
                <CardDescription>
                  Please review your trade completion details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Trade Summary */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Symbol</p>
                      <p className="font-medium">{trade.symbol}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p
                        className={cn(
                          "font-medium uppercase",
                          trade.type === "buy"
                            ? "text-green-600"
                            : "text-red-600"
                        )}
                      >
                        {trade.type}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Quantity</p>
                      <p className="font-medium">{trade.quantity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Entry Price</p>
                      <p className="font-medium">
                        ₹{trade.entryPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Trading Plan</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Confidence
                        </p>
                        <p className="font-medium">
                          {CONFIDENCE_LABELS[formData.confidence - 1]}
                        </p>
                      </div>

                      {formData.plannedTarget && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Target
                          </p>
                          <p className="font-medium text-green-600">
                            ₹{parseFloat(formData.plannedTarget).toFixed(2)}
                          </p>
                        </div>
                      )}

                      {formData.plannedStop && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Stop Loss
                          </p>
                          <p className="font-medium text-red-600">
                            ₹{parseFloat(formData.plannedStop).toFixed(2)}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm text-muted-foreground">Reason</p>
                        <p className="font-medium whitespace-pre-wrap">
                          {formData.reason}
                        </p>
                      </div>
                    </div>
                  </div>

                  {(() => {
                    const rr = calculateRiskReward();
                    return rr ? (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-3">Risk Analysis</h4>
                        <div className="bg-muted/50 p-4 rounded-lg grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Risk
                            </p>
                            <p className="text-lg font-semibold text-red-600">
                              ₹{rr.risk.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Reward
                            </p>
                            <p className="text-lg font-semibold text-green-600">
                              ₹{rr.reward.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Ratio
                            </p>
                            <p className="text-lg font-semibold text-primary">
                              1:{rr.ratio}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={
              currentStep === "commitment"
                ? () => onOpenChange(false)
                : handleBack
            }
            disabled={isSubmitting}
          >
            {currentStep === "commitment" ? "Cancel" : "Back"}
          </Button>
          <Button
            onClick={currentStep === "commitment" ? handleNext : handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Saving..."
              : currentStep === "commitment"
              ? "Next"
              : "Complete Trade"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
