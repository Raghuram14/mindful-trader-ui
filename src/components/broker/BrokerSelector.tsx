import { useState, useEffect } from "react";
import { CheckCircle2, Circle, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { brokerApi, type BrokerConnectionStatus } from "@/api/broker";
import { cn } from "@/lib/utils";

type Broker = {
  id: string;
  name: string;
  enabled: boolean;
};

const AVAILABLE_BROKERS: Broker[] = [
  { id: "zerodha", name: "Zerodha Kite", enabled: true },
  { id: "angelone", name: "Angel One", enabled: false },
  { id: "upstox", name: "Upstox", enabled: false },
  { id: "iifl", name: "IIFL Securities", enabled: false },
];

interface BrokerSelectorProps {
  selectedBroker: string | null;
  onBrokerSelect: (broker: string | null) => void;
  className?: string;
}

export function BrokerSelector({
  selectedBroker,
  onBrokerSelect,
  className,
}: BrokerSelectorProps) {
  const [brokerStatuses, setBrokerStatuses] = useState<
    Record<string, BrokerConnectionStatus | null>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrokerStatuses = async () => {
      setLoading(true);
      const statuses: Record<string, BrokerConnectionStatus | null> = {};

      // Fetch status for each enabled broker
      await Promise.all(
        AVAILABLE_BROKERS.filter((b) => b.enabled).map(async (broker) => {
          try {
            const status = await brokerApi.getStatus(broker.id);
            statuses[broker.id] = status;
          } catch (error) {
            console.error(`Error fetching status for ${broker.id}:`, error);
            statuses[broker.id] = null;
          }
        })
      );

      setBrokerStatuses(statuses);
      setLoading(false);
    };

    fetchBrokerStatuses();
  }, []);

  const handleBrokerClick = (brokerId: string, isConnected: boolean) => {
    if (!isConnected) {
      // Redirect to broker settings page to connect
      window.location.href = "/broker-settings";
      return;
    }
    onBrokerSelect(brokerId === selectedBroker ? null : brokerId);
  };

  const handleManualSelect = () => {
    onBrokerSelect(null);
  };

  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Manual Entry Option */}
      <Card
        className={cn(
          "cursor-pointer transition-all hover:border-primary",
          selectedBroker === null && "border-primary bg-primary/5"
        )}
        onClick={handleManualSelect}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedBroker === null ? (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <h4 className="font-semibold">Manual Entry</h4>
                <p className="text-xs text-muted-foreground">
                  Journal trade without broker execution
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Broker Options */}
      {AVAILABLE_BROKERS.map((broker) => {
        const status = brokerStatuses[broker.id];
        const isConnected = status?.connected || false;
        const isSelected = selectedBroker === broker.id;

        return (
          <Card
            key={broker.id}
            className={cn(
              "transition-all",
              broker.enabled
                ? "cursor-pointer hover:border-primary"
                : "opacity-50 cursor-not-allowed",
              isSelected && "border-primary bg-primary/5"
            )}
            onClick={() =>
              broker.enabled && handleBrokerClick(broker.id, isConnected)
            }
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {isSelected ? (
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{broker.name}</h4>
                      {!broker.enabled && (
                        <Badge variant="outline" className="text-xs">
                          Coming Soon
                        </Badge>
                      )}
                    </div>

                    {broker.enabled && (
                      <>
                        {isConnected ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="text-xs bg-green-50 text-green-700 border-green-200"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Connected
                              </Badge>
                              {status?.userId && (
                                <span className="text-xs text-muted-foreground">
                                  {status.userId}
                                </span>
                              )}
                            </div>

                            {status?.margins && (
                              <div className="flex items-center gap-2 text-xs">
                                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Available:{" "}
                                  <span className="font-medium text-foreground">
                                    ₹{status.margins.available.toLocaleString()}
                                  </span>
                                </span>
                              </div>
                            )}

                            {status && !status.marketOpen && (
                              <Badge variant="secondary" className="text-xs">
                                Market Closed
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Not Connected
                            </Badge>
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = "/broker-settings";
                              }}
                            >
                              Connect Now →
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
