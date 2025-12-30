import { useQuery } from "@tanstack/react-query";
import { tradesApi } from "@/api/trades";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatCurrency,
  getConfidenceDisplay,
  analyzeTradeBehavior,
} from "@/lib/mockData";
import { format } from "date-fns";

interface TradeDetailModalProps {
  tradeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TradeDetailModal({
  tradeId,
  open,
  onOpenChange,
}: TradeDetailModalProps) {
  const { data: trade, isLoading } = useQuery({
    queryKey: ["trade", tradeId],
    queryFn: () => tradesApi.getTrade(tradeId!),
    enabled: !!tradeId && open,
  });

  const behavior = trade ? analyzeTradeBehavior(trade as any) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        {isLoading ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : trade ? (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <DialogTitle className="text-2xl">
                      {trade.symbol}
                    </DialogTitle>
                    <Badge variant="secondary">{trade.instrumentType}</Badge>
                    {trade.optionType && (
                      <Badge variant="outline">{trade.optionType}</Badge>
                    )}
                  </div>
                </div>
                <div
                  className={`text-right p-4 rounded-lg border-l-4 ${
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
                          (trade.profitLoss /
                            (trade.entryPrice * trade.quantity)) *
                          100
                        ).toFixed(2)}%`
                      : "—"}
                  </div>
                </div>
              </div>
            </DialogHeader>

            <Separator />

            <ScrollArea className="max-h-[60vh]">
              <div className="grid grid-cols-2 gap-6 p-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Entry Details */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                      Entry Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Price:
                        </span>
                        <span className="text-sm font-medium">
                          {formatCurrency(trade.entryPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Quantity:
                        </span>
                        <span className="text-sm font-medium">
                          {trade.quantity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Date:
                        </span>
                        <span className="text-sm font-medium">
                          {format(new Date(trade.createdAt), "MMM dd, yyyy")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Time:
                        </span>
                        <span className="text-sm font-medium">
                          {trade.tradeTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Exit Details */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                      Exit Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Price:
                        </span>
                        <span className="text-sm font-medium">
                          {trade.exitPrice
                            ? formatCurrency(trade.exitPrice)
                            : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Reason:
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            trade.exitReason === "target"
                              ? "bg-green-500/10 text-green-700"
                              : trade.exitReason === "stop"
                              ? "bg-orange-500/10 text-orange-700"
                              : ""
                          }
                        >
                          {trade.exitReason || "—"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Date:
                        </span>
                        <span className="text-sm font-medium">
                          {trade.closedAt
                            ? format(new Date(trade.closedAt), "MMM dd, yyyy")
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Confidence */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                      Confidence
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getConfidenceDisplay(trade.confidence)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({trade.confidence}/5)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Plan Adherence */}
                  {behavior && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                        Plan Adherence
                      </h3>
                      <Badge
                        variant={
                          behavior.followedPlan ? "default" : "destructive"
                        }
                        className="text-sm"
                      >
                        {behavior.followedPlan
                          ? "Within Plan"
                          : "Deviated from Plan"}
                      </Badge>
                    </div>
                  )}

                  {/* Behavioral Tag */}
                  {behavior?.behavioralTag && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                        Behavioral Pattern
                      </h3>
                      <Badge variant="outline" className="text-sm">
                        {behavior.behavioralTag}
                      </Badge>
                    </div>
                  )}

                  {/* Emotions */}
                  {trade.emotions && trade.emotions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                        Emotions
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {trade.emotions.map((emotion) => (
                          <Badge key={emotion} variant="secondary">
                            {emotion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {trade.exitNote && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                        Notes
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {trade.exitNote}
                      </p>
                    </div>
                  )}

                  {/* Source */}
                  {trade.source && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                        Source
                      </h3>
                      <Badge variant="outline">{trade.source}</Badge>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            Trade not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
