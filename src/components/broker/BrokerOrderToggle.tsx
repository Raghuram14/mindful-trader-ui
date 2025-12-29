import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Zap, AlertTriangle, CheckCircle } from "lucide-react";
import {
  brokerApi,
  type BrokerConnectionStatus,
  type PlaceOrderRequest,
} from "@/api/broker";
import { PreOrderValidationModal } from "./PreOrderValidationModal";
import { useToast } from "@/hooks/use-toast";

interface BrokerOrderToggleProps {
  tradeData: PlaceOrderRequest["tradeData"];
  onTradeCreated?: (trade: any) => void;
  disabled?: boolean;
}

export function BrokerOrderToggle({
  tradeData,
  onTradeCreated,
  disabled,
}: BrokerOrderToggleProps) {
  const [useBroker, setUseBroker] = useState(false);
  const [brokerStatus, setBrokerStatus] =
    useState<BrokerConnectionStatus | null>(null);
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [placing, setPlacing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check broker status on component mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        setLoading(true);
        console.log("Checking broker status...");
        const status = await brokerApi.getStatus("zerodha");
        console.log("Broker status received:", status);
        setBrokerStatus(status);
      } catch (error) {
        console.error("Error checking broker status:", error);
        // Not connected
        setBrokerStatus({ connected: false, marketOpen: false });
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, []);

  const handlePlaceOrder = async (overrideReason?: string) => {
    try {
      setPlacing(true);

      const request: PlaceOrderRequest = {
        tradeData,
        overrideWarnings: !!overrideReason,
        overrideReason,
      };

      const result = await brokerApi.placeOrder("zerodha", request);

      if (result.requiresOverride && result.validation) {
        // Show validation modal
        setValidationResult(result.validation);
        setValidationModalOpen(true);
        setPlacing(false);
        return;
      }

      if (result.trade) {
        toast({
          title: "Order Placed Successfully",
          description: `Your order has been placed through Zerodha. Order ID: ${result.trade.brokerOrderId}`,
        });

        setValidationModalOpen(false);
        onTradeCreated?.(result.trade);
      } else {
        throw new Error(result.error || "Failed to place order");
      }
    } catch (error) {
      toast({
        title: "Order Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to place order through broker",
        variant: "destructive",
      });
    } finally {
      setPlacing(false);
    }
  };

  const canUseBroker = brokerStatus?.connected && brokerStatus?.marketOpen;

  if (loading) {
    return (
      <Card className="border-muted">
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          Checking broker connection...
        </CardContent>
      </Card>
    );
  }

  if (!brokerStatus?.connected) {
    return (
      <Card className="border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Execute via Broker
          </CardTitle>
          <CardDescription>
            Place order through Zerodha Kite with automatic rule validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/broker-settings")}
            className="w-full"
          >
            Connect Broker to Enable
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card
        className={
          useBroker && canUseBroker
            ? "border-primary bg-primary/5"
            : "border-muted"
        }
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  useBroker ? "bg-primary/10" : "bg-muted"
                }`}
              >
                <Zap
                  className={`w-5 h-5 ${
                    useBroker ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>
              <div>
                <CardTitle className="text-base">Execute via Broker</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Place order through Zerodha Kite with rule validation
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={useBroker}
              onCheckedChange={setUseBroker}
              disabled={disabled || !canUseBroker}
            />
          </div>
        </CardHeader>
        {useBroker && (
          <CardContent className="space-y-3 pt-0">
            {/* Status Row */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-background">
                <span className="text-muted-foreground">Broker</span>
                <Badge variant="outline" className="gap-1.5">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-background">
                <span className="text-muted-foreground">Market</span>
                <Badge
                  variant={brokerStatus.marketOpen ? "default" : "secondary"}
                  className="gap-1.5"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      brokerStatus.marketOpen ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  {brokerStatus.marketOpen ? "Open" : "Closed"}
                </Badge>
              </div>
            </div>

            {/* Margin Info */}
            {brokerStatus.margins && (
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-background text-sm">
                <span className="text-muted-foreground">Available Margin</span>
                <span className="font-semibold">
                  ₹{brokerStatus.margins.available.toLocaleString()}
                </span>
              </div>
            )}

            {/* Market Closed Warning */}
            {!brokerStatus.marketOpen && (
              <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Orders can only be placed during market hours (9:15 AM - 3:30
                  PM IST)
                </span>
              </div>
            )}

            {/* Action Button */}
            <Button
              className="w-full"
              onClick={() => handlePlaceOrder()}
              disabled={disabled || !canUseBroker || placing}
              size="lg"
            >
              {placing ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-pulse" />
                  Validating & Placing Order...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Validate & Place Order
                </>
              )}
            </Button>
          </CardContent>
        )}
      </Card>

      {validationResult && (
        <PreOrderValidationModal
          open={validationModalOpen}
          onClose={() => {
            setValidationModalOpen(false);
            setPlacing(false);
          }}
          validation={validationResult}
          onConfirm={handlePlaceOrder}
          loading={placing}
        />
      )}
    </>
  );
}
