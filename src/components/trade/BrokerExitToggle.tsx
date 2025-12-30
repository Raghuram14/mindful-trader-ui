import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BrokerExitToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  connectionStatus: "connected" | "disconnected" | "loading";
  position?: {
    symbol: string;
    quantity: number;
    ltp: number;
  };
}

export function BrokerExitToggle({
  enabled,
  onToggle,
  connectionStatus,
  position,
}: BrokerExitToggleProps) {
  const isConnected = connectionStatus === "connected";
  const isLoading = connectionStatus === "loading";

  return (
    <div className="space-y-4">
      {/* Toggle Switch */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-3">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : isConnected ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-orange-600" />
          )}
          <div>
            <Label htmlFor="broker-exit" className="cursor-pointer">
              Exit via Broker
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isLoading
                ? "Checking connection..."
                : isConnected
                ? "Broker connected"
                : "Not connected"}
            </p>
          </div>
        </div>
        <Switch
          id="broker-exit"
          checked={enabled}
          onCheckedChange={onToggle}
          disabled={!isConnected || isLoading}
        />
      </div>

      {/* Connection Status Details */}
      {!isConnected && !isLoading && (
        <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-1">
                Broker Not Connected
              </p>
              <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                Connect your broker account to place exit orders directly from
                the app.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = "/broker-settings")}
                className="border-orange-300 hover:bg-orange-100 dark:border-orange-800 dark:hover:bg-orange-900"
              >
                Connect Broker
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Position Information */}
      {enabled && isConnected && position && (
        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Broker Position
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-xs">Symbol</p>
              <p className="font-medium text-blue-900 dark:text-blue-100">
                {position.symbol}
              </p>
            </div>
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-xs">
                Quantity
              </p>
              <p className="font-medium text-blue-900 dark:text-blue-100">
                {position.quantity}
              </p>
            </div>
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-xs">LTP</p>
              <p className="font-medium text-blue-900 dark:text-blue-100">
                ₹{position.ltp.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-blue-200 dark:border-blue-900">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              ✓ Order will be placed directly on your broker platform
            </p>
          </div>
        </div>
      )}

      {/* Position Mismatch Warning */}
      {enabled &&
        isConnected &&
        position &&
        position.quantity !== position.quantity && (
          <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                  Position Mismatch Detected
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  The quantity in your broker account doesn't match the app.
                  Please verify before proceeding.
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Error Fallback Options */}
      {enabled && (
        <div className="text-xs text-muted-foreground space-y-1">
          <p>In case of errors:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>Try refreshing the position data</li>
            <li>Check your broker app for pending orders</li>
            <li>Switch to manual exit if issues persist</li>
          </ul>
        </div>
      )}
    </div>
  );
}
