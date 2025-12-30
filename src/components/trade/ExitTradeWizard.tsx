import { useState, useEffect } from "react";
import { Check, TrendingDown, Zap, Heart, FileText } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { cn } from "@/lib/utils";
import type { Trade } from "@/lib/mockData";
import { BrokerExitToggle } from "@/components/trade/BrokerExitToggle";

type ExitStep = "setup" | "execution" | "emotions" | "review";

interface ExitFormData {
  // Setup
  quantity: number;
  exitPrice: string;
  exitReason: "target" | "stop" | "fear" | "unsure" | "impulse";
  exitDateTime: Date;

  // Execution
  useBroker: boolean;
  orderType: "MARKET" | "LIMIT";
  brokerOrderId?: string;

  // Emotions
  emotions: ("fear" | "greed" | "fomo" | "regret" | "confident" | "calm")[];
  exitNote: string;
}

interface ExitTradeWizardProps {
  trade: Trade;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExit: (data: ExitFormData) => Promise<void>;
  brokerConnectionStatus?: "connected" | "disconnected" | "loading";
  canUseBrokerExit?: boolean;
}

const EXIT_REASONS = [
  { value: "target", label: "Target Hit", icon: "🎯" },
  { value: "stop", label: "Stop Loss", icon: "🛑" },
  { value: "fear", label: "Fear/Panic", icon: "😰" },
  { value: "unsure", label: "Uncertainty", icon: "🤔" },
  { value: "impulse", label: "Impulse", icon: "⚡" },
] as const;

const EMOTION_OPTIONS = [
  { value: "fear", label: "😰 Fear" },
  { value: "greed", label: "🤑 Greed" },
  { value: "fomo", label: "😱 FOMO" },
  { value: "regret", label: "😔 Regret" },
  { value: "confident", label: "😄 Confident" },
  { value: "calm", label: "😌 Calm" },
] as const;

export function ExitTradeWizard({
  trade,
  open,
  onOpenChange,
  onExit,
  brokerConnectionStatus = "disconnected",
  canUseBrokerExit = true,
}: ExitTradeWizardProps) {
  const now = new Date();
  now.setSeconds(0, 0);

  const [currentStep, setCurrentStep] = useState<ExitStep>("setup");
  const [formData, setFormData] = useState<ExitFormData>({
    quantity: trade.quantity,
    exitPrice: "",
    exitReason: "target",
    exitDateTime: now,
    useBroker: false,
    orderType: "MARKET",
    emotions: [],
    exitNote: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ltp, setLtp] = useState<number | null>(null);

  // Fetch LTP when dialog opens
  useEffect(() => {
    if (open) {
      // Mock LTP - in real app, fetch from broker API
      setLtp(trade.entryPrice * 1.02);
    }
  }, [open, trade.entryPrice]);

  const validateSetup = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    if (formData.quantity > trade.quantity) {
      newErrors.quantity = `Cannot exceed position size (${trade.quantity})`;
    }

    if (!formData.exitPrice.trim()) {
      newErrors.exitPrice = "Exit price is required";
    } else {
      const price = parseFloat(formData.exitPrice);
      if (isNaN(price) || price <= 0) {
        newErrors.exitPrice = "Invalid price";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateExecution = (): boolean => {
    if (
      formData.useBroker &&
      formData.orderType === "LIMIT" &&
      !formData.exitPrice
    ) {
      setErrors({ exitPrice: "Limit price required for limit orders" });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === "setup" && validateSetup()) {
      setCurrentStep("execution");
    } else if (currentStep === "execution" && validateExecution()) {
      setCurrentStep("emotions");
    } else if (currentStep === "emotions") {
      setCurrentStep("review");
    }
  };

  const handleBack = () => {
    const steps: ExitStep[] = ["setup", "execution", "emotions", "review"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleUseLTP = () => {
    if (ltp) {
      setFormData({ ...formData, exitPrice: ltp.toFixed(2) });
    }
  };

  const toggleEmotion = (emotion: (typeof formData.emotions)[number]) => {
    setFormData({
      ...formData,
      emotions: formData.emotions.includes(emotion)
        ? formData.emotions.filter((e) => e !== emotion)
        : [...formData.emotions, emotion],
    });
  };

  const handleSubmit = async () => {
    if (!validateSetup()) return;

    setIsSubmitting(true);
    try {
      await onExit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to exit trade:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatePnL = (): { gross: number; percentage: number } => {
    const price = parseFloat(formData.exitPrice);
    if (isNaN(price)) return { gross: 0, percentage: 0 };

    const gross =
      (price - trade.entryPrice) *
      formData.quantity *
      (trade.type === "buy" ? 1 : -1);
    const percentage =
      ((price - trade.entryPrice) / trade.entryPrice) *
      100 *
      (trade.type === "buy" ? 1 : -1);

    return { gross, percentage };
  };

  const steps: { id: ExitStep; label: string }[] = [
    { id: "setup", label: "Setup" },
    { id: "execution", label: "Execute" },
    { id: "emotions", label: "Reflect" },
    { id: "review", label: "Review" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Exit Trade</DialogTitle>
          <DialogDescription>
            Close your position in {trade.symbol}
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
          {currentStep === "setup" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  Exit Details
                </CardTitle>
                <CardDescription>
                  Specify the quantity and price for your exit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Position Info */}
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Symbol:</span>
                    <span className="font-medium">{trade.symbol}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Position:</span>
                    <span className="font-medium">
                      {trade.quantity} @ ₹{trade.entryPrice.toFixed(2)}
                    </span>
                  </div>
                  {ltp && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">LTP:</span>
                      <span className="font-medium">₹{ltp.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="quantity">
                    Exit Quantity <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="quantity"
                      type="number"
                      min={1}
                      max={trade.quantity}
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantity: parseInt(e.target.value) || 0,
                        })
                      }
                      className={errors.quantity ? "border-destructive" : ""}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setFormData({ ...formData, quantity: trade.quantity })
                      }
                    >
                      Full
                    </Button>
                  </div>
                  {errors.quantity && (
                    <p className="text-xs text-destructive">
                      {errors.quantity}
                    </p>
                  )}
                  {formData.quantity < trade.quantity && (
                    <p className="text-xs text-muted-foreground">
                      Partial exit: {trade.quantity - formData.quantity}{" "}
                      remaining
                    </p>
                  )}
                </div>

                {/* Exit Price */}
                <div className="space-y-2">
                  <Label htmlFor="exitPrice">
                    Exit Price <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="exitPrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.exitPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, exitPrice: e.target.value })
                      }
                      className={errors.exitPrice ? "border-destructive" : ""}
                    />
                    {ltp && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleUseLTP}
                      >
                        Use LTP
                      </Button>
                    )}
                  </div>
                  {errors.exitPrice && (
                    <p className="text-xs text-destructive">
                      {errors.exitPrice}
                    </p>
                  )}
                </div>

                {/* P&L Preview */}
                {formData.exitPrice && (
                  <div
                    className={cn(
                      "p-4 rounded-lg",
                      calculatePnL().gross >= 0
                        ? "bg-green-50 dark:bg-green-950/30"
                        : "bg-red-50 dark:bg-red-950/30"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Expected P&L:</span>
                      <div className="text-right">
                        <p
                          className={cn(
                            "text-lg font-bold",
                            calculatePnL().gross >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          )}
                        >
                          {calculatePnL().gross >= 0 ? "+" : ""}₹
                          {calculatePnL().gross.toFixed(2)}
                        </p>
                        <p
                          className={cn(
                            "text-sm",
                            calculatePnL().gross >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          )}
                        >
                          ({calculatePnL().percentage >= 0 ? "+" : ""}
                          {calculatePnL().percentage.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Exit Reason */}
                <div className="space-y-3">
                  <Label>
                    Why are you exiting?{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <RadioGroup
                    value={formData.exitReason}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, exitReason: value })
                    }
                  >
                    {EXIT_REASONS.map((reason) => (
                      <div
                        key={reason.value}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem
                          value={reason.value}
                          id={reason.value}
                        />
                        <Label
                          htmlFor={reason.value}
                          className="cursor-pointer"
                        >
                          {reason.icon} {reason.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Date/Time */}
                <div className="space-y-2">
                  <Label htmlFor="exitDateTime">Exit Date & Time</Label>
                  <DateTimePicker
                    value={formData.exitDateTime}
                    onChange={(date) =>
                      date && setFormData({ ...formData, exitDateTime: date })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === "execution" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Order Execution
                </CardTitle>
                <CardDescription>
                  Choose how to execute your exit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Manual Trade Warning */}
                {!canUseBrokerExit && trade.source === "MANUAL" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-600 text-xl">⚠️</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-yellow-900">
                          Manual Trade - Broker Exit Disabled
                        </h4>
                        <p className="text-sm text-yellow-800 mt-1">
                          This trade was manually added and does not exist in
                          your broker account. Broker exit is disabled to
                          prevent accidentally opening a new position.
                        </p>
                        <p className="text-sm text-yellow-800 mt-1 font-medium">
                          Please use manual exit to close this trade.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Broker Exit Toggle */}
                <BrokerExitToggle
                  enabled={formData.useBroker && canUseBrokerExit}
                  onToggle={(enabled) => {
                    if (canUseBrokerExit) {
                      setFormData({ ...formData, useBroker: enabled });
                    }
                  }}
                  connectionStatus={brokerConnectionStatus}
                  position={{
                    symbol: trade.symbol,
                    quantity: trade.quantity,
                    ltp: ltp || trade.entryPrice,
                  }}
                />

                {formData.useBroker && (
                  <>
                    {/* Order Type */}
                    <div className="space-y-3">
                      <Label>Order Type</Label>
                      <RadioGroup
                        value={formData.orderType}
                        onValueChange={(value: any) =>
                          setFormData({ ...formData, orderType: value })
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="MARKET" id="market" />
                          <Label htmlFor="market" className="cursor-pointer">
                            Market Order (Immediate execution at current price)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="LIMIT" id="limit" />
                          <Label htmlFor="limit" className="cursor-pointer">
                            Limit Order (Execute at specified price)
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.orderType === "MARKET" && ltp && (
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg text-sm">
                        <p className="text-blue-900 dark:text-blue-100">
                          Market order will execute at approximately ₹
                          {ltp.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {!formData.useBroker && (
                  <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
                    <p>
                      Manual exit: You'll need to place the order in your broker
                      app separately.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === "emotions" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Emotional Reflection
                </CardTitle>
                <CardDescription>
                  How did you feel about this exit?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Emotion Tags */}
                <div className="space-y-3">
                  <Label>Select emotions (multiple allowed)</Label>
                  <div className="flex flex-wrap gap-2">
                    {EMOTION_OPTIONS.map((emotion) => (
                      <button
                        key={emotion.value}
                        type="button"
                        onClick={() => toggleEmotion(emotion.value)}
                        className={cn(
                          "px-4 py-2 rounded-lg border-2 transition-colors text-sm",
                          formData.emotions.includes(emotion.value)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted bg-background hover:border-primary/50"
                        )}
                      >
                        {emotion.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exit Note */}
                <div className="space-y-2">
                  <Label htmlFor="exitNote">Exit Notes (Optional)</Label>
                  <Textarea
                    id="exitNote"
                    placeholder="What did you learn from this trade?"
                    value={formData.exitNote}
                    onChange={(e) =>
                      setFormData({ ...formData, exitNote: e.target.value })
                    }
                    rows={5}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === "review" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Review & Confirm
                </CardTitle>
                <CardDescription>
                  Please review your exit details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Exit Summary */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Symbol</p>
                      <p className="font-medium">{trade.symbol}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Quantity</p>
                      <p className="font-medium">{formData.quantity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Entry Price</p>
                      <p className="font-medium">
                        ₹{trade.entryPrice.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Exit Price</p>
                      <p className="font-medium">
                        ₹{parseFloat(formData.exitPrice).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* P&L */}
                  <div
                    className={cn(
                      "p-4 rounded-lg border-2",
                      calculatePnL().gross >= 0
                        ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                        : "border-red-500 bg-red-50 dark:bg-red-950/30"
                    )}
                  >
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">
                        Profit/Loss
                      </p>
                      <p
                        className={cn(
                          "text-3xl font-bold",
                          calculatePnL().gross >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        )}
                      >
                        {calculatePnL().gross >= 0 ? "+" : ""}₹
                        {calculatePnL().gross.toFixed(2)}
                      </p>
                      <p
                        className={cn(
                          "text-lg",
                          calculatePnL().gross >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        )}
                      >
                        ({calculatePnL().percentage >= 0 ? "+" : ""}
                        {calculatePnL().percentage.toFixed(2)}%)
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Exit Reason
                      </p>
                      <p className="font-medium">
                        {
                          EXIT_REASONS.find(
                            (r) => r.value === formData.exitReason
                          )?.label
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Execution Method
                      </p>
                      <p className="font-medium">
                        {formData.useBroker
                          ? `Broker ${formData.orderType} Order`
                          : "Manual"}
                      </p>
                    </div>

                    {formData.emotions.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Emotions
                        </p>
                        <p className="font-medium">
                          {formData.emotions
                            .map(
                              (e) =>
                                EMOTION_OPTIONS.find((opt) => opt.value === e)
                                  ?.label
                            )
                            .join(", ")}
                        </p>
                      </div>
                    )}

                    {formData.exitNote && (
                      <div>
                        <p className="text-sm text-muted-foreground">Notes</p>
                        <p className="font-medium whitespace-pre-wrap">
                          {formData.exitNote}
                        </p>
                      </div>
                    )}
                  </div>
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
              currentStep === "setup" ? () => onOpenChange(false) : handleBack
            }
            disabled={isSubmitting}
          >
            {currentStep === "setup" ? "Cancel" : "Back"}
          </Button>
          <Button
            onClick={currentStep === "review" ? handleSubmit : handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Processing..."
              : currentStep === "review"
              ? formData.useBroker
                ? "Place Order & Exit"
                : "Exit Trade"
              : "Next"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
