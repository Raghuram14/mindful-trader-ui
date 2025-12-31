import { useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Clock, Target, Shield, AlertTriangle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useTrades } from "@/context/TradeContext";
import { formatCurrency, getTimeInTrade } from "@/lib/mockData";

const emotions = [
  { id: "fear", label: "😰 Fear" },
  { id: "neutral", label: "😐 Neutral" },
  { id: "confident", label: "😄 Confident" },
] as const;

export default function TradeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTradeById, updateTradeEmotion } = useTrades();

  const trade = getTradeById(id || "");

  const handleEmotionTap = useCallback(
    async (emotionId: "fear" | "neutral" | "confident") => {
      if (!id) return;
      await updateTradeEmotion(id, emotionId);
    },
    [id, updateTradeEmotion]
  );

  // Redirect to exit page for open trades (new flow)
  useEffect(() => {
    if (trade && trade.status === "open") {
      navigate(`/exit-trade/${id}`, { replace: true });
    }
  }, [trade, id, navigate]);

  if (!trade) {
    return (
      <AppLayout>
        <div className="page-container">
          <p className="text-muted-foreground">Trade not found</p>
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

  if (trade.status === "closed") {
    navigate("/history");
    return null;
  }

  return (
    <AppLayout>
      <div className="page-container animate-fade-in">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="page-title">{trade.symbol}</h1>
            <span
              className={`text-xs px-2.5 py-1 rounded font-medium ${
                trade.type === "buy"
                  ? "bg-success/20 text-success"
                  : "bg-destructive/20 text-destructive"
              }`}
            >
              {trade.type.toUpperCase()}
            </span>
            <span className="text-xs px-2.5 py-1 rounded font-medium bg-secondary text-secondary-foreground">
              {trade.instrumentType}
            </span>
            {trade.instrumentType === "OPTIONS" && trade.optionType && (
              <span className="text-xs px-2.5 py-1 rounded font-medium bg-accent text-accent-foreground">
                {trade.optionType}
              </span>
            )}
          </div>
          <p className="page-subtitle">Active trade</p>
        </header>

        {/* Trade Info Cards */}
        <div className="grid gap-4 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="card-calm">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                Quantity
              </div>
              <p className="text-xl font-semibold text-foreground">
                {trade.quantity}
              </p>
            </div>
            {trade.entryPrice && (
              <div className="card-calm">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Target className="w-4 h-4" />
                  Entry Price
                </div>
                <p className="text-xl font-semibold text-foreground">
                  ₹{trade.entryPrice.toLocaleString("en-IN")}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {trade.plannedStop && (
              <div className="card-calm">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Shield className="w-4 h-4" />
                  Stop
                </div>
                <p className="text-lg font-medium text-foreground">
                  ₹{trade.plannedStop.toLocaleString("en-IN")}
                </p>
              </div>
            )}

            {trade.plannedTarget && (
              <div className="card-calm">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Target className="w-4 h-4" />
                  Target
                </div>
                <p className="text-lg font-medium text-foreground">
                  ₹{trade.plannedTarget.toLocaleString("en-IN")}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="card-calm">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                Trade Time
              </div>
              <p className="text-lg font-medium text-foreground">
                {trade.tradeTime}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(trade.tradeDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>
            <div className="card-calm">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                Time in Trade
              </div>
              <p className="text-lg font-medium text-foreground">
                {getTimeInTrade(trade.createdAt)}
              </p>
            </div>
          </div>

          {/* Risk Comfort Highlight */}
          <div className="card-calm border-l-4 border-l-primary">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <AlertTriangle className="w-4 h-4 text-primary" />
              Max Comfortable Loss
            </div>
            <p className="text-2xl font-semibold text-primary">
              {formatCurrency(trade.riskComfort)}
            </p>
          </div>
        </div>

        {/* Emotion Check-in */}
        <div className="mb-8">
          <p className="text-sm font-medium text-foreground mb-3">
            How are you feeling?
          </p>
          <div className="flex gap-2 flex-wrap">
            {emotions.map((emotion) => {
              const isSelected = trade.emotions?.includes(emotion.id);
              return (
                <button
                  key={emotion.id}
                  onClick={() => handleEmotionTap(emotion.id)}
                  className={`emotion-chip ${isSelected ? "selected" : ""}`}
                >
                  {emotion.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Exit Trade CTA */}
        <Link
          to={`/exit-trade/${trade.id}`}
          className="btn-secondary w-full text-center block"
        >
          Exit Trade
        </Link>
      </div>
    </AppLayout>
  );
}
