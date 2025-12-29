import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { brokerApi } from "@/api/broker";
import { useAuth } from "@/auth/auth.context";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function BrokerCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );
  const [message, setMessage] = useState("Connecting to broker...");

  useEffect(() => {
    // Wait for auth to be loaded
    if (isLoading) {
      return;
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      setStatus("error");
      setMessage("Please log in first");
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
      return;
    }

    const handleCallback = async () => {
      try {
        const requestToken = searchParams.get("request_token");
        const broker = searchParams.get("broker") || "zerodha";

        if (!requestToken) {
          throw new Error("Missing request token");
        }

        console.log("Processing broker callback:", {
          broker,
          hasToken: !!requestToken,
        });

        await brokerApi.handleCallback(broker, requestToken);

        console.log("Broker callback successful");

        setStatus("success");
        setMessage("Broker connected successfully!");

        // Close popup if opened in popup, otherwise redirect
        if (window.opener) {
          setTimeout(() => {
            window.close();
          }, 2000);
        } else {
          setTimeout(() => {
            navigate("/broker-settings");
          }, 2000);
        }
      } catch (error) {
        console.error("Broker callback error:", error);
        setStatus("error");
        setMessage(
          error instanceof Error ? error.message : "Failed to connect broker"
        );

        setTimeout(() => {
          if (window.opener) {
            window.close();
          } else {
            navigate("/broker-settings");
          }
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, isAuthenticated, isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === "processing" && (
              <Loader2 className="w-5 h-5 animate-spin" />
            )}
            {status === "success" && (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            )}
            {status === "error" && <XCircle className="w-5 h-5 text-red-600" />}
            Broker Connection
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "processing" && (
            <div className="text-sm text-muted-foreground">
              Please wait while we complete your broker connection...
            </div>
          )}
          {status === "success" && (
            <div className="text-sm text-muted-foreground">
              You can now place orders through your broker. This window will
              close automatically.
            </div>
          )}
          {status === "error" && (
            <div className="text-sm text-muted-foreground">
              Please try connecting again from the settings page.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
