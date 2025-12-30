import { AlertCircle, X, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExternalExitNotificationProps {
  trade: {
    id: string;
    symbol: string;
    suggestedExitReason?: "target" | "stop" | "other";
    exitPrice?: number;
    entryPrice: number;
  };
  onComplete: (tradeId: string) => void;
  onDismiss: (tradeId: string) => void;
}

const REASON_LABELS = {
  target: { icon: "🎯", label: "Target Hit", color: "green" },
  stop: { icon: "🛑", label: "Stop Loss", color: "red" },
  other: { icon: "ℹ️", label: "Other", color: "blue" },
};

export function ExternalExitNotification({
  trade,
  onComplete,
  onDismiss,
}: ExternalExitNotificationProps) {
  const reasonData = trade.suggestedExitReason
    ? REASON_LABELS[trade.suggestedExitReason]
    : REASON_LABELS.other;

  const pnl = trade.exitPrice
    ? ((trade.exitPrice - trade.entryPrice) / trade.entryPrice) * 100
    : 0;

  return (
    <div
      className={cn(
        "relative bg-gradient-to-r p-4 rounded-lg border-2 shadow-lg animate-fade-in",
        reasonData.color === "green" &&
          "from-green-50 to-green-100 border-green-300 dark:from-green-950/30 dark:to-green-900/30 dark:border-green-800",
        reasonData.color === "red" &&
          "from-red-50 to-red-100 border-red-300 dark:from-red-950/30 dark:to-red-900/30 dark:border-red-800",
        reasonData.color === "blue" &&
          "from-blue-50 to-blue-100 border-blue-300 dark:from-blue-950/30 dark:to-blue-900/30 dark:border-blue-800"
      )}
    >
      <button
        onClick={() => onDismiss(trade.id)}
        className="absolute top-2 right-2 p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <AlertCircle
            className={cn(
              "w-6 h-6",
              reasonData.color === "green" && "text-green-600",
              reasonData.color === "red" && "text-red-600",
              reasonData.color === "blue" && "text-blue-600"
            )}
          />
        </div>

        <div className="flex-1 space-y-2">
          <div>
            <h3
              className={cn(
                "font-semibold mb-1",
                reasonData.color === "green" &&
                  "text-green-900 dark:text-green-100",
                reasonData.color === "red" && "text-red-900 dark:text-red-100",
                reasonData.color === "blue" &&
                  "text-blue-900 dark:text-blue-100"
              )}
            >
              External Exit Detected: {trade.symbol}
            </h3>
            <p
              className={cn(
                "text-sm",
                reasonData.color === "green" &&
                  "text-green-800 dark:text-green-200",
                reasonData.color === "red" && "text-red-800 dark:text-red-200",
                reasonData.color === "blue" &&
                  "text-blue-800 dark:text-blue-200"
              )}
            >
              This trade was closed in your broker account. We detected it as{" "}
              <strong>
                {reasonData.icon} {reasonData.label}
              </strong>
              {trade.exitPrice && (
                <>
                  {" "}
                  at ₹{trade.exitPrice.toFixed(2)} (
                  <span
                    className={cn(
                      "font-medium",
                      pnl >= 0 ? "text-green-700" : "text-red-700"
                    )}
                  >
                    {pnl >= 0 ? "+" : ""}
                    {pnl.toFixed(2)}%
                  </span>
                  )
                </>
              )}
              .
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onComplete(trade.id)}
              className={cn(
                "gap-1",
                reasonData.color === "green" &&
                  "bg-green-600 hover:bg-green-700 text-white",
                reasonData.color === "red" &&
                  "bg-red-600 hover:bg-red-700 text-white",
                reasonData.color === "blue" &&
                  "bg-blue-600 hover:bg-blue-700 text-white"
              )}
            >
              <Edit className="w-3 h-3" />
              Complete Exit Details
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDismiss(trade.id)}
              className={cn(
                reasonData.color === "green" &&
                  "hover:bg-green-200 dark:hover:bg-green-900",
                reasonData.color === "red" &&
                  "hover:bg-red-200 dark:hover:bg-red-900",
                reasonData.color === "blue" &&
                  "hover:bg-blue-200 dark:hover:bg-blue-900"
              )}
            >
              Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
