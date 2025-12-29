import { AlertTriangle, Info, CheckCircle2, HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface RiskNudge {
  type: "info" | "warning" | "error";
  title: string;
  message: string;
  helpText?: string;
}

interface RiskOverviewPanelProps {
  accountRiskPercent?: number;
  plannedRisk?: number;
  actualRisk?: number;
  dailyRuleWarnings?: string[];
  className?: string;
}

export function RiskOverviewPanel({
  accountRiskPercent,
  plannedRisk,
  actualRisk,
  dailyRuleWarnings = [],
  className,
}: RiskOverviewPanelProps) {
  const nudges: RiskNudge[] = [];

  // Account Risk Percentage Nudge
  if (accountRiskPercent !== undefined && accountRiskPercent > 0) {
    let type: "info" | "warning" | "error" = "info";
    if (accountRiskPercent > 5) type = "error";
    else if (accountRiskPercent > 2) type = "warning";

    nudges.push({
      type,
      title: "Account Risk",
      message: `This trade risks ${accountRiskPercent.toFixed(
        2
      )}% of your account`,
      helpText:
        "Professional traders typically risk 1-2% per trade. Higher percentages increase the chance of significant account drawdowns.",
    });
  }

  // Stop vs Risk Mismatch Nudge
  if (plannedRisk !== undefined && actualRisk !== undefined && actualRisk > 0) {
    const diff = Math.abs(actualRisk - plannedRisk);
    const diffPercent = (diff / plannedRisk) * 100;

    if (diffPercent > 10) {
      nudges.push({
        type: "warning",
        title: "Risk Mismatch",
        message: `Your stop loss creates ₹${actualRisk.toLocaleString()} risk, but you planned for ₹${plannedRisk.toLocaleString()}`,
        helpText:
          "The actual risk from your stop loss should align with your planned risk comfort. Consider adjusting your stop price or position size.",
      });
    }
  }

  // Daily Rule Warnings
  dailyRuleWarnings.forEach((warning) => {
    nudges.push({
      type: "warning",
      title: "Daily Limit Alert",
      message: warning,
      helpText:
        "Daily limits help prevent revenge trading and emotional decisions during difficult trading days.",
    });
  });

  if (nudges.length === 0) {
    return (
      <div
        className={cn(
          "rounded-lg border border-green-200 bg-green-50 p-4",
          className
        )}
      >
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-medium">Risk parameters look good</span>
        </div>
      </div>
    );
  }

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="risk-overview"
      className={cn("rounded-lg border", className)}
    >
      <AccordionItem value="risk-overview" className="border-none">
        <AccordionTrigger className="px-4 hover:no-underline">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {nudges.some((n) => n.type === "error") ? (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              ) : nudges.some((n) => n.type === "warning") ? (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              ) : (
                <Info className="h-5 w-5 text-blue-500" />
              )}
              <span className="font-semibold">Risk Overview</span>
            </div>
            <Badge variant="outline" className="ml-2">
              {nudges.length} {nudges.length === 1 ? "Alert" : "Alerts"}
            </Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 space-y-3">
          {nudges.map((nudge, index) => (
            <div
              key={index}
              className={cn(
                "rounded-lg p-3 flex items-start gap-3",
                nudge.type === "error" && "bg-red-50 border border-red-200",
                nudge.type === "warning" &&
                  "bg-amber-50 border border-amber-200",
                nudge.type === "info" && "bg-blue-50 border border-blue-200"
              )}
            >
              <div className="flex-shrink-0 mt-0.5">
                {nudge.type === "error" ? (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                ) : nudge.type === "warning" ? (
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                ) : (
                  <Info className="h-4 w-4 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p
                      className={cn(
                        "text-sm font-medium mb-1",
                        nudge.type === "error" && "text-red-700",
                        nudge.type === "warning" && "text-amber-700",
                        nudge.type === "info" && "text-blue-700"
                      )}
                    >
                      {nudge.title}
                    </p>
                    <p
                      className={cn(
                        "text-xs",
                        nudge.type === "error" && "text-red-600",
                        nudge.type === "warning" && "text-amber-600",
                        nudge.type === "info" && "text-blue-600"
                      )}
                    >
                      {nudge.message}
                    </p>
                  </div>
                  {nudge.helpText && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="flex-shrink-0">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-xs">
                          <p className="text-xs">{nudge.helpText}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
