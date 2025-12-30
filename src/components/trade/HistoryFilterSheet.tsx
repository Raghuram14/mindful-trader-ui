import { useState, useEffect } from "react";
import { Search, X, Save, Filter as FilterIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { FilterState } from "@/hooks/useHistoryFilters";
import { useFilterPresets } from "@/hooks/useFilterPresets";
import { cn } from "@/lib/utils";

interface HistoryFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onClearAll: () => void;
  activeFilterCount: number;
  validationErrors: Array<{ field: string; message: string }>;
  isMobile: boolean;
}

const INSTRUMENT_TYPES = [
  { value: "STOCK", label: "Stock" },
  { value: "FUTURES", label: "Futures" },
  { value: "OPTIONS", label: "Options" },
];

const EXIT_REASONS = [
  { value: "target", label: "Target" },
  { value: "stop", label: "Stop Loss" },
  { value: "fear", label: "Fear" },
  { value: "unsure", label: "Unsure" },
  { value: "impulse", label: "Impulse" },
];

const EMOTIONS = [
  { value: "fear", label: "😰 Fear" },
  { value: "neutral", label: "😐 Neutral" },
  { value: "confident", label: "😄 Confident" },
  { value: "greed", label: "🤑 Greed" },
  { value: "fomo", label: "📈 FOMO" },
  { value: "regret", label: "😔 Regret" },
  { value: "calm", label: "😌 Calm" },
];

const SOURCES = [
  { value: "MANUAL", label: "Manual" },
  { value: "MANUAL_BROKER", label: "Manual (Broker)" },
  { value: "BROKER_EXTERNAL", label: "Broker External" },
  { value: "IMPORTED", label: "Imported" },
];

export function HistoryFilterSheet({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  onClearAll,
  activeFilterCount,
  validationErrors,
  isMobile,
}: HistoryFilterSheetProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [savePresetOpen, setSavePresetOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const { presets, savePreset, deletePreset, loadPreset } = useFilterPresets();

  // Sync local filters with prop changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onFiltersChange(localFilters);
    onOpenChange(false);
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) return;

    try {
      const { page, view, ...filterValues } = localFilters;
      savePreset(presetName.trim(), filterValues);
      setPresetName("");
      setSavePresetOpen(false);
    } catch (error) {
      console.error("Failed to save preset:", error);
    }
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = loadPreset(presetId);
    if (preset) {
      setLocalFilters({ ...localFilters, ...preset.filters });
    }
  };

  const getError = (field: string) => {
    return validationErrors.find((e) => e.field === field)?.message;
  };

  const content = (
    <div className="flex flex-col h-full">
      <ScrollArea
        className="flex-1 pr-4"
        style={{ maxHeight: "calc(100vh - 280px)" }}
      >
        <div className="space-y-6 py-4">
          {/* Saved Presets */}
          {presets.length > 0 && (
            <div className="space-y-2">
              <Label>Saved Presets</Label>
              <Select onValueChange={handleLoadPreset}>
                <SelectTrigger>
                  <SelectValue placeholder="Load a preset..." />
                </SelectTrigger>
                <SelectContent>
                  {presets.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{preset.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePreset(preset.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Separator />

          {/* Date Range */}
          <div className="space-y-3">
            <Label>Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    {localFilters.dateFrom
                      ? format(localFilters.dateFrom, "PP")
                      : "From date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={localFilters.dateFrom}
                    onSelect={(date) =>
                      setLocalFilters({ ...localFilters, dateFrom: date })
                    }
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    {localFilters.dateTo
                      ? format(localFilters.dateTo, "PP")
                      : "To date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={localFilters.dateTo}
                    onSelect={(date) =>
                      setLocalFilters({ ...localFilters, dateTo: date })
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
            {/* Quick date filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  setLocalFilters({
                    ...localFilters,
                    dateFrom: today,
                    dateTo: today,
                  });
                }}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const last7Days = new Date(today);
                  last7Days.setDate(today.getDate() - 7);
                  setLocalFilters({
                    ...localFilters,
                    dateFrom: last7Days,
                    dateTo: today,
                  });
                }}
              >
                Last 7 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const last30Days = new Date(today);
                  last30Days.setDate(today.getDate() - 30);
                  setLocalFilters({
                    ...localFilters,
                    dateFrom: last30Days,
                    dateTo: today,
                  });
                }}
              >
                Last 30 days
              </Button>
            </div>
            {getError("dateRange") && (
              <p className="text-sm text-destructive">
                {getError("dateRange")}
              </p>
            )}
          </div>

          <Separator />

          {/* Symbol Search */}
          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="symbol"
                placeholder="Search by symbol..."
                value={localFilters.symbol || ""}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, symbol: e.target.value })
                }
                className="pl-9"
              />
            </div>
          </div>

          <Separator />

          {/* Result Filter */}
          <div className="space-y-3">
            <Label>Result</Label>
            <RadioGroup
              value={localFilters.result || "all"}
              onValueChange={(value: any) =>
                setLocalFilters({ ...localFilters, result: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="result-all" />
                <Label
                  htmlFor="result-all"
                  className="font-normal cursor-pointer"
                >
                  All
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="win" id="result-win" />
                <Label
                  htmlFor="result-win"
                  className="font-normal cursor-pointer"
                >
                  Wins
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="loss" id="result-loss" />
                <Label
                  htmlFor="result-loss"
                  className="font-normal cursor-pointer"
                >
                  Losses
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Instrument Type */}
          <div className="space-y-3">
            <Label>Instrument Type</Label>
            <div className="space-y-2">
              {INSTRUMENT_TYPES.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`instrument-${type.value}`}
                    checked={localFilters.instrumentTypes.includes(type.value)}
                    onCheckedChange={(checked) => {
                      setLocalFilters({
                        ...localFilters,
                        instrumentTypes: checked
                          ? [...localFilters.instrumentTypes, type.value]
                          : localFilters.instrumentTypes.filter(
                              (t) => t !== type.value
                            ),
                      });
                    }}
                  />
                  <Label
                    htmlFor={`instrument-${type.value}`}
                    className="font-normal cursor-pointer"
                  >
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* P&L Range */}
          <div className="space-y-3">
            <Label>P&L Range (₹)</Label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <Input
                  type="number"
                  placeholder="Min"
                  value={localFilters.minPnL ?? ""}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      minPnL: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    })
                  }
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Max"
                  value={localFilters.maxPnL ?? ""}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      maxPnL: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    })
                  }
                />
              </div>
            </div>
            {getError("pnlRange") && (
              <p className="text-sm text-destructive">{getError("pnlRange")}</p>
            )}
          </div>

          <Separator />

          {/* Exit Reason */}
          <div className="space-y-3">
            <Label>Exit Reason</Label>
            <div className="space-y-2">
              {EXIT_REASONS.map((reason) => (
                <div key={reason.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`exit-${reason.value}`}
                    checked={localFilters.exitReasons.includes(reason.value)}
                    onCheckedChange={(checked) => {
                      setLocalFilters({
                        ...localFilters,
                        exitReasons: checked
                          ? [...localFilters.exitReasons, reason.value]
                          : localFilters.exitReasons.filter(
                              (r) => r !== reason.value
                            ),
                      });
                    }}
                  />
                  <Label
                    htmlFor={`exit-${reason.value}`}
                    className="font-normal cursor-pointer"
                  >
                    {reason.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Emotions */}
          <div className="space-y-3">
            <Label>Emotions</Label>
            <div className="space-y-2">
              {EMOTIONS.map((emotion) => (
                <div
                  key={emotion.value}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`emotion-${emotion.value}`}
                    checked={localFilters.emotions.includes(emotion.value)}
                    onCheckedChange={(checked) => {
                      setLocalFilters({
                        ...localFilters,
                        emotions: checked
                          ? [...localFilters.emotions, emotion.value]
                          : localFilters.emotions.filter(
                              (e) => e !== emotion.value
                            ),
                      });
                    }}
                  />
                  <Label
                    htmlFor={`emotion-${emotion.value}`}
                    className="font-normal cursor-pointer"
                  >
                    {emotion.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Source */}
          <div className="space-y-3">
            <Label>Source</Label>
            <div className="space-y-2">
              {SOURCES.map((source) => (
                <div key={source.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`source-${source.value}`}
                    checked={localFilters.sources.includes(source.value)}
                    onCheckedChange={(checked) => {
                      setLocalFilters({
                        ...localFilters,
                        sources: checked
                          ? [...localFilters.sources, source.value]
                          : localFilters.sources.filter(
                              (s) => s !== source.value
                            ),
                      });
                    }}
                  />
                  <Label
                    htmlFor={`source-${source.value}`}
                    className="font-normal cursor-pointer"
                  >
                    {source.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setSavePresetOpen(true)}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Preset
          </Button>
          <Button variant="outline" className="flex-1" onClick={onClearAll}>
            Clear All
          </Button>
        </div>
        <Button className="w-full" onClick={handleApply}>
          Apply Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
      </div>

      {/* Save Preset Dialog */}
      <Dialog open={savePresetOpen} onOpenChange={setSavePresetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter Preset</DialogTitle>
            <DialogDescription>
              Give this filter configuration a name so you can quickly apply it
              later
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="preset-name">Preset Name</Label>
              <Input
                id="preset-name"
                placeholder="e.g., Last Month Losses"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSavePreset()}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setSavePresetOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSavePreset}
              disabled={!presetName.trim()}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  // Render as Sheet on desktop, Dialog on mobile
  if (isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-full h-full p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FilterIcon className="w-5 h-5" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary">{activeFilterCount}</Badge>
              )}
            </DialogTitle>
            <DialogDescription>Filter your trading history</DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-6">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FilterIcon className="w-5 h-5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount}</Badge>
            )}
          </SheetTitle>
          <SheetDescription>Filter your trading history</SheetDescription>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
}
