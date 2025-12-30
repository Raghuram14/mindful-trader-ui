import { TradeResponse } from "@/api/trades";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getConfidenceDisplay } from "@/lib/mockData";
import { formatDistanceToNow } from "date-fns";

interface TradeGridViewProps {
  trades: TradeResponse[];
  onSelectTrade: (tradeId: string) => void;
  isLoading?: boolean;
}

export function TradeGridView({
  trades,
  onSelectTrade,
  isLoading,
}: TradeGridViewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="p-4 animate-pulse">
            <div className="h-6 bg-muted rounded mb-3" />
            <div className="h-10 bg-muted rounded mb-3" />
            <div className="h-4 bg-muted rounded mb-2" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {trades.map((trade) => (
        <Card
          key={trade.id}
          className="p-4 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 focus:ring-2 focus:ring-primary"
          onClick={() => onSelectTrade(trade.id)}
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onSelectTrade(trade.id)}
        >
          {/* Symbol and Instrument Type */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-foreground">
              {trade.symbol}
            </h3>
            <div className="flex gap-1">
              <Badge variant="secondary" className="text-xs">
                {trade.instrumentType}
              </Badge>
              {trade.optionType && (
                <Badge variant="outline" className="text-xs">
                  {trade.optionType}
                </Badge>
              )}
            </div>
          </div>

          {/* P&L Display */}
          <div
            className={`p-3 rounded-lg border-l-4 mb-3 ${
              trade.result === "win"
                ? "bg-green-500/5 border-green-500"
                : "bg-red-500/5 border-red-500"
            }`}
          >
            <div
              className={`text-2xl font-bold ${
                trade.result === "win" ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(trade.profitLoss || 0)}
            </div>
            <div className="text-sm text-muted-foreground">
              {trade.profitLoss && trade.entryPrice
                ? `${(
                    (trade.profitLoss / (trade.entryPrice * trade.quantity)) *
                    100
                  ).toFixed(2)}%`
                : "—"}
            </div>
          </div>

          {/* Confidence and Date */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Confidence:</span>
              <span className="text-foreground">
                {getConfidenceDisplay(trade.confidence)}
              </span>
            </div>
            <span className="text-muted-foreground text-xs">
              {trade.closedAt &&
                formatDistanceToNow(new Date(trade.closedAt), {
                  addSuffix: true,
                })}
            </span>
          </div>

          {/* Exit Reason */}
          {trade.exitReason && (
            <div className="mt-3">
              <Badge
                variant="outline"
                className={`text-xs ${
                  trade.exitReason === "target"
                    ? "bg-green-500/10 text-green-700 border-green-500/30"
                    : trade.exitReason === "stop"
                    ? "bg-orange-500/10 text-orange-700 border-orange-500/30"
                    : "bg-muted"
                }`}
              >
                {trade.exitReason.charAt(0).toUpperCase() +
                  trade.exitReason.slice(1)}
              </Badge>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
