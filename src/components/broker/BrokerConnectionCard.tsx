import { useState, useEffect } from "react";
import { brokerApi, type BrokerConnectionStatus } from "@/api/broker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

interface BrokerConnectionCardProps {
  broker: "ZERODHA" | "ANGELONE" | "UPSTOX" | "IIFL";
  enabled?: boolean;
  disabledForUser?: boolean;
}

export function BrokerConnectionCard({
  broker,
  enabled = true,
  disabledForUser = false,
}: BrokerConnectionCardProps) {
  const [status, setStatus] = useState<BrokerConnectionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const brokerNames = {
    ZERODHA: "Zerodha Kite",
    ANGELONE: "Angel One",
    UPSTOX: "Upstox",
    IIFL: "IIFL Securities",
  };

  const brokerLogos = {
    ZERODHA: "🪁",
    ANGELONE: "👼",
    UPSTOX: "📈",
    IIFL: "🏦",
  };

  useEffect(() => {
    if (enabled) {
      loadStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [broker, enabled]);

  const loadStatus = async () => {
    try {
      setError(null);
      const data = await brokerApi.getStatus(broker.toLowerCase());
      setStatus(data);
    } catch (err) {
      // Not connected yet
      setStatus({ connected: false, marketOpen: false });
    }
  };

  const handleConnect = async () => {
    if (disabledForUser) {
      setError("Broker connection is currently unavailable for your account.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { loginUrl } = await brokerApi.connect(broker.toLowerCase());

      // Open broker login in popup
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        loginUrl,
        "BrokerLogin",
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for OAuth callback (will be handled by callback page)
      const checkPopup = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkPopup);
          setLoading(false);
          // Refresh status after popup closes
          setTimeout(() => loadStatus(), 1000);
        }
      }, 500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to initiate connection"
      );
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      setError(null);
      await brokerApi.disconnect(broker.toLowerCase());
      setStatus({ connected: false, marketOpen: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await brokerApi.syncPositions(broker.toLowerCase());

      // Show sync results
      alert(
        `Sync completed:\n- Positions matched: ${result.positionsMatched}\n- Trades created: ${result.tradesCreated}\n- Trades updated: ${result.tradesUpdated}\n- Trades closed: ${result.tradesClosed}`
      );

      await loadStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync");
    } finally {
      setLoading(false);
    }
  };

  if (!enabled) {
    return (
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>{brokerLogos[broker]}</span>
            <span>{brokerNames[broker]}</span>
            <Badge variant="secondary">Coming Soon</Badge>
          </CardTitle>
          <CardDescription>
            Integration for {brokerNames[broker]} will be available in a future
            update.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>{brokerLogos[broker]}</span>
            <span>{brokerNames[broker]}</span>
          </div>
          {status?.connected ? (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              Not Connected
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {status?.connected
            ? `Connected as ${status.userId}${
                status.expiresAt
                  ? ` • Expires at ${new Date(
                      status.expiresAt
                    ).toLocaleString()}`
                  : ""
              }`
            : "Connect your broker account to enable automated trade execution"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {status?.connected && status.margins && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <div className="text-sm text-muted-foreground">Available</div>
              <div className="text-lg font-semibold">
                ₹{(status.margins.available ?? 0).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Used</div>
              <div className="text-lg font-semibold">
                ₹{(status.margins.used ?? 0).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-lg font-semibold">
                ₹{(status.margins.total ?? 0).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {status?.connected && (
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                status.marketOpen ? "bg-green-500" : "bg-gray-400"
              }`}
            />
            <span className="text-sm text-muted-foreground">
              Market is {status.marketOpen ? "open" : "closed"}
            </span>
          </div>
        )}

        <div className="flex gap-2">
          {!status?.connected ? (
            <Button
              onClick={handleConnect}
              disabled={loading || disabledForUser}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Connect {brokerNames[broker]}
                </>
              )}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleSync} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDisconnect}
                disabled={loading}
                className="flex-1"
              >
                Disconnect
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
