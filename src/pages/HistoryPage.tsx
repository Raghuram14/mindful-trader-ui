import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Filter as FilterIcon,
  Download,
  Keyboard,
  List,
  Calendar as CalendarIcon,
  ArrowUpDown,
  Upload,
} from "lucide-react";
import { tradesApi } from "@/api/trades";
import { useHistoryFilters } from "@/hooks/useHistoryFilters";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { KeyboardShortcutsDialog } from "@/components/trade/KeyboardShortcutsDialog";
import { HistoryFilterSheet } from "@/components/trade/HistoryFilterSheet";
import { TradeGridView } from "@/components/trade/TradeGridView";
import { TradeCalendarView } from "@/components/trade/TradeCalendarView";
import { TradeDetailModal } from "@/components/trade/TradeDetailModal";
import {
  NoClosedTrades,
  NoFilterResults,
  ErrorState,
} from "@/components/trade/EmptyStates";
import { exportTradesToCSV } from "@/utils/export";
import { useToast } from "@/hooks/use-toast";
import {
  formatCurrency,
  getConfidenceDisplay,
  analyzeTradeBehavior,
  formatTradeTime,
} from "@/lib/mockData";
import { format } from "date-fns";

// Hook to detect mobile
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useState(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  });

  return matches;
}

export default function HistoryPage() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter management
  const {
    filters,
    rawFilters,
    validationErrors,
    updateFilters,
    clearFilters,
    updatePage,
    setView,
    activeFilterCount,
    hasFilters,
  } = useHistoryFilters();

  // UI state
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Fetch paginated trades
  const {
    data: paginatedData,
    isLoading: isLoadingTrades,
    isError: isTradesError,
    refetch: refetchTrades,
  } = useQuery({
    queryKey: ["closedTradesPaginated", filters],
    queryFn: () => {
      const query = {
        skip: (filters.page - 1) * filters.limit,
        limit: filters.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        dateFrom: filters.dateFrom?.toISOString().split("T")[0],
        dateTo: filters.dateTo?.toISOString().split("T")[0],
        symbol: filters.symbol,
        result: filters.result === "all" ? undefined : filters.result,
        instrumentTypes:
          filters.instrumentTypes.length > 0
            ? filters.instrumentTypes
            : undefined,
        exitReasons:
          filters.exitReasons.length > 0 ? filters.exitReasons : undefined,
        emotions: filters.emotions.length > 0 ? filters.emotions : undefined,
        sources: filters.sources.length > 0 ? filters.sources : undefined,
        minPnL: filters.minPnL,
        maxPnL: filters.maxPnL,
      };
      return tradesApi.getClosedTradesPaginated(query);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch month trades for calendar view
  const currentMonth = new Date();
  const { data: monthData, isLoading: isLoadingMonth } = useQuery({
    queryKey: [
      "monthTrades",
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
    ],
    queryFn: () =>
      tradesApi.getMonthTrades(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1
      ),
    enabled: filters.view === "calendar",
    staleTime: 10 * 60 * 1000,
  });

  // Fetch metadata for calendar navigation
  const { data: metadata } = useQuery({
    queryKey: ["tradesMetadata"],
    queryFn: () => tradesApi.getTradesMetadata(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onOpenFilters: () => setFiltersOpen(true),
    onToggleView: (view) => setView(view),
    onNavigatePage: (direction) => {
      if (direction === "prev" && filters.page > 1) {
        updatePage(filters.page - 1);
      } else if (direction === "next" && paginatedData?.hasMore) {
        updatePage(filters.page + 1);
      }
    },
    onFocusSearch: () => searchInputRef.current?.focus(),
    onOpenHelp: () => setShortcutsOpen(true),
    enabled: !filtersOpen && !selectedTradeId,
  });

  // Handle export with confirmation
  const handleExport = async () => {
    if (!paginatedData) return;

    if (paginatedData.total > 1000) {
      setExportDialogOpen(true);
    } else {
      await exportTradesToCSV(filters, paginatedData.total, toast);
    }
  };

  const confirmExport = async () => {
    setExportDialogOpen(false);
    if (paginatedData) {
      await exportTradesToCSV(filters, paginatedData.total, toast);
    }
  };

  // Handle month change for calendar
  const handleMonthChange = (year: number, month: number) => {
    // This would need calendar month state management
    // For now, just a placeholder
    console.log("Navigate to:", year, month);
  };

  // Build active filters for empty state
  const activeFilters = [];
  if (filters.dateFrom)
    activeFilters.push({
      label: `From: ${format(filters.dateFrom, "MMM dd, yyyy")}`,
      onRemove: () => updateFilters({ dateFrom: undefined }),
    });
  if (filters.dateTo)
    activeFilters.push({
      label: `To: ${format(filters.dateTo, "MMM dd, yyyy")}`,
      onRemove: () => updateFilters({ dateTo: undefined }),
    });
  if (filters.symbol)
    activeFilters.push({
      label: `Symbol: ${filters.symbol}`,
      onRemove: () => updateFilters({ symbol: undefined }),
    });
  if (filters.result && filters.result !== "all")
    activeFilters.push({
      label: `Result: ${filters.result}`,
      onRemove: () => updateFilters({ result: "all" }),
    });

  // Show empty states
  if (isTradesError) {
    return (
      <AppLayout>
        <div className="page-container">
          <ErrorState onRetry={refetchTrades} />
        </div>
      </AppLayout>
    );
  }

  if (
    !isLoadingTrades &&
    paginatedData &&
    paginatedData.total === 0 &&
    !hasFilters
  ) {
    return (
      <AppLayout>
        <div className="page-container">
          <NoClosedTrades />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-container animate-fade-in">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="page-title">Trading History</h1>
              <p className="page-subtitle mt-1">
                {paginatedData && `${paginatedData.total} closed trades`}
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Tabs */}
            <Tabs value={filters.view} onValueChange={(v: any) => setView(v)}>
              <TabsList>
                <TabsTrigger value="list" className="gap-2">
                  <List className="w-4 h-4" />
                  List
                </TabsTrigger>
                <TabsTrigger value="calendar" className="gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Calendar
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex-1" />

            {/* Import Button */}
            <Link to="/import">
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="w-4 h-4" />
                Import
              </Button>
            </Link>

            {/* Filter Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersOpen(true)}
              className="gap-2"
            >
              <FilterIcon className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    updateFilters({ sortBy: "closedAt", sortOrder: "desc" })
                  }
                >
                  Date (Newest)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateFilters({ sortBy: "closedAt", sortOrder: "asc" })
                  }
                >
                  Date (Oldest)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateFilters({ sortBy: "profitLoss", sortOrder: "desc" })
                  }
                >
                  P&L (High to Low)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateFilters({ sortBy: "profitLoss", sortOrder: "asc" })
                  }
                >
                  P&L (Low to High)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateFilters({ sortBy: "symbol", sortOrder: "asc" })
                  }
                >
                  Symbol (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateFilters({ sortBy: "symbol", sortOrder: "desc" })
                  }
                >
                  Symbol (Z-A)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Export Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>

            {/* Shortcuts Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShortcutsOpen(true)}
              className="gap-2"
            >
              <Keyboard className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Content */}
        {filters.view === "list" && (
          <>
            {isLoadingTrades ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : paginatedData && paginatedData.trades.length > 0 ? (
              <>
                <div className="space-y-3 mb-6">
                  {paginatedData.trades.map((trade) => {
                    const behavior = analyzeTradeBehavior(trade as any);
                    return (
                      <button
                        key={trade.id}
                        onClick={() => setSelectedTradeId(trade.id)}
                        className="w-full text-left card-calm hover:shadow-lg hover:scale-[1.01] transition-all duration-200 cursor-pointer focus:ring-2 focus:ring-primary"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-semibold">
                              {trade.symbol}
                            </span>
                            <Badge variant="secondary">
                              {trade.instrumentType}
                            </Badge>
                            {trade.optionType && (
                              <Badge variant="outline">
                                {trade.optionType}
                              </Badge>
                            )}
                          </div>
                          <div
                            className={`text-right px-4 py-2.5 rounded-lg min-w-[140px] ${
                              trade.result === "win"
                                ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                : "bg-red-500/10 text-red-700 dark:text-red-400"
                            }`}
                          >
                            <div className="text-lg font-bold">
                              {formatCurrency(trade.profitLoss || 0)}
                            </div>
                            <div className="text-xs opacity-80">
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

                        <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
                          <span>Qty: {trade.quantity}</span>
                          <span>Entry: {formatCurrency(trade.entryPrice)}</span>
                          <span>
                            Exit:{" "}
                            {trade.exitPrice
                              ? formatCurrency(trade.exitPrice)
                              : "—"}
                          </span>
                          <span>{getConfidenceDisplay(trade.confidence)}</span>
                          {trade.closedAt && (
                            <span>{formatTradeTime(trade.closedAt)}</span>
                          )}
                        </div>

                        {behavior && (
                          <div className="mt-3 flex items-center gap-2 flex-wrap">
                            <Badge
                              variant={
                                behavior.followedPlan ? "default" : "outline"
                              }
                            >
                              {behavior.followedPlan
                                ? "Within Plan"
                                : "Deviated"}
                            </Badge>
                            {behavior.behavioralTag && (
                              <Badge variant="outline">
                                {behavior.behavioralTag}
                              </Badge>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Pagination */}
                <div className="mt-6 space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Showing {(filters.page - 1) * filters.limit + 1}-
                      {Math.min(
                        filters.page * filters.limit,
                        paginatedData.total
                      )}{" "}
                      of {paginatedData.total} trades
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              filters.page > 1 && updatePage(filters.page - 1)
                            }
                            className={
                              filters.page === 1
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>
                        {Array.from(
                          {
                            length: Math.min(
                              5,
                              Math.ceil(paginatedData.total / filters.limit)
                            ),
                          },
                          (_, i) => filters.page - 2 + i
                        )
                          .filter(
                            (p) =>
                              p > 0 &&
                              p <=
                                Math.ceil(paginatedData.total / filters.limit)
                          )
                          .map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => updatePage(page)}
                                isActive={page === filters.page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              paginatedData.hasMore &&
                              updatePage(filters.page + 1)
                            }
                            className={
                              !paginatedData.hasMore
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </div>
              </>
            ) : (
              <NoFilterResults
                activeFilters={activeFilters}
                onClearAll={clearFilters}
              />
            )}
          </>
        )}

        {filters.view === "calendar" && (
          <TradeCalendarView
            monthData={monthData}
            metadata={metadata}
            isLoading={isLoadingMonth}
            currentMonth={currentMonth}
            onMonthChange={handleMonthChange}
            onSelectTrade={setSelectedTradeId}
            isMobile={isMobile}
          />
        )}

        {/* Dialogs */}
        <HistoryFilterSheet
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          filters={rawFilters}
          onFiltersChange={updateFilters}
          onClearAll={clearFilters}
          activeFilterCount={activeFilterCount}
          validationErrors={validationErrors}
          isMobile={isMobile}
        />

        <KeyboardShortcutsDialog
          open={shortcutsOpen}
          onOpenChange={setShortcutsOpen}
        />

        <TradeDetailModal
          tradeId={selectedTradeId}
          open={!!selectedTradeId}
          onOpenChange={(open) => !open && setSelectedTradeId(null)}
        />

        <AlertDialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Export {paginatedData?.total} trades?
              </AlertDialogTitle>
              <AlertDialogDescription>
                You're about to export {paginatedData?.total.toLocaleString()}{" "}
                trades. This may take a moment. Continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmExport}>
                Export
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
