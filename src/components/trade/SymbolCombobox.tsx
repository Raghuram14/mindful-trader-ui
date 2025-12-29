import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Search, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  disabled = false,
  placeholder = "Search symbol...",
  className,
}: SymbolComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [instruments, setInstruments] = useState<InstrumentSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

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
                <div className="py-6 text-center text-sm text-destructive">
                  {error}
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
                      <p className="text-sm text-muted-foreground mb-2">
                        No symbols found for "{searchQuery}"
                      </p>
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
