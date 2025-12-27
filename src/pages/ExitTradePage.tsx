import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useTrades } from "@/context/TradeContext";
import { Trade } from "@/lib/mockData";
import { formatCurrency } from "@/lib/mockData";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { checkPlanAdherence } from "@/utils/planAdherence";
import { RuleBreachModal } from "@/components/trade/RuleBreachModal";

const exitReasons: { id: Trade["exitReason"]; label: string }[] = [
  { id: "target", label: "Target hit" },
  { id: "stop", label: "Stop hit" },
  { id: "fear", label: "Fear" },
  { id: "unsure", label: "Unsure" },
  { id: "impulse", label: "Impulse" },
];

const emotions = [
  { id: "fear", label: "😰 Fear" },
  { id: "neutral", label: "😐 Neutral" },
  { id: "confident", label: "😄 Confident" },
] as const;

const closingMessages = [
  "This trade is done. The next one deserves a fresh start.",
  "You don't need to trade again immediately.",
  "Take a breath before the next decision.",
];

export default function ExitTradePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTradeById, closeTrade } = useTrades();

  const [selectedReason, setSelectedReason] = useState<Trade["exitReason"]>();
  const [exitPrice, setExitPrice] = useState("");
  const [exitDate, setExitDate] = useState("");
  const [exitTime, setExitTime] = useState("");
  const [selectedEmotions, setSelectedEmotions] = useState<
    ("fear" | "neutral" | "confident")[]
  >([]);
  const [reflectionNote, setReflectionNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRuleBreachModal, setShowRuleBreachModal] = useState(false);
  const [ruleBreachData, setRuleBreachData] = useState<{
    ruleBreaches: Array<{ ruleId: string; ruleType: string; message: string }>;
    nudgeMessage?: string;
  } | null>(null);
  const [tradeClosed, setTradeClosed] = useState(false);
  const [savedTrade, setSavedTrade] = useState<Trade | null>(null);
  const { toast } = useToast();

  const currentTrade = getTradeById(id || "");
  const trade = currentTrade || savedTrade;

  // Save trade data when it's first loaded to prevent "trade not found" error after closing
  useEffect(() => {
    if (currentTrade && !savedTrade && currentTrade.status === "open") {
      setSavedTrade(currentTrade);
    }
  }, [currentTrade, savedTrade]);

  // Initialize exit date/time to current if not set
  useMemo(() => {
    if (!exitDate && !exitTime) {
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      const timeStr = now.toTimeString().slice(0, 5);
      setExitDate(dateStr);
      setExitTime(timeStr);
    }
  }, [exitDate, exitTime]);

  // Calculate profit/loss when exit price is entered
  const calculatedProfitLoss = useMemo(() => {
    if (!trade || !exitPrice) return null;
    const exitPriceNum = parseFloat(exitPrice);
    if (isNaN(exitPriceNum) || exitPriceNum <= 0) return null;

    const priceDifference = exitPriceNum - trade.entryPrice;
    const profitLoss =
      trade.type === "buy"
        ? priceDifference * trade.quantity
        : -priceDifference * trade.quantity;

    return profitLoss;
  }, [trade, exitPrice]);

  // Check plan adherence - PRIMARY: Compare exit price to planned price
  // Exit reason is secondary context, price is the truth
  const planAdherence = useMemo(() => {
    if (!trade || !exitPrice) return null;
    const exitPriceNum = parseFloat(exitPrice);
    if (isNaN(exitPriceNum) || exitPriceNum <= 0) return null;

    // If no planned stop or target, we can't determine adherence
    if (!trade.plannedStop && !trade.plannedTarget) {
      return "no_plan";
    }

    const isBuy = trade.type === "buy";
    const tolerance = 0.05; // 5% tolerance for price matching (more realistic)

    // PRIMARY CHECK: Compare exit price to planned target/stop
    // This is the source of truth, not the exit reason

    if (trade.plannedTarget) {
      const priceDiff = Math.abs(exitPriceNum - trade.plannedTarget);
      const toleranceAmount = trade.plannedTarget * tolerance;

      if (isBuy) {
        // BUY trade: higher price = better
        if (exitPriceNum >= trade.plannedTarget - toleranceAmount) {
          // Exited at or above target (within tolerance) = followed plan
          return "followed";
        } else {
          // Exited below target = deviated from plan
          return "deviated";
        }
      } else {
        // SELL trade: lower price = better
        if (exitPriceNum <= trade.plannedTarget + toleranceAmount) {
          // Exited at or below target (within tolerance) = followed plan
          return "followed";
        } else {
          // Exited above target = deviated from plan
          return "deviated";
        }
      }
    }

    if (trade.plannedStop) {
      const priceDiff = Math.abs(exitPriceNum - trade.plannedStop);
      const toleranceAmount = trade.plannedStop * tolerance;

      if (isBuy) {
        // BUY trade: if exited at/below stop, that's hitting stop = followed
        // If exited way above stop, might be deviation (should have hit target)
        if (exitPriceNum <= trade.plannedStop + toleranceAmount) {
          return "followed"; // Hit stop as planned
        } else {
          // Exited way above stop - check if there was a target
          if (trade.plannedTarget && exitPriceNum < trade.plannedTarget) {
            // Between stop and target - reasonable, not a deviation
            return "followed";
          }
          // Way above stop and no target or above target - unclear, but not a clear deviation
          return "followed";
        }
      } else {
        // SELL trade: if exited at/above stop, that's hitting stop = followed
        // If exited way below stop, might be deviation
        if (exitPriceNum >= trade.plannedStop - toleranceAmount) {
          return "followed"; // Hit stop as planned
        } else {
          // Exited way below stop - check if there was a target
          if (trade.plannedTarget && exitPriceNum > trade.plannedTarget) {
            // Between stop and target - reasonable, not a deviation
            return "followed";
          }
          // Way below stop and no target or below target - unclear, but not a clear deviation
          return "followed";
        }
      }
    }

    return "no_plan";
  }, [trade, exitPrice]);

  // Select random closing message
  const closingMessage = useMemo(() => {
    return closingMessages[Math.floor(Math.random() * closingMessages.length)];
  }, []);

  // Don't show "trade not found" if we just closed it and are showing the modal
  if ((!trade || trade.status === "closed") && !tradeClosed) {
    return (
      <AppLayout>
        <div className="page-container">
          <p className="text-muted-foreground">
            Trade not found or already closed
          </p>
          <Link
            to="/today"
            className="text-primary hover:underline mt-4 inline-block"
          >
            Back to Today
          </Link>
        </div>
      </AppLayout>
    );
  }

  // If trade was just closed and no modal to show, navigate away
  if (tradeClosed && !showRuleBreachModal && savedTrade) {
    // Small delay to ensure state is updated
    setTimeout(() => navigate("/today"), 100);
    return null;
  }

  const isValid =
    selectedReason &&
    exitPrice &&
    parseFloat(exitPrice) > 0 &&
    selectedEmotions.length > 0;

  const handleEmotionToggle = (emotion: "fear" | "neutral" | "confident") => {
    setSelectedEmotions((prev) =>
      prev.includes(emotion)
        ? prev.filter((e) => e !== emotion)
        : [...prev, emotion]
    );
  };

  const handleCloseRuleBreachModal = () => {
    setShowRuleBreachModal(false);
    setRuleBreachData(null);
    navigate("/today");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      setIsSubmitting(true);

      // Combine date and time into ISO string
      let closedAtISO: string | undefined;
      if (exitDate && exitTime) {
        const dateTime = new Date(`${exitDate}T${exitTime}`);
        if (!isNaN(dateTime.getTime())) {
          closedAtISO = dateTime.toISOString();
        }
      }

      const response = await closeTrade(
        trade.id,
        selectedReason!,
        parseFloat(exitPrice),
        reflectionNote || undefined,
        selectedEmotions,
        closedAtISO
      );

      // Mark trade as closed to prevent "trade not found" error
      setTradeClosed(true);

      // Show modal if rules breached, otherwise navigate to today
      if (response.ruleBreaches && response.ruleBreaches.length > 0) {
        setRuleBreachData({
          ruleBreaches: response.ruleBreaches,
          nudgeMessage: response.nudgeMessage,
        });
        setShowRuleBreachModal(true);
      } else {
        toast({
          title: "Trade completed",
          description: "Your trade has been closed.",
        });
        navigate("/today");
      }
    } catch (error) {
      toast({
        title: "Failed to close trade",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while closing the trade.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="page-container animate-fade-in">
        <header className="mb-6">
          <h1 className="page-title">Trade completed</h1>
          <p className="page-subtitle mt-1">
            {trade.symbol} · {trade.type.toUpperCase()}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="max-w-2xl">
          {/* Exit Details */}
          <div className="mb-8">
            {/* Trade Summary - Compact Grid */}
            <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="card-calm">
                <div className="text-xs text-muted-foreground mb-1">
                  Entry Price
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(trade.entryPrice)}
                </p>
              </div>
              <div className="card-calm">
                <div className="text-xs text-muted-foreground mb-1">
                  Quantity
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {trade.quantity}
                </p>
              </div>
              {trade.plannedStop && (
                <div className="card-calm">
                  <div className="text-xs text-muted-foreground mb-1">
                    Planned Stop
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {formatCurrency(trade.plannedStop)}
                  </p>
                </div>
              )}
              {trade.plannedTarget && (
                <div className="card-calm">
                  <div className="text-xs text-muted-foreground mb-1">
                    Planned Target
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {formatCurrency(trade.plannedTarget)}
                  </p>
                </div>
              )}
            </div>

            {/* Exit Price, Date/Time, and Emotions */}
            <div className="space-y-4 mb-6">
              <div>
                <Label
                  htmlFor="exitPrice"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Exit Price <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="exitPrice"
                  type="number"
                  step="0.01"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  placeholder="Enter exit price"
                  className="h-10 w-full"
                  min="0.01"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="exitDate"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Exit Date{" "}
                    <span className="text-muted-foreground font-normal text-xs">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="exitDate"
                    type="date"
                    value={exitDate}
                    onChange={(e) => setExitDate(e.target.value)}
                    className="h-10 w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    When did you actually exit this trade?
                  </p>
                </div>
                <div>
                  <Label
                    htmlFor="exitTime"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Exit Time{" "}
                    <span className="text-muted-foreground font-normal text-xs">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="exitTime"
                    type="time"
                    value={exitTime}
                    onChange={(e) => setExitTime(e.target.value)}
                    className="h-10 w-full"
                  />
                </div>
              </div>

              <div>
                <Label className="block text-sm font-medium text-foreground mb-3">
                  How did you feel at exit?{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2 flex-wrap">
                  {emotions.map((emotion) => {
                    const isSelected = selectedEmotions.includes(emotion.id);
                    return (
                      <button
                        key={emotion.id}
                        type="button"
                        onClick={() => handleEmotionToggle(emotion.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {emotion.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Muted P&L Display */}
            {exitPrice &&
              parseFloat(exitPrice) > 0 &&
              calculatedProfitLoss !== null && (
                <div className="card-calm border border-border/50 bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">
                    {calculatedProfitLoss > 0
                      ? "Profit"
                      : calculatedProfitLoss < 0
                      ? "Loss"
                      : "Break Even"}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-xl font-semibold ${
                        calculatedProfitLoss > 0
                          ? "text-success"
                          : calculatedProfitLoss < 0
                          ? "text-destructive/70"
                          : "text-foreground"
                      }`}
                    >
                      {calculatedProfitLoss > 0 ? "+" : ""}
                      {formatCurrency(calculatedProfitLoss)}
                    </span>
                  </div>
                </div>
              )}
          </div>

          {/* Reflection (Conditional) - Only show if we have exit price and reason */}
          {planAdherence &&
            planAdherence !== "no_plan" &&
            exitPrice && (
              <div className="mb-8">
                {/* Plan Adherence Context (Judgment-Free) */}
                <div className="card-calm mb-4 bg-muted/20">
                  <p className="text-sm text-foreground">
                    {(() => {
                      const exitPriceNum = parseFloat(exitPrice);
                      let plannedPrice = trade.plannedStop || 0;
                      if (exitPriceNum > trade.plannedStop) {
                        plannedPrice = trade.plannedTarget;
                      }
                      const isBuy = trade.type === "buy";
                      const tolerance = plannedPrice * 0.02; // 2% tolerance
                      const priceDiff = Math.abs(exitPriceNum - plannedPrice);
                      const isClose = priceDiff <= tolerance;
                      const isBetter = isBuy
                        ? exitPriceNum > plannedPrice
                        : exitPriceNum < plannedPrice;

                      if (planAdherence === "followed") {
                        // If price is close to planned (within tolerance), say "and you did"
                        if (isClose) {
                          return `You planned to exit at ${formatCurrency(
                            plannedPrice
                          )}, and you exited at ${formatCurrency(
                            exitPriceNum
                          )}.`;
                        } else if (isBetter && trade.plannedTarget) {
                          // Better than planned
                          return `You planned to exit at ${formatCurrency(
                            plannedPrice
                          )}, and you exited at ${formatCurrency(
                            exitPriceNum
                          )} — better than planned.`;
                        } else {
                          // Followed plan but not exactly at price (e.g., hit stop but price was close)
                          return `You planned to exit at ${formatCurrency(
                            plannedPrice
                          )}, and you exited at ${formatCurrency(
                            exitPriceNum
                          )}.`;
                        }
                      } else {
                        // Deviated from plan
                        return `You planned to exit at ${formatCurrency(
                          plannedPrice
                        )}, but exited at ${formatCurrency(exitPriceNum)}.`;
                      }
                    })()}
                  </p>
                </div>

                {/* Reflection Prompt */}
                <div>
                  <Label
                    htmlFor="reflectionNote"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    {(() => {
                      const exitPriceNum = parseFloat(exitPrice);
                      const plannedPrice =
                        trade.plannedTarget || trade.plannedStop || 0;
                      const isBuy = trade.type === "buy";
                      const isBetter = isBuy
                        ? exitPriceNum > plannedPrice
                        : exitPriceNum < plannedPrice;

                      if (planAdherence === "followed") {
                        if (
                          selectedReason === "target" ||
                          selectedReason === "stop"
                        ) {
                          return "What helped you stay aligned this time?";
                        } else if (isBetter && trade.plannedTarget) {
                          return "What helped you exit at a better price?";
                        } else {
                          return "What helped you stay aligned this time?";
                        }
                      } else {
                        return "What pulled you away from your plan?";
                      }
                    })()}
                    <span className="text-muted-foreground font-normal text-xs ml-2">
                      (optional)
                    </span>
                  </Label>
                  <textarea
                    id="reflectionNote"
                    value={reflectionNote}
                    onChange={(e) => setReflectionNote(e.target.value)}
                    placeholder={(() => {
                      const exitPriceNum = parseFloat(exitPrice);
                      const plannedPrice =
                        trade.plannedTarget || trade.plannedStop || 0;
                      const isBuy = trade.type === "buy";
                      const isBetter = isBuy
                        ? exitPriceNum > plannedPrice
                        : exitPriceNum < plannedPrice;

                      if (planAdherence === "followed") {
                        if (
                          selectedReason === "target" ||
                          selectedReason === "stop"
                        ) {
                          return "One thing I want to repeat…";
                        } else if (isBetter && trade.plannedTarget) {
                          return "What worked well this time…";
                        } else {
                          return "One thing I want to repeat…";
                        }
                      } else {
                        return "Just a short note…";
                      }
                    })()}
                    rows={3}
                    className="input-calm w-full resize-none"
                  />
                </div>
              </div>
            )}

          {/* Exit Reason and Closing */}
          <div className="mb-6">
            {/* Exit Reason */}
            <div className="mb-4">
              <Label className="block text-sm font-medium text-foreground mb-3">
                Why did you exit? <span className="text-destructive">*</span>
              </Label>
              <div className="space-y-2">
                {exitReasons.map((reason) => (
                  <button
                    key={reason.id}
                    type="button"
                    onClick={() => setSelectedReason(reason.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedReason === reason.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {reason.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Closing Message */}
            <div className="card-calm border-l-4 border-l-primary/30 bg-primary/5 mb-4">
              <p className="text-sm text-foreground italic">{closingMessage}</p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Link
              to={`/trade/${trade.id}`}
              className="btn-secondary flex-1 text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                  Closing...
                </>
              ) : (
                "Done"
              )}
            </button>
          </div>
        </form>

        {/* Rule Breach Modal */}
        {ruleBreachData && (
          <RuleBreachModal
            open={showRuleBreachModal}
            onClose={handleCloseRuleBreachModal}
            ruleBreaches={ruleBreachData.ruleBreaches}
            nudgeMessage={ruleBreachData.nudgeMessage}
          />
        )}
      </div>
    </AppLayout>
  );
}
