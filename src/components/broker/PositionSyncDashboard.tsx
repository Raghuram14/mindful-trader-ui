import { useState, useEffect } from "react";
import { brokerApi, type BrokerPosition } from "@/api/broker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Loader2, TrendingUp, TrendingDown } from "lucide-react";

interface PositionSyncDashboardProps {
  broker: string;
}

export function PositionSyncDashboard({ broker }: PositionSyncDashboardProps) {
  const [positions, setPositions] = useState<BrokerPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    loadPositions();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadPositions();
    }, 30000);
    return () => clearInterval(interval);
  }, [broker]);

  const loadPositions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await brokerApi.getPositions(broker);
      setPositions(data.positions);
      setLastSync(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load positions");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      const result = await brokerApi.syncPositions(broker);

      // Show detailed results
      const message =
        `Sync completed successfully!\n\n` +
        `✓ Positions matched: ${result.positionsMatched}\n` +
        `✓ Trades created: ${result.tradesCreated}\n` +
        `✓ Trades updated: ${result.tradesUpdated}\n` +
        `✓ Trades closed: ${result.tradesClosed}` +
        (result.errors.length > 0
          ? `\n\n⚠️ ${result.errors.length} errors occurred`
          : "");

      alert(message);
      await loadPositions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync positions");
    } finally {
      setSyncing(false);
    }
  };

  const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);
  const totalValue = positions.reduce((sum, pos) => sum + pos.value, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Open Positions</CardTitle>
            <CardDescription>
              {lastSync && `Last synced: ${lastSync.toLocaleTimeString()}`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadPositions}
              disabled={loading || syncing}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              onClick={handleSync}
              disabled={loading || syncing}
            >
              {syncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                "Sync Positions"
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {positions.length === 0 && !loading && (
          <div className="text-center text-muted-foreground py-8">
            No open positions
          </div>
        )}

        {positions.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <div className="text-sm text-muted-foreground">Total P&L</div>
                <div
                  className={`text-2xl font-bold ${
                    totalPnL >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {totalPnL >= 0 ? "+" : ""}₹{totalPnL.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Value</div>
                <div className="text-2xl font-bold">
                  ₹{totalValue.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {positions.map((position, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {position.tradingsymbol}
                      </span>
                      <Badge variant="outline">{position.exchange}</Badge>
                      <Badge
                        variant={
                          position.quantity > 0 ? "default" : "secondary"
                        }
                      >
                        {position.quantity > 0 ? "LONG" : "SHORT"}{" "}
                        {Math.abs(position.quantity)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Avg: ₹{position.averagePrice.toFixed(2)} • LTP: ₹
                      {position.lastPrice.toFixed(2)} •{position.product}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`flex items-center gap-1 font-semibold ${
                        position.pnl >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {position.pnl >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {position.pnl >= 0 ? "+" : ""}₹
                      {position.pnl.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {((position.pnl / position.value) * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
