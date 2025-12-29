import { useState } from "react";
import { Check } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { SymbolCombobox } from "./SymbolCombobox";
import { RiskOverviewPanel } from "./RiskOverviewPanel";
import { BrokerSelector } from "../broker/BrokerSelector";
import { DateTimePicker } from "../ui/date-time-picker";
import type { InstrumentSearchResult } from "@/api/broker";
import { cn } from "@/lib/utils";

type WizardStep = "setup" | "commitment" | "execution" | "review";

interface TradeFormData {
  // Setup
  instrumentType: "STOCK" | "FUTURES" | "OPTIONS";
  symbol: string;
  exchange: "NSE" | "BSE";
  optionType?: "PUT" | "CALL";
  quantity: string;
  entryPrice: string;
  type: "buy" | "sell";

  // Commitment
  confidence: number;
  riskComfort: number;
  customRisk: string;
  plannedStop: string;
  plannedTarget: string;
  reason: string;
  tradeDateTime: Date;

  // Execution
  selectedBroker: string | null;

  // Metadata
  selectedInstrument?: InstrumentSearchResult;
}

interface TradeWizardProps {
  initialData?: Partial<TradeFormData>;
  onSubmit: (data: TradeFormData) => Promise<void>;
  onCancel?: () => void;
}

const RISK_PRESETS = [500, 1000, 2000];

export function TradeWizard({
  initialData,
  onSubmit,
  onCancel,
}: TradeWizardProps) {
  const now = new Date();
  now.setSeconds(0, 0);

  const [currentStep, setCurrentStep] = useState<WizardStep>("setup");
  const [formData, setFormData] = useState<TradeFormData>({
    instrumentType: "STOCK",
    symbol: "",
    exchange: "NSE",
    optionType: undefined,
    quantity: "",
    entryPrice: "",
    type: "buy",
    confidence: 3,
    riskComfort: 1000,
    customRisk: "",
    plannedStop: "",
    plannedTarget: "",
    reason: "",
    tradeDateTime: now,
    selectedBroker: null,
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateSetup = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.symbol.trim()) {
      newErrors.symbol = "Symbol is required";
    }
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }
    if (!formData.entryPrice || parseFloat(formData.entryPrice) <= 0) {
      newErrors.entryPrice = "Entry price must be greater than 0";
    }
    if (formData.instrumentType === "OPTIONS" && !formData.optionType) {
      newErrors.optionType = "Option type is required for OPTIONS";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCommitment = (): boolean => {
    // Commitment step has no required fields, all are optional
    return true;
  };

  const handleNext = () => {
    let isValid = false;

    switch (currentStep) {
      case "setup":
        isValid = validateSetup();
        if (isValid) setCurrentStep("commitment");
        break;
      case "commitment":
        isValid = validateCommitment();
        if (isValid) setCurrentStep("execution");
        break;
      case "execution":
        setCurrentStep("review");
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case "commitment":
        setCurrentStep("setup");
        break;
      case "execution":
        setCurrentStep("commitment");
        break;
      case "review":
        setCurrentStep("execution");
        break;
    }
  };

  const handleSubmitTrade = async () => {
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate risk metrics for overview panel
  const actualRisk =
    formData.plannedStop && formData.entryPrice && formData.quantity
      ? Math.abs(
          parseFloat(formData.entryPrice) - parseFloat(formData.plannedStop)
        ) * parseInt(formData.quantity)
      : undefined;

  const riskAmount = formData.customRisk
    ? parseInt(formData.customRisk)
    : formData.riskComfort;

  // Mock account balance (in real app, get from profile context)
  const accountBalance = 100000;
  const accountRiskPercent = (riskAmount / accountBalance) * 100;

  const stepCompleted = (step: WizardStep): boolean => {
    const steps: WizardStep[] = ["setup", "commitment", "execution", "review"];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(step);
    return stepIndex < currentIndex;
  };

  return (
    <div className="space-y-6">
      {/* Step Indicators */}
      <div className="flex items-center justify-between px-4">
        {[
          { id: "setup", label: "Trade Setup", number: 1 },
          { id: "commitment", label: "Commitment", number: 2 },
          { id: "execution", label: "Execution", number: 3 },
          { id: "review", label: "Review", number: 4 },
        ].map((step, index, array) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                  currentStep === step.id
                    ? "bg-primary text-primary-foreground"
                    : stepCompleted(step.id as WizardStep)
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {stepCompleted(step.id as WizardStep) ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={cn(
                  "text-xs mt-2 text-center",
                  currentStep === step.id
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < array.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 transition-colors",
                  stepCompleted(array[index + 1].id as WizardStep)
                    ? "bg-green-500"
                    : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[500px]">
        {/* STEP 1: SETUP */}
        {currentStep === "setup" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trade Details</CardTitle>
                <CardDescription>
                  Enter the basic details of your trade setup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Instrument Type & Direction */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="instrumentType">Instrument Type</Label>
                    <Select
                      value={formData.instrumentType}
                      onValueChange={(value: any) => {
                        setFormData({
                          ...formData,
                          instrumentType: value,
                          optionType: undefined,
                        });
                        setErrors({ ...errors, optionType: "" });
                      }}
                    >
                      <SelectTrigger id="instrumentType" className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STOCK">Stock</SelectItem>
                        <SelectItem value="FUTURES">Futures</SelectItem>
                        <SelectItem value="OPTIONS">Options</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Direction</Label>
                    <div className="flex gap-2 mt-1.5">
                      <Button
                        type="button"
                        variant={
                          formData.type === "buy" ? "default" : "outline"
                        }
                        className="flex-1"
                        onClick={() =>
                          setFormData({ ...formData, type: "buy" })
                        }
                      >
                        Buy
                      </Button>
                      <Button
                        type="button"
                        variant={
                          formData.type === "sell" ? "default" : "outline"
                        }
                        className="flex-1"
                        onClick={() =>
                          setFormData({ ...formData, type: "sell" })
                        }
                      >
                        Sell
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Symbol & Exchange */}
                <div>
                  <Label>
                    Symbol {formData.exchange && `(${formData.exchange})`}
                  </Label>
                  <SymbolCombobox
                    value={formData.symbol}
                    exchange={formData.exchange}
                    onExchangeChange={(exchange) =>
                      setFormData({ ...formData, exchange })
                    }
                    onChange={(symbol, instrument) => {
                      setFormData({
                        ...formData,
                        symbol,
                        selectedInstrument: instrument,
                      });
                      setErrors({ ...errors, symbol: "" });
                    }}
                    className="mt-1.5"
                  />
                  {errors.symbol && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.symbol}
                    </p>
                  )}
                </div>

                {/* Option Type (conditional) */}
                {formData.instrumentType === "OPTIONS" && (
                  <div>
                    <Label>Option Type</Label>
                    <div className="flex gap-2 mt-1.5">
                      <Button
                        type="button"
                        variant={
                          formData.optionType === "CALL" ? "default" : "outline"
                        }
                        className="flex-1"
                        onClick={() => {
                          setFormData({ ...formData, optionType: "CALL" });
                          setErrors({ ...errors, optionType: "" });
                        }}
                      >
                        Call
                      </Button>
                      <Button
                        type="button"
                        variant={
                          formData.optionType === "PUT" ? "default" : "outline"
                        }
                        className="flex-1"
                        onClick={() => {
                          setFormData({ ...formData, optionType: "PUT" });
                          setErrors({ ...errors, optionType: "" });
                        }}
                      >
                        Put
                      </Button>
                    </div>
                    {errors.optionType && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.optionType}
                      </p>
                    )}
                  </div>
                )}

                {/* Quantity & Entry Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => {
                        setFormData({ ...formData, quantity: e.target.value });
                        setErrors({ ...errors, quantity: "" });
                      }}
                      placeholder="Number of shares/lots"
                      className="mt-1.5"
                    />
                    {errors.quantity && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.quantity}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="entryPrice">Entry Price</Label>
                    <Input
                      id="entryPrice"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.entryPrice}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          entryPrice: e.target.value,
                        });
                        setErrors({ ...errors, entryPrice: "" });
                      }}
                      placeholder="0.00"
                      className="mt-1.5"
                    />
                    {errors.entryPrice && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.entryPrice}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date & Time */}
                <div>
                  <Label>Trade Date & Time</Label>
                  <DateTimePicker
                    value={formData.tradeDateTime}
                    onChange={(date) =>
                      setFormData({
                        ...formData,
                        tradeDateTime: date || new Date(),
                      })
                    }
                    className="mt-1.5"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* STEP 2: COMMITMENT */}
        {currentStep === "commitment" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trading Commitment</CardTitle>
                <CardDescription>
                  Set your confidence level and risk parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Confidence Level */}
                <div>
                  <Label>Confidence Level: {formData.confidence}</Label>
                  <div className="mt-4">
                    <Slider
                      value={[formData.confidence]}
                      onValueChange={(value) =>
                        setFormData({ ...formData, confidence: value[0] })
                      }
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>1 - Low</span>
                      <span>3 - Medium</span>
                      <span>5 - High</span>
                    </div>
                  </div>
                </div>

                {/* Risk Comfort */}
                <div>
                  <Label>Risk Comfort</Label>
                  <div className="flex gap-2 mt-1.5">
                    {RISK_PRESETS.map((preset) => (
                      <Button
                        key={preset}
                        type="button"
                        variant={
                          formData.riskComfort === preset &&
                          !formData.customRisk
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          setFormData({
                            ...formData,
                            riskComfort: preset,
                            customRisk: "",
                          })
                        }
                        className="flex-1"
                      >
                        ₹{preset}
                      </Button>
                    ))}
                  </div>
                  <div className="mt-2">
                    <Input
                      type="number"
                      value={formData.customRisk}
                      onChange={(e) =>
                        setFormData({ ...formData, customRisk: e.target.value })
                      }
                      placeholder="Custom amount"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum planned loss for this trade: ₹
                    {riskAmount.toLocaleString()}
                  </p>
                </div>

                {/* Stop & Target (Optional) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="plannedStop">
                      Planned Stop{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                      id="plannedStop"
                      type="number"
                      step="0.01"
                      value={formData.plannedStop}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          plannedStop: e.target.value,
                        })
                      }
                      placeholder="Stop loss price"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="plannedTarget">
                      Planned Target{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                      id="plannedTarget"
                      type="number"
                      step="0.01"
                      value={formData.plannedTarget}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          plannedTarget: e.target.value,
                        })
                      }
                      placeholder="Target price"
                      className="mt-1.5"
                    />
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <Label htmlFor="reason">
                    Why this trade?{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    placeholder="Brief reason for entry..."
                    rows={3}
                    className="mt-1.5"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Risk Overview */}
            <RiskOverviewPanel
              accountRiskPercent={accountRiskPercent}
              plannedRisk={riskAmount}
              actualRisk={actualRisk}
            />
          </div>
        )}

        {/* STEP 3: EXECUTION */}
        {currentStep === "execution" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Execution Method</CardTitle>
                <CardDescription>
                  Choose how you want to execute this trade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BrokerSelector
                  selectedBroker={formData.selectedBroker}
                  onBrokerSelect={(broker) =>
                    setFormData({ ...formData, selectedBroker: broker })
                  }
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* STEP 4: REVIEW */}
        {currentStep === "review" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Your Trade</CardTitle>
                <CardDescription>
                  Please review all details before submitting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Trade Details Summary */}
                <div>
                  <h3 className="font-semibold mb-3">Trade Details</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Symbol</p>
                      <p className="font-medium">
                        {formData.symbol} ({formData.exchange})
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium">
                        {formData.instrumentType} {formData.type.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Quantity</p>
                      <p className="font-medium">{formData.quantity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Entry Price</p>
                      <p className="font-medium">
                        ₹{parseFloat(formData.entryPrice).toFixed(2)}
                      </p>
                    </div>
                    {formData.plannedStop && (
                      <div>
                        <p className="text-muted-foreground">Stop Loss</p>
                        <p className="font-medium">
                          ₹{parseFloat(formData.plannedStop).toFixed(2)}
                        </p>
                      </div>
                    )}
                    {formData.plannedTarget && (
                      <div>
                        <p className="text-muted-foreground">Target</p>
                        <p className="font-medium">
                          ₹{parseFloat(formData.plannedTarget).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Commitment Summary */}
                <div>
                  <h3 className="font-semibold mb-3">Commitment</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Confidence</p>
                      <p className="font-medium">{formData.confidence}/5</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Risk Comfort</p>
                      <p className="font-medium">
                        ₹{riskAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Execution Method */}
                <div>
                  <h3 className="font-semibold mb-3">Execution</h3>
                  <p className="text-sm">
                    {formData.selectedBroker ? (
                      <span>
                        Will execute via{" "}
                        <span className="font-medium capitalize">
                          {formData.selectedBroker}
                        </span>
                      </span>
                    ) : (
                      <span>Manual journal entry (no broker execution)</span>
                    )}
                  </p>
                </div>

                {formData.reason && (
                  <div>
                    <h3 className="font-semibold mb-2">Reason</h3>
                    <p className="text-sm text-muted-foreground">
                      {formData.reason}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={currentStep === "setup" ? onCancel : handleBack}
        >
          {currentStep === "setup" ? "Cancel" : "Back"}
        </Button>

        {currentStep === "review" ? (
          <Button onClick={handleSubmitTrade} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Trade"}
          </Button>
        ) : (
          <Button onClick={handleNext}>Continue</Button>
        )}
      </div>
    </div>
  );
}
