import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  Event,
} from "react-big-calendar";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addMonths,
  subMonths,
} from "date-fns";
import { enUS } from "date-fns/locale";
import {
  TradeResponse,
  MonthTradesResponse,
  TradesMetadataResponse,
} from "@/api/trades";
import { formatCurrency } from "@/lib/mockData";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar-styles.css";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "en-US": enUS },
});

interface TradeEvent extends Event {
  resource: TradeResponse;
}

interface TradeCalendarViewProps {
  monthData: MonthTradesResponse | undefined;
  metadata: TradesMetadataResponse | undefined;
  isLoading: boolean;
  currentMonth: Date;
  onMonthChange: (year: number, month: number) => void;
  onSelectTrade: (tradeId: string) => void;
  isMobile: boolean;
}

export function TradeCalendarView({
  monthData,
  metadata,
  isLoading,
  currentMonth,
  onMonthChange,
  onSelectTrade,
  isMobile,
}: TradeCalendarViewProps) {
  // Map trades to calendar events
  const events: TradeEvent[] = useMemo(() => {
    if (!monthData) return [];

    return monthData.trades.map((trade) => ({
      title: `${trade.symbol} ${formatCurrency(trade.profitLoss || 0)}`,
      start: new Date(trade.closedAt || trade.createdAt),
      end: new Date(trade.closedAt || trade.createdAt),
      resource: trade,
    }));
  }, [monthData]);

  // Check if navigation is disabled
  const canNavigatePrev = useMemo(() => {
    if (!metadata || !metadata.availableMonths.length) return true;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    return metadata.availableMonths.some(
      (m) => m.year < year || (m.year === year && m.month < month)
    );
  }, [metadata, currentMonth]);

  const canNavigateNext = useMemo(() => {
    if (!metadata || !metadata.availableMonths.length) return true;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    return metadata.availableMonths.some(
      (m) => m.year > year || (m.year === year && m.month > month)
    );
  }, [metadata, currentMonth]);

  const handleNavigate = useCallback(
    (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      onMonthChange(year, month);
    },
    [onMonthChange]
  );

  const handlePrevMonth = () => {
    if (canNavigatePrev) {
      const prev = subMonths(currentMonth, 1);
      handleNavigate(prev);
    }
  };

  const handleNextMonth = () => {
    if (canNavigateNext) {
      const next = addMonths(currentMonth, 1);
      handleNavigate(next);
    }
  };

  // Custom event style
  const eventPropGetter = useCallback((event: TradeEvent) => {
    const backgroundColor =
      event.resource.result === "win" ? "#22c55e" : "#ef4444";
    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.9,
        color: "white",
        border: "none",
        display: "block",
      },
    };
  }, []);

  // Mobile fallback
  if (isMobile) {
    return (
      <div className="py-8">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Calendar view is best viewed on larger screens. Please switch to
            List or Grid view on mobile.
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Custom Toolbar */}
      <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevMonth}
              disabled={!canNavigatePrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold min-w-[150px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
              disabled={!canNavigateNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {monthData && (
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Net P&L: </span>
              <span
                className={`font-semibold ${
                  monthData.monthTotal >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(monthData.monthTotal)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">
                {monthData.winCount}W / {monthData.lossCount}L
              </span>
            </div>
            {metadata && (
              <div>
                <span className="text-muted-foreground">Total trades: </span>
                <span className="font-semibold">{metadata.totalTrades}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Calendar */}
      <div
        className="bg-card rounded-lg border p-4"
        style={{ height: "600px" }}
      >
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          onSelectEvent={(event: TradeEvent) =>
            onSelectTrade(event.resource.id)
          }
          eventPropGetter={eventPropGetter}
          views={["month"]}
          defaultView="month"
          date={currentMonth}
          onNavigate={handleNavigate}
          toolbar={false} // We use custom toolbar
        />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span>Winning trades</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span>Losing trades</span>
        </div>
      </div>
    </div>
  );
}
