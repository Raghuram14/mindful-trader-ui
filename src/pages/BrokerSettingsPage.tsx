import { BrokerConnectionCard } from "@/components/broker/BrokerConnectionCard";
import { PositionSyncDashboard } from "@/components/broker/PositionSyncDashboard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/auth/auth.context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ALLOWED_BROKER_EMAIL = "raghuram.r14@gmail.com";

export function BrokerSettingsPage() {
  const { userEmail } = useAuth();
  const isBrokerAllowed = userEmail === ALLOWED_BROKER_EMAIL;

  return (
    <AppLayout>
      <div className="container mx-auto py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Broker Integration</h1>
          <p className="text-muted-foreground">
            Connect your broker account to enable automated trade execution with
            rule validation
          </p>
        </div>

        <Tabs defaultValue="connections" className="space-y-6">
          <TabsList>
            <TabsTrigger value="connections">Broker Connections</TabsTrigger>
            <TabsTrigger value="positions">Live Positions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <BrokerConnectionCard
                broker="ZERODHA"
                enabled={true}
                disabledForUser={!isBrokerAllowed}
              />
              <BrokerConnectionCard broker="ANGELONE" enabled={false} />
              <BrokerConnectionCard broker="UPSTOX" enabled={false} />
              <BrokerConnectionCard broker="IIFL" enabled={false} />
            </div>
          </TabsContent>

          <TabsContent value="positions" className="space-y-4">
            <PositionSyncDashboard broker="zerodha" />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sync Settings</CardTitle>
                <CardDescription>
                  Configure how and when positions are synced with your broker
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Automatic Sync</div>
                      <div className="text-sm text-muted-foreground">
                        Automatically sync positions every 5 minutes during
                        market hours
                      </div>
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      Enabled
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Fuzzy Matching</div>
                      <div className="text-sm text-muted-foreground">
                        Use intelligent matching to reconcile broker trades with
                        app trades
                      </div>
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      Enabled
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        Auto-Close Squared Off Positions
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Automatically mark trades as closed when broker position
                        is zero
                      </div>
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      Enabled
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    ℹ️ These settings are currently managed automatically.
                    Advanced configuration will be available in a future update.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data & Privacy</CardTitle>
                <CardDescription>
                  How your broker data is handled
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span>🔐</span>
                    <div>
                      <div className="font-medium">Encrypted Storage</div>
                      <div className="text-muted-foreground">
                        Your broker access tokens are encrypted using AES-256
                        encryption before storage
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span>⏰</span>
                    <div>
                      <div className="font-medium">Token Expiry</div>
                      <div className="text-muted-foreground">
                        Broker tokens expire daily at 6 AM IST. You'll need to
                        reconnect after expiry.
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span>🚫</span>
                    <div>
                      <div className="font-medium">No Password Storage</div>
                      <div className="text-muted-foreground">
                        We never store your broker username or password.
                        Authentication is handled via OAuth.
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span>🔄</span>
                    <div>
                      <div className="font-medium">Read-Only by Default</div>
                      <div className="text-muted-foreground">
                        We only request permissions to read positions and place
                        orders you explicitly initiate through the app.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
