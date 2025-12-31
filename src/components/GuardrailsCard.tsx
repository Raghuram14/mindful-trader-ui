import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  Brain,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useRules } from "@/context/RulesContext";
import { formatCurrency, TradingRuleType, RuleCategory } from "@/lib/mockData";
import {
  RULE_TEMPLATES,
  CATEGORY_LABELS,
  formatTimeValue,
  BOOLEAN_RULES,
} from "@/api/rules";
import { cn } from "@/lib/utils";

// Category icons
const CategoryIcon = ({
  category,
  className,
}: {
  category: RuleCategory;
  className?: string;
}) => {
  const icons = {
    RISK: Shield,
    DISCIPLINE: Target,
    TIMING: Clock,
    PSYCHOLOGY: Brain,
  };
  const Icon = icons[category];
  return <Icon className={className} />;
};

// Category colors
const CATEGORY_COLORS: Record<RuleCategory, string> = {
  RISK: "text-red-500",
  DISCIPLINE: "text-blue-500",
  TIMING: "text-amber-500",
  PSYCHOLOGY: "text-purple-500",
};

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

  const getRuleLabel = (ruleType: TradingRuleType) => {
    const template = RULE_TEMPLATES.find((t) => t.type === ruleType);
    return template?.name || ruleType;
  };

  const formatRuleValue = (status: any, rule: any) => {
    // Time-based rules
    if (rule.type === "NO_TRADING_BEFORE" || rule.type === "NO_TRADING_AFTER") {
      return formatTimeValue(rule.value);
    }

    // Boolean rules
    if (BOOLEAN_RULES.includes(rule.type)) {
      return status.status === "BREACHED" ? "Violated" : "Active";
    }

    // Percentage-based loss/target rules
    if (rule.type === "DAILY_LOSS" || rule.type === "WEEKLY_LOSS") {
      return `${formatCurrency(status.remainingValue)} remaining`;
    }

    if (rule.type === "DAILY_TARGET") {
      const currentProfit = status.currentValue || 0;
      const remaining = status.remainingValue || 0;

      if (currentProfit > 0) {
        return `${formatCurrency(currentProfit)} achieved · ${formatCurrency(
          remaining
        )} remaining`;
      }
      return `${formatCurrency(remaining)} remaining`;
    }

    // Count-based rules
    if (
      rule.type === "MAX_LOSING_TRADES" ||
      rule.type === "MAX_TRADES_PER_DAY" ||
      rule.type === "MAX_OPEN_POSITIONS" ||
      rule.type === "STOP_AFTER_CONSECUTIVE_LOSSES" ||
      rule.type === "MAX_TRADES_AFTER_WIN"
    ) {
      return `${status.currentValue} of ${status.limitValue}`;
    }

    // Position size
    if (rule.type === "MAX_POSITION_SIZE") {
      if (rule.valueType === "PERCENTAGE") {
        return `Max ${rule.value}% per trade`;
      }
      return `Max ${formatCurrency(rule.value)} per trade`;
    }

    // Cooling off
    if (rule.type === "COOLING_OFF_PERIOD") {
      return `${rule.value} min after loss`;
    }

    // R:R ratio
    if (rule.type === "MIN_RR_RATIO") {
      return `Min ${rule.value}:1 ratio`;
    }

    return "Active";
  };

  const getStatusMessage = (status: any, rule: any) => {
    if (status.status === "BREACHED") {
      return "You've reached a limit you set to protect yourself.";
    }
    if (status.status === "WARNING") {
      return "You're approaching a limit.";
    }
    return null;
  };

  const overallStatus = dailyStatus.some((s) => s.status === "BREACHED")
    ? "BREACHED"
    : dailyStatus.some((s) => s.status === "WARNING")
    ? "WARNING"
    : "SAFE";

  // Group active rules by category for display
  const rulesByCategory: Record<RuleCategory, typeof activeRules> = {
    RISK: [],
    DISCIPLINE: [],
    TIMING: [],
    PSYCHOLOGY: [],
  };

  activeRules.forEach((rule) => {
    const category = rule.category || "DISCIPLINE";
    if (rulesByCategory[category]) {
      rulesByCategory[category].push(rule);
    }
  });

  // Get categories that have active rules
  const activeCategories = (
    Object.keys(rulesByCategory) as RuleCategory[]
  ).filter((cat) => rulesByCategory[cat].length > 0);

  return (
    <div className={`card-calm border-l-4 ${getStatusColor(overallStatus)}`}>
      <div className="flex items-start gap-3 mb-4">
        <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-base font-semibold text-foreground mb-1">
            Today's Guardrails
          </p>
          <p className="text-xs text-muted-foreground">
            {activeRules.length} active rule
            {activeRules.length !== 1 ? "s" : ""} protecting you
          </p>
        </div>
      </div>

      {/* Category-based display */}
      <div className="space-y-4">
        {activeCategories.map((category) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-2">
              <CategoryIcon
                category={category}
                className={cn("w-3.5 h-3.5", CATEGORY_COLORS[category])}
              />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {CATEGORY_LABELS[category]}
              </span>
            </div>
            <div className="space-y-2">
              {rulesByCategory[category].map((rule) => {
                const status = dailyStatus.find((s) => s.ruleId === rule.id);
                const ruleStatus = status?.status || "SAFE";

                return (
                  <div
                    key={rule.id}
                    className={cn(
                      "p-3 rounded-lg",
                      ruleStatus === "BREACHED"
                        ? "bg-destructive/10 border border-destructive/20"
                        : ruleStatus === "WARNING"
                        ? "bg-warning/10 border border-warning/20"
                        : "bg-secondary/50 border border-border"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(ruleStatus)}
                        <span className="text-sm font-medium text-foreground">
                          {getRuleLabel(rule.type)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {status && formatRuleValue(status, rule)}
                      </span>
                    </div>
                    {status && getStatusMessage(status, rule) && (
                      <p className="text-xs text-muted-foreground mt-1 ml-6 italic">
                        {getStatusMessage(status, rule)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
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
