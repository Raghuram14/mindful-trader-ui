import { useState, useEffect, useCallback } from "react";
import {
  Check,
  ChevronsUpDown,
  Search,
  RefreshCw,
  Keyboard,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { brokerApi, type InstrumentSearchResult } from "@/api/broker";
import { useDebounce } from "@/hooks/useDebounce";

interface SymbolComboboxProps {
  value: string;
  onChange: (symbol: string, instrument?: InstrumentSearchResult) => void;
  exchange?: "NSE" | "BSE";
  onExchangeChange?: (exchange: "NSE" | "BSE") => void;
  broker?: string;
  brokerConnected?: boolean; // Optional: if false, show manual mode by default
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function SymbolCombobox({
  value,
  onChange,
  exchange = "NSE",
  onExchangeChange,
  broker = "zerodha",
  brokerConnected = true, // Default to true for backward compatibility
  disabled = false,
  placeholder = "Search symbol...",
  className,
}: SymbolComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [instruments, setInstruments] = useState<InstrumentSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isManualMode, setIsManualMode] = useState(!brokerConnected);
  const [manualInput, setManualInput] = useState(value || "");

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Update manual mode if broker connection changes
  useEffect(() => {
    if (!brokerConnected) {
      setIsManualMode(true);
    }
  }, [brokerConnected]);

  // Sync manual input with value prop
  useEffect(() => {
    if (value && isManualMode) {
      setManualInput(value);
    }
  }, [value, isManualMode]);

  // Search instruments when debounced query changes
  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) {
      setInstruments([]);
      return;
    }

    const searchInstruments = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await brokerApi.searchInstruments(
          broker,
          debouncedSearch,
          exchange
        );
        setInstruments(result.instruments);
      } catch (err: any) {
        console.error("Error searching instruments:", err);
        setError(err.message || "Failed to search instruments");
        setInstruments([]);
      } finally {
        setLoading(false);
      }
    };

    searchInstruments();
  }, [debouncedSearch, exchange, broker]);

  const handleSelect = (instrument: InstrumentSearchResult) => {
    onChange(instrument.tradingsymbol, instrument);
    setOpen(false);
    setSearchQuery("");
  };

  // Handle manual symbol entry
  const handleManualSubmit = useCallback(() => {
    const trimmedSymbol = manualInput.trim().toUpperCase();
    if (trimmedSymbol) {
      onChange(trimmedSymbol, undefined);
    }
  }, [manualInput, onChange]);

  // Handle using search query as manual entry when no results found
  const handleUseAsManual = useCallback(() => {
    const symbol = searchQuery.trim().toUpperCase();
    if (symbol) {
      onChange(symbol, undefined);
      setOpen(false);
      setSearchQuery("");
    }
  }, [searchQuery, onChange]);

  // Toggle between search and manual mode
  const toggleManualMode = useCallback(() => {
    setIsManualMode((prev) => !prev);
    setSearchQuery("");
    setError(null);
  }, []);

  const handleRefresh = async () => {
    if (!searchQuery) return;

    try {
      setLoading(true);
      setError(null);
      const result = await brokerApi.searchInstruments(
        broker,
        searchQuery,
        exchange,
        true // force refresh
      );
      setInstruments(result.instruments);
    } catch (err: any) {
      console.error("Error refreshing instruments:", err);
      setError(err.message || "Failed to refresh instruments");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex gap-2", className)}>
      {/* Manual Mode - Simple Input */}
      {isManualMode ? (
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Input
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value.toUpperCase())}
              onBlur={handleManualSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleManualSubmit();
                }
              }}
              placeholder="Enter symbol (e.g., RELIANCE)"
              className="uppercase"
              disabled={disabled}
            />
            {!brokerConnected && (
              <span
                className="absolute right-2 top-1/2 -translate-y-1/2"
                title="Broker not connected"
              >
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </span>
            )}
          </div>
          {brokerConnected && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={toggleManualMode}
              disabled={disabled}
              title="Switch to search mode"
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        /* Search Mode - Combobox */
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="flex-1 justify-between"
              disabled={disabled}
            >
              {value || placeholder}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command shouldFilter={false}>
              <div className="flex items-center border-b px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <CommandInput
                  placeholder="Type symbol or company name..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  className="flex-1"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={loading}
                    className="h-8 w-8 p-0"
                  >
                    <RefreshCw
                      className={cn("h-4 w-4", loading && "animate-spin")}
                    />
                  </Button>
                )}
              </div>
              <CommandList>
                {loading && (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Searching...
                  </div>
                )}
                {error && (
                  <div className="py-4 text-center">
                    <p className="text-sm text-destructive mb-2">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleManualMode}
                      className="text-xs"
                    >
                      <Keyboard className="mr-1 h-3 w-3" />
                      Enter symbol manually
                    </Button>
                  </div>
                )}
                {!loading &&
                  !error &&
                  searchQuery.length > 0 &&
                  searchQuery.length < 2 && (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      Type at least 2 characters to search
                    </div>
                  )}
                {!loading &&
                  !error &&
                  searchQuery.length >= 2 &&
                  instruments.length === 0 && (
                    <CommandEmpty>
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground mb-3">
                          No symbols found for "{searchQuery}"
                        </p>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={handleUseAsManual}
                            className="text-xs"
                          >
                            <Keyboard className="mr-1 h-3 w-3" />
                            Use "{searchQuery.toUpperCase()}" anyway
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            className="text-xs"
                          >
                            <RefreshCw className="mr-1 h-3 w-3" />
                            Refresh symbol list
                          </Button>
                        </div>
                      </div>
                    </CommandEmpty>
                  )}
                {instruments.length > 0 && (
                  <CommandGroup>
                    {instruments.map((instrument) => (
                      <CommandItem
                        key={`${instrument.exchange}:${instrument.tradingsymbol}`}
                        value={instrument.tradingsymbol}
                        onSelect={() => handleSelect(instrument)}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === instrument.tradingsymbol
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <div className="flex-1 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {instrument.tradingsymbol}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {instrument.name}
                            </span>
                          </div>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {instrument.exchange}
                          </Badge>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}

      {/* Manual Mode Toggle - Only show when in search mode and broker is connected */}
      {!isManualMode && brokerConnected && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={toggleManualMode}
          disabled={disabled}
          title="Enter symbol manually"
        >
          <Keyboard className="h-4 w-4" />
        </Button>
      )}

      {/* Exchange Toggle */}
      {onExchangeChange && (
        <div className="flex border rounded-md overflow-hidden">
          <Button
            type="button"
            variant={exchange === "NSE" ? "default" : "ghost"}
            size="sm"
            onClick={() => onExchangeChange("NSE")}
            className="rounded-none px-4"
            disabled={disabled}
          >
            NSE
          </Button>
          <Button
            type="button"
            variant={exchange === "BSE" ? "default" : "ghost"}
            size="sm"
            onClick={() => onExchangeChange("BSE")}
            className="rounded-none px-4"
            disabled={disabled}
          >
            BSE
          </Button>
        </div>
      )}
    </div>
  );
}
