import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useRules } from "@/context/RulesContext";
import { formatCurrency } from "@/lib/mockData";
import { TradingRuleType } from "@/lib/mockData";

export function GuardrailsCard() {
  const { rules, dailyStatus, profile } = useRules();
  const activeRules = rules.filter((r) => r.isActive);

  if (activeRules.length === 0) {
    return (
      <div className="card-calm border-l-4 border-l-primary">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-base font-semibold text-foreground mb-1">
              Today's Guardrails
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              The limits you've set to support today's decisions
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              You haven't set any trading rules yet.
            </p>
            <Link
              to="/rules"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              Set up guardrails →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "BREACHED":
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case "WARNING":
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-success" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "BREACHED":
        return "border-l-destructive";
      case "WARNING":
        return "border-l-warning";
      default:
        return "border-l-success";
    }
  };

  const getRuleLabel = (rule: TradingRuleType) => {
    switch (rule) {
      case "DAILY_LOSS":
        return "Daily loss limit";
      case "MAX_LOSING_TRADES":
        return "Losing trades";
      case "DAILY_TARGET":
        return "Daily target";
      case "STOP_AFTER_TARGET":
        return "Stop after target";
      case "STOP_AFTER_LOSS":
        return "Stop after loss";
      default:
        return "Rule";
    }
  };

  const formatRuleValue = (status: any, rule: any) => {
    if (rule.type === "DAILY_LOSS") {
      // Check if percentage or absolute
      if (rule.valueType === "PERCENTAGE") {
        // For percentage, remainingValue is already in absolute terms (currency)
        return `${formatCurrency(status.remainingValue)} remaining`;
      }
      return `${formatCurrency(status.remainingValue)} remaining`;
    }
    if (rule.type === "MAX_LOSING_TRADES") {
      return `${status.currentValue} of ${status.limitValue} used`;
    }
    if (rule.type === "DAILY_TARGET") {
      // Show current profit achieved and remaining target
      const currentProfit = status.currentValue || 0;
      const remaining = status.remainingValue || 0;

      if (currentProfit > 0) {
        return `${formatCurrency(currentProfit)} achieved • ${formatCurrency(
          remaining
        )} remaining`;
      }
      return `${formatCurrency(remaining)} remaining`;
    }
    return "Active";
  };

  const getStatusMessage = (status: any, rule: any) => {
    if (status.status === "BREACHED") {
      return "You've reached a limit you set to protect yourself.";
    }
    if (status.status === "WARNING") {
      return "You're approaching a limit you set to protect today's capital.";
    }
    return null;
  };

  const overallStatus = dailyStatus.some((s) => s.status === "BREACHED")
    ? "BREACHED"
    : dailyStatus.some((s) => s.status === "WARNING")
    ? "WARNING"
    : "SAFE";

  return (
    <div className={`card-calm border-l-4 ${getStatusColor(overallStatus)}`}>
      <div className="flex items-start gap-3 mb-4">
        <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-base font-semibold text-foreground mb-1">
            Today's Guardrails
          </p>
          <p className="text-xs text-muted-foreground">
            The limits you've set to support today's decisions
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {dailyStatus.map((status) => {
          const rule = rules.find((r) => r.id === status.ruleId);
          if (!rule) return null;

          return (
            <div
              key={status.ruleId}
              className={`p-3 rounded-lg ${
                status.status === "BREACHED"
                  ? "bg-destructive/10 border border-destructive/20"
                  : status.status === "WARNING"
                  ? "bg-warning/10 border border-warning/20"
                  : "bg-secondary/50 border border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.status)}
                  <span className="text-sm font-medium text-foreground">
                    {getRuleLabel(rule.type)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                {formatRuleValue(status, rule)}
              </p>
              {getStatusMessage(status, rule) && (
                <p className="text-xs text-muted-foreground mt-2 ml-6 italic">
                  {getStatusMessage(status, rule)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <Link
          to="/rules"
          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
        >
          Manage rules →
        </Link>
      </div>
    </div>
  );
}
