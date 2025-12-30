import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export interface FilterState {
  dateFrom?: Date;
  dateTo?: Date;
  symbol?: string;
  result?: "win" | "loss" | "all";
  instrumentTypes: string[];
  exitReasons: string[];
  emotions: string[];
  sources: string[];
  minPnL?: number;
  maxPnL?: number;
  page: number;
  limit: number;
  sortBy: "closedAt" | "profitLoss" | "symbol";
  sortOrder: "asc" | "desc";
  view: "list" | "grid" | "calendar";
}

const DEFAULT_FILTERS: FilterState = {
  instrumentTypes: [],
  exitReasons: [],
  emotions: [],
  sources: [],
  page: 1,
  limit: 20,
  sortBy: "closedAt",
  sortOrder: "desc",
  view: "list",
  result: "all",
};

export interface FilterValidationError {
  field: string;
  message: string;
}

export function useHistoryFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [debouncedSymbol, setDebouncedSymbol] = useState<string | undefined>();

  // Parse filters from URL
  const filters = useMemo((): FilterState => {
    const parsed: FilterState = { ...DEFAULT_FILTERS };

    // Date filters
    const dateFrom = searchParams.get("dateFrom");
    if (dateFrom) parsed.dateFrom = new Date(dateFrom);

    const dateTo = searchParams.get("dateTo");
    if (dateTo) parsed.dateTo = new Date(dateTo);

    // Symbol search
    const symbol = searchParams.get("symbol");
    if (symbol) parsed.symbol = symbol;

    // Result filter
    const result = searchParams.get("result");
    if (result === "win" || result === "loss") parsed.result = result;

    // Array filters
    const instrumentTypes = searchParams.get("instrumentTypes");
    if (instrumentTypes) parsed.instrumentTypes = instrumentTypes.split(",");

    const exitReasons = searchParams.get("exitReasons");
    if (exitReasons) parsed.exitReasons = exitReasons.split(",");

    const emotions = searchParams.get("emotions");
    if (emotions) parsed.emotions = emotions.split(",");

    const sources = searchParams.get("sources");
    if (sources) parsed.sources = sources.split(",");

    // P&L range
    const minPnL = searchParams.get("minPnL");
    if (minPnL) parsed.minPnL = parseFloat(minPnL);

    const maxPnL = searchParams.get("maxPnL");
    if (maxPnL) parsed.maxPnL = parseFloat(maxPnL);

    // Pagination & sorting
    const page = searchParams.get("page");
    if (page) parsed.page = parseInt(page);

    const sortBy = searchParams.get("sortBy");
    if (
      sortBy === "closedAt" ||
      sortBy === "profitLoss" ||
      sortBy === "symbol"
    ) {
      parsed.sortBy = sortBy;
    }

    const sortOrder = searchParams.get("sortOrder");
    if (sortOrder === "asc" || sortOrder === "desc") {
      parsed.sortOrder = sortOrder;
    }

    // View
    const view = searchParams.get("view");
    if (view === "list" || view === "grid" || view === "calendar") {
      parsed.view = view;
    }

    return parsed;
  }, [searchParams]);

  // Debounce symbol search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSymbol(filters.symbol);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.symbol]);

  // Validate filters
  const validationErrors = useMemo((): FilterValidationError[] => {
    const errors: FilterValidationError[] = [];

    if (
      filters.dateFrom &&
      filters.dateTo &&
      filters.dateFrom > filters.dateTo
    ) {
      errors.push({
        field: "dateRange",
        message: "Start date must be before end date",
      });
    }

    if (
      filters.minPnL !== undefined &&
      filters.maxPnL !== undefined &&
      filters.minPnL > filters.maxPnL
    ) {
      errors.push({
        field: "pnlRange",
        message: "Minimum P&L must be less than maximum P&L",
      });
    }

    return errors;
  }, [filters]);

  // Update filters (only non-default values)
  const updateFilters = (partial: Partial<FilterState>) => {
    const newParams = new URLSearchParams(searchParams);

    Object.entries(partial).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0) ||
        value === DEFAULT_FILTERS[key as keyof FilterState]
      ) {
        newParams.delete(key);
      } else if (value instanceof Date) {
        newParams.set(key, value.toISOString().split("T")[0]);
      } else if (Array.isArray(value)) {
        newParams.set(key, value.join(","));
      } else {
        newParams.set(key, value.toString());
      }
    });

    // Reset to page 1 if filters changed (not pagination)
    if (partial.page === undefined) {
      newParams.delete("page");
    }

    setSearchParams(newParams);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchParams(
      new URLSearchParams({
        view: filters.view, // Preserve view
      })
    );
  };

  // Update page
  const updatePage = (page: number) => {
    updateFilters({ page });
  };

  // Set view
  const setView = (view: FilterState["view"]) => {
    updateFilters({ view });
  };

  // Apply preset
  const applyPreset = (presetFilters: Partial<FilterState>) => {
    updateFilters(presetFilters);
  };

  // Count active filters (excluding page, view)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.symbol) count++;
    if (filters.result && filters.result !== "all") count++;
    if (filters.instrumentTypes.length > 0) count++;
    if (filters.exitReasons.length > 0) count++;
    if (filters.emotions.length > 0) count++;
    if (filters.sources.length > 0) count++;
    if (filters.minPnL !== undefined) count++;
    if (filters.maxPnL !== undefined) count++;
    return count;
  }, [filters]);

  return {
    filters: { ...filters, symbol: debouncedSymbol }, // Use debounced symbol for API calls
    rawFilters: filters, // Non-debounced for UI
    validationErrors,
    updateFilters,
    clearFilters,
    updatePage,
    setView,
    applyPreset,
    activeFilterCount,
    hasFilters: activeFilterCount > 0,
  };
}
