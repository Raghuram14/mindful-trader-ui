import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useTrades } from "@/context/TradeContext";
import { ExitTradeWizard } from "@/components/trade/ExitTradeWizard";
import { useToast } from "@/hooks/use-toast";
import { tradesApi } from "@/api/trades";
import { brokerApi } from "@/api/broker";
import type { Trade } from "@/lib/mockData";

export default function ExitTradePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTradeById, loadTrades } = useTrades();
  const { toast } = useToast();

  const [wizardOpen, setWizardOpen] = useState(true);
  const [brokerConnectionStatus, setBrokerConnectionStatus] = useState<
    "connected" | "disconnected" | "loading"
  >("loading");
  const [canUseBrokerExit, setCanUseBrokerExit] = useState(false);

  const trade = getTradeById(id || "");

  // Check broker connection status and trade eligibility for broker exit
  useEffect(() => {
    const checkBrokerConnection = async () => {
      try {
        const status = await brokerApi.getStatus("ZERODHA");
        setBrokerConnectionStatus(
          status.connected ? "connected" : "disconnected"
        );

        // Debug logging
        console.log("Trade source:", trade?.source);
        console.log("Broker connected:", status.connected);

        // Check if trade is eligible for broker exit
        // Only allow broker exit for trades placed through broker (MANUAL_BROKER, BROKER_EXTERNAL)
        // Trades with source=MANUAL or undefined source should NOT have broker exit
        if (trade && status.connected) {
          const isManualTrade =
            !trade.source ||
            trade.source === "MANUAL" ||
            trade.source === "IMPORTED";
          const isBrokerTrade =
            trade.source === "MANUAL_BROKER" ||
            trade.source === "BROKER_EXTERNAL";

          console.log("Is manual trade:", isManualTrade);
          console.log("Is broker trade:", isBrokerTrade);
          console.log("Can use broker exit:", isBrokerTrade);

          setCanUseBrokerExit(isBrokerTrade);
        } else {
          setCanUseBrokerExit(false);
        }
      } catch (error) {
        console.error("Failed to check broker connection:", error);
        setBrokerConnectionStatus("disconnected");
        setCanUseBrokerExit(false);
      }
    };

    if (trade) {
      checkBrokerConnection();
    }
  }, [trade]);

  // Navigate back when wizard is closed
  useEffect(() => {
    if (!wizardOpen) {
      navigate("/today");
    }
  }, [wizardOpen, navigate]);

  if (!trade || trade.status === "closed") {
    return (
      <AppLayout>
        <div className="page-container">
          <p className="text-muted-foreground">
            Trade not found or already closed
          </p>
          <Link
            to="/today"
            className="text-primary hover:underline mt-4 inline-block"
          >
            Back to Today
          </Link>
        </div>
      </AppLayout>
    );
  }

  const handleExit = async (data: {
    quantity: number;
    exitPrice: string;
    exitReason: "target" | "stop" | "fear" | "unsure" | "impulse";
    exitDateTime: Date;
    useBroker: boolean;
    orderType: "MARKET" | "LIMIT";
    brokerOrderId?: string;
    emotions: ("fear" | "greed" | "fomo" | "regret" | "confident" | "calm")[];
    exitNote: string;
  }) => {
    try {
      // Additional safety check on frontend
      const isManualTrade =
        !trade.source ||
        trade.source === "MANUAL" ||
        trade.source === "IMPORTED";
      if (data.useBroker && isManualTrade) {
        toast({
          title: "Cannot use broker exit",
          description:
            "This trade was manually added and cannot be exited through the broker. Please use manual exit.",
          variant: "destructive",
        });
        throw new Error("Broker exit not allowed for manual trades");
      }

      const exitPriceNum = parseFloat(data.exitPrice);

      await tradesApi.closeTrade(trade.id, {
        exitReason: data.exitReason,
        exitPrice: exitPriceNum,
        exitNote: data.exitNote,
        emotions: data.emotions as (
          | "fear"
          | "neutral"
          | "confident"
          | "greed"
          | "fomo"
          | "regret"
          | "calm"
        )[],
        closedAt: data.exitDateTime.toISOString(),
      });

      // Refresh trades to update the list
      await loadTrades();

      toast({
        title: "Trade closed successfully",
        description: data.useBroker
          ? "Your exit order has been placed with the broker."
          : "Your trade has been closed manually.",
      });

      setWizardOpen(false);
    } catch (error) {
      toast({
        title: "Failed to close trade",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while closing the trade.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <AppLayout>
      <div className="page-container animate-fade-in">
        <ExitTradeWizard
          trade={trade}
          open={wizardOpen}
          onOpenChange={setWizardOpen}
          onExit={handleExit}
          brokerConnectionStatus={brokerConnectionStatus}
          canUseBrokerExit={canUseBrokerExit}
        />
      </div>
    </AppLayout>
  );
}
