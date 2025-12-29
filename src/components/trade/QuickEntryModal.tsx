import { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { SymbolCombobox } from "./SymbolCombobox";
import type { InstrumentSearchResult } from "@/api/broker";

interface QuickEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: QuickTradeData) => Promise<void>;
}

export interface QuickTradeData {
  instrumentType: "STOCK" | "FUTURES" | "OPTIONS";
  symbol: string;
  exchange: "NSE" | "BSE";
  quantity: string;
  entryPrice: string;
  plannedStop?: string;
}

const RECENT_SYMBOLS_KEY = "mindfultrade_recent_symbols";
const MAX_RECENT = 10;

// Get recent symbols from localStorage
const getRecentSymbols = (): string[] => {
  try {
    const stored = localStorage.getItem(RECENT_SYMBOLS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save symbol to recent list
const saveRecentSymbol = (symbol: string) => {
  try {
    const recent = getRecentSymbols();
    const updated = [symbol, ...recent.filter((s) => s !== symbol)].slice(
      0,
      MAX_RECENT
    );
    localStorage.setItem(RECENT_SYMBOLS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving recent symbol:", error);
  }
};

export function QuickEntryModal({
  open,
  onOpenChange,
  onSubmit,
}: QuickEntryModalProps) {
  const [formData, setFormData] = useState<QuickTradeData>({
    instrumentType: "STOCK",
    symbol: "",
    exchange: "NSE",
    quantity: "",
    entryPrice: "",
    plannedStop: "",
  });

  const [recentSymbols, setRecentSymbols] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      // Load recent symbols when modal opens
      setRecentSymbols(getRecentSymbols());

      // Reset form
      setFormData({
        instrumentType: "STOCK",
        symbol: "",
        exchange: "NSE",
        quantity: "",
        entryPrice: "",
        plannedStop: "",
      });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.symbol || !formData.quantity || !formData.entryPrice) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Save to recent symbols
      saveRecentSymbol(formData.symbol);

      await onSubmit(formData);

      // Close modal on success
      onOpenChange(false);
    } catch (error) {
      console.error("Quick entry error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecentSymbolClick = (symbol: string) => {
    setFormData({ ...formData, symbol });
  };

  const isValid = formData.symbol && formData.quantity && formData.entryPrice;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <DialogTitle>Quick Entry</DialogTitle>
          </div>
          <DialogDescription>
            Enter essential trade details quickly. Press Cmd/Ctrl+K anytime to
            open.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Recent Symbols */}
          {recentSymbols.length > 0 && !formData.symbol && (
            <div>
              <Label className="text-xs text-muted-foreground">
                Recent Symbols
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {recentSymbols.map((symbol) => (
                  <Button
                    key={symbol}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRecentSymbolClick(symbol)}
                    className="text-xs"
                  >
                    {symbol}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Instrument Type */}
          <div>
            <Label htmlFor="quick-instrument-type">Type</Label>
            <Select
              value={formData.instrumentType}
              onValueChange={(value: any) =>
                setFormData({ ...formData, instrumentType: value })
              }
            >
              <SelectTrigger id="quick-instrument-type" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STOCK">Stock</SelectItem>
                <SelectItem value="FUTURES">Futures</SelectItem>
                <SelectItem value="OPTIONS">Options</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Symbol */}
          <div>
            <Label>Symbol</Label>
            <SymbolCombobox
              value={formData.symbol}
              exchange={formData.exchange}
              onExchangeChange={(exchange) =>
                setFormData({ ...formData, exchange })
              }
              onChange={(symbol, instrument) =>
                setFormData({ ...formData, symbol })
              }
              className="mt-1.5"
              placeholder="Search or type symbol..."
            />
          </div>

          {/* Quantity & Entry Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="quick-quantity">Quantity</Label>
              <Input
                id="quick-quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                placeholder="Qty"
                className="mt-1.5"
                required
              />
            </div>

            <div>
              <Label htmlFor="quick-entry-price">Entry Price</Label>
              <Input
                id="quick-entry-price"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.entryPrice}
                onChange={(e) =>
                  setFormData({ ...formData, entryPrice: e.target.value })
                }
                placeholder="Price"
                className="mt-1.5"
                required
              />
            </div>
          </div>

          {/* Stop (Optional) */}
          <div>
            <Label htmlFor="quick-stop">
              Stop Loss{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="quick-stop"
              type="number"
              step="0.01"
              value={formData.plannedStop}
              onChange={(e) =>
                setFormData({ ...formData, plannedStop: e.target.value })
              }
              placeholder="Stop price"
              className="mt-1.5"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Trade"}
            </Button>
          </div>
        </form>

        {/* Keyboard Hint */}
        <p className="text-xs text-center text-muted-foreground pt-2 border-t">
          Tip: All other fields will use default values. Edit in full form if
          needed.
        </p>
      </DialogContent>
    </Dialog>
  );
}
