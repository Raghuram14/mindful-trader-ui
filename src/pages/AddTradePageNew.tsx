import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { TradeWizard } from "@/components/trade/TradeWizard";
import {
  QuickEntryModal,
  type QuickTradeData,
} from "@/components/trade/QuickEntryModal";
import { useTrades } from "@/context/TradeContext";
import { useToast } from "@/hooks/use-toast";
import { brokerApi } from "@/api/broker";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

// LocalStorage keys
const LAST_BROKER_KEY = "mindfultrade_last_broker";
const QUICK_ENTRY_ENABLED_KEY = "mindfultrade_quick_entry_enabled";

export default function AddTradePage() {
  const navigate = useNavigate();
  const { addTrade } = useTrades();
  const { toast } = useToast();

  const [quickEntryOpen, setQuickEntryOpen] = useState(false);
  const [quickEntryEnabled, setQuickEntryEnabled] = useState(true);

  // Load quick entry preference
  useEffect(() => {
    const enabled = localStorage.getItem(QUICK_ENTRY_ENABLED_KEY);
    if (enabled !== null) {
      setQuickEntryEnabled(enabled === "true");
    }
  }, []);

  // Keyboard shortcut for quick entry (Cmd/Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (quickEntryEnabled) {
          setQuickEntryOpen(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [quickEntryEnabled]);

  // Handle wizard submission
  const handleWizardSubmit = async (formData: any) => {
    const riskAmount = formData.customRisk
      ? parseInt(formData.customRisk)
      : formData.riskComfort;

    const tradeDate = formData.tradeDateTime.toISOString().split("T")[0];
    const tradeTime = formData.tradeDateTime.toTimeString().slice(0, 5);

    try {
      // If broker is selected, place order through broker
      if (formData.selectedBroker) {
        const tradeData = {
          instrumentType: formData.instrumentType,
          symbol: formData.symbol.toUpperCase(),
          optionType:
            formData.instrumentType === "OPTIONS"
              ? formData.optionType
              : undefined,
          tradeDate,
          tradeTime,
          type: formData.type,
          quantity: parseInt(formData.quantity),
          entryPrice: parseFloat(formData.entryPrice),
          plannedStop: formData.plannedStop
            ? parseFloat(formData.plannedStop)
            : undefined,
          plannedTarget: formData.plannedTarget
            ? parseFloat(formData.plannedTarget)
            : undefined,
          confidence: formData.confidence,
          riskComfort: riskAmount,
          reason: formData.reason || undefined,
        };

        const result = await brokerApi.placeOrder(formData.selectedBroker, {
          tradeData,
          overrideWarnings: false,
        });

        if (result.requiresOverride && result.validation) {
          // Handle validation modal (would need PreOrderValidationModal)
          toast({
            title: "Rule validation required",
            description: "Please review rule warnings before proceeding",
            variant: "destructive",
          });
          return;
        }

        if (result.trade) {
          toast({
            title: "Order placed successfully",
            description: `Your order has been placed through ${formData.selectedBroker}`,
          });

          // Save last selected broker
          localStorage.setItem(LAST_BROKER_KEY, formData.selectedBroker);

          navigate("/today");
          return;
        }
      }

      // Manual entry (no broker)
      await addTrade({
        instrumentType: formData.instrumentType,
        symbol: formData.symbol.toUpperCase(),
        optionType:
          formData.instrumentType === "OPTIONS"
            ? formData.optionType
            : undefined,
        tradeDate,
        tradeTime,
        type: formData.type,
        quantity: parseInt(formData.quantity),
        entryPrice: parseFloat(formData.entryPrice),
        plannedStop: formData.plannedStop
          ? parseFloat(formData.plannedStop)
          : undefined,
        plannedTarget: formData.plannedTarget
          ? parseFloat(formData.plannedTarget)
          : undefined,
        confidence: formData.confidence,
        riskComfort: riskAmount,
        reason: formData.reason || undefined,
      });

      toast({
        title: "Trade committed",
        description: "Your trade plan has been successfully committed.",
      });

      navigate("/today");
    } catch (error) {
      toast({
        title: "Failed to commit trade",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Handle quick entry submission
  const handleQuickEntrySubmit = async (data: QuickTradeData) => {
    const now = new Date();
    const tradeDate = now.toISOString().split("T")[0];
    const tradeTime = now.toTimeString().slice(0, 5);

    try {
      await addTrade({
        instrumentType: data.instrumentType,
        symbol: data.symbol.toUpperCase(),
        tradeDate,
        tradeTime,
        type: "buy", // Default to buy
        quantity: parseInt(data.quantity),
        entryPrice: parseFloat(data.entryPrice),
        plannedStop: data.plannedStop
          ? parseFloat(data.plannedStop)
          : undefined,
        confidence: 3, // Default confidence
        riskComfort: 1000, // Default risk comfort
      });

      toast({
        title: "Trade added",
        description: "Quick entry successful. Edit full details if needed.",
      });

      navigate("/today");
    } catch (error) {
      toast({
        title: "Failed to add trade",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <AppLayout>
      <div className="page-container animate-fade-in">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="page-title">Add Trade</h1>
            <p className="page-subtitle mt-1">Pre-commit to your plan</p>
          </div>

          {quickEntryEnabled && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickEntryOpen(true)}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Quick Entry
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          )}
        </header>

        <div className="max-w-5xl mx-auto">
          <TradeWizard
            onSubmit={handleWizardSubmit}
            onCancel={() => navigate(-1)}
          />
        </div>
      </div>

      <QuickEntryModal
        open={quickEntryOpen}
        onOpenChange={setQuickEntryOpen}
        onSubmit={handleQuickEntrySubmit}
      />
    </AppLayout>
  );
}
